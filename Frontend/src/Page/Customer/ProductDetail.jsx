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
  Upload,
  Modal,
  Popconfirm,
  Pagination,
} from "antd";
import {
  ShoppingCartOutlined,
  TruckOutlined,
  SafetyCertificateOutlined,
  SyncOutlined,
  MessageOutlined,
  UserOutlined,
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
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

  // ✅ reviews (from DB) — thay cho localStorage comments
  const [reviewForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ avgRating: 0, count: 0 });
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);

  const [reviewImages, setReviewImages] = useState([]); // antd Upload fileList

  // Admin edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const isAdmin = String(user?.role || "").toUpperCase() === "ADMIN";

  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  const fetchReviews = async (page = 1) => {
    try {
      setReviewLoading(true);
      const res = await axios.get(
        `${API_URL}/api/products/${id}/reviews?page=${page}&limit=8`
      );

      setReviews(res.data?.items || []);
      setReviewSummary(res.data?.summary || { avgRating: 0, count: 0 });
      setReviewTotal(res.data?.total || 0);
      setReviewPage(res.data?.page || page);
    } catch (e) {
      message.error("Không tải được đánh giá");
    } finally {
      setReviewLoading(false);
    }
  };
  const handleReply = async (reviewId) => {
    if (!user) {
      message.warning("Vui lòng đăng nhập để trả lời");
      return;
    }

    if (!replyContent.trim()) return;

    try {
      await axios.post(
        `${API_URL}/api/reviews/${reviewId}/replies`,
        { content: replyContent },
        { withCredentials: true }
      );

      message.success("Đã gửi phản hồi");
      setReplyContent("");
      setReplyingTo(null);
      fetchReviews(reviewPage);
    } catch (e) {
      message.error(e?.response?.data?.message || "Không thể phản hồi");
    }
  };


  const handleAddReview = async (values) => {
    if (!user) {
      message.warning("Vui lòng đăng nhập để đánh giá");
      return navigate("/login", { state: { from: location.pathname } });
    }

    try {
      const formData = new FormData();
      formData.append("rating", values.rating);
      formData.append("comment", values.content || "");

      reviewImages.forEach((f) => {
        if (f.originFileObj) formData.append("images", f.originFileObj);
      });

      await axios.post(`${API_URL}/api/products/${id}/reviews`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Đã gửi đánh giá!");
      setReviewImages([]);
      reviewForm.resetFields();
      fetchReviews(1);
    } catch (e) {
      message.error(e?.response?.data?.message || "Gửi đánh giá thất bại");
    }
  };

  const openEdit = (item) => {
    setEditing(item);
    editForm.setFieldsValue({
      rating: item.rating,
      comment: item.comment,
    });
    setEditOpen(true);
  };

  const submitAdminEdit = async () => {
    try {
      const v = await editForm.validateFields();
      await axios.put(`${API_URL}/api/reviews/${editing._id}`, v, {
        withCredentials: true,
      });
      message.success("Đã cập nhật review");
      setEditOpen(false);
      setEditing(null);
      fetchReviews(reviewPage);
    } catch (e) {
      message.error(e?.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const adminDelete = async (reviewId) => {
    try {
      await axios.delete(`${API_URL}/api/reviews/${reviewId}`, {
        withCredentials: true,
      });
      message.success("Đã xoá review");
      fetchReviews(1);
    } catch (e) {
      message.error(e?.response?.data?.message || "Xoá thất bại");
    }
  };

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

  // ✅ fetch reviews khi đổi product
  useEffect(() => {
    if (id) fetchReviews(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // gallery
  const gallery =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.map((u) => (u.startsWith("http") ? u : `${API_URL}${u}`))
      : [imageSrc, imageSrc, imageSrc, imageSrc];

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
                {stock > 0 ? <Tag color="green">Còn hàng</Tag> : <Tag color="red">Hết hàng</Tag>}
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
                      onChange={(val) =>
                        setQuantity(Math.max(1, Math.min(Number(val) || 1, stock || 1)))
                      }
                      style={{ width: 120 }}
                      disabled={stock <= 0}
                    />
                    <Text type="secondary">
                      Tổng: <Text strong>{money(price * quantity)}₫</Text>
                    </Text>
                  </Space>
                </Col>
              </Row>

              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                disabled={stock <= 0}
                onClick={() => {
                  addToCart(product, quantity);
                  message.success("Đã thêm vào giỏ hàng!");
                }}
              >
                Thêm vào giỏ hàng
              </Button>

              <Divider style={{ margin: "10px 0" }} />

              <Space wrap>
                <Tag icon={<TruckOutlined />} color="geekblue">
                  Giao nhanh
                </Tag>
                <Tag icon={<SafetyCertificateOutlined />} color="green">
                  Chính hãng
                </Tag>
                <Tag icon={<SyncOutlined />} color="gold">
                  Đổi trả 7 ngày
                </Tag>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* DETAILS */}
      <Card
        bordered={false}
        style={{
          borderRadius: 14,
          boxShadow: "0 6px 22px rgba(0,0,0,0.06)",
          marginTop: 22,
        }}
        bodyStyle={{ padding: 18 }}
      >
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: "Mô tả",
              children: (
                <Paragraph style={{ marginBottom: 0 }}>
                  {product.description || "Chưa có mô tả cho sản phẩm này."}
                </Paragraph>
              ),
            },
            {
              key: "2",
              label: "Thông số",
              children: (
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="Tên sản phẩm">
                    {product.productName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Danh mục">
                    {product.category || "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số lượng tồn">
                    {stock}
                  </Descriptions.Item>
                </Descriptions>
              ),
            },
            {
              key: "3",
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

        {/* Review Form */}
        <Card size="small" style={{ borderRadius: 12 }} bodyStyle={{ padding: 14 }}>
          <Form
            form={reviewForm}
            layout="vertical"
            onFinish={handleAddReview}
            initialValues={{ rating: 5 }}
          >
            <Row gutter={[12, 12]}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="rating"
                  label="Đánh giá"
                  rules={[{ required: true, message: "Vui lòng chọn số sao" }]}
                >
                  <Rate />
                </Form.Item>
              </Col>

              <Col xs={24} md={16}>
                <Form.Item
                  name="content"
                  label="Nội dung"
                  rules={[
                    { required: true, message: "Vui lòng nhập nội dung bình luận" },
                    { min: 6, message: "Tối thiểu 6 ký tự" },
                  ]}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Chia sẻ trải nghiệm của bạn... (từ bậy sẽ bị tự động che ***)"
                  />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item label="Ảnh phản hồi (tối đa 6)">
                  <Upload
                    listType="picture-card"
                    fileList={reviewImages}
                    onChange={({ fileList }) => setReviewImages(fileList)}
                    beforeUpload={() => false}
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    maxCount={6}
                  >
                    {reviewImages.length >= 6 ? null : (
                      <div style={{ textAlign: "center" }}>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>Tải ảnh</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </Col>

              <Col xs={24} style={{ display: "flex", justifyContent: "space-between" }}>
                <Space align="center">
                  <Rate disabled allowHalf value={reviewSummary.avgRating || 0} />
                  <Text type="secondary">
                    {Number(reviewSummary.avgRating || 0).toFixed(1)} (
                    {reviewSummary.count || 0} đánh giá)
                  </Text>
                </Space>

                <Button type="primary" htmlType="submit">
                  Gửi đánh giá
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>

        <Divider style={{ margin: "18px 0" }} />

        {/* Reviews List */}
        {reviewLoading ? (
          <Spin />
        ) : reviews.length === 0 ? (
          <Empty description="Chưa có bình luận nào. Hãy là người đầu tiên đánh giá!" />
        ) : (
          <>
            <List
              itemLayout="horizontal"
              dataSource={reviews}
              renderItem={(c) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <Space wrap>
                        <Text strong>{c.userName || "Khách"}</Text>
                        <Rate disabled value={c.rating} />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(c.createdAt).toLocaleString("vi-VN")}
                        </Text>
                        {c.isEdited && <Tag>Đã chỉnh sửa</Tag>}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" style={{ width: "100%" }} size={8}>
                        {/* COMMENT */}
                        {c.comment && <Text>{c.comment}</Text>}
                        {/* REVIEW IMAGES */}
                        {Array.isArray(c.images) && c.images.length > 0 && (
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {c.images.map((img, idx) => (
                              <Image
                                key={idx}
                                src={img.startsWith("http") ? img : `${API_URL}${img}`}
                                width={80}
                                height={80}
                                style={{ objectFit: "cover", borderRadius: 8 }}
                                preview={{
                                  src: img.startsWith("http") ? img : `${API_URL}${img}`,
                                }}
                              />
                            ))}
                          </div>
                        )}


                        {/* ADMIN REPLY */}
                        {c.adminReply && (
                          <div
                            style={{
                              padding: "10px 12px",
                              background: "#f6ffed",
                              borderLeft: "4px solid #52c41a",
                              borderRadius: 6,
                            }}
                          >
                            <Text strong type="success">
                              Phản hồi từ Admin
                            </Text>
                            <div>{c.adminReply}</div>
                          </div>
                        )}

                        {/* USER REPLIES */}
                        {Array.isArray(c.replies) && c.replies.length > 0 && (
                          <div style={{ paddingLeft: 44 }}>
                            {c.replies.map((r, idx) => {
                              const isAdminReply = r.isAdmin;

                              return (
                                <div
                                  key={idx}
                                  style={{
                                    background: isAdminReply ? "#e6f4ff" : "#f5f7fa",
                                    borderLeft: isAdminReply ? "4px solid #1677ff" : "3px solid #d9d9d9",
                                    padding: "8px 12px",
                                    borderRadius: 8,
                                    marginBottom: 6,
                                  }}
                                >
                                  <Space align="center" size={6}>
                                    <Text strong style={{ color: isAdminReply ? "#1677ff" : "#000" }}>
                                      {isAdminReply ? "Admin" : r.userName}
                                    </Text>

                                    {isAdminReply && <Tag color="blue">ADMIN</Tag>}

                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                      {new Date(r.createdAt).toLocaleString("vi-VN")}
                                    </Text>
                                  </Space>

                                  <div style={{ marginTop: 4 }}>{r.content}</div>
                                </div>
                              );
                            })}

                          </div>
                        )}

                        {/* REPLY FORM */}
                        {user && user.role !== "GUEST" && (
                          <div style={{ paddingLeft: 44 }}>
                            {replyingTo === c._id ? (
                              <>
                                <Input.TextArea
                                  rows={2}
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                />
                                <Space style={{ marginTop: 6 }}>
                                  <Button
                                    size="small"
                                    type="primary"
                                    onClick={() => handleReply(c._id)}
                                  >
                                    Gửi
                                  </Button>
                                  <Button
                                    size="small"
                                    onClick={() => {
                                      setReplyingTo(null);
                                      setReplyContent("");
                                    }}
                                  >
                                    Huỷ
                                  </Button>
                                </Space>
                              </>
                            ) : (
                              <Button
                                size="small"
                                type="link"
                                onClick={() => setReplyingTo(c._id)}
                              >
                                Trả lời
                              </Button>
                            )}
                          </div>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />



            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Pagination
                current={reviewPage}
                total={reviewTotal}
                pageSize={8}
                onChange={(p) => fetchReviews(p)}
                showSizeChanger={false}
              />
            </div>
          </>
        )}

        {/* Admin Edit Modal */}
        <Modal
          title="Admin sửa đánh giá"
          open={editOpen}
          onOk={submitAdminEdit}
          onCancel={() => setEditOpen(false)}
          okText="Lưu"
          cancelText="Huỷ"
        >
          <Form form={editForm} layout="vertical">
            <Form.Item
              name="rating"
              label="Số sao"
              rules={[{ required: true, message: "Chọn số sao" }]}
            >
              <Rate />
            </Form.Item>
            <Form.Item name="comment" label="Bình luận">
              <Input.TextArea rows={4} maxLength={800} showCount />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default ProductDetail;
