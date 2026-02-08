import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  Space,
  Typography,
  Rate,
  Form,
  Input,
  Button,
  Upload,
  Image,
  List,
  Empty,
  Pagination,
  Modal,
  Popconfirm,
  message,
  Avatar,
  Spin,
  Tag,
} from "antd";
import { UploadOutlined, EditOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const API_URL = "http://localhost:9999";

export default function ReviewSection({ productId, user }) {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ avgRating: 0, count: 0 });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [fileList, setFileList] = useState([]);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const isAdmin = (user?.role || "").toUpperCase() === "ADMIN";

  const fetchReviews = async (p = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/products/${productId}/reviews?page=${p}&limit=8`);
      setReviews(res.data.items || []);
      setSummary(res.data.summary || { avgRating: 0, count: 0 });
      setTotal(res.data.total || 0);
      setPage(res.data.page || p);
    } catch {
      message.error("Không tải được đánh giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) fetchReviews(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const submitReview = async (values) => {
    if (!user) return message.warning("Vui lòng đăng nhập để đánh giá");

    try {
      const fd = new FormData();
      fd.append("rating", values.rating);
      fd.append("comment", values.comment || "");

      fileList.forEach((f) => {
        if (f.originFileObj) fd.append("images", f.originFileObj);
      });

      await axios.post(`${API_URL}/api/products/${productId}/reviews`, fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Đã gửi đánh giá!");
      setFileList([]);
      form.resetFields();
      fetchReviews(1);
    } catch (e) {
      message.error(e?.response?.data?.message || "Gửi đánh giá thất bại");
    }
  };

  const openEdit = (item) => {
    setEditing(item);
    editForm.setFieldsValue({ rating: item.rating, comment: item.comment });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    try {
      const v = await editForm.validateFields();
      await axios.put(`${API_URL}/api/reviews/${editing._id}`, v, { withCredentials: true });
      message.success("Đã cập nhật review");
      setEditOpen(false);
      setEditing(null);
      fetchReviews(page);
    } catch (e) {
      message.error(e?.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const delReview = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/reviews/${id}`, { withCredentials: true });
      message.success("Đã xoá review");
      fetchReviews(1);
    } catch (e) {
      message.error(e?.response?.data?.message || "Xoá thất bại");
    }
  };

  return (
    <Card style={{ borderRadius: 14 }}>
      <Space direction="vertical" style={{ width: "100%" }} size={14}>
        <Space align="center" style={{ justifyContent: "space-between", width: "100%" }}>
          <Title level={4} style={{ margin: 0 }}>
            Đánh giá & Bình luận
          </Title>
          <Space align="center">
            <Rate disabled allowHalf value={summary.avgRating || 0} />
            <Text type="secondary">
              {Number(summary.avgRating || 0).toFixed(1)} ({summary.count || 0})
            </Text>
          </Space>
        </Space>

        <Card size="small" style={{ borderRadius: 12 }} bodyStyle={{ padding: 14 }}>
          <Form form={form} layout="vertical" onFinish={submitReview} initialValues={{ rating: 5 }}>
            <Form.Item
              name="rating"
              label="Đánh giá"
              rules={[{ required: true, message: "Vui lòng chọn số sao" }]}
            >
              <Rate />
            </Form.Item>

            <Form.Item name="comment" label="Bình luận">
              <Input.TextArea
                rows={3}
                placeholder="Chia sẻ cảm nhận… (từ bậy sẽ bị che *** bởi backend)"
                maxLength={800}
                showCount
              />
            </Form.Item>

            <Form.Item label="Ảnh phản hồi (tối đa 6)">
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={({ fileList: fl }) => setFileList(fl)}
                beforeUpload={() => false}
                accept="image/png,image/jpeg,image/webp"
                multiple
                maxCount={6}
              >
                {fileList.length >= 6 ? null : (
                  <div style={{ textAlign: "center" }}>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Tải ảnh</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button type="primary" htmlType="submit">
                Gửi đánh giá
              </Button>
            </div>
          </Form>
        </Card>

        {loading ? (
          <Spin />
        ) : reviews.length === 0 ? (
          <Empty description="Chưa có đánh giá nào" />
        ) : (
          <>
            <List
              itemLayout="horizontal"
              dataSource={reviews}
              renderItem={(c) => (
                <List.Item
                  actions={
                    isAdmin
                      ? [
                          <Button key="e" size="small" icon={<EditOutlined />} onClick={() => openEdit(c)}>
                            Sửa
                          </Button>,
                          <Popconfirm
                            key="d"
                            title="Xoá đánh giá này?"
                            okText="Xoá"
                            cancelText="Huỷ"
                            onConfirm={() => delReview(c._id)}
                          >
                            <Button danger size="small" icon={<DeleteOutlined />}>
                              Xoá
                            </Button>
                          </Popconfirm>,
                        ]
                      : []
                  }
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <Space direction="vertical" size={2}>
                        <Space align="center">
                          <Text strong>{c.userName || "Khách"}</Text>
                          <Rate disabled value={c.rating} />
                          {c.isEdited ? <Tag>Đã chỉnh sửa</Tag> : null}
                        </Space>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(c.createdAt).toLocaleString("vi-VN")}
                        </Text>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" style={{ width: "100%" }} size={8}>
                        {c.comment ? <Paragraph style={{ margin: 0 }}>{c.comment}</Paragraph> : null}

                        {Array.isArray(c.images) && c.images.length > 0 ? (
                          <Image.PreviewGroup>
                            <Space wrap>
                              {c.images.map((src, idx) => (
                                <Image
                                  key={idx}
                                  width={90}
                                  height={90}
                                  src={`${API_URL}${src}`}
                                  style={{ borderRadius: 10, objectFit: "cover" }}
                                />
                              ))}
                            </Space>
                          </Image.PreviewGroup>
                        ) : null}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Pagination
                current={page}
                total={total}
                pageSize={8}
                onChange={(p) => fetchReviews(p)}
                showSizeChanger={false}
              />
            </div>
          </>
        )}

        <Modal
          title="Admin sửa đánh giá"
          open={editOpen}
          onOk={saveEdit}
          onCancel={() => setEditOpen(false)}
          okText="Lưu"
          cancelText="Huỷ"
        >
          <Form form={editForm} layout="vertical">
            <Form.Item name="rating" label="Số sao" rules={[{ required: true, message: "Chọn số sao" }]}>
              <Rate />
            </Form.Item>
            <Form.Item name="comment" label="Bình luận">
              <Input.TextArea rows={4} maxLength={800} showCount />
            </Form.Item>
          </Form>
        </Modal>
      </Space>
    </Card>
  );
}
