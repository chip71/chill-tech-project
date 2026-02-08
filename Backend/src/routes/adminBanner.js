const express = require("express");
const router = express.Router();

const adminBannerController = require("../controller/adminBannerController");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ middleware check admin (FIX: accept ADMIN / admin)
const isAdmin = (req, res, next) => {
  const role = (req.user?.role || "").toString().toUpperCase();
  if (role === "ADMIN") return next();
  return res.status(403).json({ message: "Không có quyền admin" });
};

router.use(authMiddleware, isAdmin);

router.get("/banners", adminBannerController.getAllBanners);
router.post("/banners", adminBannerController.createBanner);
router.put("/banners/:id", adminBannerController.updateBanner);
router.delete("/banners/:id", adminBannerController.deleteBanner);
router.patch("/banners/:id/toggle", adminBannerController.toggleBanner);

module.exports = router;
