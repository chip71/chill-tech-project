import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        unique: true
    },
    adminName: String
}, { timestamps: true });

export default mongoose.model("Admin", adminSchema, "Admin");
