// models/user.model.js
import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import env from "#configs/env";
import { userAndAdminStatus, userTypes } from "#utils/constants";

const RefreshSessionSchema = new Schema({
    tokenId: {
        type: String,
        required: true,
    }, // jti
    tokenHash: {
        type: String,
        required: true,
    }, // sha256(refreshToken)
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
    },
    ip: String,
    userAgent: String,
});

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            required: [true, "Not Provided"],
        },

        password: {
            type: String,
            required: [true, "Not Provided"],
        },

        mobile: {
            type: String,
            trim: true,
        },

        email: {
            type: String,
            required: [true, "Not Provided"],
            lowercase: true,
            trim: true,
        },

        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        loginType: {
            type: String,
            default: "",
        },

        avatar: {
            type: String,
            default: "",
        },

        role: {
            type: String,
            enum: Object.values(userTypes),
            required: true,
        },

        status: {
            type: String,
            enum: Object.values(userAndAdminStatus),
            default: userAndAdminStatus.inactive, // keep users inactive by default
        },

        refreshSessions: {
            type: [RefreshSessionSchema],
            default: [],
        },

        lastLogin: {
            type: Date,
        },
    },
    {
        timestamps: true,
        collection: "users",
    }
);

// EMail Unique index for faster searching
userSchema.index({ email: 1 }, { unique: true });

/**
 * Hash the password before saving the user models
 */
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 12);
    next();
});

/**
 * Compare the password to check if it's correct
 * This method is accessible by calling user document instance
 */
userSchema.methods.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Generate JWT Access tokens
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            role: this.role,
        },
        env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

// Generate JWT Refresh tokens
userSchema.methods.generateRefreshToken = function (jti) {
    return jwt.sign(
        {
            _id: this._id,
            jti,
        },
        env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

const User = mongoose.model("User", userSchema);

export default User;
