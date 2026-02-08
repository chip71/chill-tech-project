import {
    Card,
    Table,
    Typography,
    Tag,
    Space,
    Input,
    Row,
    Col,
    Select,
    Button,
    message,
    DatePicker,
    Popconfirm,
} from "antd";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const API_URL = "http://localhost:9999";

/* ================= STATUS CONFIG ================= */
const STATUS_COLOR = {
    "Chờ thanh toán": "gold",
    "Đang xử lý": "blue",
    "Đã thanh toán": "cyan",
    "Đang giao hàng": "processing",
    "Đã giao": "green",
    "Hủy đơn": "red",
};

/**
 * LUẬT CHUYỂN TRẠNG THÁI (UI + BACKEND ĐỒNG BỘ)
 *
 * Chờ thanh toán  →  Hủy đơn
 * Đang xử lý      →  Đã thanh toán
 * Đã thanh toán   →  Đang giao hàng
 *
 * Đang giao hàng  →  ❌ KHÓA
 * Đã giao         →  ❌ KHÓA
 * Hủy đơn         →  ❌ KHÓA
 */
const STATUS_FLOW = {
    "Chờ thanh toán": ["Hủy đơn"],
    "Đang xử lý": ["Đã thanh toán"],
    "Đã thanh toán": ["Đang giao hàng"],
    "Đang giao hàng": [],
    "Đã giao": [],
    "Hủy đơn": [],
};

