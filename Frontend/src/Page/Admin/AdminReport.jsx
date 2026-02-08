import {
  Card,
  Row,
  Col,
  Statistic,
  Select,
  Typography,
  Spin,
  message,
} from "antd";
import {
  ShoppingCartOutlined,
  DollarOutlined,
  UserOutlined,
  BoxPlotOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const { Title, Text } = Typography;
const { Option } = Select;

const API_URL = "http://localhost:9999";

const COLORS = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f"];

const AdminReport = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);

      const from = `${year}-01-01`;
      const to = `${year}-12-31`;

      const [revenueRes, orderStatusRes] = await Promise.all([
        axios.get(
          `${API_URL}/api/admin/reports/revenue?from=${from}&to=${to}&type=month`,
          { withCredentials: true }
        ),
        axios.get(
          `${API_URL}/api/admin/reports/orders-status?from=${from}&to=${to}`,
          { withCredentials: true }
        ),
      ]);

      const revenueData = revenueRes.data.data || [];
      const orderStatusData = orderStatusRes.data.data || [];

      setData({
        summary: {
          totalOrders: orderStatusData.reduce(
            (sum, i) => sum + i.count,
            0
          ),
          totalRevenue: revenueData.reduce(
            (sum, i) => sum + i.revenue,
            0
          ),
          totalCustomers: 0, // chưa có API
          totalSold: revenueData.reduce(
            (sum, i) => sum + i.orders,
            0
          ),
        },
        revenueByMonth: revenueData.map((i) => ({
          month: `${i._id.month}/${i._id.year}`,
          revenue: i.revenue,
        })),
        orderStatus: orderStatusData.map((i) => ({
          status: i._id,
          count: i.count,
        })),
      });
    } catch (err) {
      console.error(err);
      message.error("Không tải được dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [year]);

  if (loading || !data) {
    return (
      <div style={{ textAlign: "center", marginTop: 120 }}>
        <Spin size="large" />
      </div>
    );
  }

  const { summary, revenueByMonth, orderStatus } = data;

  return (
    <>
      {/* ===== HEADER ===== */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3}>Báo cáo & Thống kê</Title>
        <Text type="secondary">
          Phân tích hoạt động kinh doanh theo thời gian
        </Text>
      </div>

      {/* ===== FILTER ===== */}
      <Card style={{ marginBottom: 24 }}>
        <Text strong>Năm</Text>
        <Select
          value={year}
          style={{ width: 120, marginLeft: 12 }}
          onChange={setYear}
        >
          {[2023, 2024, 2025, 2026].map((y) => (
            <Option key={y} value={y}>
              {y}
            </Option>
          ))}
        </Select>
      </Card>

      {/* ===== SUMMARY ===== */}
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={summary.totalOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="Doanh thu"
              value={summary.totalRevenue}
              prefix={<DollarOutlined />}
              formatter={(v) => `${v.toLocaleString()} ₫`}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="Khách hàng"
              value={summary.totalCustomers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="Đơn đã bán"
              value={summary.totalSold}
              prefix={<BoxPlotOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* ===== CHARTS ===== */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        {/* === REVENUE LINE CHART === */}
        <Col span={16}>
          <Card title="Doanh thu theo tháng">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueByMonth}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v) => `${v.toLocaleString()} ₫`} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1677ff"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* === ORDER STATUS PIE === */}
        <Col span={8}>
          <Card title="Trạng thái đơn hàng">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatus}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={60}
                  outerRadius={90}
                  label
                >
                  {orderStatus.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AdminReport;
