// models/otp.model.js
import mongoose, { Schema } from "mongoose";

const otpSchema = new Schema(
    {
        otp: {
            type: String,
            required: true,
        },
        userId: {
            type: String,
            required: true,
            unique: true,
        },
        expireAt: {
            type: Date,
            default: Date.now() + 2 * 60 * 60 * 1000, // expire OTP 2 hours from now
        },
    },
    {
        timestamps: true,
        collection: "otps",
    }
);
// otpSchema.indexes = () => ({ "expireAt": 1 })
// otpSchema.index({ "expireAt": 1 }, { expireAfterSeconds: 0 })

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;
