const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: String,
    variant: String,
    description: String,
    price: Number,
    stockQuantity: Number,
    category: String,
    imageUrl: String,
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
    unit: {
      type: String, // mét, cái, kg...
      default: "cái",
    },

    // 👇 MỚI
    wpu: {
      type: Number, // weight per unit (kg)
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema, "Product");
