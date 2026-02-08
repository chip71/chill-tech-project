const Banner = require("../models/Banner");

/**
 * GET /api/admin/banners
 * Admin: lấy tất cả banner
 */
const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    res.json({ data: banners });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/**
 * POST /api/admin/banners
 * Admin: tạo banner mới
 */
const createBanner = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      ctaText,
      ctaLink,
      imageUrl,
      bgValue,
      glowText,
      page,
      order,
      active,
      imageOnly,
    } = req.body;

    const isImageOnly = imageOnly === true || imageOnly === "true";

    // ✅ Validate theo chế độ banner
    if (isImageOnly) {
      if (!imageUrl) {
        return res.status(400).json({
          message: "Banner dạng chỉ hình ảnh bắt buộc phải có imageUrl",
        });
      }
    } else {
      if (!title) {
        return res.status(400).json({
          message: "Tiêu đề banner không được để trống",
        });
      }
      if (!imageUrl) {
        return res.status(400).json({
          message: "Banner bắt buộc phải có imageUrl",
        });
      }
    }

    const banner = new Banner({
      title,
      subtitle,
      ctaText,
      ctaLink,
      imageUrl,
      bgValue,
      glowText,
      page,
      order,
      active,
      imageOnly: !!isImageOnly,
    });

    await banner.save();
    res.json({ message: "Tạo banner thành công", data: banner });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * PUT /api/admin/banners/:id
 * Admin: cập nhật banner
 */
const updateBanner = async (req, res) => {
  try {
    const existing = await Banner.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Không tìm thấy banner" });
    }

    // Xác định trạng thái sau update (nếu body không gửi field thì lấy từ existing)
    const nextImageOnly =
      req.body.imageOnly === undefined
        ? existing.imageOnly
        : req.body.imageOnly === true || req.body.imageOnly === "true";

    const nextTitle =
      req.body.title === undefined ? existing.title : req.body.title;

    const nextImageUrl =
      req.body.imageUrl === undefined ? existing.imageUrl : req.body.imageUrl;

    // ✅ Validate theo chế độ banner
    if (nextImageOnly) {
      if (!nextImageUrl) {
        return res.status(400).json({
          message: "Banner dạng chỉ hình ảnh bắt buộc phải có imageUrl",
        });
      }
    } else {
      if (!nextTitle) {
        return res.status(400).json({
          message: "Tiêu đề banner không được để trống",
        });
      }
      if (!nextImageUrl) {
        return res.status(400).json({
          message: "Banner bắt buộc phải có imageUrl",
        });
      }
    }

    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, // ✅ đảm bảo schema validate chạy khi update
    });

    res.json({ message: "Cập nhật banner thành công", data: banner });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * DELETE /api/admin/banners/:id
 */
const deleteBanner = async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: "Xoá banner thành công" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * PATCH /api/admin/banners/:id/toggle
 */
const toggleBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    banner.active = !banner.active;
    await banner.save();
    res.json({ data: banner });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBanner,
};
