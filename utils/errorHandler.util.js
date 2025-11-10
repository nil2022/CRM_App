// utils/errorHandler.js
import env from "#configs/env";
import { storeError } from "#utils/helper";

/**
 * 
 * @param {*} err :- error object
 * @param {*} req 
 * @param {*} res :- response object
 * @param {*} next :- next function
 * ## Error Handler
 */
const errorHandler = async (err, req, res, next) => {
    console.log(`Error ::`, err);
    // Store the error in a separate file
    await storeError(err);


    const statusCode = err.statusCode ? err.statusCode : 500;
    res.status(statusCode);
    return res.json({
        status: false,
        statusCode: statusCode,
        message: err.message,
        stack: env.NODE_ENV === "production" ? null : err.stack,
    });
}

export default errorHandler;