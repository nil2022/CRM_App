// models/admin.model.js
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "#configs/env";
import { adminTypes, userAndAdminStatus } from "#utils/constants";

const adminSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        mobile: {
            type: String,
            trim: true,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        profilePicture: {
            type: String,
            default: "",
        },
        lastLogin: {
            type: Date,
        },
        role: {
            type: String,
            enum: Object.values(adminTypes),
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(userAndAdminStatus),
            default: userAndAdminStatus.inactive, // keep sub-admins inactive by default
        },
        // adds a permissions array which can hold various permissions for sub-admins
        permissions: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
        collections: "admins",
    }
);

// Indexes which help in searching and uniqueness
// Email index for faster search and uniqueness
adminSchema.index({ email: 1 }, { unique: true });
// Mobile for fater and uniqueness, also if fields available
adminSchema.index({ mobile: 1 }, { unique: true, sparse: true });

// Hash Password before saving/updating user
adminSchema.pre("save", async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Use a traditional function to allow Mongoose to bind `this`
// Generates JWT token
adminSchema.methods.generateAuthToken = function () {
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

// cheks if password is valid or not
adminSchema.methods.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
