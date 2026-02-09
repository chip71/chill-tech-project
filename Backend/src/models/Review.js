const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
      index: true,
    },

    userName: { type: String, default: "Khách" },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: "" },
    images: [{ type: String }],
    isEdited: { type: Boolean, default: false },

    // ===== USER / ADMIN REPLIES =====
    replies: [
      {
        account: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Account",
        },
        userName: String,
        content: String,
        isAdmin: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],


    isHidden: { type: Boolean, default: false, index: true },
    hasProfanity: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// indexes
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ account: 1, createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);
