import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true
    },
    tokenHash: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    isRevoked: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model("RefreshToken", refreshTokenSchema, "RefreshToken");
