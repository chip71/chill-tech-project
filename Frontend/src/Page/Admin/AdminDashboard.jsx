import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Tag,
  Button,
  Spin,
} from "antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  UserOutlined,
} from "@ant-design/icons";
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
  BarChart,
  Bar,
} from "recharts";
import { useEffect, useState } from "react";
import axios from "axios";

const { Title, Text } = Typography;
const API_URL = "http://localhost:9999";

/* ===== COLORS ===== */
const PIE_COLORS = ["#1890ff", "#9254de", "#faad14", "#52c41a", "#bfbfbf"];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  const [overview, setOverview] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
  });

  const [revenue, setRevenue] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  /* ================= LOAD DASHBOARD ================= */
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/api/admin/dashboard`,
        { withCredentials: true }
      );

      const data = res.data.data;

      setOverview(data.overview);
      setRevenue(data.revenue);
      setCategories(data.categories);
      setTopProducts(data.topProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      {/* ===== HEADER ===== */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Title level={3}>Tổng quan</Title>
        <Button type="primary">Xuất báo cáo</Button>
      </Row>

      {/* ===== OVERVIEW ===== */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Text type="secondary">Tổng doanh thu</Text>
            <Title level={4}>
              ₫{overview.totalRevenue.toLocaleString("vi-VN")}
            </Title>
            <DollarOutlined />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Text type="secondary">Đơn hàng</Text>
            <Title level={4}>{overview.totalOrders}</Title>
            <ShoppingCartOutlined />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Text type="secondary">Khách hàng</Text>
            <Title level={4}>{overview.totalCustomers}</Title>
            <UserOutlined />
          </Card>
        </Col>
      </Row>

      {/* ===== CHARTS ===== */}
      <Row gutter={16} style={{ marginTop: 24 }}>
        {/* Revenue Line */}
        <Col span={14}>
          <Card title="Xu hướng doanh thu">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenue}>
                <XAxis
                  dataKey="month"
                  tickFormatter={(m) => `T${m}`}
                />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1890ff"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Category Pie */}
        <Col span={10}>
          <Card title="Phân bố theo danh mục">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="count"
                  nameKey="category"
                  outerRadius={100}
                  label
                >
                  {categories.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* ===== TOP PRODUCTS ===== */}
      <Card title="Sản phẩm bán chạy" style={{ marginTop: 24 }}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={topProducts}>
            <XAxis dataKey="productName" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#1890ff" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </>
  );
}
