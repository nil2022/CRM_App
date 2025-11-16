// utils/general.js
import User from "#models/user";
import crypto from "crypto";

// Secure password generator with unique characters (Node.js 14.10+)
export const generateSecurePassword = (length = 16) => {
    // const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$&";

    // Validate length doesn't exceed available unique characters
    if (length > charset.length) {
        throw new Error(`Password length cannot exceed ${charset.length} for unique characters`);
    }

    // Convert charset to array for easier manipulation
    const availableChars = charset.split("");
    let password = "";

    for (let i = 0; i < length; i++) {
        // Get random index from remaining available characters
        const randomIndex = crypto.randomInt(0, availableChars.length);

        // Add the selected character to password
        password += availableChars[randomIndex];

        // Remove the used character to ensure uniqueness
        availableChars.splice(randomIndex, 1);
    }

    return password;
};

export const generateOtp = (length) => {
    const digits = "0123456789";
    let otp = "";

    for (let i = 0; i < length; i++) {
        // crypto.randomInt(max) returns a secure random number from 0 to max-1
        const randIndex = crypto.randomInt(0, digits.length);
        otp += digits[randIndex];
    }

    return otp;
};

/**
 * * This function generates Access and Refresh Token
 * for User [CUSTOMER, ENGINEER]
 */
export async function generateAccessAndRefreshToken(userId, opts = {}) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const tokenId = genJti();
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken(tokenId);

    // store only hashed refresh token + jti in user.refreshSessions (or single field)
    const tokenHash = hashToken(refreshToken);
    const expiresAt = Date.now() + 30 * 60 * 60 * 1000;

    // Example: push into refreshSessions array
    user.refreshSessions.push({
        tokenId,
        tokenHash,
        createdAt: new Date(),
        expiresAt: new Date(expiresAt),
        ip: opts.ip,
        userAgent: opts.userAgent,
    });

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken, tokenId };
}

export const hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

export const genJti = () => crypto.randomUUID();

export const randomAlphaNum = (size = 32) => {
    return crypto.randomBytes(size).toString("hex"); // size bytes -> 2*size hex chars
};
