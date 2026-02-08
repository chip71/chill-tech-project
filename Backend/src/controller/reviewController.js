const mongoose = require("mongoose");
const Review = require("../models/Review");
const Customer = require("../models/Customer");
const { censorText } = require("../service/profanity.service");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const ensureAdmin = (req) => String(req.user?.role || "").toUpperCase() === "ADMIN";

const toPublicReviewUrl = (filePath) => {
  // multer lưu absolute path -> lấy filename
  const filename = String(filePath).split(/[/\\]/).pop();
  return `/uploads/reviews/${filename}`;
};

// GET /api/products/:id/reviews?page=1&limit=8
const getReviewsByProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit || "8", 10)));
    const filter = { product: productId };

    const [items, total, summaryAgg] = await Promise.all([
      Review.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Review.countDocuments(filter),
      Review.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(productId) } },
        { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
      ]),
    ]);

    const summary = summaryAgg?.[0] || { avgRating: 0, count: 0 };

    return res.json({
      page,
      limit,
      total,
      items,
      summary: {
        avgRating: Number(summary.avgRating || 0),
        count: Number(summary.count || 0),
      },
    });
  } catch (err) {
    console.error("getReviewsByProduct error:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// POST /api/products/:id/reviews  (auth + multipart images[])
const createMyReview = async (req, res) => {
  try {
    const productId = req.params.id;
    const accountId = req.user?.accountId;

    if (!accountId) return res.status(401).json({ message: "Chưa đăng nhập" });
    if (!isValidObjectId(productId)) return res.status(400).json({ message: "Invalid product id" });

    if (String(req.user?.role || "").toUpperCase() !== "CUSTOMER") {
      return res.status(403).json({ message: "Chỉ khách hàng mới được đánh giá" });
    }

    const rating = Number(req.body.rating || 0);
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating phải từ 1 đến 5" });
    }

    const comment = censorText(req.body.comment || "");
    const images = (req.files || []).map((f) => toPublicReviewUrl(f.path));

    const customer = await Customer.findById(req.user.customerId).lean();
    const userName = customer?.customerName || "Khách";

    const item = await Review.create({
      product: productId,
      account: accountId,
      customer: req.user.customerId || null,
      userName,
      rating,
      comment,
      images,
      isEdited: false,
    });

    return res.status(201).json({ message: "Đã gửi đánh giá", item });
  } catch (err) {
    console.error("createMyReview error:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
const updateMyReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const accountId = req.user?.accountId;

    if (!accountId) return res.status(401).json({ message: "Chưa đăng nhập" });
    if (!isValidObjectId(reviewId)) return res.status(400).json({ message: "Invalid review id" });

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Không tìm thấy review" });

    // ✅ chỉ chủ review hoặc ADMIN
    const admin = String(req.user?.role || "").toUpperCase() === "ADMIN";
    if (!admin && String(review.account) !== String(accountId)) {
      return res.status(403).json({ message: "Bạn không có quyền sửa review này" });
    }

    if (req.body.rating != null) {
      const rating = Number(req.body.rating);
      if (rating < 1 || rating > 5) return res.status(400).json({ message: "Rating phải từ 1 đến 5" });
      review.rating = rating;
    }
    if (req.body.comment != null) review.comment = censorText(req.body.comment);

    review.isEdited = true;
    await review.save();

    return res.json({ message: "Đã cập nhật review", item: review });
  } catch (err) {
    console.error("updateMyReview error:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// PUT /api/reviews/:reviewId (admin)
const adminUpdateReview = async (req, res) => {
  try {
    if (!ensureAdmin(req)) return res.status(403).json({ message: "Chỉ ADMIN được phép" });

    const { reviewId } = req.params;
    if (!isValidObjectId(reviewId)) return res.status(400).json({ message: "Invalid review id" });

    const update = {};
    if (req.body.rating != null) {
      const rating = Number(req.body.rating);
      if (rating < 1 || rating > 5) return res.status(400).json({ message: "Rating phải từ 1 đến 5" });
      update.rating = rating;
    }
    if (req.body.comment != null) update.comment = censorText(req.body.comment);
    update.isEdited = true;

    const item = await Review.findByIdAndUpdate(reviewId, update, { new: true });
    if (!item) return res.status(404).json({ message: "Không tìm thấy review" });

    return res.json({ message: "Admin đã cập nhật review", item });
  } catch (err) {
    console.error("adminUpdateReview error:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// DELETE /api/reviews/:reviewId (admin)
const adminDeleteReview = async (req, res) => {
  try {
    if (!ensureAdmin(req)) return res.status(403).json({ message: "Chỉ ADMIN được phép" });

    const { reviewId } = req.params;
    if (!isValidObjectId(reviewId)) return res.status(400).json({ message: "Invalid review id" });

    const item = await Review.findByIdAndDelete(reviewId);
    if (!item) return res.status(404).json({ message: "Không tìm thấy review" });

    return res.json({ message: "Admin đã xoá review" });
  } catch (err) {
    console.error("adminDeleteReview error:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
// ✅ ADMIN: list all reviews with pagination + filters
const adminListReviews = async (req, res) => {
  try {
    if (String(req.user?.role || "").toUpperCase() !== "ADMIN") {
      return res.status(403).json({ message: "Chỉ ADMIN được phép" });
    }

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || "10", 10)));
    const q = (req.query.q || "").trim();
    const rating = req.query.rating ? Number(req.query.rating) : null;
    const productId = req.query.productId || null;

    const filter = {};
    if (rating) filter.rating = rating;
    if (productId) filter.product = productId;

    // search theo comment hoặc userName
    if (q) {
      filter.$or = [
        { comment: { $regex: q, $options: "i" } },
        { userName: { $regex: q, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("product", "productName imageUrl price")
        .lean(),
      Review.countDocuments(filter),
    ]);

    return res.json({
      page,
      limit,
      total,
      items,
    });
  } catch (err) {
    console.error("adminListReviews error:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// ================== ADMIN: ẨN / HIỆN REVIEW ==================
const adminSetHidden = async (req, res) => {
  try {
    if (String(req.user?.role || "").toUpperCase() !== "ADMIN") {
      return res.status(403).json({ message: "Chỉ ADMIN được phép" });
    }

    const { reviewId } = req.params;
    const { isHidden } = req.body;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { isHidden: Boolean(isHidden) },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá" });
    }

    return res.json({
      message: isHidden ? "Đã ẩn đánh giá" : "Đã hiển thị đánh giá",
      item: review,
    });
  } catch (error) {
    console.error("adminSetHidden error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};


module.exports = {
   getReviewsByProduct,
  createMyReview,
  updateMyReview,
  adminUpdateReview,
  adminDeleteReview,
  adminListReviews,
   adminSetHidden,
};
