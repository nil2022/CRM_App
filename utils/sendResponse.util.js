// utils/sendResponse.util.js
import { Model } from "mongoose";

/**
 * Global Send Response Function, sends response with the provided data and status code.
 */
export const sendResponse = (res, statusCode, data, message, token) => {
    if (data instanceof Model) {
        data = data.toJSON();
    }
    const response = {
        status: statusCode < 400 ? true : false,
        ...(message ? { message } : {}),
        ...(data
            ? Array.isArray(data.data)
                ? {
                      data: data?.data,
                      total: data.total,
                      count: data.count,
                  }
                : Array.isArray(data.results)
                  ? {
                        data: data?.results,
                        total: data.total,
                        count: data.count,
                    }
                  : { data } // Simply include data as-is for non-paginated case
            : {}),
        ...(token ? { token } : {}),
    };
    return res.status(statusCode).json(response);
};
