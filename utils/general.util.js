// utils/general.js
import crypto from "crypto";

export const generateSecurePassword = (length = 16) => {
    // Generates base64 string, then slice to required length
    return crypto
        .randomBytes(Math.ceil(length * 0.75))
        .toString("base64")
        .replace(/[^a-zA-Z0-9]/g, "") // remove special chars if you want URL-safe
        .slice(0, length);
};
