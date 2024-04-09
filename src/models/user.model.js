import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
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
        index: true
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
    createdAt: {
        type: Date,
        immutable: true,
        default: Date.now(),
    },
    updatedAt: {
        type: Date,
        default: Date.now(),
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
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

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

export const User = mongoose.model("User", userSchema);
