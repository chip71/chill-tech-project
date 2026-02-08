import { useState } from "react";
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  Typography,
  Divider,
  Checkbox,
  message,
} from "antd";
import {
  ShoppingOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { Link } from "react-router-dom";

// ⚠️ SỬA PATH NÀY cho đúng dự án của bạn
// Ví dụ nếu AuthContext nằm ở src/Routes/Context/AuthContext.jsx thì giữ như dưới
import { useAuth } from "../../Routes/Context/AuthContext";

const { Title, Text } = Typography;

const API_URL = "http://localhost:9999";
const ADMIN_DASHBOARD_PATH = "/admin";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { fetchMe } = useAuth();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 1) Login
      const loginRes = await axios.post(
        `${API_URL}/api/auth/login`,
        values,
        { withCredentials: true }
      );

      // 2) Try read role from response (optional)
      let role =
        loginRes?.data?.user?.role ||
        loginRes?.data?.data?.user?.role ||
        loginRes?.data?.data?.role ||
        loginRes?.data?.role ||
        null;

      // 3) Fetch current user để cập nhật context / role chắc chắn
      const me = await fetchMe();
      role = role || me?.role;

      message.success("Đăng nhập thành công");

      // ✅ FIX CHẮC CHẮN: Admin luôn nhảy thẳng dashboard (hard redirect)
      if (String(role).toUpperCase() === "ADMIN") {
        window.location.replace(ADMIN_DASHBOARD_PATH);
        return;
      }

      // User thường về home
      window.location.replace("/");
    } catch (err) {
      message.error(err?.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 600px at 10% 10%, rgba(24,144,255,.18), transparent 60%)," +
          "radial-gradient(900px 500px at 90% 20%, rgba(82,196,26,.14), transparent 55%)," +
          "linear-gradient(135deg, #f7f9fc 0%, #ffffff 60%, #f7f9fc 100%)",
        display: "flex",
        alignItems: "center",
        padding: 16,
      }}
    >
      <Row
        gutter={[24, 24]}
        style={{ width: "100%", maxWidth: 1100, margin: "0 auto" }}
        align="middle"
      >
        {/* LEFT - Marketing Panel */}
        <Col xs={24} md={12}>
          <div style={{ padding: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #1677ff, #69b1ff)",
                  display: "grid",
                  placeItems: "center",
                  color: "white",
                  boxShadow: "0 10px 25px rgba(22,119,255,.25)",
                }}
              >
                <ShoppingOutlined style={{ fontSize: 22 }} />
              </div>
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  ChillTech Store
                </Title>
                <Text type="secondary">Mua sắm nhanh • An toàn • Giá tốt</Text>
              </div>
            </div>

            <div style={{ marginTop: 22 }}>
              <Title level={2} style={{ marginBottom: 8, lineHeight: 1.15 }}>
                Đăng nhập để tiếp tục
                <br />
                trải nghiệm mua sắm chuyên nghiệp
              </Title>
              <Text type="secondary" style={{ fontSize: 15 }}>
                Quản lý đơn hàng, theo dõi vận chuyển, ưu đãi thành viên và nhiều hơn nữa.
              </Text>
            </div>

            <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
              <Feature
                icon={<SafetyCertificateOutlined />}
                title="Thanh toán an toàn"
                desc="Bảo mật giao dịch, xác thực rõ ràng."
              />
              <Feature
                icon={<ThunderboltOutlined />}
                title="Giao nhanh"
                desc="Tối ưu vận chuyển, cập nhật trạng thái realtime."
              />
              <Feature
                icon={<GiftOutlined />}
                title="Ưu đãi thành viên"
                desc="Mã giảm giá, tích điểm, quà tặng định kỳ."
              />
            </div>
          </div>
        </Col>

        {/* RIGHT - Login Card */}
        <Col xs={24} md={12}>
          <Card
            style={{
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: "0 18px 40px rgba(0,0,0,.08)",
              border: "1px solid rgba(0,0,0,.06)",
            }}
            bodyStyle={{ padding: 26 }}
          >
            <Title level={3} style={{ marginTop: 0, marginBottom: 4 }}>
              Đăng nhập
            </Title>
            <Text type="secondary">Chào mừng quay trở lại 👋</Text>

            <Divider style={{ margin: "16px 0" }} />

            <Form layout="vertical" onFinish={onFinish} autoComplete="off">
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input
                  size="large"
                  placeholder="name@email.com"
                  style={{ borderRadius: 12 }}
                />
              </Form.Item>

              <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
              >
                <Input.Password
                  size="large"
                  placeholder="••••••••"
                  style={{ borderRadius: 12 }}
                />
              </Form.Item>

              {/* <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                <Link to="/forgot-password">Quên mật khẩu?</Link>
              </div> */}

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                block
                style={{
                  borderRadius: 12,
                  height: 44,
                  boxShadow: "0 10px 25px rgba(22,119,255,.22)",
                }}
              >
                Đăng nhập
              </Button>
              <div style={{ marginTop: 14 }}>
                <Text type="secondary">
                  Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
                </Text>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: 14,
        borderRadius: 16,
        border: "1px solid rgba(0,0,0,.06)",
        background: "rgba(255,255,255,.7)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          display: "grid",
          placeItems: "center",
          background: "rgba(22,119,255,.10)",
          color: "#1677ff",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 18 }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontWeight: 700 }}>{title}</div>
        <div style={{ color: "rgba(0,0,0,.55)" }}>{desc}</div>
      </div>
    </div>
  );
}
