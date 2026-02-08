const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: function () { return !this.imageOnly; } },
    subtitle: { type: String, default: "" },
    imageOnly: { type: Boolean, default: false },

    ctaText: { type: String, default: "XEM NGAY" },
    ctaLink: { type: String, default: "/products" },

    imageUrl: { type: String, required: true },

    bgValue: {
      type: String,
      default:
        "radial-gradient(circle at 30% 40%, #1d4ed8 0%, #0b1220 45%, #000 100%)",
    },
    glowText: { type: String, default: "" },

    page: { type: String, enum: ["home", "products"], default: "home" },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);