// utils/sendResponse.util.js

import env from "#configs/env";

/**
 * ### Global response handler
 *
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (200, 201, 400, 404, 500, etc.)
 * @param {*} data - Response data (can be object, array, Model instance, or null)
 * @param {string} [message] - Optional response message
 * @param {Object} [options] - Additional options for customization
 * @param {string} [options.token] - Authentication token to include
 * @param {Object} [options.meta] - Additional metadata
 * @param {Object} [options.pagination] - Custom pagination info
 * @param {Array} [options.errors] - Array of error details
 * @param {string} [options.responseFormat] - Override default response format
 * @returns {Object} Express response with JSON
 */
export const sendResponse = (res, statusCode = 200, data = null, message = null, options = {}) => {
    try {
        // Validate required parameters
        if (!res || typeof res.status !== "function") {
            throw new Error("Invalid response object provided");
        }

        if (typeof statusCode !== "number" || statusCode < 100 || statusCode > 599) {
            console.warn(`Invalid status code: ${statusCode}. Using 500 as fallback.`);
            statusCode = 500;
        }

        // Extract options with defaults
        const {
            token = null,
            meta = null,
            pagination = null,
            errors = null,
            responseFormat = "default",
            includeTimestamp = true,
            customFields = {},
        } = options;

        // Transform Sequelize/ORM models to plain objects
        const transformData = (input) => {
            if (!input) return null;

            // Handle Sequelize models
            if (input && typeof input.toJSON === "function") {
                return input.toJSON();
            }

            // Handle arrays of models
            if (Array.isArray(input)) {
                return input.map((item) => (item && typeof item.toJSON === "function" ? item.toJSON() : item));
            }

            return input;
        };

        const transformedData = transformData(data);

        // Determine success status
        const isSuccess = statusCode >= 200 && statusCode < 300;

        // Build base response structure
        const baseResponse = {
            success: isSuccess,
            status: statusCode,
            ...(includeTimestamp && { timestamp: new Date().toISOString() }),
        };

        // Add message if provided or generate default for errors
        if (message) {
            baseResponse.message = message;
        } else if (!isSuccess && !message) {
            // Default error messages based on status code
            const defaultMessages = {
                400: "Bad Request",
                401: "Unauthorized",
                403: "Forbidden",
                404: "Resource not found",
                422: "Validation failed",
                500: "Internal server error",
            };
            baseResponse.message = defaultMessages[statusCode] || "An error occurred";
        }

        // Handle data based on different formats and pagination patterns
        if (transformedData !== null) {
            // Check for common pagination patterns in your codebase
            const isPaginatedResponse =
                transformedData &&
                typeof transformedData === "object" &&
                // Pattern 1: { data: [...], total: number, currentCount: number }
                ((Array.isArray(transformedData.data) && typeof transformedData.total === "number") ||
                    // Pattern 2: { results: [...], total: number }
                    (Array.isArray(transformedData.results) && typeof transformedData.total === "number") ||
                    // Pattern 3: Custom pagination object
                    pagination !== null);

            if (isPaginatedResponse) {
                // Handle paginated data
                if (pagination) {
                    // Custom pagination provided
                    baseResponse.data = transformedData;
                    baseResponse.pagination = pagination;
                } else if (transformedData.data) {
                    // Pattern 1: data array
                    baseResponse.data = transformedData.data;
                    baseResponse.pagination = {
                        total: transformedData.total,
                        count: transformedData.currentCount || transformedData.data.length,
                        ...(transformedData.page && { page: transformedData.page }),
                        ...(transformedData.limit && { limit: transformedData.limit }),
                        ...(transformedData.totalPages && { totalPages: transformedData.totalPages }),
                    };
                } else if (transformedData.results) {
                    // Pattern 2: results array
                    baseResponse.data = transformedData.results;
                    baseResponse.pagination = {
                        total: transformedData.total,
                        count: transformedData.currentCount || transformedData.results.length,
                        ...(transformedData.page && { page: transformedData.page }),
                        ...(transformedData.limit && { limit: transformedData.limit }),
                        ...(transformedData.totalPages && { totalPages: transformedData.totalPages }),
                    };
                }
            } else {
                // Handle regular data
                baseResponse.data = transformedData;
            }
        }

        // Add authentication token
        if (token) {
            baseResponse.token = token;
        }

        // Add metadata
        if (meta) {
            baseResponse.meta = meta;
        }

        // Add error details for failed responses
        if (!isSuccess && errors) {
            baseResponse.errors = Array.isArray(errors) ? errors : [errors];
        }

        // Add any custom fields
        Object.assign(baseResponse, customFields);

        // Handle different response formats if needed
        // CUSTOMIZATION POINT: Add your own response formats here
        let finalResponse = baseResponse;

        switch (responseFormat) {
            case "minimal":
                // Minimal response format
                finalResponse = {
                    success: isSuccess,
                    ...(transformedData && { data: transformedData }),
                    ...(message && { message }),
                };
                break;

            case "verbose":
                // Include additional debugging info in development
                if (env.NODE_ENV === "development") {
                    finalResponse.debug = {
                        originalStatusCode: statusCode,
                        dataType: typeof data,
                        hasToken: !!token,
                        hasErrors: !!errors,
                    };
                }
                break;

            // CUSTOMIZATION POINT: Add more formats as needed
            // case 'custom-format':
            //     finalResponse = { /* your custom structure */ };
            //     break;

            default:
                // Use base response as-is
                break;
        }

        // Log response in development (customize as needed)
        if (env.NODE_ENV === "development" && env.LOG_RESPONSES === "true") {
            console.log(`API Response [${statusCode}]:`, JSON.stringify(finalResponse, null, 2));
        }

        console.log('finalResponse: ', finalResponse);
        return res.status(statusCode).json(finalResponse);
    } catch (error) {
        // Fallback error handling
        console.error("Error in sendResponse:", error);

        // Ensure we always send a response, even if there's an error in the function
        const fallbackResponse = {
            success: false,
            status: 500,
            message: "Internal server error",
            ...(env.NODE_ENV === "development" && {
                error: error.message,
            }),
        };

        try {
            return res.status(500).json(fallbackResponse);
        } catch (finalError) {
            // Last resort - if even the fallback fails
            console.error("Critical error in sendResponse fallback:", finalError);
            return res.end('{"success":false,"message":"Critical server error"}');
        }
    }
};

