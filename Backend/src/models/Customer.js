const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      unique: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    address: String,
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema, "Customer");
