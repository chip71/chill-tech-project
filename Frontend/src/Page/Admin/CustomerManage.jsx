import {
  Card,
  Table,
  Typography,
  Space,
  Input,
  Row,
  Col,
  Tag,
  Avatar,
  Button,
  message,
} from "antd";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const API_URL = "http://localhost:9999";

/* ================= STATUS TAG ================= */
const renderStatus = (status, isVIP) => {
  if (isVIP) return <Tag color="purple">VIP</Tag>;
  if (status === "Hoạt động") return <Tag color="green">Hoạt động</Tag>;
  return <Tag>Không hoạt động</Tag>;
};

const CustomerManage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const navigate = useNavigate(); // ✅ BẮT BUỘC

  /* ================= LOAD DATA ================= */
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/api/admin/customers`,
        { withCredentials: true }
      );
      setCustomers(res.data.data || []);
    } catch (err) {
      console.error(err);
      message.error("Không tải được danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  /* ================= FILTER ================= */
  const filteredCustomers = useMemo(() => {
    if (!searchText) return customers;
    const kw = searchText.toLowerCase();
    return customers.filter(
      (c) =>
        c.customerName?.toLowerCase().includes(kw) ||
        c.email?.toLowerCase().includes(kw) ||
        c.phone?.includes(kw)
    );
  }, [customers, searchText]);

  /* ================= SUMMARY ================= */
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(
    (c) => c.status === "Hoạt động"
  ).length;
  const vipCustomers = customers.filter((c) => c.isVIP).length;
  const totalRevenue = customers.reduce(
    (sum, c) => sum + (c.totalSpent || 0),
    0
  );

  /* ================= TABLE ================= */
  const columns = [
    {
      title: "Khách hàng",
      render: (_, record) => (
        <Space>
          <Avatar>
            {record.customerName?.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.customerName}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Liên hệ",
      render: (_, record) => (
        <div>
          <div>{record.email}</div>
          <div style={{ fontSize: 12, color: "#888" }}>
            {record.phone}
          </div>
        </div>
      ),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
    },
    {
      title: "Đơn hàng",
      dataIndex: "orders",
      align: "center",
    },
    {
      title: "Tổng chi tiêu",
      dataIndex: "totalSpent",
      render: (v) =>
        `${(v || 0).toLocaleString("vi-VN")} ₫`,
    },
    {
      title: "Trạng thái",
      render: (_, record) =>
        renderStatus(record.status, record.isVIP),
    },
    {
      title: "Thao tác",
      align: "center",
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() =>
            navigate(`/admin/customers/${record._id}`)
          }
        />
      ),
    },
  ];

  return (
    <>
      {/* ===== HEADER ===== */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3}>Quản lý khách hàng</Title>
        <Text type="secondary">
          Theo dõi và quản lý thông tin khách hàng
        </Text>
      </div>

      {/* ===== SUMMARY ===== */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Text type="secondary">Tổng khách hàng</Text>
            <Title level={3}>{totalCustomers}</Title>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Text type="secondary">Đang hoạt động</Text>
            <Title level={3}>{activeCustomers}</Title>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Text type="secondary">Khách VIP</Text>
            <Title level={3}>{vipCustomers}</Title>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Text type="secondary">Tổng doanh thu</Text>
            <Title level={3}>
              ₫{(totalRevenue / 1_000_000).toFixed(1)}M
            </Title>
          </Card>
        </Col>
      </Row>

      {/* ===== TABLE ===== */}
      <Card
        title="Danh sách khách hàng"
        extra={
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm kiếm khách hàng..."
            style={{ width: 260 }}
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        }
      >
        <Table
          rowKey="_id"
          loading={loading}
          columns={columns}
          dataSource={filteredCustomers}
          pagination={{ pageSize: 8 }}
        />
      </Card>
    </>
  );
};

export default CustomerManage;
