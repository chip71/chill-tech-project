import {
  Modal,
  Typography,
  Divider,
  Row,
  Col,
  Tag,
  Table,
  Spin,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const API_URL = "http://localhost:9999";

export default function AdminCustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/api/admin/customers/${id}`,
        { withCredentials: true }
      );
      setData(res.data.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const columns = [
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      render: (v) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      render: (v) => `${v.toLocaleString("vi-VN")} ₫`,
    },
    {
      title: "Trạng thái",
      dataIndex: "orderStatus",
      render: (s) => <Tag>{s}</Tag>,
    },
  ];

  return (
    <Modal
      open
      width={700}
      footer={null}
      onCancel={() => navigate(-1)}
      destroyOnClose
    >
      {loading || !data ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin />
        </div>
      ) : (
        <>
          <Title level={4}>{data.customerName}</Title>
          <Text type="secondary">Thông tin khách hàng</Text>

          <Divider />

          <Row gutter={[16, 12]}>
            <Col span={12}>
              <Text type="secondary">Email</Text>
              <div>{data.email}</div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Số điện thoại</Text>
              <div>{data.phone}</div>
            </Col>
            <Col span={24}>
              <Text type="secondary">Địa chỉ</Text>
              <div>{data.address}</div>
            </Col>
          </Row>

          <Divider />

          <Row gutter={16}>
            <Col span={8}>
              <Text type="secondary">Tổng đơn</Text>
              <Title level={4}>{data.totalOrders}</Title>
            </Col>
            <Col span={8}>
              <Text type="secondary">Tổng chi tiêu</Text>
              <Title level={4}>
                {data.totalSpent.toLocaleString("vi-VN")} ₫
              </Title>
            </Col>
            <Col span={8}>
              <Text type="secondary">Phân loại</Text>
              <div>
                {data.isVIP ? (
                  <Tag color="purple">VIP</Tag>
                ) : (
                  <Tag>Thường</Tag>
                )}
              </div>
            </Col>
          </Row>

          <Divider />

          <Text strong>Danh sách đơn hàng</Text>

          <Table
            rowKey="_id"
            style={{ marginTop: 12 }}
            columns={columns}
            dataSource={data.orders}
            pagination={{ pageSize: 5 }}
          />
        </>
      )}
    </Modal>
  );
}
