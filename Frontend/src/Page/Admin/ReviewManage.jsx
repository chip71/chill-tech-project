import {
  Card,
  Table,
  Typography,
  Space,
  Input,
  Row,
  Col,
  Rate,
  Tag,
  Button,
  Modal,
  Form,
  message,
  Image,
  Select,
  Popconfirm,
  Switch,
  Divider,
  Tooltip,
  Badge,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  StarOutlined,
  WarningOutlined,
  LinkOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

const API_URL = "http://localhost:9999";

export default function ReviewManage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);

  const [stats, setStats] = useState({ total: 0, bad: 0, badPercent: 0 });

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [q, setQ] = useState("");
  const [rating, setRating] = useState("");
  const [includeHidden, setIncludeHidden] = useState(true);
  const [onlyBad, setOnlyBad] = useState(false);
  const [onlyProfanity, setOnlyProfanity] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchStats = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/admin/reviews/stats?includeHidden=false`,
        { withCredentials: true }
      );
      setStats(res.data || { total: 0, bad: 0, badPercent: 0 });
    } catch {
      // ignore
    }
  };

  const fetchReviews = async (p = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(p));
      params.set("limit", String(pageSize));
      params.set("includeHidden", String(includeHidden));
      params.set("onlyBad", String(onlyBad));
      params.set("onlyProfanity", String(onlyProfanity));
      if (q.trim()) params.set("q", q.trim());
      if (rating) params.set("rating", rating);

      const res = await axios.get(
        `${API_URL}/api/admin/reviews?${params.toString()}`,
        { withCredentials: true }
      );

      setReviews(res.data?.items || []);
      setTotal(res.data?.total || 0);
      setPage(res.data?.page || p);
    } catch (e) {
      message.error(e?.response?.data?.message || "Không tải được đánh giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchReviews(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onApplyFilter = () => fetchReviews(1);

  const onResetFilter = () => {
    setQ("");
    setRating("");
    setIncludeHidden(true);
    setOnlyBad(false);
    setOnlyProfanity(false);
    // gọi fetch sau 1 tick để chắc state cập nhật
    setTimeout(() => fetchReviews(1), 0);
  };

  const openEdit = (item) => {
    setEditing(item);
    form.setFieldsValue({
      rating: item.rating,
      comment: item.comment,
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    try {
      const v = await form.validateFields();
      await axios.put(`${API_URL}/api/reviews/${editing._id}`, v, {
        withCredentials: true,
      });
      message.success("Đã cập nhật đánh giá");
      setEditOpen(false);
      setEditing(null);
      fetchStats();
      fetchReviews(page);
    } catch (e) {
      message.error(e?.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const deleteReview = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/reviews/${id}`, {
        withCredentials: true,
      });
      message.success("Đã xoá đánh giá");
      fetchStats();
      fetchReviews(1);
    } catch (e) {
      message.error(e?.response?.data?.message || "Xoá thất bại");
    }
  };

  const toggleHidden = async (row, nextHidden) => {
    try {
      await axios.patch(
        `${API_URL}/api/reviews/${row._id}/hidden`,
        { isHidden: nextHidden },
        { withCredentials: true }
      );
      message.success(nextHidden ? "Đã ẩn review" : "Đã hiện review");
      fetchStats();
      fetchReviews(page);
    } catch (e) {
      message.error(
        e?.response?.data?.message || "Không cập nhật được trạng thái"
      );
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "Sản phẩm",
        dataIndex: "product",
        key: "product",
        render: (p, row) => {
          const img = p?.imageUrl ? `${API_URL}${p.imageUrl}` : "";
          const pid = p?._id;

          return (
            <Space align="start">
              { (
                <div
                
                />
              )}

              <div style={{ lineHeight: 1.2 }}>
                <Space size={8} align="center" wrap>
                  <Text strong style={{ maxWidth: 300 }} ellipsis={{ tooltip: p?.productName }}>
                    {p?.productName || "—"}
                  </Text>

                  {pid ? (
                    <Tooltip title="Mở trang sản phẩm (tab mới)">
                      <Link to={`/products/${pid}`} target="_blank" rel="noreferrer">
                        <Tag icon={<LinkOutlined />} style={{ cursor: "pointer" }}>
                          Mở
                        </Tag>
                      </Link>
                    </Tooltip>
                  ) : null}

                  {row?.isHidden ? (
                    <Tag icon={<EyeInvisibleOutlined />}>Ẩn</Tag>
                  ) : (
                    <Tag icon={<EyeOutlined />}>Hiện</Tag>
                  )}
                </Space>

                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    ReviewID: {String(row?._id || "").slice(-6)}
                  </Text>
                </div>
              </div>
            </Space>
          );
        },
      },
      {
        title: "Người đánh giá",
        dataIndex: "userName",
        key: "userName",
        width: 170,
        render: (t) => <Text>{t || "Khách"}</Text>,
      },
      {
        title: "Sao",
        dataIndex: "rating",
        key: "rating",
        width: 180,
        render: (v) => (
          <Space>
            <Rate disabled value={v} />
            {v <= 2 ? (
              <Tag color="red" icon={<StarOutlined />}>
                Xấu
              </Tag>
            ) : (
              <Tag>{v}/5</Tag>
            )}
          </Space>
        ),
      },
      {
        title: "Nội dung",
        dataIndex: "comment",
        key: "comment",
        render: (t, row) => {
          const prof = row?.hasProfanity || String(t || "").includes("***");
          return (
            <Space direction="vertical" size={6} style={{ width: "100%" }}>
              <Text
                style={{ display: "inline-block", maxWidth: 520 }}
                ellipsis={{ tooltip: t }}
              >
                {t || "—"}
              </Text>

              <Space size={8} wrap>
                {prof ? (
                  <Tag color="orange" icon={<WarningOutlined />}>
                    Có từ bậy
                  </Tag>
                ) : null}

                {Array.isArray(row?.images) && row.images.length > 0 ? (
                  <Tag>Ảnh: {row.images.length}</Tag>
                ) : (
                  <Tag>Ảnh: 0</Tag>
                )}
              </Space>
            </Space>
          );
        },
      },
      {
        title: "Thời gian",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 175,
        render: (t) => (
          <Text type="secondary">
            {t ? new Date(t).toLocaleString("vi-VN") : "—"}
          </Text>
        ),
      },
      {
        title: "Ẩn/Hiện",
        key: "hidden",
        width: 110,
        align: "center",
        render: (_, row) => (
          <Switch
            checked={!row.isHidden}
            checkedChildren={<EyeOutlined />}
            unCheckedChildren={<EyeInvisibleOutlined />}
            onChange={(checked) => toggleHidden(row, !checked)}
          />
        ),
      },
      {
        title: "Hành động",
        key: "actions",
        width: 220,
        render: (_, row) => (
          <Space>
            {/* <Button icon={<EditOutlined />} onClick={() => openEdit(row)}>
              Sửa
            </Button> */}

            <Popconfirm
              title="Xoá đánh giá này?"
              okText="Xoá"
              cancelText="Huỷ"
              onConfirm={() => deleteReview(row._id)}
            >
              <Button danger icon={<DeleteOutlined />}>
                Xoá
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, includeHidden, onlyBad, onlyProfanity]
  );

  const headerRight = (
    <Space wrap>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin")}>
        Về trang Admin
      </Button>
      <Button
        icon={<ReloadOutlined />}
        onClick={() => {
          fetchStats();
          fetchReviews(page);
        }}
      >
        Tải lại
      </Button>
    </Space>
  );

  return (
    <div>
      {/* HEADER */}
      <Row justify="space-between" align="middle" gutter={[12, 12]} style={{ marginBottom: 12 }}>
        <Col>
          <Space direction="vertical" size={2}>
            <Title level={3} style={{ margin: 0 }}>
              Quản lý đánh giá
            </Title>
           
          </Space>
        </Col>
        <Col>{headerRight}</Col>
      </Row>

      {/* STATS */}
      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 14 }}>
            <Space direction="vertical" size={2}>
              <Text type="secondary">Tổng review (đang hiện)</Text>
              <Title level={3} style={{ margin: 0 }}>
                {stats.total || 0}
              </Title>
              <Text type="secondary">Đang hiển thị với người dùng</Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 14 }}>
            <Space direction="vertical" size={2}>
              <Text type="secondary">Review xấu (≤2⭐)</Text>
              <Title level={3} style={{ margin: 0 }}>
                {stats.bad || 0}
              </Title>
              <Text type="secondary">
                Cần ưu tiên xử lý
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} style={{ borderRadius: 14 }}>
            <Space direction="vertical" size={2}>
              <Text type="secondary">% review xấu</Text>
              <Title level={3} style={{ margin: 0 }}>
                {Number(stats.badPercent || 0).toFixed(2)}%
              </Title>
              <Text type="secondary">Tỷ lệ đánh giá tiêu cực</Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* FILTER */}
      <Card
        bordered={false}
        style={{ borderRadius: 14, marginBottom: 12 }}
        title={
          <Space>  
            <Text strong>Bộ lọc</Text>
          </Space>
        }
        extra={
          <Space>
            <Button onClick={onResetFilter}>Đặt lại</Button>
            <Button type="primary" onClick={onApplyFilter}>
              Áp dụng
            </Button>
          </Space>
        }
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={10}>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo nội dung hoặc tên người đánh giá..."
              prefix={<SearchOutlined />}
              allowClear
              onPressEnter={onApplyFilter}
            />
          </Col>

          <Col xs={24} md={5}>
            <Select
              value={rating}
              onChange={setRating}
              style={{ width: "100%" }}
              placeholder="Lọc theo sao"
              allowClear
            >
              <Option value="1">1 sao</Option>
              <Option value="2">2 sao</Option>
              <Option value="3">3 sao</Option>
              <Option value="4">4 sao</Option>
              <Option value="5">5 sao</Option>
            </Select>
          </Col>

          <Col xs={24} md={9}>
            <Row gutter={[12, 12]}>
              <Col xs={8}>
                <Tooltip title="Hiện cả review đang bị ẩn">
                  <Switch
                    checked={includeHidden}
                    onChange={(v) => {
                      setIncludeHidden(v);
                      setPage(1);
                    }}
                    checkedChildren="Tất cả"
                    unCheckedChildren="Hiện"
                    style={{ width: "100%" }}
                  />
                </Tooltip>
              </Col>

              <Col xs={8}>
                <Tooltip title="Chỉ hiển thị review xấu (≤2⭐)">
                  <Switch
                    checked={onlyBad}
                    onChange={(v) => {
                      setOnlyBad(v);
                      setPage(1);
                    }}
                    checkedChildren="Xấu"
                    unCheckedChildren="Xấu"
                    style={{ width: "100%" }}
                  />
                </Tooltip>
              </Col>

              <Col xs={8}>
                <Tooltip title="Chỉ hiển thị review có từ bậy (*** )">
                  <Switch
                    checked={onlyProfanity}
                    onChange={(v) => {
                      setOnlyProfanity(v);
                      setPage(1);
                    }}
                    checkedChildren="từ ngữ không phù hợp"
                    unCheckedChildren="từ ngữ không phù hợp"
                    style={{ width: "100%" }}
                  />
                </Tooltip>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* TABLE */}
      <Card bordered={false} style={{ borderRadius: 14 }}>
        <Table
          rowKey="_id"
          loading={loading}
          columns={columns}
          dataSource={reviews}
          rowClassName={(row) => {
            const prof =
              row?.hasProfanity || String(row?.comment || "").includes("***");
            const bad = Number(row?.rating || 0) <= 2;
            if (row?.isHidden) return "row-hidden";
            if (prof) return "row-profanity";
            if (bad) return "row-bad";
            return "";
          }}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (p) => fetchReviews(p),
            showSizeChanger: false,
          }}
        />

        <Divider style={{ margin: "12px 0 0" }} />

        {/* highlight style */}
        <style>{`
          .row-hidden td { opacity: 0.65; }
          .row-profanity td { background: rgba(255, 159, 10, 0.08); }
          .row-bad td { background: rgba(255, 77, 79, 0.06); }
        `}</style>
      </Card>

      {/* EDIT MODAL */}
      <Modal
        title="Sửa đánh giá"
        open={editOpen}
        onOk={saveEdit}
        onCancel={() => setEditOpen(false)}
        okText="Lưu"
        cancelText="Huỷ"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="rating"
            label="Số sao"
            rules={[{ required: true, message: "Chọn số sao" }]}
          >
            <Rate />
          </Form.Item>

          <Form.Item name="comment" label="Nội dung">
            <Input.TextArea rows={4} maxLength={800} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
