const dashboardService = require("../service/dashboardService");
const ExcelJS = require("exceljs");

/* ======================
   GET DASHBOARD (JSON)
====================== */
const getDashboard = async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const [overview, revenue, categories, topProducts] =
    await Promise.all([
      dashboardService.getOverviewStats(),
      dashboardService.getRevenueByMonth(),
      dashboardService.getCategoryDistribution(),
      dashboardService.getTopSellingProducts(),
    ]);

  res.json({
    data: {
      overview,
      revenue,
      categories,
      topProducts,
    },
  });
};

/* ======================
   EXPORT DASHBOARD (EXCEL)
====================== */
const exportDashboardExcel = async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const [overview, revenue, categories, topProducts] =
      await Promise.all([
        dashboardService.getOverviewStats(),
        dashboardService.getRevenueByMonth(),
        dashboardService.getCategoryDistribution(),
        dashboardService.getTopSellingProducts(),
      ]);

    const workbook = new ExcelJS.Workbook();

    /* ===== OVERVIEW ===== */
    const overviewSheet = workbook.addWorksheet("Tổng quan");
    overviewSheet.addRow(["Chỉ số", "Giá trị"]);
    overviewSheet.addRow(["Tổng doanh thu", overview.totalRevenue]);
    overviewSheet.addRow(["Tổng đơn hàng", overview.totalOrders]);
    overviewSheet.addRow(["Tổng khách hàng", overview.totalCustomers]);

    /* ===== REVENUE ===== */
    const revenueSheet = workbook.addWorksheet("Doanh thu theo tháng");
    revenueSheet.addRow(["Tháng", "Doanh thu"]);
    revenue.forEach((r) => {
      revenueSheet.addRow([`Tháng ${r.month}`, r.revenue]);
    });

    /* ===== CATEGORIES ===== */
    const categorySheet = workbook.addWorksheet("Danh mục");
    categorySheet.addRow(["Danh mục", "Số lượng"]);
    categories.forEach((c) => {
      categorySheet.addRow([c.category, c.count]);
    });

    /* ===== TOP PRODUCTS ===== */
    const productSheet = workbook.addWorksheet("Sản phẩm bán chạy");
    productSheet.addRow(["Tên sản phẩm", "Doanh thu"]);
    topProducts.forEach((p) => {
      productSheet.addRow([p.productName, p.revenue]);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=dashboard-report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("EXPORT DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Xuất báo cáo thất bại" });
  }
};

module.exports = {
  getDashboard,
  exportDashboardExcel,
};
