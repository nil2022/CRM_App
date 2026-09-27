/**
 * * Wraps an async route/middleware handler so a rejected promise (or thrown
 * error) is forwarded to `next()` instead of crashing the request, letting
 * the centralized `errorHandler` deal with it in one place.
 * @example
 * export const signup = asyncHandler(async (req, res) => { ... })
 */
const asyncHandler = (requestHandler) => (req, res, next) => {
    try {
        Promise.resolve(requestHandler(req, res, next)).catch(next);
    } catch (err) {
        next(err);
    }
};

export default asyncHandler;
