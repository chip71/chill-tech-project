// ProductDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../Routes/Context/CartContext";
import { useAuth } from "../../Routes/Context/AuthContext";

import {
  Row,
  Col,
  Image,
  Breadcrumb,
  Rate,
  Button,
  InputNumber,
  Tag,
  Space,
  Spin,
  Typography,
  Tabs,
  Divider,
  Descriptions,
  Card,
  message,
  Avatar,
  List,
  Form,
  Input,
  Empty,
} from "antd";
import {
  ShoppingCartOutlined,
  TruckOutlined,
  SafetyCertificateOutlined,
  SyncOutlined,
  MessageOutlined,
  UserOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text, Paragraph } = Typography;

const API_URL = "http://localhost:9999";

const money = (v) => (Number(v) || 0).toLocaleString("vi-VN");

const ProductDetail = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // gallery selection
  const [activeImage, setActiveImage] = useState("");

  // comments (demo local)
  const storageKey = useMemo(() => `comments_product_${id}`, [id]);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    // load comments from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      setComments(Array.isArray(saved) ? saved : []);
    } catch {
      setComments([]);
    }
  }, [storageKey]);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_URL}/api/products/${id}`)
      .then((res) => {
        // parse flexible response shapes
        const raw = res?.data;
        const maybe =
          raw?.data?.data ?? // { data: { data: product } }
          raw?.data ?? // { data: product }
          raw?.product ?? // { product: product }
          raw;

        const productData =
          maybe?.data && typeof maybe.data === "object" ? maybe.data : maybe;

        setProduct(productData);

        const stockQ = Number(productData?.stockQuantity) || 0;
        setQuantity((q) => Math.max(1, Math.min(q, stockQ || 1)));

        // image setup
        const main =
          productData?.imageUrl &&
          (productData.imageUrl.startsWith("http")
            ? productData.imageUrl
            : `${API_URL}${productData.imageUrl}`);
        setActiveImage(main || "/no-image.png");
      })
      .catch((err) => {
        console.error("Fetch product failed:", err);
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spin style={{ display: "block", margin: "100px auto" }} />;
  if (!product)
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <Title level={4}>Không tìm thấy sản phẩm.</Title>
        <Link to="/products">Quay lại danh sách</Link>
      </div>
    );

  const price = Number(product.price) || 0;
  const stock = Number(product.stockQuantity) || 0;

  // main image
  const imageSrc = product.imageUrl
    ? product.imageUrl.startsWith("http")
      ? product.imageUrl
      : `${API_URL}${product.imageUrl}`
    : "/no-image.png";

  // gallery: nếu backend có thêm product.images (mảng) thì lấy, không thì dùng lặp ảnh chính
  const gallery = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map((u) => (u.startsWith("http") ? u : `${API_URL}${u}`))
    : [imageSrc, imageSrc, imageSrc, imageSrc];

  const handleAddComment = (values) => {
    const newComment = {
      id: Date.now(),
      name: values.name?.trim() || "Khách",
      rating: Number(values.rating) || 5,
      content: values.content?.trim(),
      createdAt: new Date().toISOString(),
    };
    const next = [newComment, ...comments];
    setComments(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    message.success("Đã gửi đánh giá!");
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 16px 40px" }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <Link to="/">Trang chủ</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/products">Sản phẩm</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{product.productName}</Breadcrumb.Item>
      </Breadcrumb>

      {/* TOP SECTION */}
      <Row gutter={[24, 24]}>
        {/* LEFT: Gallery */}
        <Col xs={24} md={12}>
          <Card
            bordered={false}
            style={{
              borderRadius: 14,
              boxShadow: "0 6px 22px rgba(0,0,0,0.06)",
            }}
            bodyStyle={{ padding: 16 }}
          >
            <div style={{ background: "#fff", borderRadius: 12, padding: 8 }}>
              <Image
                src={activeImage || imageSrc}
                preview={false}
                style={{
                  width: "100%",
                  height: 420,
                  objectFit: "contain",
                  borderRadius: 12,
                }}
              />
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {gallery.slice(0, 6).map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 10,
                    overflow: "hidden",
                    border: img === activeImage ? "2px solid #1677ff" : "1px solid #eee",
                    cursor: "pointer",
                    background: "#fff",
                  }}
                >
                  <img
                    src={img}
                    alt="thumb"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* RIGHT: Purchase box */}
        <Col xs={24} md={12}>
          <Card
            bordered={false}
            style={{
              borderRadius: 14,
              boxShadow: "0 6px 22px rgba(0,0,0,0.06)",
            }}
            bodyStyle={{ padding: 18 }}
          >
            <Space direction="vertical" size={14} style={{ width: "100%" }}>
              <Space wrap>
                <Tag color="blue">{product.category || "Chưa phân loại"}</Tag>
                <Tag>SKU: {product._id ? product._id.slice(-6) : "—"}</Tag>
              </Space>

              <Title level={3} style={{ margin: 0 }}>
                {product.productName}
              </Title>

              <Space align="center">
                <Rate allowHalf value={4.5} disabled />
                <Text type="secondary">(24 đánh giá)</Text>
              </Space>

              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <Title level={2} style={{ margin: 0, color: "#003a5c" }}>
                  {money(price)}₫
                </Title>
                {stock > 0 ? (
                  <Tag color="green">Còn hàng</Tag>
                ) : (
                  <Tag color="red">Hết hàng</Tag>
                )}
              </div>

              <Text>
                Tình trạng:{" "}
                {stock > 0 ? (
                  <Text type="success">Còn {stock} sản phẩm</Text>
                ) : (
                  <Text type="danger">Hết hàng</Text>
                )}
              </Text>

              <Divider style={{ margin: "10px 0" }} />

              <Row gutter={[12, 12]} align="middle">
                <Col flex="none">
                  <Text strong>Số lượng</Text>
                </Col>
                <Col flex="auto">
                  <Space>
                    <InputNumber
                      min={1}
                      max={stock || 1}
                      value={quantity}
                      onChange={(val) => setQuantity(Math.max(1, Math.min(Number(val) || 1, stock || 1)))}
                      style={{ width: 120 }}
                      disabled={stock <= 0}
                    />
                    <Text type="secondary">
                      Tổng: <Text strong>{money(price * quantity)}₫</Text>
                    </Text>
                  </Space>
                </Col>
              </Row>

              <Row gutter={[12, 12]}>
                <Col span={24}>
                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<ShoppingCartOutlined />}
                    onClick={() => {
                      if (!user) {
                        message.info("Vui lòng đăng nhập để thêm vào giỏ");
                        navigate("/login", { replace: true, state: { from: location.pathname + location.search } });
                        return;
                      }
                      addToCart(product, quantity);
                      message.success("Đã thêm vào giỏ hàng!");
                    }}
                    disabled={stock <= 0}
                  >
                    Thêm vào giỏ hàng
                  </Button>
                </Col>
                <Col span={24}>
                  <Button
                    size="large"
                    block
                    disabled={stock <= 0}
                    onClick={() => {
                      if (!user) {
                        message.info("Vui lòng đăng nhập để mua hàng");
                        navigate("/login", {
                          replace: true,
                          state: { from: location.pathname + location.search },
                        });
                        return;
                      }

                      addToCart(product, quantity);
                      navigate("/cart");
                    }}
                  >
                    Mua ngay
                  </Button>

                </Col>
              </Row>

              <Divider style={{ margin: "12px 0" }} />

              {/* Commitments */}
              <Row gutter={[12, 12]}>
                <Col span={8}>
                  <Card size="small" bordered style={{ borderRadius: 12, textAlign: "center" }}>
                    <TruckOutlined style={{ fontSize: 18 }} />
                    <div style={{ marginTop: 6, fontSize: 12 }}>Giao hàng toàn quốc</div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" bordered style={{ borderRadius: 12, textAlign: "center" }}>
                    <SafetyCertificateOutlined style={{ fontSize: 18 }} />
                    <div style={{ marginTop: 6, fontSize: 12 }}>Bảo hành chính hãng</div>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card size="small" bordered style={{ borderRadius: 12, textAlign: "center" }}>
                    <SyncOutlined style={{ fontSize: 18 }} />
                    <div style={{ marginTop: 6, fontSize: 12 }}>Đổi trả 7 ngày</div>
                  </Card>
                </Col>
              </Row>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* DETAILS */}
      <Divider style={{ margin: "26px 0" }} />

      <Card
        bordered={false}
        style={{
          borderRadius: 14,
          boxShadow: "0 6px 22px rgba(0,0,0,0.06)",
        }}
        bodyStyle={{ padding: 18 }}
      >
        <Title level={4} style={{ marginTop: 0 }}>
          Thông tin sản phẩm
        </Title>

        <Tabs
          defaultActiveKey="desc"
          items={[
            {
              key: "desc",
              label: "Mô tả",
              children: (
                <div style={{ lineHeight: 1.8 }}>
                  {product.description ? (
                    <Paragraph style={{ marginBottom: 0 }}>{product.description}</Paragraph>
                  ) : (
                    <Text type="secondary">Chưa có mô tả cho sản phẩm này.</Text>
                  )}
                </div>
              ),
            },
            {
              key: "specs",
              label: "Thông số",
              children: product.specs && typeof product.specs === "object" ? (
                <Descriptions bordered column={1} size="middle">
                  {Object.entries(product.specs).map(([k, v]) => (
                    <Descriptions.Item key={k} label={k}>
                      {String(v)}
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              ) : (
                <Descriptions bordered column={1} size="middle">
                  <Descriptions.Item label="Danh mục">{product.category || "-"}</Descriptions.Item>
                  <Descriptions.Item label="SKU">{product._id ? product._id.slice(-6) : "-"}</Descriptions.Item>
                  <Descriptions.Item label="Tồn kho">{stock}</Descriptions.Item>
                  <Descriptions.Item label="Giá">{money(price)}₫</Descriptions.Item>
                </Descriptions>
              ),
            },
            {
              key: "policy",
              label: "Chính sách",
              children: (
                <div style={{ lineHeight: 1.8 }}>
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    <li>Giao hàng toàn quốc</li>
                    <li>Bảo hành chính hãng (tuỳ sản phẩm)</li>
                    <li>Đổi trả trong 7 ngày nếu lỗi từ nhà sản xuất</li>
                  </ul>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* COMMENTS */}
      <Divider style={{ margin: "26px 0" }} />

      <Card
        bordered={false}
        style={{
          borderRadius: 14,
          boxShadow: "0 6px 22px rgba(0,0,0,0.06)",
        }}
        bodyStyle={{ padding: 18 }}
      >
        <Space align="center" style={{ marginBottom: 12 }}>
          <MessageOutlined />
          <Title level={4} style={{ margin: 0 }}>
            Đánh giá & Bình luận
          </Title>
        </Space>

        {/* Comment Form */}
        <Card size="small" style={{ borderRadius: 12 }} bodyStyle={{ padding: 14 }}>
          <Form layout="vertical" onFinish={handleAddComment} initialValues={{ rating: 5 }}>
            <Row gutter={[12, 12]}>
              <Col xs={24} md={8}>
                <Form.Item name="name" label="Tên của bạn">
                  <Input placeholder="Ví dụ: Duy An" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="rating"
                  label="Đánh giá"
                  rules={[{ required: true, message: "Vui lòng chọn số sao" }]}
                >
                  <Rate />
                </Form.Item>
              </Col>
              <Col xs={24} md={24}>
                <Form.Item
                  name="content"
                  label="Nội dung"
                  rules={[
                    { required: true, message: "Vui lòng nhập nội dung bình luận" },
                    { min: 6, message: "Tối thiểu 6 ký tự" },
                  ]}
                >
                  <Input.TextArea rows={3} placeholder="Chia sẻ trải nghiệm của bạn..." />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Button type="primary" htmlType="submit">
                  Gửi đánh giá
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>

        <Divider style={{ margin: "18px 0" }} />

        {/* Comments List */}
        {comments.length === 0 ? (
          <Empty description="Chưa có bình luận nào. Hãy là người đầu tiên đánh giá!" />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={comments}
            renderItem={(c) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={
                    <Space>
                      <Text strong>{c.name}</Text>
                      <Rate disabled value={c.rating} />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {new Date(c.createdAt).toLocaleString("vi-VN")}
                      </Text>
                    </Space>
                  }
                  description={<Text>{c.content}</Text>}
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default ProductDetail;
