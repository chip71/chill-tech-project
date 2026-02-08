import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  InputNumber,
  Typography,
  Space,
  Divider,
  Image,
  Empty,
  Tag,
  theme,
  Tooltip,
  Input,
} from "antd";
import {
  DeleteOutlined,
  ArrowLeftOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  GiftOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { useCart } from "../../Routes/Context/CartContext";

const { Title, Text } = Typography;
const API_URL = "http://localhost:9999";

const Cart = () => {
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const [coupon, setCoupon] = useState("");

  /* ===== IMAGE RESOLVER (LINK or UPLOAD) ===== */
  const resolveImage = (imageUrl) => {
    if (!imageUrl) return "/no-image.png";
    return imageUrl.startsWith("http")
      ? imageUrl
      : `${API_URL}${imageUrl}`;
  };

  /* ===== SUBTOTAL ===== */
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = Number(item.product.price) || 0;
      return sum + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const money = (v) => (Number(v || 0)).toLocaleString() + "₫";

  /* ===== EMPTY CART ===== */
  if (!cartItems || cartItems.length === 0) {
    return (
      <div style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <Empty
          description="Giỏ hàng trống"
          extra={
            <Button type="primary" onClick={() => navigate("/products")}>
              Tiếp tục mua sắm
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
        <Title level={2}>Giỏ hàng</Title>

        <Row gutter={[24, 24]}>
          {/* LEFT: ITEMS */}
          <Col xs={24} lg={16}>
            <Space direction="vertical" size={14} style={{ width: "100%" }}>
              {cartItems.map(({ product, quantity }) => {
                const price = Number(product.price) || 0;
                const imageSrc = resolveImage(product.imageUrl);

                return (
                  <Card key={product._id} bordered={false}>
                    <Row gutter={16} align="middle">
                      <Col xs={24} sm={6}>
                        <Image
                          src={imageSrc}
                          fallback="/no-image.png"
                          preview={false}
                          style={{
                            width: "100%",
                            maxWidth: 120,
                            height: 120,
                            objectFit: "cover",
                            borderRadius: 12,
                          }}
                        />
                      </Col>

                      <Col xs={24} sm={10}>
                        <Title level={5} style={{ margin: 0 }}>
                          {product.productName}
                        </Title>
                        <Text type="secondary">
                          {money(price)} / sản phẩm
                        </Text>

                        <div style={{ marginTop: 12 }}>
                          <Space>
                            <Button
                              onClick={() =>
                                updateQuantity(
                                  product._id,
                                  Math.max(1, quantity - 1)
                                )
                              }
                              disabled={quantity <= 1}
                            >
                              −
                            </Button>

                            <InputNumber
                              min={1}
                              value={quantity}
                              onChange={(val) =>
                                updateQuantity(product._id, val)
                              }
                            />

                            <Button
                              onClick={() =>
                                updateQuantity(product._id, quantity + 1)
                              }
                            >
                              +
                            </Button>
                          </Space>
                        </div>
                      </Col>

                      <Col xs={24} sm={6} style={{ textAlign: "right" }}>
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: 700,
                          }}
                        >
                          {money(price * quantity)}
                        </Text>
                      </Col>

                      <Col xs={24} sm={2} style={{ textAlign: "right" }}>
                        <Tooltip title="Xóa">
                          <Button
                            danger
                            shape="circle"
                            icon={<DeleteOutlined />}
                            onClick={() => removeFromCart(product._id)}
                          />
                        </Tooltip>
                      </Col>
                    </Row>
                  </Card>
                );
              })}
            </Space>
          </Col>

          {/* RIGHT: SUMMARY */}
          <Col xs={24} lg={8}>
            <Card bordered={false}>
              <Title level={4}>Tóm tắt đơn hàng</Title>

              <Divider />

              <Row justify="space-between">
                <Text>Tạm tính</Text>
                <Text strong>{money(subtotal)}</Text>
              </Row>

              <Divider />

              <Button
                type="primary"
                size="large"
                block
                icon={<RightOutlined />}
                style={{ marginTop: 16 }}
                onClick={() => navigate("/checkout")}
              >
                Thanh toán
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Cart;
