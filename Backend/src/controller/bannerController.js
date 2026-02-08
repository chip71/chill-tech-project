const Banner = require("../models/Banner");

/**
 * GET /api/banners?page=home
 * Public: trả về banner đang active theo page
 */
const getPublicBanners = async (req, res) => {
  try {
    const page = (req.query.page || "home").toString();

    const now = new Date();

    const banners = await Banner.find({
      active: true,
      page,
      // nếu sau này bạn thêm startAt/endAt thì mở ra:
      // $or: [
      //   { startAt: { $exists: false }, endAt: { $exists: false } },
      //   { startAt: { $lte: now }, endAt: { $gte: now } }
      // ]
    })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return res.json({ data: banners });
  } catch (error) {
    console.error("getPublicBanners error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = {
  getPublicBanners,
};
