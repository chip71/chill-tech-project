const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");


const calculateTotalWeight = (cart) => {
  return cart.items.reduce((sum, item) => {
    const wpu = Number(item.product.wpu || 0);
    return sum + item.quantity * wpu;
  }, 0);
};


const calculateShippingFee = (provider, weightKg) => {
  if (provider === "Giao hàng nhanh") {
    if (weightKg <= 2) return 18000;
    const extra = Math.ceil((weightKg - 2) / 0.5);
    return 18000 + extra * 3500;
  }

  if (provider === "J&T Express") {
    if (weightKg <= 1) return 20700;
    const extra = Math.ceil((weightKg - 1) / 0.5);
    return 20700 + extra * 4000;
  }

  return 0;
};


const generateRandomCode = (length = 6) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};


const generateUniquePaymentContent = async () => {
  let paymentContent = "";
  let existed = true;

  while (existed) {
    paymentContent = `Chilltech${generateRandomCode(6)}`;
    existed = await Order.findOne({ paymentContent });
  }

  return paymentContent;
};


const confirmCheckout = async ({
  customerId,
  shippingAddress,
  note,
  shippingUnit,
  // NEW (optional):
  receiveMethod = "delivery", // "delivery" | "pickup"
  pickupLocation,
  customerInfo,
  invoice,
}) => {
  // Normalize receive method
  const method = receiveMethod === "pickup" ? "pickup" : "delivery";

  // Pickup flow: no shipping provider required, shippingFee = 0
  if (method === "pickup") {
    const finalPickup = pickupLocation || shippingAddress;

    if (!finalPickup) {
      throw new Error("Chưa chọn điểm lấy hàng");
    }

    const cart = await Cart.findOne({ customer: customerId }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      throw new Error("Giỏ hàng trống");
    }

    const totalProductPrice = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.priceAtTime,
      0
    );

    const totalWeight = calculateTotalWeight(cart);
    const shippingFee = 0;
    const paymentContent = await generateUniquePaymentContent();

    const order = await Order.create({
      customer: customerId,
      items: cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.priceAtTime,
      })),
      totalAmount: totalProductPrice + shippingFee,

      receiveMethod: "pickup",
      shippingUnit: "Tự đến lấy",
      shippingFee,
      totalWeight,

      paymentContent,
      shippingAddress: finalPickup,
      note,

      customerInfo: customerInfo || null,
      invoice: invoice || null,

      orderStatus: "Chờ thanh toán",
    });

    cart.items = [];
    await cart.save();

    return {
      order,
      paymentContent,
      totalProductPrice,
      shippingFee,
      totalWeight,
    };
  }

  // Delivery flow
  if (!shippingUnit) {
    throw new Error("Chưa chọn đơn vị vận chuyển");
  }

  if (!shippingAddress) {
    throw new Error("Chưa nhập địa chỉ nhận hàng");
  }

  const cart = await Cart.findOne({ customer: customerId }).populate(
    "items.product"
  );

  if (!cart || cart.items.length === 0) {
    throw new Error("Giỏ hàng trống");
  }

  const totalProductPrice = cart.items.reduce(
    (sum, item) => sum + item.quantity * item.priceAtTime,
    0
  );

  const totalWeight = calculateTotalWeight(cart);
  const shippingFee = calculateShippingFee(shippingUnit, totalWeight);
  const paymentContent = await generateUniquePaymentContent();

  const order = await Order.create({
    customer: customerId,
    items: cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.priceAtTime,
    })),
    totalAmount: totalProductPrice + shippingFee,

    receiveMethod: "delivery",
    shippingUnit,
    shippingFee,
    totalWeight,

    paymentContent,
    shippingAddress,
    note,

    customerInfo: customerInfo || null,
    invoice: invoice || null,

    orderStatus: "Chờ thanh toán",
  });

  cart.items = [];
  await cart.save();

  return {
    order,
    paymentContent,
    totalProductPrice,
    shippingFee,
    totalWeight,
  };
};


const getOrderById = async ({ orderId, customerId }) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error("OrderId không hợp lệ");
  }

  const order = await Order.findOne({
    _id: orderId,
    customer: customerId,
  });

  if (!order) {
    throw new Error("Không tìm thấy đơn hàng");
  }

  return order;
};

const markOrderProcessing = async ({ orderId, customerId }) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error("OrderId không hợp lệ");
  }

  
  const order = await Order.findOne({
    _id: orderId,
    customer: customerId,
    orderStatus: "Chờ thanh toán",
  }).populate("items.product");

  if (!order) {
    throw new Error("Không thể xử lý đơn hàng");
  }


  for (const item of order.items) {
    if (item.product.stockQuantity < item.quantity) {
      throw new Error(
        `Sản phẩm ${item.product.productName} không đủ tồn kho`
      );
    }
  }


  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { stockQuantity: -item.quantity },
    });
  }

 
  order.orderStatus = "Đang xử lý";
  await order.save();

  return order;
};
const hideProduct = async (productId) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Sản phẩm không tồn tại");
  }

  product.status = "INACTIVE";
  await product.save();

  return product;
};

module.exports = {
  confirmCheckout,
  getOrderById,
  markOrderProcessing,
  hideProduct,
};
