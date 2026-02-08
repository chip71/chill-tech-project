const Product = require("../models/Product");

const getAllProducts = async () => {
  return await Product.find({}).lean();
};

// ✅ CHỈ DÙNG CHO USER
const getActiveProducts = async () => {
  return await Product.find({ status: "ACTIVE" }).lean();
};
/* ======================
   GET PRODUCT BY ID (CLIENT)
====================== */
const getProductById = async (id) => {
  return await Product.findOne({
    _id: id,
    status: "ACTIVE", // client chỉ thấy sản phẩm đang bán
  }).lean();
};

/* ======================
   CREATE PRODUCT
====================== */
const createProduct = async (payload) => {
  const {
    productName,
    category,
    price,
    stockQuantity,
    description,
    unit,
    wpu,
    featured,
    imageUrl,
  } = payload;

  if (!productName || !category || price == null || price === "") {
    throw new Error("Thiếu thông tin bắt buộc");
  }

  return await Product.create({
    productName: productName.trim(),
    category: category.trim(),
    price: Number(price),
    stockQuantity: Number(stockQuantity) || 0,
    description,
    unit: unit || "cái",
    wpu: Number(wpu) || 0,
    featured: featured === "true" || featured === true,
    imageUrl,
    status: "ACTIVE",
  });
};

/* ======================
   UPDATE PRODUCT
====================== */
const updateProduct = async (id, payload) => {
  return await Product.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true }
  );
};

/* ======================
   HIDE PRODUCT (LEGACY)
====================== */
const hideProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new Error("Sản phẩm không tồn tại");
  }

  product.status = "INACTIVE";
  await product.save();
  return product;
};

/* ======================
   TOGGLE PRODUCT STATUS (ADMIN)
====================== */
const toggleProductStatus = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new Error("Sản phẩm không tồn tại");
  }

  product.status =
    product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  await product.save();
  return product;
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  hideProduct,
  toggleProductStatus,
  getActiveProducts,
};
