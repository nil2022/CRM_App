// utils/general.js
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
