import env from "#configs/env";
import { rateLimit } from "express-rate-limit";

export const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_TIME * 60 * 1000 || 15 * 60 * 1000, // default is 15 minutes
    limit: env.MAX_REQUESTS || 10, // Limit each IP to 5 requests per `window` (here, per 15 minutes)
    skipFailedRequests: true, // If any request not failed that will count
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator: (req) =>
        `${req.protocol}://${req.hostname}${req.originalUrl}`,
    message: async (req, res) => {
        console.log(
            `\n${req.protocol}://${req.hostname}${req.originalUrl} [${req.method}] -> API is Rate-limited`
        );
        return res.status(429).json({
            data: "",
            message: "Too many requests,\n Try again later.",
            statusCode: 429,
            success: false,
        });
    },
});
