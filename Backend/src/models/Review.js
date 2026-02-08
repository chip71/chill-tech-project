const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    // ✅ dùng Account (vì authMiddleware của bạn set req.user.accountId)
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

    userName: { type: String, default: "Khách" }, // snapshot
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: "" },
    images: [{ type: String }], // /uploads/reviews/xxx.jpg
    isEdited: { type: Boolean, default: false },

    // ✅ Admin moderation
    isHidden: { type: Boolean, default: false, index: true },

    // ✅ Highlight profanity
    hasProfanity: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// ✅ index thường cho query nhanh (không unique)
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ account: 1, createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);
