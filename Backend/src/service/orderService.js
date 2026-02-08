const Order = require("../models/Order");

/* ================= ADMIN ================= */

const getAllOrdersForAdmin = async () => {
  return await Order.find()
    .populate({
      path: "customer",
      select: "customerName",
      populate: {
        path: "account",
        select: "phone email",
      },
    })
    .populate({
      path: "items.product",
      select: "productName",
    })
    .sort({ createdAt: -1 })
    .lean();
};

/**
 * 🚨 GIỮ NGUYÊN FLOW ADMIN – KHÔNG ĐỤNG
 */
const STATUS_FLOW = {
  "Chờ thanh toán": ["Hủy đơn"],
  "Đang xử lý": ["Đã thanh toán"],
  "Đã thanh toán": ["Đang giao hàng"],
  "Đang giao hàng": [],
  "Đã giao": [],
  "Hủy đơn": [],
};

const updateOrderStatus = async (orderId, newStatus) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Đơn hàng không tồn tại");
  }

  const currentStatus = order.orderStatus;
  const allowedNextStatuses = STATUS_FLOW[currentStatus];

  if (!allowedNextStatuses || allowedNextStatuses.length === 0) {
    throw new Error(
      `Đơn hàng đang ở trạng thái '${currentStatus}' không thể thay đổi`
    );
  }

  if (!allowedNextStatuses.includes(newStatus)) {
    throw new Error(
      `Không thể chuyển từ '${currentStatus}' sang '${newStatus}'`
    );
  }

  order.orderStatus = newStatus;
  await order.save();

  return order;
};

const getOrderByIdForAdmin = async (orderId) => {
  return await Order.findById(orderId)
    .populate({
      path: "customer",
      select: "customerName",
      populate: {
        path: "account",
        select: "email phone",
      },
    })
    .populate({
      path: "items.product",
      select: "productName",
    });
};

/* ================= CUSTOMER ================= */

const getMyOrders = async (customerId) => {
  return await Order.find({ customer: customerId })
    .populate({
      path: "items.product",
      select: "productName imageUrl price",
    })
    .sort({ createdAt: -1 })
    .lean();
};

/**
 * ✅ CUSTOMER chỉ được xác nhận "Đã giao"
 * ❌ Không nhận status từ client
 * ❌ Không dùng STATUS_FLOW của admin
 */
const confirmOrderDeliveredByCustomer = async (orderId, customerId) => {
  const order = await Order.findOne({
    _id: orderId,
    customer: customerId,
  });

  if (!order) {
    throw new Error("Đơn hàng không tồn tại");
  }

  if (order.orderStatus !== "Đang giao hàng") {
    throw new Error(
      "Chỉ có thể xác nhận khi đơn hàng đang giao"
    );
  }

  order.orderStatus = "Đã giao";
  await order.save();

  return order;
};

module.exports = {
  // admin
  getAllOrdersForAdmin,
  updateOrderStatus,
  getOrderByIdForAdmin,

  // customer
  getMyOrders,
  confirmOrderDeliveredByCustomer,
};
