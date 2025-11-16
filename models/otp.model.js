// models/otp.model.js
import mongoose, { Schema } from "mongoose";

const otpSchema = new Schema(
    {
        otp: {
            type: String,
            required: true,
        },

        // the ID (always an ObjectId)
        ownerId: {
            type: Schema.Types.ObjectId,
            required: true,
        },

        // tells Mongoose which model ownerId refers to: "User" or "Admin"
        ownerModel: {
            type: String,
            required: true,
            enum: ["User", "Admin"],
        },

        isUsed: {
            type: Boolean,
            default: false,
        },

        expireAt: {
            type: Date,
            default: () => Date.now() + 10 * 60 * 1000, // OTP expires 10 minutes after creation
            index: { expires: 0 }, // TTL index: doc removed when expireAt reached
        },
    },
    {
        timestamps: true,
        collection: "otps",
    }
);

// tell Mongoose to use the ownerModel value as the ref
otpSchema.virtual("owner", {
    ref: (doc) => doc.ownerModel,
    localField: "ownerId",
    foreignField: "_id",
    justOne: true,
});

// unique per owner (ownerId + ownerModel)
otpSchema.index({ ownerId: 1, ownerModel: 1 }, { unique: true });

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;
