import React, { useEffect, useState } from "react";
import { Row, Col, Card, Button, Tag, Spin, message } from "antd";
import {
  ShoppingCartOutlined,
  SafetyOutlined,
  CustomerServiceOutlined,
  VerifiedOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FeaturedBanner from "../../components/FeaturedBanner/FeaturedBanner";
import { useCart } from "../../Routes/Context/CartContext";
import { useAuth } from "../../Routes/Context/AuthContext";

const API_URL = "http://localhost:9999";

/* ================== ✅ FIX ẢNH DÙNG CHUNG ================== */
const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return "/no-image.png";

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  return `${API_URL}${imageUrl}`;
};
/* ========================================================= */

const HomePage = () => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // banners (from DB)
  const [homeBanners, setHomeBanners] = useState([]);

  // =============================
  // 📥 FETCH FEATURED PRODUCTS
  // =============================
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/products/public`
        );

        if (!response.ok) {
          throw new Error("API không phản hồi hợp lệ");
        }

        const result = await response.json();
        const activeProducts = result.data || [];

        const featured = activeProducts.filter(
          (p) => p.featured === true
        );

        const finalProducts =
          featured.length > 0
            ? featured.slice(0, 6)
            : activeProducts.slice(0, 6);

        setProducts(finalProducts);
      } catch (error) {
        console.error("Lỗi fetch sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // =============================
  // 📥 FETCH HOME BANNERS
  // =============================
  useEffect(() => {
    const fetchHomeBanners = async () => {
      try {
        const res = await fetch(`${API_URL}/api/banners?page=home`);
        if (!res.ok) return;

        const result = await res.json();
        const list = result.data || [];

        const mapped = list.map((b) => ({
          id: b._id,
          title: b.title,
          subtitle: b.subtitle,
          glowText: b.glowText,
          ctaText: b.ctaText,
          href: b.ctaLink,
          imageUrl: resolveImageUrl(b.imageUrl), // ✅ FIX
          bgColor: b.bgValue,
        }));

        setHomeBanners(mapped);
      } catch (e) {
        console.error("Lỗi fetch banner:", e);
      }
    };

    fetchHomeBanners();
  }, []);

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", color: "#0b1c36" }}>
      {/* ================= FEATURED BANNER ================= */}
      {homeBanners.length > 0 && (
        <section style={{ padding: "16px 20px", background: "#fff" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <FeaturedBanner items={homeBanners} height={320} />
          </div>
        </section>
      )}

      {/* ================= HERO ================= */}
      <section
        style={{
          background:
            "linear-gradient(135deg, #f0f7ff 0%, #ffffff 50%, #f9f0ff 100%)",
          padding: "60px 20px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Row align="middle" gutter={[40, 40]}>
            <Col xs={24} md={12}>
              <h1 style={{ fontSize: 48, fontWeight: 800 }}>
                Linh Kiện Điện Lạnh <br />
                <span style={{ color: "#1890ff" }}>
                  Chất Lượng Cao
                </span>
              </h1>
              <p
                style={{
                  fontSize: 18,
                  color: "#4b5563",
                  marginBottom: 32,
                }}
              >
                Chuyên cung cấp linh kiện chính hãng cho tủ lạnh,
                máy lạnh, máy giặt. Giao hàng toàn quốc.
              </p>

              <Button
                type="primary"
                size="large"
                style={{ borderRadius: 8 }}
              >
                <Link to="/products" style={{ color: "#fff" }}>
                  Xem sản phẩm
                </Link>
              </Button>
            </Col>

            <Col xs={24} md={12} style={{ textAlign: "center" }}>
              <img
                src="/chilltech.png"
                alt="Hero"
                style={{ maxWidth: "100%", borderRadius: 24 }}
              />
            </Col>
          </Row>
        </div>
      </section>

      {/* ================= FEATURED PRODUCTS ================= */}
      <section style={{ padding: "80px 20px", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700 }}>
              Sản Phẩm Nổi Bật
            </h2>
            <p style={{ color: "#6b7280" }}>
              Các sản phẩm được khách hàng tin dùng nhất
            </p>
            <div
              style={{
                width: 60,
                height: 4,
                background: "#1890ff",
                margin: "12px auto 0",
                borderRadius: 4,
              }}
            />
          </div>

          {loading ? (
            <div style={{ textAlign: "center" }}>
              <Spin size="large" />
            </div>
          ) : (
            <Row gutter={[24, 24]}>
              {products.map((item) => {
                const imgSrc = resolveImageUrl(item.imageUrl);

                return (
                  <Col xs={24} sm={12} md={8} key={item._id}>
                    <Card
                      hoverable
                      style={{ borderRadius: 16 }}
                      cover={
                        <Link to={`/products/${item._id}`}>
                          <div
                            style={{
                              height: 220,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "#fff",
                              borderBottom:
                                "1px solid #f0f0f0",
                            }}
                          >
                            <img
                              src={imgSrc}
                              alt={item.productName}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/no-image.png";
                              }}
                              style={{
                                maxHeight: "100%",
                                maxWidth: "100%",
                                objectFit: "contain",
                              }}
                            />
                          </div>
                        </Link>
                      }
                    >
                      {item.featured && (
                        <Tag
                          color="blue"
                          style={{ marginBottom: 8 }}
                        >
                          Nổi bật
                        </Tag>
                      )}

                      <h4 style={{ minHeight: 44 }}>
                        <Link
                          to={`/products/${item._id}`}
                          style={{ color: "#0b1c36" }}
                        >
                          {item.productName}
                        </Link>
                      </h4>

                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          color: "#1890ff",
                          marginBottom: 12,
                        }}
                      >
                        {item.price
                          ? item.price.toLocaleString() +
                            "₫"
                          : "Liên hệ"}
                      </div>

                      <Button
                        type="primary"
                        block
                        icon={<ShoppingCartOutlined />}
                        onClick={() => {
                          if (!user) {
                            message.info(
                              "Vui lòng đăng nhập để thêm vào giỏ"
                            );
                            navigate("/login", {
                              replace: true,
                              state: {
                                from:
                                  location.pathname +
                                  location.search,
                              },
                            });
                            return;
                          }
                          addToCart(item, 1);
                          message.success(
                            "Đã thêm vào giỏ!"
                          );
                        }}
                      >
                        Thêm vào giỏ
                      </Button>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </div>
      </section>

      {/* ================= COMMITMENT ================= */}
      <section style={{ padding: "70px 20px", background: "#f9fafb" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Row gutter={[24, 24]} justify="center">
            <Col xs={24} md={8} style={{ textAlign: "center" }}>
              <SafetyOutlined
                style={{ fontSize: 36, color: "#1890ff" }}
              />
              <h3 style={{ marginTop: 16, fontWeight: 600 }}>
                Hàng chính hãng
              </h3>
              <p style={{ color: "#6b7280" }}>
                Cam kết 100% hàng chính hãng
              </p>
            </Col>

            <Col xs={24} md={8} style={{ textAlign: "center" }}>
              <CustomerServiceOutlined
                style={{ fontSize: 36, color: "#1890ff" }}
              />
              <h3 style={{ marginTop: 16, fontWeight: 600 }}>
                Hỗ trợ 24/7
              </h3>
              <p style={{ color: "#6b7280" }}>
                Tư vấn kỹ thuật miễn phí
              </p>
            </Col>

            <Col xs={24} md={8} style={{ textAlign: "center" }}>
              <VerifiedOutlined
                style={{ fontSize: 36, color: "#1890ff" }}
              />
              <h3 style={{ marginTop: 16, fontWeight: 600 }}>
                Bảo hành dài hạn
              </h3>
              <p style={{ color: "#6b7280" }}>
                Bảo hành từ 6–24 tháng
              </p>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
