import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Divider,
  Image,
  Spin,
  Empty,
  Tag,
  message,
} from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const API_URL = "http://localhost:9999";
const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return "/no-image.png";

  // Link ảnh ngoài
  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  // Ảnh từ backend
  return `${API_URL}${imageUrl}`;
};

// ===== UI (Only) =====
// Chỉ chỉnh UI: style + bố cục. Không đổi logic/API/state.
const UI = {
  // page
  pageBg: {
    background:
      "radial-gradient(1200px circle at 20% 0%, rgba(22,119,255,0.10), transparent 45%), radial-gradient(900px circle at 80% 10%, rgba(56,189,248,0.10), transparent 45%), #f6f8fc",
    minHeight: "calc(100vh - 64px)",
    padding: "22px 16px 60px",
  },
  page: {
    maxWidth: 1120,
    margin: "0 auto",
  },

  // header
  header: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 14,
  },
  subtitle: { color: "rgba(0,0,0,0.55)", fontSize: 13, marginTop: 6 },

  // summary chip
  chip: {
    borderRadius: 999,
    padding: "2px 10px",
    fontWeight: 800,
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 8px 18px rgba(0,0,0,0.06)",
  },

  // order card
  orderCard: {
    marginBottom: 16,
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 12px 34px rgba(0,0,0,0.08)",
    overflow: "hidden",
    background: "#fff",
  },

  // order header area
  orderHeader: {
    padding: "14px 16px",
    background:
      "linear-gradient(180deg, rgba(22,119,255,0.10), rgba(255,255,255,1))",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
  },
  orderId: { fontSize: 14, fontWeight: 950, color: "#0b1f2a" },
  date: { marginLeft: 10, color: "rgba(0,0,0,0.55)", fontSize: 13 },

  statusTag: {
    borderRadius: 999,
    padding: "4px 10px",
    fontWeight: 900,
    letterSpacing: 0.2,
  },

  // items wrapper
  itemsWrap: { padding: 16 },

  // item row
  itemRow: {
    padding: 14,
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.06)",
    background: "linear-gradient(180deg, rgba(0,0,0,0.015), rgba(255,255,255,1))",
  },

  imgWrap: {
    width: 112,
    height: 112,
    borderRadius: 16,
    overflow: "hidden",
    border: "1px solid rgba(0,0,0,0.08)",
    background: "#fff",
    boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
  },

  productName: { margin: 0, lineHeight: 1.25 },
  meta: { color: "rgba(0,0,0,0.55)", fontSize: 13, marginTop: 6 },

  // price pill
  pricePill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 12px",
    borderRadius: 999,
    background: "rgba(22,119,255,0.10)",
    border: "1px solid rgba(22,119,255,0.22)",
  },
  priceText: { color: "#0b3a8d", fontWeight: 950, fontSize: 16 },

  // buttons
  primaryBtn: {
    borderRadius: 14,
    fontWeight: 900,
    padding: "0 14px",
    height: 40,
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    border: "none",
    boxShadow: "0 12px 24px rgba(37, 99, 235, 0.28)",
  },
  ghostBtn: {
    borderRadius: 14,
    fontWeight: 900,
    padding: "0 14px",
    height: 40,
    border: "1px solid rgba(37, 99, 235, 0.35)",
    color: "#1d4ed8",
    background: "#fff",
  },

  // footer
  footer: {
    padding: "12px 16px",
    background: "#fff",
    borderTop: "1px solid rgba(0,0,0,0.06)",
  },
  shipping: { color: "rgba(0,0,0,0.70)", fontSize: 13 },
  totalPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.22)",
    fontWeight: 950,
    fontSize: 13,
    whiteSpace: "nowrap",
  },

  // empty card
  emptyCard: {
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 12px 34px rgba(0,0,0,0.08)",
  },
};

const statusColorMap = {
  "Chờ thanh toán": "orange",
  "Đang xử lý": "blue",
  "Đã thanh toán": "cyan",
  "Đang giao hàng": "geekblue",
  "Đã giao": "green",
  "Hủy đơn": "red",
};

