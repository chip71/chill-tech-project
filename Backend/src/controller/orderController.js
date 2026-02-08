const orderService = require("../service/orderService");

/* ================= ADMIN ================= */

const getAdminOrders = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    const orders = await orderService.getAllOrdersForAdmin();

    return res.status(200).json({
      message: "Lấy danh sách đơn hàng thành công",
      data: orders,
    });
  } catch (error) {
    console.error("GET ADMIN ORDERS ERROR:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Không có quyền thao tác" });
    }

    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Thiếu trạng thái mới" });
    }

    const order = await orderService.updateOrderStatus(orderId, status);

    return res.status(200).json({
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Không thể cập nhật trạng thái đơn hàng",
    });
  }
};

const getAdminOrderById = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    const { orderId } = req.params;

    const order = await orderService.getOrderByIdForAdmin(orderId);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    return res.json({
      message: "Lấy chi tiết đơn hàng thành công",
      data: order,
    });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi server" });
  }
};

/* ================= CUSTOMER ================= */

const getMyOrders = async (req, res) => {
  try {
    const customerId = req.user.customerId;
    if (!customerId) {
      return res.status(400).json({
        message: "Không tìm thấy customerId từ token",
      });
    }

    const orders = await orderService.getMyOrders(customerId);
    return res.json({ data: orders });
  } catch (error) {
    console.error("GET MY ORDERS ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ CUSTOMER xác nhận đã giao
 * CHỈ khi trạng thái hiện tại = "Đang giao hàng"
 */
const confirmDeliveredByCustomer = async (req, res) => {
  try {
    const customerId = req.user.customerId;
    const { orderId } = req.params;

    if (!customerId) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const order =
      await orderService.confirmOrderDeliveredByCustomer(
        orderId,
        customerId
      );

    return res.json({
      message: "Xác nhận đã giao hàng thành công",
      data: order,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  // admin
  getAdminOrders,
  updateOrderStatus,
  getAdminOrderById,

  // customer
  getMyOrders,
  confirmDeliveredByCustomer,
};
