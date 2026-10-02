import crypto from "crypto";
import { ForbiddenError } from "../utils/ApiError.js";

export const CSRF_COOKIE = "csrfToken";
export const CSRF_HEADER = "x-csrf-token";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const generateCsrfToken = () => crypto.randomBytes(32).toString("hex");

/* Readable by the frontend (not httpOnly) so it can echo the value back in the CSRF header */
export const csrfCookieOptions = {
    httpOnly: false,
    secure: true,
    sameSite: "strict",
};

const tokensEqual = (a, b) => {
    const bufA = Buffer.from(String(a));
    const bufB = Buffer.from(String(b));
    return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};

/**
 * * Double-submit-cookie CSRF protection.
 * Only state-changing requests authenticated by cookies can be forged cross-site, so those must send
 * the `csrfToken` cookie value back in the `x-csrf-token` header. Requests authenticated via the
 * Authorization / x-access-token header (Postman, Swagger, mobile apps) are not affected.
 */
export function csrfProtection(req, res, next) {
    if (SAFE_METHODS.has(req.method)) return next();

    const usesHeaderAuth = req.header("Authorization") || req.header("x-access-token");
    const usesCookieAuth = req.cookies?.accessToken || req.cookies?.refreshToken;
    if (usesHeaderAuth || !usesCookieAuth) return next();

    const cookieToken = req.cookies?.csrfToken; // CSRF_COOKIE
    const headerToken = req.header(CSRF_HEADER);
    if (!cookieToken || !headerToken || !tokensEqual(cookieToken, headerToken)) {
        console.log("CSRF token missing or invalid!");
        return next(new ForbiddenError("Invalid or missing CSRF token"));
    }
    next();
}
