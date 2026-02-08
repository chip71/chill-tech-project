
const dashboardService = require("../service/dashboardService");

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

module.exports = { getDashboard };
