/**
 * * Base class for all operational (expected) API errors.
 * Thrown from controllers/middlewares and caught centrally by `errorHandler`,
 * which uses `statusCode`/`errors` to build the standard response envelope.
 */
class ApiError extends Error {
    constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/** 400 - malformed/invalid request (bad input, missing fields, invalid state) */
class BadRequestError extends ApiError {
    constructor(message = "Bad request", errors = []) {
        super(400, message, errors);
    }
}

/** 401 - missing/invalid credentials or session */
class UnauthorizedError extends ApiError {
    constructor(message = "Unauthorized", errors = []) {
        super(401, message, errors);
    }
}

/** 403 - authenticated but not allowed to perform this action */
class ForbiddenError extends ApiError {
    constructor(message = "Forbidden", errors = []) {
        super(403, message, errors);
    }
}

/** 404 - requested resource does not exist */
class NotFoundError extends ApiError {
    constructor(message = "Not found", errors = []) {
        super(404, message, errors);
    }
}

/** 500 - unexpected failure, safe to show a generic message to clients */
class InternalServerError extends ApiError {
    constructor(message = "Something went wrong", errors = []) {
        super(500, message, errors);
    }
}

export default ApiError;
export { ApiError, BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, InternalServerError };
