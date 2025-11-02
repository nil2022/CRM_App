// models/user.model.js
import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            required: [true, "Not Provided"],
        },
        userId: {
            type: String,
            required: [true, "Not Provided"],
            unique: true,
            trim: true,
            index: true, // helps to make searchable in DB
        },
        password: {
            type: String,
            required: [true, "Not Provided"],
        },
        email: {
            type: String,
            required: [true, "Not Provided"],
            lowercase: true,
            unique: true,
            minLength: 10,
            trim: true,
            index: true,
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
        userType: {
            type: String,
            required: true,
            uppercase: true,
            default: "CUSTOMER",
        },
        userStatus: {
            type: String,
            required: true,
            uppercase: true,
            default: "APPROVED",
        },
        refreshToken: {
            type: String,
        },
        ticketsCreated: {
            type: [Schema.Types.ObjectId],
            ref: "Ticket",
        },
        ticketsAssigned: {
            type: [Schema.Types.ObjectId],
            ref: "Ticket",
        },
    },
    {
        timestamps: true,
        collection: "users",
    }
);

/**
 * Hash the password before saving the user models
 */
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

/**
 * Compare the password to check if it's correct
 */
userSchema.methods.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Generate JWT Access tokens
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            userId: this.userId,
            userType: this.userType,
            userStatus: this.userStatus,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

// Generate JWT Refresh tokens
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

const User = mongoose.model("User", userSchema);

export default User;
