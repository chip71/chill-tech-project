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
  message,
  Image,
  Select,
  Popconfirm,
  Switch,
  Divider,
  Tooltip,
  Badge,
  Drawer,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import {
  SearchOutlined,
  DeleteOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  StarOutlined,
  WarningOutlined,
  ReloadOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;
const { Option } = Select;

const API_URL = "http://localhost:9999";
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

export default function ReviewManage() {
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [hasProfanity, setHasProfanity] = useState("");

  const [stats, setStats] = useState({ total: 0, bad: 0, badPercent: 0 });

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [q, setQ] = useState("");
  const [rating, setRating] = useState("");
  const [includeHidden, setIncludeHidden] = useState(true);

  /** Drawer chi tiết */
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/admin/reviews/stats?includeHidden=false`,
        { withCredentials: true }
      );
      setStats(res.data || { total: 0, bad: 0, badPercent: 0 });
    } catch { }
  };

  const fetchReviews = async (p = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: p,
        limit: pageSize,
        includeHidden,
      });
      if (q) params.set("q", q);
      if (rating) params.set("rating", rating);
      if (hasProfanity !== "") params.set("hasProfanity", hasProfanity);

      const res = await axios.get(
        `${API_URL}/api/admin/reviews?${params.toString()}`,
        { withCredentials: true }
      );

      setReviews(res.data?.items || []);
      setTotal(res.data?.total || 0);
      setPage(res.data?.page || p);
    } catch {
      message.error("Không tải được review");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchReviews(1);
  }, []);

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
    } catch {
      message.error("Không cập nhật được trạng thái");
    }
  };

  const deleteReview = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/reviews/${id}`, {
        withCredentials: true,
      });
      message.success("Đã xoá review");
      fetchStats();
      fetchReviews(1);
    } catch {
      message.error("Xoá thất bại");
    }
  };

  const openDetail = (row) => {
    setDetail(row);
    setReplyText("");
    setDetailOpen(true);
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;
    try {
      setReplyLoading(true);

      const res = await axios.post(
        `${API_URL}/api/reviews/${detail._id}/replies`,
        { content: replyText },
        { withCredentials: true }
      );

      message.success("Đã phản hồi review");

      // 🔥 UPDATE DETAIL NGAY
      setDetail((prev) => ({
        ...prev,
        replies: res.data.replies,
      }));

      setReplyText("");
      fetchReviews(page); // update list
    } catch {
      message.error("Gửi phản hồi thất bại");
    } finally {
      setReplyLoading(false);
    }
  };


  const columns = useMemo(
    () => [
      {
        title: "Sản phẩm",
        dataIndex: "product",
        width: 240,
        render: (p) => (
          <Space>
            {p?.imageUrl && (
              <Image
                src={resolveImageUrl(p?.imageUrl)}
                width={40}
                height={40}
                preview={false}
                fallback="/no-image.png"
                style={{ borderRadius: 6, objectFit: "cover" }}
              />

            )}
            <Text strong ellipsis={{ tooltip: p?.productName }}>
              {p?.productName}
            </Text>
          </Space>
        ),
      },
      {
        title: "Người đánh giá",
        dataIndex: "userName",
        width: 160,
        render: (t) => t || "Khách",
      },
      {
        title: "Sao",
        dataIndex: "rating",
        width: 160,
        render: (v) => (
          <Space>
            <Rate disabled value={v} />
            {v <= 2 && (
              <Tag color="red" icon={<StarOutlined />}>
                Xấu
              </Tag>
            )}
          </Space>
        ),
      },
      {
        title: "Nội dung",
        dataIndex: "comment",
        width: 420, // ✅ RỘNG RA
        render: (t, row) => (
          <Space direction="vertical" size={6} style={{ width: "100%" }}>
            <Text
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {t}
            </Text>

            {row?.images?.length > 0 && (
              <Image.PreviewGroup>
                <Space size={6}>
                  {row.images.slice(0, 3).map((img, i) => (
                    <Image
                      key={i}
                      src={`${API_URL}${img}`}
                      width={36}
                      height={36}
                      style={{ borderRadius: 6, objectFit: "cover" }}
                    />
                  ))}
                  {row.images.length > 3 && (
                    <Badge count={`+${row.images.length - 3}`} />
                  )}
                </Space>
              </Image.PreviewGroup>
            )}
          </Space>
        ),
      },
      {
        title: "Thời gian",
        dataIndex: "createdAt",
        width: 170,
        render: (t) => new Date(t).toLocaleString("vi-VN"),
      },
      {
        title: "Ẩn",
        width: 90,
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
        width: 200,
        render: (_, row) => (
          <Space>
            <Button
              icon={<CommentOutlined />}
              onClick={() => openDetail(row)}
            >
              Xem
            </Button>
            <Popconfirm
              title="Xoá review?"
              onConfirm={() => deleteReview(row._id)}
            >
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [page]
  );

  return (
    <div>
      {/* HEADER */}
      <Row justify="space-between" style={{ marginBottom: 12 }}>
        <Title level={3}>Quản lý đánh giá</Title>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            fetchStats();
            fetchReviews(page);
          }}
        >
          Tải lại
        </Button>
      </Row>

      {/* STATS */}
      <Row gutter={12} style={{ marginBottom: 12 }}>
        <Col span={8}>
          <Card>
            <Text>Tổng review</Text>
            <Title level={3}>{stats.total}</Title>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Text>Review xấu</Text>
            <Title level={3}>{stats.bad}</Title>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Text>% review xấu</Text>
            <Title level={3}>
              {Number(stats.badPercent).toFixed(2)}%
            </Title>
          </Card>
        </Col>
      </Row>
      <Space style={{ marginBottom: 12 }} wrap>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm nội dung / tên người dùng"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ width: 260 }}
        />

        <Select
          placeholder="Số sao"
          allowClear
          value={rating || undefined}
          onChange={(v) => setRating(v || "")}
          style={{ width: 140 }}
        >
          {[1, 2, 3, 4, 5].map((r) => (
            <Option key={r} value={r}>
              {r} sao
            </Option>
          ))}
        </Select>

        <Select
          placeholder="Nội dung"
          allowClear
          value={hasProfanity || undefined}
          onChange={(v) => setHasProfanity(v || "")}
          style={{ width: 200 }}
        >
          <Option value="true">⚠️ Có từ ngữ không phù hợp</Option>
          <Option value="false">✅ Nội dung sạch</Option>
        </Select>

        {/* NÚT LỌC */}
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={() => fetchReviews(1)}
        >
          Lọc
        </Button>

        {/* NÚT HUỶ LỌC */}
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            setQ("");
            setRating("");
            setHasProfanity("");
            fetchReviews(1);
          }}
        >
          Huỷ lọc
        </Button>
      </Space>



      {/* TABLE */}
      <Card>
        <Table
          rowKey="_id"
          loading={loading}
          columns={columns}
          dataSource={reviews}
          rowClassName={(row) =>
            row.rating <= 2 ? "row-bad" : ""
          }
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (p) => fetchReviews(p),
          }}
        />
      </Card>

      {/* STYLE */}
      <style>{`
        .row-bad td {
          background: rgba(255, 77, 79, 0.12);
        }
      `}</style>

      {/* DETAIL DRAWER */}
      <Drawer
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width={720}
        title="Chi tiết đánh giá"
      >
        {detail && (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Title level={5}>{detail.product?.productName}</Title>
            <Rate disabled value={detail.rating} />
            <Text>{detail.comment}</Text>

            {detail.images?.length > 0 && (
              <Image.PreviewGroup>
                <Space wrap>
                  {detail.images.map((img, i) => (
                    <Image
                      key={i}
                      width={120}
                      src={`${API_URL}${img}`}
                    />
                  ))}
                </Space>
              </Image.PreviewGroup>
            )}

            <Divider />
            <Divider>Trao đổi</Divider>

            {detail.replies?.length === 0 && (
              <Text type="secondary">Chưa có phản hồi</Text>
            )}

            {detail.replies?.map((r, i) => (
              <div
                key={i}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  background: r.isAdmin ? "#fff7e6" : "#f5f7fa",
                  borderLeft: r.isAdmin
                    ? "4px solid #faad14"
                    : "4px solid #d9d9d9",
                  marginBottom: 8,
                }}
              >
                <Space>
                  <Text strong>{r.userName}</Text>
                  {r.isAdmin && <Tag color="gold">ADMIN</Tag>}
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {new Date(r.createdAt).toLocaleString("vi-VN")}
                  </Text>
                </Space>

                <div style={{ marginTop: 6 }}>{r.content}</div>
              </div>
            ))}
            <Input.TextArea
              rows={3}
              placeholder="Nhập phản hồi..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />


            <Button
              type="primary"
              loading={replyLoading}
              onClick={sendReply}
            >
              Gửi phản hồi
            </Button>
          </Space>
        )}
      </Drawer>
    </div>
  );
}