const OrderManage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [dateRange, setDateRange] = useState(null);

    const navigate = useNavigate();

    /* ================= LOAD ORDERS ================= */
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/admin/orders`, {
                withCredentials: true,
            });
            setOrders(res.data.data || []);
        } catch {
            message.error("Không tải được danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    /* ================= UPDATE STATUS ================= */
    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await axios.put(
                `${API_URL}/api/admin/orders/${orderId}/status`,
                { status: newStatus },
                { withCredentials: true }
            );
            message.success("Cập nhật trạng thái thành công");
            fetchOrders();
        } catch {
            message.error("Cập nhật trạng thái thất bại");
        }
    };

    /* ================= FILTER ================= */
    const filteredOrders = useMemo(() => {
        let data = [...orders];

        if (searchText) {
            const kw = searchText.toLowerCase();
            data = data.filter(
                (o) =>
                    o.customer?.customerName?.toLowerCase().includes(kw) ||
                    o.customer?.account?.phone?.includes(kw)
            );
        }

        if (statusFilter !== "ALL") {
            data = data.filter((o) => o.orderStatus === statusFilter);
        }

        if (dateRange && dateRange.length === 2) {
            const [start, end] = dateRange;
            const s = start.startOf("day").valueOf();
            const e = end.endOf("day").valueOf();

            data = data.filter((o) => {
                const t = dayjs(o.createdAt).valueOf();
                return t >= s && t <= e;
            });
        }

        return data;
    }, [orders, searchText, statusFilter, dateRange]);

    /* ================= TABLE COLUMNS ================= */
    const columns = [
        {
            title: "Mã đơn",
            dataIndex: "_id",
            width: 120,
            render: (id) => id.slice(-6).toUpperCase(),
        },
        {
            title: "Khách hàng",
            render: (_, r) => (
                <div>
                    <b>{r.customer?.customerName}</b>
                    <div style={{ fontSize: 12, color: "#888" }}>
                        {r.customer?.account?.phone}
                    </div>
                </div>
            ),
        },
        {
            title: "Ngày đặt",
            render: (_, r) => dayjs(r.createdAt).format("DD/MM/YYYY"),
        },
        {
            title: "Nội dung chuyển tiền",
            dataIndex: "paymentContent",
            render: (v) => <Text copyable>{v}</Text>,
        },
        {
            title: "Tổng tiền",
            dataIndex: "totalAmount",
            render: (v) => `${v.toLocaleString("vi-VN")} ₫`,
        },
        {
            title: "Trạng thái",
            width: 200,
            render: (_, r) => {
                const nextStatuses = STATUS_FLOW[r.orderStatus];

                // 🔒 KHÓA CỨNG UI
                if (
                    r.orderStatus === "Đang giao hàng" ||
                    r.orderStatus === "Đã giao" ||
                    r.orderStatus === "Hủy đơn"
                ) {
                    return (
                        <Tag color={STATUS_COLOR[r.orderStatus]}>
                            {r.orderStatus}
                        </Tag>
                    );
                }

                // ❌ Không có trạng thái kế tiếp
                if (!nextStatuses || nextStatuses.length === 0) {
                    return (
                        <Tag color={STATUS_COLOR[r.orderStatus]}>
                            {r.orderStatus}
                        </Tag>
                    );
                }

                // ✅ Chỉ trạng thái HỢP LỆ mới cho Select
                return (
                    <Popconfirm
                        title="Xác nhận thay đổi trạng thái?"
                        onConfirm={() =>
                            updateOrderStatus(r._id, nextStatuses[0])
                        }
                    >
                        <Select value={r.orderStatus} style={{ width: 180 }}>
                            <Option value={r.orderStatus}>
                                {r.orderStatus}
                            </Option>
                            {nextStatuses.map((s) => (
                                <Option key={s} value={s}>
                                    {s}
                                </Option>
                            ))}
                        </Select>
                    </Popconfirm>
                );
            },
        },
        {
            title: "Thao tác",
            render: (_, r) => (
                <Button
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/admin/orders/${r._id}`)}
                />

            ),
        },
    ];

    /* ================= SUMMARY ================= */
    const totalOrders = filteredOrders.length;
    const pendingOrders = filteredOrders.filter(
        (o) => o.orderStatus === "Chờ thanh toán"
    ).length;
    const processingOrders = filteredOrders.filter(
        (o) => o.orderStatus === "Đang xử lý"
    ).length;
    const completedOrders = filteredOrders.filter(
        (o) => o.orderStatus === "Đã giao"
    ).length;

    return (
        <>
            {/* ===== HEADER ===== */}
            <div style={{ marginBottom: 24 }}>
                <Title level={3}>Quản lý đơn hàng</Title>
                <Text type="secondary">
                    Theo dõi và cập nhật trạng thái đơn hàng
                </Text>
            </div>

            {/* ===== TABLE ===== */}
            <Card
                title="Danh sách đơn hàng"
                extra={
                    <Space wrap>
                        <Input
                            prefix={<SearchOutlined />}
                            placeholder="Tìm tên hoặc SĐT..."
                            allowClear
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />

                        <Select
                            value={statusFilter}
                            style={{ width: 180 }}
                            onChange={setStatusFilter}
                        >
                            <Option value="ALL">Tất cả</Option>
                            {Object.keys(STATUS_COLOR).map((s) => (
                                <Option key={s} value={s}>
                                    {s}
                                </Option>
                            ))}
                        </Select>

                        <RangePicker
                            format="DD/MM/YYYY"
                            onChange={setDateRange}
                        />
                    </Space>
                }
            >
                <Table
                    rowKey="_id"
                    loading={loading}
                    columns={columns}
                    dataSource={filteredOrders}
                    pagination={{ pageSize: 8 }}
                />
            </Card>

            {/* ===== SUMMARY ===== */}
            <Row gutter={16} style={{ marginTop: 24 }}>
                <Col span={6}>
                    <Card>
                        <Text type="secondary">Tổng đơn</Text>
                        <Title level={3}>{totalOrders}</Title>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Text type="secondary">Chờ thanh toán</Text>
                        <Title level={3}>{pendingOrders}</Title>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Text type="secondary">Đang xử lý</Text>
                        <Title level={3}>{processingOrders}</Title>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Text type="secondary">Hoàn thành</Text>
                        <Title level={3}>{completedOrders}</Title>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default OrderManage;
