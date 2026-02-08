const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    quantity: {
        type: Number,
        required: true
    },
    priceAtTime: {
        type: Number,
        required: true
    }
});

const cartSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        unique: true
    },
    items: [cartItemSchema]
}, { timestamps: true });

module.exports = mongoose.model ("Cart", cartSchema, "Cart");
