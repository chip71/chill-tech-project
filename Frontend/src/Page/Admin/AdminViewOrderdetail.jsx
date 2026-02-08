import {
  Modal,
  Typography,
  Divider,
  Row,
  Col,
  List,
  Tag,
  Spin,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const API_URL = "http://localhost:9999";

const STATUS_COLOR = {
  "Chờ thanh toán": "gold",
  "Đang xử lý": "blue",
  "Đã thanh toán": "cyan",
  "Đang giao hàng": "processing",
  "Đã giao": "green",
  "Hủy đơn": "red",
};

export default function AdminViewOrderdetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD ORDER DETAIL ================= */
  const fetchOrderDetail = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_URL}/api/admin/orders/${id}`,
        { withCredentials: true }
      );

      setOrder(res.data.data);
    } catch (err) {
      console.error("LOAD ORDER DETAIL ERROR:", err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  return (
    <Modal
      open
      footer={null}
      width={560}
      onCancel={() => navigate(-1)}
      destroyOnClose
    >
      {loading || !order ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin />
        </div>
      ) : (
        <>
          {/* ===== HEADER ===== */}
          <Title level={4}>
            Chi tiết đơn hàng #{order._id.slice(-6).toUpperCase()}
          </Title>
          <Text type="secondary">Thông tin chi tiết về đơn hàng</Text>

          <Divider />

          {/* ===== CUSTOMER INFO ===== */}
          <Row gutter={[16, 12]}>
            <Col span={12}>
              <Text type="secondary">Khách hàng</Text>
              <div>
                <b>{order.customer?.customerName}</b>
              </div>
            </Col>

            <Col span={12}>
              <Text type="secondary">Ngày đặt</Text>
              <div>{dayjs(order.createdAt).format("DD/MM/YYYY")}</div>
            </Col>

            <Col span={12}>
              <Text type="secondary">Email</Text>
              <div>{order.customer?.account?.email}</div>
            </Col>

            <Col span={12}>
              <Text type="secondary">Số điện thoại</Text>
              <div>{order.customer?.account?.phone}</div>
            </Col>

            <Col span={24}>
              <Text type="secondary">Địa chỉ giao hàng</Text>
              <div>{order.shippingAddress}</div>
            </Col>
          </Row>

          <Divider />

          {/* ===== PRODUCT LIST ===== */}
          <Text strong>Sản phẩm</Text>

          <List
            style={{ marginTop: 12 }}
            dataSource={order.items}
            renderItem={(item) => (
              <List.Item
                style={{
                  background: "#f5f6f7",
                  borderRadius: 8,
                  padding: "12px 16px",
                  marginBottom: 8,
                }}
              >
                <Row style={{ width: "100%" }}>
                  <Col span={16}>
                    <b>{item.product?.productName}</b>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      Số lượng: {item.quantity}
                    </div>
                  </Col>
                  <Col span={8} style={{ textAlign: "right" }}>
                    {item.price.toLocaleString("vi-VN")} ₫
                  </Col>
                </Row>
              </List.Item>
            )}
          />

          <Divider />

          {/* ===== TOTAL ===== */}
          <Row justify="space-between" align="middle">
            <Text strong>Tổng cộng</Text>
            <Title level={4} style={{ margin: 0 }}>
              {order.totalAmount.toLocaleString("vi-VN")} ₫
            </Title>
          </Row>

          <Divider />

          {/* ===== STATUS ===== */}
          <Row justify="space-between" align="middle">
            <Text strong>Trạng thái</Text>
            <Tag color={STATUS_COLOR[order.orderStatus]}>
              {order.orderStatus}
            </Tag>
          </Row>
        </>
      )}
    </Modal>
  );
}
