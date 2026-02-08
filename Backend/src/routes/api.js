const express = require("express");
const customerController = require("../controller/customerController");
const authController = require("../controller/authController");
const productController = require("../controller/productController");
const cartController = require("../controller/cartController");
const checkoutController = require("../controller/checkoutController");
const authMiddleware = require("../middleware/authMiddleware");
const uploadProductImage = require("../middleware/uploadProductImage");
const orderController = require("../controller/orderController");
const dashboardController = require("../controller/dashboardController");
const bannerController = require("../controller/bannerController")
const adminBannerRoute = require("./adminBanner");
const router = express.Router();

const initAPIRoutes = (app) => {
  /* ===== AUTH ===== */
  router.post("/auth/register", customerController.handleRegisterCustomer);
  router.post("/auth/login", authController.login);
  router.post("/auth/logout", authController.logout);
  router.get("/auth/me", authController.me);
  router.put("/auth/change-password", authMiddleware, authController.changePassword);

  /* ===== PRODUCTS – USER ===== */
  router.get("/products/public", productController.getPublicProducts);
  router.get("/products/:id", productController.getProductById);

  /* ===== PRODUCTS – ADMIN ===== */
  router.get(
    "/admin/products",
    authMiddleware,
    productController.getAdminProducts
  );

  router.post(
    "/products",
    authMiddleware,
    uploadProductImage.single("image"),
    productController.createProduct
  );

  router.put(
    "/products/:id",
    authMiddleware,
    uploadProductImage.single("image"),
    productController.updateProduct
  );

  router.put(
    "/products/:id/toggle-status",
    authMiddleware,
    productController.toggleProductStatus
  );

  /* ===== CART ===== */
  router.get("/cart", authMiddleware, cartController.getMyCart);
  router.post("/cart", authMiddleware, cartController.addToCart);
  router.put("/cart", authMiddleware, cartController.updateQuantity);
  router.delete("/cart/:productId", authMiddleware, cartController.removeItem);
  router.delete("/cart", authMiddleware, cartController.clearCart);

  /* ===== CHECKOUT ===== */
  router.post(
    "/checkout/confirm",
    authMiddleware,
    checkoutController.confirmCheckout
  );

  /* =====================================================
     🔥 ORDERS – CUSTOMER (THỨ TỰ RẤT QUAN TRỌNG)
     ===================================================== */

  // ✅ PHẢI ĐẶT TRƯỚC /orders/:orderId
  router.get(
    "/orders/me",
    authMiddleware,
    orderController.getMyOrders
  );

  router.get(
    "/orders/:orderId",
    authMiddleware,
    checkoutController.getOrderById
  );

  router.put(
    "/orders/:orderId/processing",
    authMiddleware,
    checkoutController.markOrderProcessing
  );

  /* ===== ORDERS – ADMIN ===== */
  router.get(
    "/admin/orders",
    authMiddleware,
    orderController.getAdminOrders
  );

  router.put(
    "/admin/orders/:orderId/status",
    authMiddleware,
    orderController.updateOrderStatus
  );

  router.get(
    "/admin/orders/:orderId",
    authMiddleware,
    orderController.getAdminOrderById
  );

  /* ===== CUSTOMERS – ADMIN ===== */
  router.get(
    "/admin/customers",
    authMiddleware,
    customerController.getAdminCustomers
  );

  router.get(
    "/admin/customers/:id",
    authMiddleware,
    customerController.getAdminCustomerDetail
  );

  /* ===== CUSTOMER PROFILE ===== */
  router.put(
    "/customers/me",
    authMiddleware,
    customerController.updateMyProfile
  );

 /* ===== BANNERS – PUBLIC ===== */
  router.get("/banners", bannerController.getPublicBanners);
  router.use("/admin", adminBannerRoute);

  /* ===== DASHBOARD ===== */
  router.get(
    "/admin/dashboard",
    authMiddleware,
    dashboardController.getDashboard
  );

  return app.use("/api", router);
};

router.patch(
  "/orders/:orderId/confirm-delivered",
  authMiddleware,
  orderController.confirmDeliveredByCustomer
);


module.exports = { initAPIRoutes };
