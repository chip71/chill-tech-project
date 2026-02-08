const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

/**
 * B2B VAT invoice info (optional)
 */
const invoiceSchema = new mongoose.Schema(
  {
    companyName: { type: String, trim: true },
    taxCode: { type: String, trim: true },
    invoiceAddress: { type: String, trim: true },
    invoiceEmail: { type: String, trim: true },
    invoiceNote: { type: String, trim: true },
  },
  { _id: false }
);

/**
 * Customer/contact info at checkout (optional)
 */
const customerInfoSchema = new mongoose.Schema(
  {
    receiverName: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    contactPerson: { type: String, trim: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    items: [orderItemSchema],

    totalAmount: {
      type: Number,
      required: true,
    },

    /**
     * delivery | pickup
     */
    receiveMethod: {
      type: String,
      enum: ["delivery", "pickup"],
      default: "delivery",
    },

    /**
     * Provider (delivery) or "Tự đến lấy" (pickup)
     */
    shippingUnit: {
      type: String,
      enum: ["Giao hàng nhanh", "J&T Express", "Tự đến lấy"],
      required: true,
    },

    /**
     * Shipping fee in VND (optional but useful for displaying breakdown)
     */
    shippingFee: {
      type: Number,
      default: 0,
    },

    /**
     * Total weight in KG (optional)
     */
    totalWeight: {
      type: Number,
      default: 0,
    },

    // 👇 NỘI DUNG CHUYỂN TIỀN
    paymentContent: {
      type: String,
      required: true,
      unique: true, // 🚨 RẤT QUAN TRỌNG
    },

    orderStatus: {
      type: String,
      enum: [
        "Chờ thanh toán",
        "Đang xử lý",
        "Đã thanh toán",
        "Đang giao hàng",
        "Đã giao",
        "Hủy đơn",
      ],
      default: "Chờ thanh toán",
    },

    /**
     * Delivery address OR pickup location string
     */
    shippingAddress: {
      type: String,
      required: true,
    },

    note: {
      type: String,
    },

    /**
     * Optional structures for B2B/B2C
     */
    customerInfo: {
      type: customerInfoSchema,
      default: null,
    },

    invoice: {
      type: invoiceSchema,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema, "Order");
