const Order = require("../models/Order");
const Product = require("../models/Product");
const Customer = require("../models/Customer");

/* ================= SUMMARY ================= */
const getSummary = async ({ from, to }) => {
  const [orders, customers, sold] = await Promise.all([
    Order.aggregate([
      {
        $match: {
          status: "PAID",
          createdAt: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
    ]),
    Customer.countDocuments(),
    Order.aggregate([
      { $match: { status: "PAID" } },
      { $unwind: "$products" },
      {
        $group: {
          _id: null,
          totalSold: { $sum: "$products.quantity" },
        },
      },
    ]),
  ]);

  return {
    totalOrders: orders[0]?.totalOrders || 0,
    totalRevenue: orders[0]?.totalRevenue || 0,
    totalCustomers: customers || 0,
    totalSold: sold[0]?.totalSold || 0,
  };
};

/* ================= REVENUE ================= */
const getRevenue = async ({ from, to, type }) => {
  const groupBy =
    type === "month"
      ? { month: { $month: "$createdAt" } }
      : type === "year"
      ? { year: { $year: "$createdAt" } }
      : {
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        };

  return Order.aggregate([
    {
      $match: {
        status: "PAID",
        createdAt: { $gte: from, $lte: to },
      },
    },
    {
      $group: {
        _id: groupBy,
        revenue: { $sum: "$totalPrice" },
      },
    },
    {
      $project: {
        _id: 0,
        month: "$_id.month",
        day: "$_id.day",
        revenue: 1,
      },
    },
    { $sort: { month: 1, day: 1 } },
  ]);
};

/* ================= ORDER STATUS ================= */
const getOrdersByStatus = async ({ from, to }) => {
  return Order.aggregate([
    {
      $match: {
        createdAt: { $gte: from, $lte: to },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        status: "$_id",
        count: 1,
      },
    },
  ]);
};

/* ================= TOP PRODUCTS ================= */
const getTopProducts = async ({ from, to, limit }) => {
  return Order.aggregate([
    {
      $match: {
        status: "PAID",
        createdAt: { $gte: from, $lte: to },
      },
    },
    { $unwind: "$products" },
    {
      $group: {
        _id: "$products.product",
        totalSold: { $sum: "$products.quantity" },
        revenue: {
          $sum: {
            $multiply: ["$products.quantity", "$products.price"],
          },
        },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: limit },
  ]);
};

/* ================= CATEGORY ================= */
const getCategoryStats = async ({ from, to }) => {
  return Order.aggregate([
    {
      $match: {
        status: "PAID",
        createdAt: { $gte: from, $lte: to },
      },
    },
    { $unwind: "$products" },
    {
      $lookup: {
        from: "products",
        localField: "products.product",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $group: {
        _id: "$product.category",
        totalSold: { $sum: "$products.quantity" },
        revenue: {
          $sum: {
            $multiply: ["$products.quantity", "$products.price"],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        category: "$_id",
        totalSold: 1,
        revenue: 1,
      },
    },
  ]);
};

module.exports = {
  getSummary,
  getRevenue,
  getOrdersByStatus,
  getTopProducts,
  getCategoryStats,
};
