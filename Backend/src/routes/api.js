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
const reportController = require("../controller/reportController");
 //  REVIEW
const reviewController = require("../controller/reviewController");
const uploadReviewImage = require("../middleware/uploadReviewImage");


const initAPIRoutes = (app) => {
  /* ===== AUTH ===== */
  router.post("/auth/register", customerController.handleRegisterCustomer);
  router.post("/auth/login", authController.login);
  router.post("/auth/logout", authController.logout);
  router.get("/auth/me", authController.me);
  router.put("/auth/change-password", authMiddleware, authController.changePassword);
router.patch("/reviews/:reviewId/hidden", authMiddleware, reviewController.adminSetHidden);

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
  router.delete(
    "/products/:id",
    authMiddleware,
    productController.deleteProduct
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

   // REVIEWS – PUBLIC/USER/ADMIN
    // ========================= */
  // Public: list reviews
  router.get("/products/:id/reviews", reviewController.getReviewsByProduct);

  // Customer: create/update my review + images[]
  router.post(
    "/products/:id/reviews",
    authMiddleware,
    uploadReviewImage.array("images", 6),
    reviewController.createMyReview
  );
  router.put("/reviews/:reviewId", authMiddleware, reviewController.updateMyReview);

  
  // Admin: edit/delete any review
  router.put("/reviews/:reviewId", authMiddleware, reviewController.adminUpdateReview);
  router.delete("/reviews/:reviewId", authMiddleware, reviewController.adminDeleteReview);
   router.post(
    "/products",
    authMiddleware,
    uploadProductImage.single("image"),
    productController.createProduct
  );
router.get("/admin/reviews", authMiddleware, reviewController.adminListReviews);
  router.put(
    "/products/:id",
    authMiddleware,
    uploadProductImage.single("image"),
    productController.updateProduct
  );

  router.put("/products/:id/toggle-status", authMiddleware, productController.toggleProductStatus);
  router.delete("/products/:id", authMiddleware, productController.deleteProduct);
  
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
  /* ===== REPORTS – ADMIN ===== */
router.get(
  "/admin/reports",
  authMiddleware,
  reportController.getAdminReport
);

router.get(
  "/admin/reports/revenue",
  authMiddleware,
  reportController.getRevenueReport
);

router.get(
  "/admin/reports/orders-status",
  authMiddleware,
  reportController.getOrderStatusReport
);

router.get(
  "/admin/reports/top-products",
  authMiddleware,
  reportController.getTopProductsReport
);

router.get(
  "/admin/reports/categories",
  authMiddleware,
  reportController.getCategoryReport
);


  return app.use("/api", router);
};

router.patch(
  "/orders/:orderId/confirm-delivered",
  authMiddleware,
  orderController.confirmDeliveredByCustomer
);


module.exports = { initAPIRoutes };
