import { ApiError, InternalServerError } from "./ApiError.js";
import { storeError } from "./helper.js";

/**
 * * Normalizes well-known non-ApiError failures (Mongoose, JWT, ...) into an
 * ApiError so the rest of the pipeline only ever deals with one shape.
 */
const normalizeError = (err) => {
    if (err instanceof ApiError) return err;

    // Invalid ObjectId / cast failures, e.g. `Ticket.findOne({ _id: "not-an-id" })`
    if (err.name === "CastError") {
        return new ApiError(400, `Invalid value for field '${err.path}'`);
    }

    // Mongoose schema validation failures
    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors || {}).map((e) => e.message);
        return new ApiError(400, "Validation failed", errors);
    }

    // Duplicate key (unique index) violations, e.g. userId/email already exists
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || "field";
        return new ApiError(409, `Duplicate value for '${field}'`);
    }

    // Invalid/expired JWTs that reach here without being handled locally
    if (err.name === "JsonWebTokenError") {
        return new ApiError(401, "Invalid token");
    }
    if (err.name === "TokenExpiredError") {
        return new ApiError(401, "Token expired");
    }

    // Unknown/unexpected error - never leak internals to clients in production
    const message = process.env.NODE_ENV === "production" ? "Something went wrong" : err.message;
    return new InternalServerError(message);
};

/**
 * ## Centralized Error Handler
 * Every thrown/forwarded error (via `next(err)` or an `asyncHandler`-wrapped
 * async function) ends up here so the response envelope stays consistent
 * across all endpoints: `{ data, message, statusCode, success, errors }`.
 *
 * @param {*} err :- error object
 * @param {*} req
 * @param {*} res :- response object
 * @param {*} next :- next function
 */
const errorHandler = (err, req, res, next) => {
    const apiError = normalizeError(err);

    // Only persist genuinely unexpected (server-side) failures. Expected
    // client errors (400/401/403/404/...) are attacker-triggerable at will -
    // logging every one of them would let repeated bad requests grow the log
    // file without bound. Logging must also never block or fail the response.
    if (apiError.statusCode >= 500) {
        storeError(err).catch((logErr) => console.error("Failed to persist error log:", logErr));
    }

    return res.status(apiError.statusCode).json({
        data: apiError.data,
        message: apiError.message,
        statusCode: apiError.statusCode,
        success: false,
        errors: apiError.errors,
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
};

export default errorHandler;
