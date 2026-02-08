const checkoutService = require("../service/checkoutService");

/* ======================
   CONFIRM CHECKOUT
====================== */
const confirmCheckout = async (req, res) => {
  try {
    const customerId = req.user.customerId;
    const { shippingAddress, note, shippingUnit, receiveMethod, pickupLocation, customerInfo, invoice } = req.body;

    const result = await checkoutService.confirmCheckout({
      customerId,
      shippingAddress,
      note,
      shippingUnit,
      receiveMethod,
      pickupLocation,
      customerInfo,
      invoice,
    });

    return res.json({
      message: "Tạo đơn hàng thành công",
      data: result,
    });
  } catch (err) {
    return res.status(400).json({
      message: err.message,
    });
  }
};

/* ======================
   GET ORDER BY ID
====================== */
const getOrderById = async (req, res) => {
  try {
    const customerId = req.user.customerId;
    const { orderId } = req.params;

    const order = await checkoutService.getOrderById({
      orderId,
      customerId,
    });

    return res.json({
      data: order,
    });
  } catch (err) {
    return res.status(400).json({
      message: err.message,
    });
  }
};

const markOrderProcessing = async (req, res) => {
  try {
    const customerId = req.user.customerId;
    const { orderId } = req.params;

    const order = await checkoutService.markOrderProcessing({
      orderId,
      customerId,
    });

    return res.json({
      message: "Đã chuyển đơn sang trạng thái Đang xử lý",
      data: order,
    });
  } catch (err) {
    return res.status(400).json({
      message: err.message,
    });
  }
};

module.exports = {
  confirmCheckout,
  getOrderById,
  markOrderProcessing,
};
