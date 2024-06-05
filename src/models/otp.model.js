import mongoose, { Schema } from "mongoose"

const otpSchema = new Schema({
    otp: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true,
        unique: true
    }
}, { expires: '1m' }) //expires after 120 minutes (2 Hours)

export const Otp = mongoose.model('Otp', otpSchema)