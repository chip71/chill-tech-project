const Cart = require("../models/Cart");

/* ======================
   GET OR CREATE CART
====================== */
const getOrCreateCart = async (customerId) => {
  let cart = await Cart.findOne({ customer: customerId });

  if (!cart) {
    cart = await Cart.create({
      customer: customerId,
      items: [],
    });
  }

  return cart;
};

/* ======================
   GET CART
====================== */
const getCartByCustomer = async (customerId) => {
  const cart = await getOrCreateCart(customerId);
  return await Cart.findById(cart._id)
    .populate("items.product")
    .lean();
};

/* ======================
   ADD TO CART
====================== */
const addToCart = async (customerId, product, quantity) => {
  const cart = await getOrCreateCart(customerId);

  const existedItem = cart.items.find(
    (item) => item.product.toString() === product._id.toString()
  );

  if (existedItem) {
    existedItem.quantity += quantity;
  } else {
    cart.items.push({
      product: product._id,
      quantity,
      priceAtTime: product.price || 0,
    });
  }

  await cart.save();
  return cart;
};

/* ======================
   UPDATE QUANTITY
====================== */
const updateQuantity = async (customerId, productId, quantity) => {
  const cart = await getOrCreateCart(customerId);

  const item = cart.items.find(
    (i) => i.product.toString() === productId
  );
  if (!item) return cart;

  item.quantity = quantity;
  await cart.save();
  return cart;
};

/* ======================
   REMOVE ITEM
====================== */
const removeItem = async (customerId, productId) => {
  const cart = await getOrCreateCart(customerId);

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  await cart.save();
  return cart;
};

/* ======================
   CLEAR CART
====================== */
const clearCart = async (customerId) => {
  const cart = await getOrCreateCart(customerId);
  cart.items = [];
  await cart.save();
  return cart;
};

module.exports = {
  getCartByCustomer,
  addToCart,
  updateQuantity,
  removeItem,
  clearCart,
};