// UTILITY FUNCTIONS for common response patterns

/**
 * Success response helpers
 */
export const sendSuccess = (res, data = null, message = "Success", options = {}) => {
    return sendResponse(res, 200, data, message, options);
};

export const sendCreated = (res, data = null, message = "Resource created successfully", options = {}) => {
    return sendResponse(res, 201, data, message, options);
};

/**
 * Error response helpers
 */
export const sendBadRequest = (res, message = "Bad Request", errors = null) => {
    return sendResponse(res, 400, null, message, { errors });
};

export const sendUnauthorized = (res, message = "Unauthorized") => {
    return sendResponse(res, 401, null, message);
};

export const sendForbidden = (res, message = "Forbidden") => {
    return sendResponse(res, 403, null, message);
};

export const sendNotFound = (res, message = "Resource not found") => {
    return sendResponse(res, 404, null, message);
};

export const sendValidationError = (res, errors, message = "Validation failed") => {
    return sendResponse(res, 422, null, message, { errors });
};

export const sendServerError = (res, message = "Internal server error", error = null) => {
    const options = {};
    if (env.NODE_ENV === "development" && error) {
        options.errors = [error.message || error];
    }
    return sendResponse(res, 500, null, message, options);
};

/**
 * Paginated response helper
 */
export const sendPaginated = (res, data, pagination, message = null) => {
    return sendResponse(res, 200, data, message, { pagination });
};

// CUSTOMIZATION EXAMPLES:

/*
// Example 1: API versioning
export const sendResponseV2 = (res, statusCode, data, message, options = {}) => {
    return sendResponse(res, statusCode, data, message, {
        ...options,
        responseFormat: 'v2',
        customFields: { apiVersion: '2.0' }
    });
};

// Example 2: Microservice response with service info
export const sendMicroserviceResponse = (res, statusCode, data, message, serviceName, options = {}) => {
    return sendResponse(res, statusCode, data, message, {
        ...options,
        meta: {
            service: serviceName,
            version: env.SERVICE_VERSION,
            timestamp: new Date().toISOString(),
            ...options.meta
        }
    });
};

// Example 3: GraphQL-style response
export const sendGraphQLResponse = (res, data, errors = null) => {
    const response = {
        data: data || null,
        ...(errors && { errors })
    };
    return res.status(200).json(response);
};
*/
