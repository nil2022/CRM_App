import { storeError } from "./helper.js";

/**
 * 
 * @param {*} err :- error object
 * @param {*} req 
 * @param {*} res :- response object
 * @param {*} next :- next function
 * ## Error Handler
 */
const errorHandler = async (err, req, res, next) => {
    // Store the error in a separate file
    await storeError(err);


    const statusCode = err.statusCode ? err.statusCode : 500;
    res.status(statusCode);
    return res.json({
        status: false,
        statusCode: statusCode,
        message: err.message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
}

export default errorHandler;