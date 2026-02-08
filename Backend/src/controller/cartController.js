const cartService = require("../service/cartService");
const Product = require("../models/Product");

const getMyCart = async (req, res) => {
  const customerId = req.user.customerId;
  const cart = await cartService.getCartByCustomer(customerId);
  return res.json({ data: cart });
};

const addToCart = async (req, res) => {
  const customerId = req.user.customerId;
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
  }

  const cart = await cartService.addToCart(
    customerId,
    product,
    quantity || 1
  );

  return res.json({ data: cart });
};

const updateQuantity = async (req, res) => {
  const customerId = req.user.customerId;
  const { productId, quantity } = req.body;

  const cart = await cartService.updateQuantity(
    customerId,
    productId,
    quantity
  );

  return res.json({ data: cart });
};

const removeItem = async (req, res) => {
  const customerId = req.user.customerId;
  const { productId } = req.params;

  const cart = await cartService.removeItem(customerId, productId);
  return res.json({ data: cart });
};

const clearCart = async (req, res) => {
  const customerId = req.user.customerId;
  const cart = await cartService.clearCart(customerId);
  return res.json({ data: cart });
};

module.exports = {
  getMyCart,
  addToCart,
  updateQuantity,
  removeItem,
  clearCart,
};
