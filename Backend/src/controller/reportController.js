const reportService = require("../service/reportService");

const checkAdmin = (req, res) => {
  if (req.user.role !== "ADMIN") {
    res.status(403).json({ message: "Forbidden" });
    return false;
  }
  return true;
};

// 📊 REPORT TỔNG HỢP (CHO DASHBOARD / ADMIN REPORT PAGE)
const getAdminReport = async (req, res) => {
  if (!checkAdmin(req, res)) return;

  try {
    const year = Number(req.query.year) || new Date().getFullYear();

    const from = new Date(`${year}-01-01`);
    const to = new Date(`${year}-12-31`);

    const [
      summary,
      revenueByMonth,
      orderStatus,
      topProducts,
      categories,
    ] = await Promise.all([
      reportService.getSummary({ from, to }),
      reportService.getRevenue({ from, to, type: "month" }),
      reportService.getOrdersByStatus({ from, to }),
      reportService.getTopProducts({ from, to, limit: 5 }),
      reportService.getCategoryStats({ from, to }),
    ]);

    res.json({
      summary,
      revenueByMonth,
      orderStatus,
      topProducts,
      categories,
    });
  } catch (err) {
    console.error("ADMIN REPORT ERROR:", err);
    res.status(500).json({ message: "Get admin report failed" });
  }
};

/* ================== API RIÊNG (EXPORT / ADVANCED) ================== */

// 📊 Doanh thu
const getRevenueReport = async (req, res) => {
  if (!checkAdmin(req, res)) return;

  const { from, to, type = "day" } = req.query;

  const data = await reportService.getRevenue({
    from: new Date(from),
    to: new Date(to),
    type,
  });

  res.json({ data });
};

// 📦 Trạng thái đơn
const getOrderStatusReport = async (req, res) => {
  if (!checkAdmin(req, res)) return;

  const { from, to } = req.query;

  const data = await reportService.getOrdersByStatus({
    from: new Date(from),
    to: new Date(to),
  });

  res.json({ data });
};

// 🔥 Top sản phẩm
const getTopProductsReport = async (req, res) => {
  if (!checkAdmin(req, res)) return;

  const { from, to, limit = 5 } = req.query;

  const data = await reportService.getTopProducts({
    from: new Date(from),
    to: new Date(to),
    limit: Number(limit),
  });

  res.json({ data });
};

// 🗂 Danh mục
const getCategoryReport = async (req, res) => {
  if (!checkAdmin(req, res)) return;

  const { from, to } = req.query;

  const data = await reportService.getCategoryStats({
    from: new Date(from),
    to: new Date(to),
  });

  res.json({ data });
};

module.exports = {
  // tổng hợp
  getAdminReport,

  // chi tiết
  getRevenueReport,
  getOrderStatusReport,
  getTopProductsReport,
  getCategoryReport,
};
