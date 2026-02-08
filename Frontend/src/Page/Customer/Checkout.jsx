import {
  Form,
  Input,
  Card,
  Button,
  Divider,
  Image,
  Alert,
  Select,
  List,
  Typography,
  Row,
  Col,
  Steps,
  Space,
  theme,
  Radio,
  Checkbox,
  message,
} from "antd";
import { useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../Routes/Context/CartContext";
import {
  CreditCardOutlined,
  RightOutlined,
  HomeOutlined,
  PhoneOutlined,
  UserOutlined,
  CarOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  FileTextOutlined,
  MailOutlined,
  BankOutlined,
} from "@ant-design/icons";

const { Option } = Select;
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

  // Ảnh upload từ backend
  return `${API_URL}${imageUrl}`;
};

const CheckOut = () => {
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const { cartItems, clearCart } = useCart();
  const [form] = Form.useForm();

  /* ================= OSM ADDRESS ================= */
  const [addressQuery, setAddressQuery] = useState("");
  const [addressResults, setAddressResults] = useState([]);
  const debounceRef = useRef(null);

  const searchAddress = (value) => {
    setAddressQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value || value.length < 3) {
      setAddressResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            value
          )}&limit=5&accept-language=vi`
        );
        const data = await res.json();
        setAddressResults(data || []);
      } catch (err) {
        console.error("Lỗi tìm địa chỉ:", err);
      }
    }, 450);
  };

  /* ================= RECEIVE METHOD ================= */
  // "delivery" | "pickup"
  const [receiveMethod, setReceiveMethod] = useState("delivery");
  const [shippingUnit, setShippingUnit] = useState(null);

  // Pickup locations: bạn có thể đổi thành địa chỉ thật của shop
  const pickupOptions = [
    {
      value: "số 627, Lê Lai, Phường Quảng Hưng , Thanh Hóa, Vietnam",
      label: "số 627, Lê Lai, Phường Quảng Hưng , Thanh Hóa, Vietnam",
    },
  ];

  const totalProductPrice = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + item.quantity * Number(item.product.price || 0),
        0
      ),
    [cartItems]
  );

  const totalWeight = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + item.quantity * Number(item.product.wpu || 0),
        0
      ),
    [cartItems]
  );

  const shippingFee = useMemo(() => {
    if (receiveMethod === "pickup") return 0;
    if (!shippingUnit || totalWeight === 0) return 0;

    if (shippingUnit === "Giao hàng nhanh") {
      if (totalWeight <= 2) return 18000;
      return 18000 + Math.ceil((totalWeight - 2) / 0.5) * 3500;
    }

    if (shippingUnit === "J&T Express") {
      if (totalWeight <= 1) return 20700;
      return 20700 + Math.ceil((totalWeight - 1) / 0.5) * 4000;
    }

    return 0;
  }, [shippingUnit, totalWeight, receiveMethod]);

  const totalAmount = totalProductPrice + shippingFee;

  /* ================= B2B INVOICE ================= */
  const [needInvoice, setNeedInvoice] = useState(false);

  /* ================= CONFIRM CHECKOUT (GIỮ LOGIC) ================= */
  const handleConfirmCheckout = async () => {
    try {
      // Validate required fields first
      const values = await form.validateFields();

      const payload = {
        // giữ các field backend cũ (nếu có)
        shippingAddress:
          receiveMethod === "pickup"
            ? values.pickupLocation
            : values.shippingAddress,
        shippingUnit: receiveMethod === "pickup" ? "Tự đến lấy" : values.shippingUnit,
        pickupLocation: receiveMethod === "pickup" ? values.pickupLocation : undefined,
        note: values.note || "",

        // thêm field (backend có thể ignore nếu chưa dùng)
        receiveMethod,
        customerInfo: {
          receiverName: values.receiverName,
          phone: values.phone,
          email: values.email || "",
          contactPerson: values.contactPerson || "",
        },
        invoice: needInvoice
          ? {
            companyName: values.companyName,
            taxCode: values.taxCode,
            invoiceAddress: values.invoiceAddress,
            invoiceEmail: values.invoiceEmail,
            invoiceNote: values.invoiceNote || "",
          }
          : null,
      };

      const res = await axios.post(`${API_URL}/api/checkout/confirm`, payload, {
        withCredentials: true,
      });

      const order = res.data?.data?.order;
      if (!order?._id) {
        message.error("Tạo đơn thất bại: thiếu mã đơn hàng");
        return;
      }

      await clearCart();
      navigate(`/payment/${order._id}`);
    } catch (err) {
      // validateFields throws an object
      if (err?.errorFields) {
        message.warning("Vui lòng điền đầy đủ thông tin bắt buộc.");
        return;
      }
      console.error(err);
      message.error("Xác nhận thanh toán thất bại");
    }
  };

  /* ================= UI STYLES ================= */
  const pageWrap = {
    background: `radial-gradient(1100px 520px at 15% -10%, ${token.colorPrimaryBg} 0%, transparent 55%),
                 radial-gradient(900px 420px at 100% 0%, ${token.colorInfoBg} 0%, transparent 55%),
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

  const sectionTitle = (icon, text) => (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 14,
          background: token.colorFillSecondary,
          display: "grid",
          placeItems: "center",
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 900, fontSize: 16, lineHeight: 1.2 }}>
          {text}
        </div>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Vui lòng nhập chính xác để xử lý nhanh
        </Text>
      </div>
    </div>
  );

  const isCartEmpty = cartItems.length === 0;

  return (
    <div style={pageWrap}>
      <div style={container}>
        {/* Breadcrumb */}
        <Text type="secondary">
          <Link to="/">Trang chủ</Link> {" / "}{" "}
          <Link to="/cart">Giỏ hàng</Link> {" / "} <span>Thanh toán</span>
        </Text>

        <div style={{ marginTop: 12, marginBottom: 14 }}>
          <Title level={2} style={{ margin: 0 }}>
            Thanh toán
          </Title>
          <Text type="secondary">
            Điền thông tin • Chọn nhận hàng • Xác nhận đơn
          </Text>
        </div>

        {/* Steps */}
        <Card bordered={false} style={{ ...softCard, marginBottom: 18 }} bodyStyle={{ padding: 16 }}>
          <Steps
            current={1}
            items={[
              { title: "Giỏ hàng" },
              { title: "Thông tin & Vận chuyển" },
              { title: "Thanh toán" },
            ]}
          />
        </Card>

        <Row gutter={[24, 24]}>
          {/* LEFT */}
          <Col xs={24} lg={16}>
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                receiverName: "",
                phone: "",
                email: "",
                contactPerson: "",
                shippingAddress: "",
                shippingUnit: null,
                note: "",
                pickupLocation: pickupOptions[0]?.value,
              }}
            >
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                {/* Buyer / Contact */}
                <Card bordered={false} style={softCard} bodyStyle={{ padding: 18 }}>
                  {sectionTitle(<UserOutlined style={{ color: token.colorTextSecondary }} />, "Thông tin liên hệ")}

                  <Divider style={{ margin: "14px 0" }} />

                  <Row gutter={[16, 10]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Tên người nhận"
                        name="receiverName"
                        rules={[{ required: true, message: "Vui lòng nhập tên người nhận" }]}
                      >
                        <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Số điện thoại"
                        name="phone"
                        rules={[
                          { required: true, message: "Vui lòng nhập số điện thoại" },
                          {
                            pattern: /^(0|\+84)\d{9,10}$/,
                            message: "Số điện thoại không hợp lệ",
                          },
                        ]}
                      >
                        <Input prefix={<PhoneOutlined />} placeholder="0xxxxxxxxx" />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Email (tuỳ chọn)"
                        name="email"
                        rules={[{ type: "email", message: "Email không hợp lệ" }]}
                      >
                        <Input prefix={<MailOutlined />} placeholder="email@company.com" />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item label="Người/Phòng ban liên hệ (B2B)" name="contactPerson">
                        <Input prefix={<BankOutlined />} placeholder="Purchasing / Procurement..." />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>

                {/* Receive method */}
                <Card bordered={false} style={softCard} bodyStyle={{ padding: 18 }}>
                  {sectionTitle(<CarOutlined style={{ color: token.colorTextSecondary }} />, "Nhận hàng")}

                  <Divider style={{ margin: "14px 0" }} />

                  <Form.Item label="Hình thức nhận hàng" required>
                    <Radio.Group
                      value={receiveMethod}
                      onChange={(e) => {
                        const next = e.target.value;
                        setReceiveMethod(next);

                        if (next === "pickup") {
                          // clear delivery-required fields
                          setShippingUnit(null);
                          form.setFieldsValue({ shippingUnit: null });
                          setAddressResults([]);
                          // keep addressQuery UI but not required
                        }
                      }}
                      style={{ width: "100%" }}
                    >
                      <Row gutter={[12, 12]}>
                        <Col xs={24} md={12}>
                          <div
                            onClick={() => setReceiveMethod("delivery")}
                            style={{
                              cursor: "pointer",
                              padding: 14,
                              borderRadius: 16,
                              border: `1px solid ${receiveMethod === "delivery"
                                ? token.colorPrimary
                                : token.colorBorderSecondary
                                }`,
                              background:
                                receiveMethod === "delivery"
                                  ? token.colorPrimaryBg
                                  : token.colorBgContainer,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 12,
                            }}
                          >
                            <Space>
                              <CarOutlined />
                              <div>
                                <div style={{ fontWeight: 900, lineHeight: 1.2 }}>
                                  Giao hàng tận nơi
                                </div>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  Chọn đơn vị vận chuyển
                                </Text>
                              </div>
                            </Space>
                            <Radio value="delivery" />
                          </div>
                        </Col>

                        <Col xs={24} md={12}>
                          <div
                            onClick={() => setReceiveMethod("pickup")}
                            style={{
                              cursor: "pointer",
                              padding: 14,
                              borderRadius: 16,
                              border: `1px solid ${receiveMethod === "pickup"
                                ? token.colorPrimary
                                : token.colorBorderSecondary
                                }`,
                              background:
                                receiveMethod === "pickup"
                                  ? token.colorPrimaryBg
                                  : token.colorBgContainer,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 12,
                            }}
                          >
                            <Space>
                              <ShopOutlined />
                              <div>
                                <div style={{ fontWeight: 900, lineHeight: 1.2 }}>
                                  Tự đến lấy
                                </div>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  Nhận tại điểm lấy hàng
                                </Text>
                              </div>
                            </Space>
                            <Radio value="pickup" />
                          </div>
                        </Col>
                      </Row>
                    </Radio.Group>
                  </Form.Item>

                  {receiveMethod === "delivery" ? (
                    <>
                      <Row gutter={[16, 10]}>
                        <Col xs={24}>
                          <Form.Item
                            label="Địa chỉ nhận hàng"
                            name="shippingAddress"
                            rules={[
                              { required: true, message: "Vui lòng nhập địa chỉ nhận hàng" },
                            ]}
                          >
                            <div style={{ position: "relative" }}>
                              <Input
                                prefix={<HomeOutlined />}
                                placeholder="Nhập địa chỉ (gợi ý từ OpenStreetMap)"
                                value={addressQuery}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  searchAddress(v);
                                  form.setFieldsValue({ shippingAddress: v });
                                }}
                                onBlur={() => setTimeout(() => setAddressResults([]), 150)}
                              />

                              {addressResults.length > 0 && (
                                <List
                                  size="small"
                                  bordered
                                  style={{
                                    position: "absolute",
                                    zIndex: 1000,
                                    width: "100%",
                                    background: token.colorBgContainer,
                                    marginTop: 6,
                                    borderRadius: 14,
                                    maxHeight: 220,
                                    overflowY: "auto",
                                    boxShadow: token.boxShadowSecondary,
                                  }}
                                  dataSource={addressResults}
                                  renderItem={(item) => (
                                    <List.Item
                                      style={{ cursor: "pointer" }}
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={() => {
                                        setAddressQuery(item.display_name);
                                        form.setFieldsValue({
                                          shippingAddress: item.display_name,
                                        });
                                        setAddressResults([]);
                                      }}
                                    >
                                      {item.display_name}
                                    </List.Item>
                                  )}
                                />
                              )}
                            </div>
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                          <Form.Item
                            label="Đơn vị vận chuyển"
                            name="shippingUnit"
                            rules={[
                              { required: true, message: "Vui lòng chọn đơn vị vận chuyển" },
                            ]}
                          >
                            <Select
                              placeholder="Chọn đơn vị vận chuyển"
                              onChange={(v) => setShippingUnit(v)}
                              value={shippingUnit}
                            >
                              <Option value="Giao hàng nhanh">Giao Hàng Nhanh</Option>
                              <Option value="J&T Express">J&T Express</Option>
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                          <Form.Item label="Ghi chú (tuỳ chọn)" name="note">
                            <Input placeholder="Ví dụ: giao giờ hành chính, gọi trước..." />
                          </Form.Item>
                        </Col>
                      </Row>
                    </>
                  ) : (
                    <>
                      <Row gutter={[16, 10]}>
                        <Col xs={24}>
                          <Form.Item
                            label="Chọn điểm lấy hàng"
                            name="pickupLocation"
                            rules={[
                              { required: true, message: "Vui lòng chọn điểm lấy hàng" },
                            ]}
                          >
                            <Select placeholder="Chọn điểm lấy hàng">
                              {pickupOptions.map((p) => (
                                <Option key={p.value} value={p.value}>
                                  {p.label}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>

                          <Alert
                            type="info"
                            showIcon
                            style={{ borderRadius: 14 }}
                            message="Tự đến lấy"
                            description="Vui lòng mang theo mã đơn hàng khi đến nhận. Bộ phận kho sẽ liên hệ khi hàng sẵn sàng."
                          />
                        </Col>

                        <Col xs={24}>
                          <Form.Item label="Ghi chú (tuỳ chọn)" name="note">
                            <Input placeholder="Ví dụ: nhờ giữ hàng đến 17:00..." />
                          </Form.Item>
                        </Col>
                      </Row>
                    </>
                  )}
                </Card>

                {/* Invoice (B2B VAT) */}
                <Card bordered={false} style={softCard} bodyStyle={{ padding: 18 }}>
                  {sectionTitle(<FileTextOutlined style={{ color: token.colorTextSecondary }} />, "Hóa đơn VAT")}

                  <Divider style={{ margin: "14px 0" }} />

                  <Checkbox
                    checked={needInvoice}
                    onChange={(e) => setNeedInvoice(e.target.checked)}
                    style={{ fontWeight: 800 }}
                  >
                    Yêu cầu xuất hóa đơn VAT
                  </Checkbox>

                  {needInvoice && (
                    <>
                      <Divider style={{ margin: "14px 0" }} />
                      <Row gutter={[16, 10]}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label="Tên công ty"
                            name="companyName"
                            rules={[{ required: true, message: "Vui lòng nhập tên công ty" }]}
                          >
                            <Input prefix={<BankOutlined />} placeholder="CÔNG TY TNHH ..." />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                          <Form.Item
                            label="Mã số thuế"
                            name="taxCode"
                            rules={[
                              { required: true, message: "Vui lòng nhập mã số thuế" },
                              {
                                pattern: /^[0-9]{10,13}$/,
                                message: "Mã số thuế không hợp lệ",
                              },
                            ]}
                          >
                            <Input placeholder="10–13 chữ số" />
                          </Form.Item>
                        </Col>

                        <Col xs={24}>
                          <Form.Item
                            label="Địa chỉ xuất hóa đơn"
                            name="invoiceAddress"
                            rules={[
                              { required: true, message: "Vui lòng nhập địa chỉ xuất hóa đơn" },
                            ]}
                          >
                            <Input prefix={<HomeOutlined />} placeholder="Địa chỉ theo đăng ký doanh nghiệp" />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                          <Form.Item
                            label="Email nhận hóa đơn"
                            name="invoiceEmail"
                            rules={[
                              { required: true, message: "Vui lòng nhập email nhận hóa đơn" },
                              { type: "email", message: "Email không hợp lệ" },
                            ]}
                          >
                            <Input prefix={<MailOutlined />} placeholder="billing@company.com" />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                          <Form.Item label="Ghi chú hóa đơn (tuỳ chọn)" name="invoiceNote">
                            <Input placeholder="Ví dụ: Xuất theo PO #..." />
                          </Form.Item>
                        </Col>
                      </Row>
                    </>
                  )}
                </Card>

                <Alert
                  type="warning"
                  showIcon
                  style={{ borderRadius: 14 }}
                  message="Lưu ý"
                  description="Vui lòng kiểm tra kỹ thông tin trước khi xác nhận. Đơn sẽ chuyển sang bước thanh toán."
                />
              </Space>
            </Form>
          </Col>

          {/* RIGHT: SUMMARY + PAYMENT UI */}
          <Col xs={24} lg={8}>
            <div style={{ position: "sticky", top: 92 }}>
              <Card bordered={false} style={softCard} bodyStyle={{ padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div>
                    <Title level={4} style={{ margin: 0 }}>
                      Tóm tắt đơn hàng
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {cartItems.length} sản phẩm
                    </Text>
                  </div>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      background: token.colorPrimaryBg,
                      display: "grid",
                      placeItems: "center",
                      border: `1px solid ${token.colorBorderSecondary}`,
                    }}
                  >
                    <SafetyCertificateOutlined style={{ color: token.colorPrimary }} />
                  </div>
                </div>

                <Divider style={{ margin: "12px 0" }} />

                {/* Items mini list */}
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  {cartItems.map(({ product, quantity }) => {
                    const imageSrc = resolveImageUrl(product.imageUrl);
                    const line = Number(product.price || 0) * quantity;

                    return (
                      <div
                        key={product._id}
                        style={{
                          display: "flex",
                          gap: 12,
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: 14,
                            overflow: "hidden",
                            background: token.colorFillSecondary,
                            flexShrink: 0,
                            border: `1px solid ${token.colorBorderSecondary}`,
                          }}
                        >
                          <Image
                            width={64}
                            height={64}
                            src={imageSrc}
                            preview={false}
                            fallback="/no-image.png"
                            style={{ objectFit: "cover" }}
                          />

                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 900,
                              lineHeight: 1.25,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {product.productName}
                          </div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            SL: {quantity}
                          </Text>
                        </div>

                        <Text style={{ fontWeight: 900 }}>
                          {line.toLocaleString()}₫
                        </Text>
                      </div>
                    );
                  })}

                  <Divider style={{ margin: "10px 0" }} />

                  <Row justify="space-between">
                    <Text type="secondary">Tạm tính</Text>
                    <Text style={{ fontWeight: 900 }}>
                      {totalProductPrice.toLocaleString()}₫
                    </Text>
                  </Row>

                  <Row justify="space-between">
                    <Text type="secondary">
                      {receiveMethod === "pickup" ? "Tự đến lấy" : "Vận chuyển"}
                    </Text>
                    <Text style={{ fontWeight: 900 }}>
                      {receiveMethod === "pickup" ? "0₫" : `${shippingFee.toLocaleString()}₫`}
                    </Text>
                  </Row>

                  <Row justify="space-between">
                    <Text type="secondary">Tổng cân nặng</Text>
                    <Text style={{ fontWeight: 800 }}>
                      {totalWeight.toFixed(2)} kg
                    </Text>
                  </Row>

                  <Divider style={{ margin: "10px 0" }} />

                  {/* Total highlight */}
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
                      <div style={{ fontWeight: 900, fontSize: 14 }}>Tổng thanh toán</div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Đã gồm phí vận chuyển (nếu có)
                      </Text>
                    </div>
                    <div style={{ fontWeight: 900, fontSize: 22, color: token.colorPrimary }}>
                      {totalAmount.toLocaleString()}₫
                    </div>
                  </div>

                  {/* CTA */}
                  <Button
                    type="primary"
                    block
                    size="large"
                    icon={<CreditCardOutlined />}
                    style={{
                      height: 52,
                      borderRadius: 14,
                      fontWeight: 900,
                      boxShadow: token.boxShadowSecondary,
                    }}
                    disabled={isCartEmpty}
                    onClick={handleConfirmCheckout}
                  >
                    Xác nhận & Thanh toán
                  </Button>

                  <Button
                    block
                    icon={<RightOutlined />}
                    style={{ borderRadius: 14, height: 44 }}
                    onClick={() => navigate("/cart")}
                  >
                    Quay lại giỏ hàng
                  </Button>

                  {/* Trust */}
                  <div
                    style={{
                      display: "grid",
                      gap: 10,
                      marginTop: 6,
                      paddingTop: 2,
                    }}
                  >
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <SafetyCertificateOutlined style={{ color: token.colorTextSecondary }} />
                      <Text type="secondary">Bảo mật thanh toán</Text>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <CarOutlined style={{ color: token.colorTextSecondary }} />
                      <Text type="secondary">
                        {receiveMethod === "pickup"
                          ? "Nhận tại điểm lấy hàng"
                          : "Theo dõi vận chuyển theo đơn vị"}
                      </Text>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <FileTextOutlined style={{ color: token.colorTextSecondary }} />
                      <Text type="secondary">
                        {needInvoice ? "Có yêu cầu hóa đơn VAT" : "Có thể xuất hóa đơn VAT khi cần"}
                      </Text>
                    </div>
                  </div>
                </Space>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CheckOut;