export default function CustomerOrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/orders/me`, {
          withCredentials: true,
        });
        setOrders(res.data.data || []);
      } catch (error) {
        console.error("FETCH ORDERS ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleConfirmDelivered = async (orderId) => {
    try {
      await axios.patch(
        `${API_URL}/api/orders/${orderId}/confirm-delivered`,
        {},
        { withCredentials: true }
      );

      // cập nhật UI ngay
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: "Đã giao" } : o))
      );

      message.success("Xác nhận đã giao hàng thành công");
    } catch (error) {
      message.error(
        error.response?.data?.message || "Không thể xác nhận đơn hàng"
      );
    }
  };

  if (loading) {
    return (
      <div style={UI.pageBg}>
        <div style={{ display: "grid", placeItems: "center", minHeight: 360 }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div style={UI.pageBg}>
        <div style={UI.page}>
          <div style={UI.header}>
            <div>
              <Title level={2} style={{ margin: 0 }}>
                Your Orders
              </Title>
              <div style={UI.subtitle}>
                Theo dõi trạng thái, xem lại sản phẩm đã mua và mua lại nhanh.
              </div>
            </div>
          </div>

          <Card style={UI.emptyCard} bodyStyle={{ padding: 22 }}>
            <Empty description="Bạn chưa có đơn hàng nào" />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={UI.pageBg}>
      <div style={UI.page}>
        <div style={UI.header}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Your Orders
            </Title>
            <div style={UI.subtitle}>
              Kiểm tra trạng thái đơn hàng và xem lại các sản phẩm đã mua.
            </div>
          </div>

          <Tag style={UI.chip} color="blue">
            {orders.length} đơn hàng
          </Tag>
        </div>

        {orders.map((order) => (
          <Card key={order._id} style={UI.orderCard} bodyStyle={{ padding: 0 }}>
            {/* ===== ORDER HEADER ===== */}
            <div style={UI.orderHeader}>
              <Row justify="space-between" align="middle" gutter={[12, 12]}>
                <Col>
                  <span style={UI.orderId}>
                    Order #{order._id.slice(-6).toUpperCase()}
                  </span>
                  <span style={UI.date}>
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </Col>

                <Col>
                  <Tag
                    color={statusColorMap[order.orderStatus]}
                    style={UI.statusTag}
                  >
                    {order.orderStatus}
                  </Tag>
                </Col>
              </Row>
            </div>

            {/* ===== ORDER ITEMS ===== */}
            <div style={UI.itemsWrap}>
              <Row gutter={[12, 12]} align="middle" style={{ marginBottom: 10 }}>
                <Col flex="auto">
                  <Text style={{ color: "rgba(0,0,0,0.55)", fontSize: 13 }}>
                    {order.items?.length || 0} sản phẩm
                  </Text>
                </Col>
              </Row>

              {order.items.map((item, index) => (
                <div key={index}>
                  <Row gutter={[16, 16]} align="middle" style={UI.itemRow}>
                    <Col flex="0 0 auto">
                      <div style={UI.imgWrap}>
                        <Image
                          width={112}
                          height={112}
                          src={resolveImageUrl(item.product?.imageUrl)}
                          fallback="/no-image.png"
                          style={{ width: 112, height: 112, objectFit: "cover" }}
                          preview={false}
                        />
                      </div>
                    </Col>

                    <Col flex="auto" style={{ minWidth: 220 }}>
                      <Title level={5} style={UI.productName}>
                        {item.product?.productName}
                      </Title>

                      <div style={UI.meta}>Số lượng: {item.quantity}</div>

                      <div style={{ marginTop: 10 }}>
                        <span style={UI.pricePill}>
                          <Text style={UI.priceText}>
                            {item.price.toLocaleString()} đ
                          </Text>
                        </span>
                      </div>
                    </Col>

                    <Col flex="0 0 auto" style={{ width: 220 }}>
                      <Row gutter={[0, 10]}>
                        <Col span={24}>
                          <Button
                            type="primary"
                            onClick={() => navigate(`/products/${item.product?._id}`)}
                            style={UI.primaryBtn}
                            block
                          >
                            Mua lại
                          </Button>
                        </Col>
                        <Col span={24}>
                          <Button
                            onClick={() => navigate(`/products/${item.product?._id}`)}
                            style={UI.ghostBtn}
                            block
                          >
                            Xem sản phẩm
                          </Button>
                        </Col>
                      </Row>
                    </Col>
                  </Row>

                  {index !== order.items.length - 1 && (
                    <Divider style={{ margin: "14px 0" }} />
                  )}
                </div>
              ))}
            </div>

            {/* ===== ORDER FOOTER ===== */}
            <div style={UI.footer}>
              <Row justify="space-between" align="middle" gutter={[12, 12]}>
                <Col flex="auto">
                  <Text style={UI.shipping}>
                    Đơn vị vận chuyển: <strong>{order.shippingUnit}</strong>
                  </Text>
                </Col>

                <Col>
                  {order.orderStatus === "Đang giao hàng" && (
                    <Button
                      type="primary"
                      onClick={() => handleConfirmDelivered(order._id)}
                      style={UI.primaryBtn}
                    >
                      Xác nhận đã giao
                    </Button>
                  )}
                </Col>

                <Col>
                  <span style={UI.totalPill}>
                    Tổng tiền: {order.totalAmount.toLocaleString()} đ
                  </span>
                </Col>
              </Row>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
