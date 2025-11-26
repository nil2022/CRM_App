// validations/user.validation.js
import Joi from "joi";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const loginSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } }) // disable strict TLD check so it works in dev too
        .required()
        .messages({
            "string.base": "Email must be a text string.",
            "string.empty": "Email is required.",
            "string.email": "Please provide a valid email address.",
            "any.required": "Email is required.",
        }),

    password: Joi.string().min(8).pattern(passwordRegex).required().messages({
        "string.base": "Password must be a valid string.",
        "string.empty": "Password is required.",
        "string.min": "Password must be at least {#limit} characters long.",
        "string.pattern.base":
            "Password must contain at least 1 uppercase, 1 lowercase, 1 digit, and 1 special character (@$!%*?&).",
        "any.required": "Password is required.",
    }),
}).options({ abortEarly: true, allowUnknown: true });

export const userSignupSchema = Joi.object({
    fullName: Joi.string().required().messages({
        "any.required": "Full name is required",
        "string.empty": "Full name cannot be empty",
        "string.base": "Invalid name",
    }),

    password: Joi.string().min(8).pattern(passwordRegex).required().messages({
        "string.base": "Password must be a valid string.",
        "string.empty": "Password is required.",
        "string.min": "Password must be at least {#limit} characters long.",
        "string.pattern.base":
            "Password must contain at least 1 uppercase, 1 lowercase, 1 digit, and 1 special character (@$!%*?&).",
        "any.required": "Password is required.",
    }),

    mobile: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .messages({
            "string.pattern.base": "Mobile number must be 10 digits",
            "string.base": "Invalid mobile number",
            "string.empty": "Mobile number cannot be empty",
        }),

    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            "any.required": "Email is required",
            "string.empty": "Email cannot be empty",
            "string.email": "Invalid email format",
            "string.base": "Invalid email",
        }),

    avatar: Joi.string().allow("").messages({
        "string.base": "Invalid avatar URL",
    }),
    // Allow only "CUSTOMER", "ENGINEER"
    role: Joi.string().valid("CUSTOMER", "ENGINEER").required().messages({
        "any.required": "Role is required",
        "string.base": "Invalid role",
        "string.empty": "Role cannot be empty",
    }),
}).options({ abortEarly: true, allowUnknown: true });

// email, otp
export const verifyEmailOtpSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            "any.required": "Email is required",
            "string.empty": "Email cannot be empty",
            "string.email": "Invalid email format",
            "string.base": "Invalid email",
        }),

    otp: Joi.string().length(6).required().messages({
        "any.required": "OTP is required",
        "string.empty": "OTP cannot be empty",
        "string.length": "OTP must be {#limit} characters long",
        "string.base": "Invalid OTP",
    }),
}).options({ abortEarly: true, allowUnknown: false });

//const { oldPassword, newPassword } = payload;
export const changePasswordSchema = Joi.object({
    oldPassword: Joi.string().min(8).pattern(passwordRegex).required().messages({
        "string.base": "Old Password must be a valid string.",
        "string.empty": "Old Password is required.",
        "string.min": "Password must be at least {#limit} characters long.",
        "string.pattern.base":
            "Password must contain at least 1 uppercase, 1 lowercase, 1 digit, and 1 special character (@$!%*?&).",
        "any.required": "Old Password is required.",
    }),
    newPassword: Joi.string().min(8).pattern(passwordRegex).required().messages({
        "string.base": "New Password must be a valid string.",
        "string.empty": "New Password is required.",
        "string.min": "New Password must be at least {#limit} characters long.",
        "string.pattern.base":
            "New Password must contain at least 1 uppercase, 1 lowercase, 1 digit, and 1 special character (@$!%*?&).",
        "any.required": "New Password is required.",
    }),
});
