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
// https://api.chilltech.store
const API_URL = "http://localhost:9999";

const Cart = () => {
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();

  const [coupon, setCoupon] = useState("");

  /* ===== IMAGE RESOLVER (LINK or UPLOAD) ===== */
  const resolveImage = (imageUrl) => {
    if (!imageUrl) return "/no-image.png";
    return imageUrl.startsWith("http") ? imageUrl : `${API_URL}${imageUrl}`;
  };

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = Number(item.product.price) || 0;
      return sum + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const pageWrap = {
    background: `radial-gradient(1000px 500px at 15% -10%, ${token.colorPrimaryBg} 0%, transparent 55%),
                 radial-gradient(800px 420px at 100% 0%, ${token.colorInfoBg} 0%, transparent 55%),
                 linear-gradient(180deg, ${token.colorFillSecondary} 0%, ${token.colorBgLayout} 55%, ${token.colorBgLayout} 100%)`,
    minHeight: "calc(100vh - 64px)",
    padding: "28px 0 56px",
  };

  const container = { maxWidth: 1200, margin: "0 auto", padding: "0 16px" };

  const softCard = {
    borderRadius: 18,
    boxShadow: token.boxShadowTertiary,
    background: token.colorBgContainer,
    overflow: "hidden",
  };

  const money = (v) => (Number(v || 0)).toLocaleString() + "₫";

  if (!cartItems || cartItems.length === 0) {
    return (
      <div style={pageWrap}>
        <div style={container}>
          <Text type="secondary">
            <Link to="/">Trang chủ</Link> {" / "} Giỏ hàng
          </Text>

          <div style={{ marginTop: 12 }}>
            <Title level={2} style={{ margin: 0 }}>
              Giỏ hàng
            </Title>
            <Text type="secondary">
              Chưa có sản phẩm nào trong giỏ. Hãy chọn sản phẩm để tiếp tục.
            </Text>
          </div>

          <Card
            bordered={false}
            style={{ ...softCard, maxWidth: 560, margin: "28px auto 0" }}
            bodyStyle={{ padding: 22 }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div style={{ marginTop: 6 }}>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>
                    Giỏ hàng trống
                  </div>
                  <div style={{ color: token.colorTextSecondary, marginTop: 4 }}>
                    Thêm sản phẩm để thanh toán nhanh chóng.
                  </div>
                </div>
              }
            />

            <Button
              type="primary"
              size="large"
              icon={<RightOutlined />}
              style={{
                width: "100%",
                height: 48,
                borderRadius: 14,
                fontWeight: 900,
              }}
              onClick={() => navigate("/products")}
            >
              Tiếp tục mua sắm
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <div style={container}>
        {/* Breadcrumb */}
        <Text type="secondary">
          <Link to="/">Trang chủ</Link> {" / "} <span>Giỏ hàng</span>
        </Text>

        {/* Header */}
        <div
          style={{
            marginTop: 12,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Giỏ hàng của bạn
            </Title>
            <Text type="secondary">
              {cartItems.length} sản phẩm • Kiểm tra số lượng và tiến hành thanh
              toán
            </Text>
          </div>

          <Space wrap>
            <Button
              danger
              icon={<DeleteOutlined />}
              style={{ borderRadius: 12 }}
              onClick={clearCart}
            >
              Xóa tất cả
            </Button>
          </Space>
        </div>

        <div style={{ height: 16 }} />

        <Row gutter={[24, 24]}>
          {/* LEFT: ITEMS */}
          <Col xs={24} lg={16}>
            <Space direction="vertical" size={14} style={{ width: "100%" }}>
              {cartItems.map(({ product, quantity }) => {
                const price = Number(product.price) || 0;
                const imageSrc = resolveImage(product.imageUrl);

                return (
                  <Card
                    key={product._id}
                    bordered={false}
                    style={{ ...softCard, position: "relative" }}
                    bodyStyle={{ padding: 16 }}
                  >
                    {/* Delete button - góc phải trên */}
                    <div
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        zIndex: 2,
                      }}
                    >
                      <Tooltip title="Xóa sản phẩm">
                        <Button
                          danger
                          size="small"
                          shape="circle"
                          icon={<DeleteOutlined />}
                          onClick={() => removeFromCart(product._id)}
                          style={{
                            borderRadius: 999,
                            boxShadow: token.boxShadowSecondary,
                            background: token.colorBgContainer,
                          }}
                        />
                      </Tooltip>
                    </div>

                    <Row gutter={[16, 12]} align="middle">
                      <Col xs={24} sm={6} md={5}>
                        <div
                          style={{
                            width: "100%",
                            maxWidth: 120,
                            height: 120,
                            borderRadius: 16,
                            overflow: "hidden",
                            background: token.colorFillSecondary,
                            border: `1px solid ${token.colorBorderSecondary}`,
                          }}
                        >
                          <Image
                            src={imageSrc}
                            fallback="/no-image.png"
                            preview={false}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      </Col>

                      <Col xs={24} sm={18} md={12}>
                        <div style={{ paddingRight: 34 /* chừa chỗ nút xóa */ }}>
                          <Title level={5} style={{ margin: 0, lineHeight: 1.35 }}>
                            {product.productName}
                          </Title>

                          <div
                            style={{
                              marginTop: 8,
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            {product.brand && (
                              <Tag
                                bordered={false}
                                style={{
                                  borderRadius: 999,
                                  padding: "2px 10px",
                                  marginRight: 0,
                                }}
                              >
                                {product.brand}
                              </Tag>
                            )}

                            <Tag
                              bordered={false}
                              style={{
                                borderRadius: 999,
                                padding: "2px 10px",
                                marginRight: 0,
                              }}
                            >
                              <GiftOutlined style={{ marginRight: 6 }} />
                              Hỗ trợ VAT
                            </Tag>
                          </div>

                          <div
                            style={{
                              marginTop: 14,
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              flexWrap: "wrap",
                            }}
                          >
                            <Text type="secondary">Số lượng</Text>

                            <Space.Compact>
                              <Button
                                onClick={() =>
                                  updateQuantity(
                                    product._id,
                                    Math.max(1, quantity - 1)
                                  )
                                }
                                disabled={quantity <= 1}
                                style={{
                                  borderTopLeftRadius: 12,
                                  borderBottomLeftRadius: 12,
                                }}
                              >
                                −
                              </Button>

                              <InputNumber
                                min={1}
                                value={quantity}
                                controls={false}
                                onChange={(val) =>
                                  updateQuantity(
                                    product._id,
                                    Math.max(1, Number(val || 1))
                                  )
                                }
                                style={{ width: 82 }}
                              />

                              <Button
                                onClick={() =>
                                  updateQuantity(product._id, quantity + 1)
                                }
                                style={{
                                  borderTopRightRadius: 12,
                                  borderBottomRightRadius: 12,
                                }}
                              >
                                +
                              </Button>
                            </Space.Compact>

                            <Text type="secondary" style={{ marginLeft: "auto" }} />
                          </div>
                        </div>
                      </Col>

                      <Col xs={24} md={7} style={{ textAlign: "right" }}>
                        <Text
                          style={{
                            fontSize: 20,
                            fontWeight: 900,
                            color: token.colorPrimary,
                          }}
                        >
                          {money(price * quantity)}
                        </Text>
                        <div>
                          <Text type="secondary">Thành tiền</Text>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                );
              })}

              <div style={{ paddingTop: 4 }}>
                <Link to="/products">
                  <Button icon={<ArrowLeftOutlined />} style={{ borderRadius: 12 }}>
                    Tiếp tục mua sắm
                  </Button>
                </Link>
              </div>
            </Space>
          </Col>

          {/* RIGHT: SUMMARY */}
          <Col xs={24} lg={8}>
            <div style={{ position: "sticky", top: 92 }}>
              <Card bordered={false} style={softCard} bodyStyle={{ padding: 18 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div>
                    <Title level={4} style={{ margin: 0 }}>
                      Tóm tắt đơn hàng
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Dành cho mua lẻ & doanh nghiệp
                    </Text>
                  </div>

                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      background: token.colorPrimaryBg,
                      border: `1px solid ${token.colorBorderSecondary}`,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <SafetyCertificateOutlined style={{ color: token.colorPrimary }} />
                  </div>
                </div>

                <Divider style={{ margin: "12px 0" }} />

                {/* Coupon */}
                <div
                  style={{
                    background: token.colorFillSecondary,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    borderRadius: 16,
                    padding: 12,
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ fontWeight: 900 }}>
                    <TagOutlined style={{ marginRight: 8 }} />
                    Mã ưu đãi
                  </Text>
                  <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                    <Input
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="Nhập mã ưu đãi"
                      style={{ borderRadius: 12 }}
                    />
                    <Button style={{ borderRadius: 12, fontWeight: 900 }}>
                      Áp dụng
                    </Button>
                  </div>
                </div>

                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  <Row justify="space-between">
                    <Text type="secondary">Tạm tính</Text>
                    <Text style={{ fontWeight: 900 }}>{money(subtotal)}</Text>
                  </Row>

                  <Row justify="space-between">
                    <Text type="secondary">Vận chuyển</Text>
                    <Text type="secondary" style={{ fontWeight: 800 }}>
                      Tính ở bước Checkout
                    </Text>
                  </Row>

                  <Divider style={{ margin: "8px 0" }} />

                  <div
                    style={{
                      padding: 14,
                      borderRadius: 16,
                      background: token.colorPrimaryBg,
                      border: `1px solid ${token.colorBorderSecondary}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 14 }}>
                        Tổng thanh toán
                      </div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Có thể xuất hóa đơn VAT khi cần
                      </Text>
                    </div>
                    <div
                      style={{
                        fontWeight: 900,
                        fontSize: 22,
                        color: token.colorPrimary,
                      }}
                    >
                      {money(subtotal)}
                    </div>
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<RightOutlined />}
                    style={{
                      height: 52,
                      borderRadius: 14,
                      fontWeight: 900,
                      boxShadow: token.boxShadowSecondary,
                    }}
                    onClick={() => navigate("/checkout")}
                  >
                    Tiến hành thanh toán
                  </Button>
                </Space>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Cart;