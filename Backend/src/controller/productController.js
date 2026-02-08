const productService = require("../service/productService");

/* ======================
   USER – GET ACTIVE PRODUCTS
====================== */
const getPublicProducts = async (req, res) => {
  try {
    const products = await productService.getActiveProducts();
    return res.json({ data: products });
  } catch (error) {
    console.error("GET PUBLIC PRODUCTS ERROR:", error);
    return res.status(500).json({
      message: "Không lấy được danh sách sản phẩm",
    });
  }
};

/* ======================
   ADMIN – GET ALL PRODUCTS
====================== */
const getAdminProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    return res.json({ data: products });
  } catch (error) {
    console.error("GET ADMIN PRODUCTS ERROR:", error);
    return res.status(500).json({
      message: "Không lấy được danh sách sản phẩm",
    });
  }
};

/* ======================
   GET PRODUCT BY ID
====================== */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await productService.getProductById(id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    return res.json({ data: product });
  } catch (error) {
    console.error("GET PRODUCT BY ID ERROR:", error);
    return res.status(500).json({
      message: "Không lấy được sản phẩm",
    });
  }
};

/* ======================
   CREATE PRODUCT (WITH IMAGE)
====================== */
const createProduct = async (req, res) => {
  try {
    const payload = { ...req.body };

    // ✅ Ưu tiên ảnh upload
    if (req.file) {
      payload.imageUrl = `/uploads/products/${req.file.filename}`;
    }
    // ✅ Nếu không upload → dùng link ảnh
    else if (req.body.imageUrl) {
      payload.imageUrl = req.body.imageUrl;
    }

    const product = await productService.createProduct(payload);

    return res.json({
      message: "Thêm sản phẩm thành công",
      data: product,
    });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    return res.status(400).json({
      message: error.message,
    });
  }
};

/* ======================
   UPDATE PRODUCT
====================== */
const updateProduct = async (req, res) => {
  try {
    const payload = { ...req.body };

    // Nếu upload file → dùng file
    if (req.file) {
      payload.imageUrl = `/uploads/products/${req.file.filename}`;
    }
    // Nếu không upload file nhưng có link
    else if (req.body.imageUrl) {
      payload.imageUrl = req.body.imageUrl;
    }
    // Nếu không có cả hai → KHÔNG set imageUrl
    else {
      delete payload.imageUrl;
    }

    const product = await productService.updateProduct(
      req.params.id,
      payload
    );

    return res.json({
      message: "Cập nhật sản phẩm thành công",
      data: product,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

/* ======================
   TOGGLE PRODUCT STATUS (ACTIVE <-> INACTIVE)
====================== */
const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await productService.toggleProductStatus(id);

    return res.json({
      message:
        product.status === "ACTIVE"
          ? "Đã hiển thị lại sản phẩm"
          : "Đã ẩn sản phẩm",
      data: product,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};
/* ======================
   DELETE PRODUCT (HARD)
====================== */
const deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id);
    return res.json({ message: "Đã xóa sản phẩm vĩnh viễn" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


module.exports = {
  // USER
  getPublicProducts,

  // ADMIN
  getAdminProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
};
