import { Layout, Row, Col, Space } from "antd";
import {
  FacebookFilled,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

const { Footer } = Layout;

// 👉 đồng bộ với Header
const CONTAINER_WIDTH = 1440;

const AppFooter = () => {
  return (
    <Footer
      id="footer"
      style={{
        background: "#fff",
        padding: "40px 0",
      }}
    >
      <Row
        gutter={[32, 32]}
        style={{
          maxWidth: CONTAINER_WIDTH,
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* Company */}
        <Col xs={24} md={6}>
          <h3>Chill Tech</h3>
          <p>
            Chuyên cung cấp linh kiện điện lạnh chất lượng cao cho các thiết bị
            làm lạnh.
          </p>
          <Space size="middle">

            {/* <MailOutlined style={{ fontSize: 20 }} /> */}
          </Space>
        </Col>

        {/* Support */}
        <Col xs={24} md={6}>
          <h4>Hỗ trợ</h4>
          <Space direction="vertical">
            <a href="/about">Về chúng tôi</a>
            <a href="/warranty">Chính sách đổi trả</a>
          </Space>
        </Col>

        {/* Contact */}
        <Col xs={24} md={6}>
          <h4>Liên hệ</h4>
          <Space direction="vertical">
            <span>
              <EnvironmentOutlined /> 627 Lê Lai, P. Quang Hưng, Thanh Hóa
            </span>
            <span>
              <PhoneOutlined /> +84 986 215 146
            </span>
            <a
              href="https://www.facebook.com/vattudienlanhphuhien?locale=vi_VN"
              target="_blank"
              rel="noreferrer"
            >
              <FacebookFilled style={{ fontSize: 20 }} /> Vật Tư Điện Lạnh Phú Hiền
            </a>

            {/* <span>
              <MailOutlined /> info@chilltech.vn
            </span> */}
          </Space>
        </Col>

        {/* Map */}
        <Col xs={24} md={6}>
          <h4>Bản đồ</h4>
          <div
            style={{
              width: "100%",
              height: 180,
              borderRadius: 8,
              overflow: "hidden",
              border: "1px solid #f0f0f0",
            }}
          >
            <iframe
              title="Chill Tech Map"
              src="https://www.google.com/maps?q=627%20L%C3%AA%20Lai%20Thanh%20H%C3%B3a&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Col>
      </Row>

      {/* Copyright */}
      <div
        style={{
          textAlign: "center",
          marginTop: 40,
          borderTop: "1px solid #f0f0f0",
          paddingTop: 20,
        }}
      >
        © 2026 Chill Tech. Tất cả quyền được bảo lưu.
      </div>
    </Footer>
  );
};

export default AppFooter;