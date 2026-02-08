import { useState } from "react";
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  Checkbox,
  Typography,
  Select,
  Divider,
  message,
} from "antd";
import {
  ShoppingOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const { Title, Text } = Typography;
const { Option } = Select;

const API_URL = "http://localhost:9999";

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        customerName: values.customerName,
        address: values.address,
        gender: values.gender,
        email: values.email,
        password: values.password,
        phone: values.phone,
      };

      await axios.post(`${API_URL}/api/auth/register`, payload);

      message.success("Đăng ký thành công");

      // redirect sau 1s để user thấy message
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.error("REGISTER ERROR:", error);
      message.error(error.response?.data?.message || "Đăng ký thất bại");
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
        {/* LEFT - Marketing Panel (đồng bộ với Login) */}
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
                Tạo tài khoản mới
                <br />
                để bắt đầu mua sắm
              </Title>
              <Text type="secondary" style={{ fontSize: 15 }}>
                Theo dõi đơn hàng, nhận ưu đãi thành viên và trải nghiệm mua sắm mượt mà hơn.
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

        {/* RIGHT - Register Card */}
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
              Đăng ký
            </Title>
            <Text type="secondary">Tạo tài khoản mới để tiếp tục</Text>

            <Divider style={{ margin: "16px 0" }} />

            <Form layout="vertical" onFinish={onFinish} autoComplete="off">
              {/* CUSTOMER */}
              <Form.Item
                label="Họ và tên"
                name="customerName"
                rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
              >
                <Input size="large" style={{ borderRadius: 12 }} />
              </Form.Item>

              <Form.Item
                label="Giới tính"
                name="gender"
                rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
              >
                <Select
                  size="large"
                  placeholder="Chọn giới tính"
                  style={{ borderRadius: 12 }}
                >
                  <Option value="MALE">Nam</Option>
                  <Option value="FEMALE">Nữ</Option>
                  <Option value="OTHER">Khác</Option>
                </Select>
              </Form.Item>

              <Form.Item label="Địa chỉ" name="address">
                <Input size="large" style={{ borderRadius: 12 }} />
              </Form.Item>

              {/* ACCOUNT */}
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input size="large" style={{ borderRadius: 12 }} />
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[
                  { pattern: /^0\d{9}$/, message: "Số điện thoại không hợp lệ" },
                ]}
              >
                <Input size="large" style={{ borderRadius: 12 }} />
              </Form.Item>

              <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu" },
                  { min: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
                ]}
              >
                <Input.Password size="large" style={{ borderRadius: 12 }} />
              </Form.Item>

              <Form.Item
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Mật khẩu không khớp"));
                    },
                  }),
                ]}
              >
                <Input.Password size="large" style={{ borderRadius: 12 }} />
              </Form.Item>

              <Form.Item
                name="agree"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, v) =>
                      v
                        ? Promise.resolve()
                        : Promise.reject(new Error("Bạn phải đồng ý điều khoản")),
                  },
                ]}
              >
                <Checkbox>
                  Tôi đồng ý với <Link to="/terms">điều khoản dịch vụ</Link>
                </Checkbox>
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                style={{
                  borderRadius: 12,
                  height: 44,
                  fontWeight: 700,
                  boxShadow: "0 10px 25px rgba(22,119,255,.22)",
                }}
              >
                Đăng ký
              </Button>
            </Form>

            <div style={{ textAlign: "center", marginTop: 14 }}>
              <Text type="secondary">
                Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

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

export default RegisterPage;
