const Order = require("../models/Order");
const Product = require("../models/Product");
const Customer = require("../models/Customer");

/* =====================================================
   1. OVERVIEW (Cards trên cùng)
===================================================== */
const getOverviewStats = async () => {
  const [totalOrders, totalCustomers, totalRevenue] =
    await Promise.all([
      Order.countDocuments(),
      Customer.countDocuments(),
      Order.aggregate([
        { $match: { orderStatus: "Đã giao" } },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
          },
        },
      ]),
    ]);

  return {
    totalOrders,
    totalCustomers,
    totalRevenue: totalRevenue[0]?.total || 0,
  };
};

/* =====================================================
   2. DOANH THU THEO THÁNG (LINE CHART)
===================================================== */
const getRevenueByMonth = async (year = new Date().getFullYear()) => {
  const data = await Order.aggregate([
    {
      $match: {
        orderStatus: "Đã giao",
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        revenue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Chuẩn hóa đủ 12 tháng
  const result = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const found = data.find((d) => d._id === month);
    return {
      month,
      revenue: found ? found.revenue : 0,
    };
  });

  return result;
};

/* =====================================================
   3. PHÂN BỐ DANH MỤC (PIE CHART)
===================================================== */
const getCategoryDistribution = async () => {
  return Product.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        category: "$_id",
        count: 1,
        _id: 0,
      },
    },
  ]);
};

/* =====================================================
   4. TOP SẢN PHẨM BÁN CHẠY (BAR CHART)
===================================================== */
const getTopSellingProducts = async (limit = 5) => {
  return Order.aggregate([
    { $match: { orderStatus: "Đã giao" } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        sold: { $sum: "$items.quantity" },
        revenue: {
          $sum: {
            $multiply: ["$items.quantity", "$items.price"],
          },
        },
      },
    },
    { $sort: { sold: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "Product",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $project: {
        productName: "$product.productName",
        sold: 1,
        revenue: 1,
        _id: 0,
      },
    },
  ]);
};

/* =====================================================
   EXPORT
===================================================== */
module.exports = {
  getOverviewStats,
  getRevenueByMonth,
  getCategoryDistribution,
  getTopSellingProducts,
};
