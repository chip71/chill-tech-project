import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
  Result,
  message,
  theme,
  Steps,
  Descriptions,
  Tooltip,
} from "antd";
import {
  BankOutlined,
  QrcodeOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  SafetyCertificateOutlined,
  HomeOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import qrImage from "../../assets/payment_qr.png";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const { Title, Text } = Typography;

const API_URL = "http://localhost:9999";

/**
 * Paid / Payment Instruction Page
 * - UI tối ưu cho cả B2C & B2B
 * - Giữ nguyên logic API hiện có
 */
const Paid = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  /* ======================
     LOAD ORDER
  ====================== */
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/orders/${orderId}`, {
          withCredentials: true,
        });
        setOrder(res.data?.data || null);
      } catch (err) {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  /* ======================
     MARK AS PROCESSING + NAVIGATE HOME
  ====================== */
  const handleMarkProcessing = async () => {
    if (!order) return;

    try {
      setUpdating(true);

      await axios.put(
        `${API_URL}/api/orders/${order._id}/processing`,
        {
          paymentMethod: "BANK_TRANSFER",
          transactionCode: order.paymentContent, // CỰC KỲ QUAN TRỌNG
        },
        { withCredentials: true }
      );

      message.success("Đã ghi nhận thanh toán, đơn hàng đang được xử lý");
      navigate("/");
    } catch (err) {
      message.error(
        err.response?.data?.message || "Không thể cập nhật trạng thái đơn hàng"
      );
    } finally {
      setUpdating(false);
    }
  };


  const canConfirm = order?.orderStatus === "Chờ thanh toán";

  const totalAmountText = useMemo(() => {
    const v = Number(order?.totalAmount || 0);
    return v.toLocaleString() + "₫";
  }, [order]);

  const copyText = async (value) => {
    try {
      await navigator.clipboard.writeText(String(value || ""));
      message.success("Đã sao chép");
    } catch {
      message.error("Không thể sao chép");
    }
  };

  /* ======================
     LOADING / NOT FOUND
  ====================== */
  if (loading) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <Result
        status="404"
        title="Không tìm thấy đơn hàng"
        subTitle="Đơn hàng không tồn tại hoặc bạn không có quyền truy cập."
        extra={
          <Button type="primary" onClick={() => navigate("/")}>
            Quay về trang chủ
          </Button>
        }
      />
    );
  }

  // Optional fields (B2B)
  const invoice = order?.invoice || null;
  const receiveMethod = order?.receiveMethod || null; // if backend returns
  const shippingAddress = order?.shippingAddress || order?.shippingInfo?.address;
  const shippingUnit = order?.shippingUnit || order?.shippingInfo?.unit;

  const pageWrap = {
    background: `radial-gradient(1100px 520px at 15% -10%, ${token.colorPrimaryBg} 0%, transparent 55%),
                 radial-gradient(900px 420px at 100% 0%, ${token.colorInfoBg} 0%, transparent 55%),
                 linear-gradient(180deg, ${token.colorFillSecondary} 0%, ${token.colorBgLayout} 55%, ${token.colorBgLayout} 100%)`,
    minHeight: "calc(100vh - 64px)",
    padding: "28px 0 56px",
  };

  const container = { maxWidth: 1150, margin: "0 auto", padding: "0 16px" };

  const softCard = {
    borderRadius: 18,
    boxShadow: token.boxShadowTertiary,
    background: token.colorBgContainer,
    overflow: "hidden",
  };

  const accentBadge = (
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
  );

  return (
    <div style={pageWrap}>
      <div style={container}>
        {/* Breadcrumb */}
        <Text type="secondary">
          <Link to="/">Trang chủ</Link> {" / "} <span>Thanh toán</span>
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
              Thanh toán đơn hàng
            </Title>
            <Text type="secondary">
              Hoàn tất chuyển khoản theo hướng dẫn bên dưới để hệ thống ghi nhận.
            </Text>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {accentBadge}
            <div>
              <div style={{ fontWeight: 900, lineHeight: 1.1 }}>
                {totalAmountText}
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Mã đơn: {order?._id || orderId}
              </Text>
            </div>
          </div>
        </div>

        <div style={{ height: 14 }} />

        {/* Steps */}
        <Card bordered={false} style={{ ...softCard, marginBottom: 18 }} bodyStyle={{ padding: 16 }}>
          <Steps
            current={2}
            items={[
              { title: "Giỏ hàng" },
              { title: "Checkout" },
              { title: "Thanh toán" },
            ]}
          />
        </Card>

        <Row gutter={[24, 24]}>
          {/* LEFT: BANK INFO + ORDER INFO */}
          <Col xs={24} lg={12}>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <Card bordered={false} style={softCard} bodyStyle={{ padding: 18 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <Space size={12} align="center">
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 14,
                        background: token.colorFillSecondary,
                        border: `1px solid ${token.colorBorderSecondary}`,
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <BankOutlined style={{ color: token.colorTextSecondary, fontSize: 18 }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 16, lineHeight: 1.2 }}>
                        Thông tin chuyển khoản
                      </div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Chuyển khoản ngân hàng để thanh toán
                      </Text>
                    </div>
                  </Space>

                  <Tag color={canConfirm ? "blue" : "green"} style={{ borderRadius: 999, padding: "2px 10px" }}>
                    {order.orderStatus}
                  </Tag>
                </div>

                <Divider style={{ margin: "14px 0" }} />

                <Descriptions
                  column={1}
                  size="middle"
                  labelStyle={{ width: 170, color: token.colorTextSecondary, fontWeight: 700 }}
                  contentStyle={{ fontWeight: 800 }}
                >
                  <Descriptions.Item label="Chủ tài khoản">
                    CT TNHH ĐIỆN LẠNH PHÚ HIỀN
                  </Descriptions.Item>

                  <Descriptions.Item
                    label="Số tài khoản"
                    contentStyle={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}
                  >
                    <span>113690217979</span>
                    <Tooltip title="Sao chép">
                      <Button
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() => copyText("113690217979")}
                        style={{ borderRadius: 10 }}
                      />
                    </Tooltip>
                  </Descriptions.Item>

                  <Descriptions.Item label="Ngân hàng">
                    VietinBank – CN Thanh Hóa
                  </Descriptions.Item>

                  <Descriptions.Item
                    label="Nội dung chuyển khoản"
                    contentStyle={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}
                  >
                    <span style={{ color: token.colorPrimary }}>{order.paymentContent}</span>
                    <Tooltip title="Sao chép">
                      <Button
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() => copyText(order.paymentContent)}
                        style={{ borderRadius: 10 }}
                      />
                    </Tooltip>
                  </Descriptions.Item>

                  <Descriptions.Item label="Số tiền">
                    <span style={{ fontSize: 16, color: token.colorPrimary }}>
                      {totalAmountText}
                    </span>
                  </Descriptions.Item>
                </Descriptions>

                <Divider style={{ margin: "14px 0" }} />

                <Alert
                  type="warning"
                  showIcon
                  style={{ borderRadius: 14 }}
                  message="Lưu ý quan trọng"
                  description={
                    <div style={{ color: token.colorTextSecondary }}>
                      Vui lòng ghi đúng <b>nội dung chuyển khoản</b> để hệ thống tự động đối soát và ghi nhận thanh toán.
                    </div>
                  }
                />
              </Card>

              {/* Order / Invoice info (B2B friendly) */}
              <Card bordered={false} style={softCard} bodyStyle={{ padding: 18 }}>
                <Space size={12} align="center">
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      background: token.colorFillSecondary,
                      border: `1px solid ${token.colorBorderSecondary}`,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <HomeOutlined style={{ color: token.colorTextSecondary, fontSize: 18 }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 16, lineHeight: 1.2 }}>
                      Thông tin đơn hàng
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Dành cho cả B2B & mua lẻ
                    </Text>
                  </div>
                </Space>

                <Divider style={{ margin: "14px 0" }} />

                <Descriptions
                  column={1}
                  size="small"
                  labelStyle={{ width: 170, color: token.colorTextSecondary, fontWeight: 700 }}
                  contentStyle={{ fontWeight: 700 }}
                >
                  <Descriptions.Item label="Mã đơn">
                    {order?._id || orderId}
                  </Descriptions.Item>

                  <Descriptions.Item label="Hình thức nhận">
                    {receiveMethod
                      ? receiveMethod === "pickup"
                        ? "Tự đến lấy"
                        : "Giao hàng tận nơi"
                      : shippingUnit === "Self Pickup"
                        ? "Tự đến lấy"
                        : "Giao hàng"}
                  </Descriptions.Item>

                  <Descriptions.Item label="Đơn vị vận chuyển">
                    {shippingUnit || "—"}
                  </Descriptions.Item>

                  <Descriptions.Item label="Địa chỉ nhận/điểm lấy">
                    {shippingAddress || "—"}
                  </Descriptions.Item>

                  <Descriptions.Item
                    label="Hóa đơn VAT"
                    contentStyle={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <FileTextOutlined />
                    {invoice ? "Có yêu cầu" : "Không yêu cầu"}
                  </Descriptions.Item>
                </Descriptions>

                {invoice && (
                  <>
                    <Divider style={{ margin: "14px 0" }} />
                    <Descriptions
                      column={1}
                      size="small"
                      labelStyle={{ width: 170, color: token.colorTextSecondary, fontWeight: 700 }}
                      contentStyle={{ fontWeight: 700 }}
                    >
                      <Descriptions.Item label="Tên công ty">
                        {invoice.companyName || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Mã số thuế">
                        {invoice.taxCode || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Email nhận hóa đơn">
                        {invoice.invoiceEmail || "—"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Địa chỉ hóa đơn">
                        {invoice.invoiceAddress || "—"}
                      </Descriptions.Item>
                    </Descriptions>
                  </>
                )}
              </Card>
            </Space>
          </Col>

          {/* RIGHT: QR + CTA */}
          <Col xs={24} lg={12}>
            <Card bordered={false} style={softCard} bodyStyle={{ padding: 18 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <Space size={12} align="center">
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      background: token.colorFillSecondary,
                      border: `1px solid ${token.colorBorderSecondary}`,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <QrcodeOutlined style={{ color: token.colorTextSecondary, fontSize: 18 }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 16, lineHeight: 1.2 }}>
                      Quét QR để thanh toán
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Mở app ngân hàng và quét mã
                    </Text>
                  </div>
                </Space>

                <Tag
                  color={canConfirm ? "blue" : "green"}
                  style={{ borderRadius: 999, padding: "2px 10px" }}
                >
                  {canConfirm ? "Chờ xác nhận" : "Đã ghi nhận"}
                </Tag>
              </div>

              <Divider style={{ margin: "14px 0" }} />

              <div
                style={{
                  background: token.colorFillSecondary,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: 16,
                  padding: 16,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <img
                  src={qrImage}
                  alt="QR Payment"
                  style={{
                    width: 280,
                    maxWidth: "100%",
                    borderRadius: 12,
                  }}
                />
              </div>

              <Divider style={{ margin: "14px 0" }} />

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
                  <div style={{ fontWeight: 900, fontSize: 14 }}>Số tiền cần thanh toán</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Vui lòng chuyển đúng số tiền
                  </Text>
                </div>
                <div style={{ fontWeight: 900, fontSize: 22, color: token.colorPrimary }}>
                  {totalAmountText}
                </div>
              </div>

              <div style={{ height: 14 }} />

              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={updating}
                disabled={!canConfirm}
                onClick={handleMarkProcessing}
                style={{
                  width: "100%",
                  height: 52,
                  borderRadius: 14,
                  fontWeight: 900,
                  boxShadow: token.boxShadowSecondary,
                }}
              >
                Tôi đã chuyển khoản
              </Button>

              <div style={{ height: 10 }} />

              <Button
                icon={<CopyOutlined />}
                onClick={() => copyText(order.paymentContent)}
                style={{ width: "100%", height: 46, borderRadius: 14, fontWeight: 800 }}
              >
                Sao chép nội dung chuyển khoản
              </Button>

              <div style={{ height: 14 }} />

              <Divider style={{ margin: "10px 0" }} />

              <Space direction="vertical" size={10} style={{ width: "100%" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <SafetyCertificateOutlined style={{ color: token.colorTextSecondary }} />
                  <Text type="secondary">Giao dịch được bảo mật</Text>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <FileTextOutlined style={{ color: token.colorTextSecondary }} />
                  <Text type="secondary">
                    {invoice ? "Hóa đơn VAT sẽ được gửi theo email" : "Có thể yêu cầu hóa đơn VAT tại bước checkout"}
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Paid;
