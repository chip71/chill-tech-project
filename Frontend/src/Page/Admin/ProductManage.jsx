import {
    Card,
    Table,
    Typography,
    Button,
    Tag,
    Space,
    Input,
    Row,
    Col,
    Image,
    message,
    Select,
} from "antd";
import {
    EditOutlined,
    EyeInvisibleOutlined,
    EyeOutlined,
    SearchOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import AddProduct from "./AddProduct";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;
const API_URL = "http://localhost:9999";

/* ================= STOCK STATUS ================= */
const renderStockStatus = (stock) => {
    if (stock > 0) return <Tag color="green">Còn hàng</Tag>;
    return <Tag color="red">Hết hàng</Tag>;
};

/* ================= PRODUCT STATUS ================= */
const renderProductStatus = (status) => {
    return status === "ACTIVE" ? (
        <Tag color="green">Đang bán</Tag>
    ) : (
        <Tag color="default">Đã ẩn</Tag>
    );
};

const ProductManage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [stockFilter, setStockFilter] = useState("ALL"); // ALL | IN_STOCK | OUT_STOCK
    const [openAdd, setOpenAdd] = useState(false);

    const navigate = useNavigate();

    /* ================= LOAD PRODUCTS ================= */
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/admin/products`, {
                withCredentials: true,
            });
            setProducts(res.data.data || []);
        } catch (err) {
            message.error("Không tải được danh sách sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    /* ================= SEARCH + FILTER ================= */
    const filteredProducts = useMemo(() => {
        let data = [...products];

        // 🔍 Search
        if (searchText) {
            const keyword = searchText.toLowerCase();
            data = data.filter(
                (p) =>
                    p.productName?.toLowerCase().includes(keyword) ||
                    p.category?.toLowerCase().includes(keyword)
            );
        }

        // 📦 Stock filter
        if (stockFilter === "IN_STOCK") {
            data = data.filter((p) => p.stockQuantity > 0);
        }

        if (stockFilter === "OUT_STOCK") {
            data = data.filter((p) => p.stockQuantity === 0);
        }

        return data;
    }, [products, searchText, stockFilter]);

    /* ================= TOGGLE PRODUCT STATUS ================= */
    const handleToggleStatus = async (product) => {
        try {
            await axios.put(
                `${API_URL}/api/products/${product._id}/toggle-status`,
                {},
                { withCredentials: true }
            );

            message.success(
                product.status === "ACTIVE"
                    ? "Đã ẩn sản phẩm"
                    : "Đã hiển thị lại sản phẩm"
            );

            fetchProducts();
        } catch (err) {
            message.error("Thao tác thất bại");
        }
    };

    /* ================= TABLE COLUMNS ================= */
    const columns = [
        {
            title: "Hình ảnh",
            dataIndex: "imageUrl",
            width: 80,
            render: (url) => {
                const src = url
                    ? url.startsWith("http")
                        ? url
                        : `${API_URL}${url}`
                    : "/no-image.png";

                return (
                    <Image
                        width={48}
                        height={48}
                        src={src}
                        fallback="/no-image.png"
                        preview={false}
                        style={{
                            borderRadius: 8,
                            objectFit: "cover",
                        }}
                    />
                );
            },
        },

        {
            title: "Tên sản phẩm",
            dataIndex: "productName",
        },
        {
            title: "Danh mục",
            dataIndex: "category",
        },
        {
            title: "Giá",
            dataIndex: "price",
            render: (price) => `${price?.toLocaleString()}₫`,
        },
        {
            title: "Tồn kho",
            dataIndex: "stockQuantity",
            width: 100,
        },
        {
            title: "Kho",
            dataIndex: "stockQuantity",
            width: 120,
            render: renderStockStatus,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            width: 120,
            render: renderProductStatus,
        },
        {
            title: "Thao tác",
            width: 160,
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        disabled={record.status !== "ACTIVE"}
                        onClick={() =>
                            navigate(`/admin/products/edit/${record._id}`)
                        }
                    />

                    {record.status === "ACTIVE" ? (
                        <Button
                            danger
                            icon={<EyeInvisibleOutlined />}
                            title="Ẩn sản phẩm"
                            onClick={() => handleToggleStatus(record)}
                        />
                    ) : (
                        <Button
                            type="primary"
                            ghost
                            icon={<EyeOutlined />}
                            title="Hiển thị lại"
                            onClick={() => handleToggleStatus(record)}
                        />
                    )}
                </Space>
            ),
        },
    ];

    /* ================= SUMMARY ================= */
    const total = filteredProducts.length;
    const inStock = filteredProducts.filter((p) => p.stockQuantity > 0).length;
    const outStock = filteredProducts.filter((p) => p.stockQuantity === 0).length;

    return (
        <>
            {/* ===== PAGE HEADER ===== */}
            <div style={{ marginBottom: 24 }}>
                <Title level={3}>Quản lý sản phẩm</Title>
                <Text type="secondary">
                    Quản lý danh sách sản phẩm linh kiện điện lạnh
                </Text>
            </div>

            {/* ===== TABLE ===== */}
            <Card
                title="Danh sách sản phẩm"
                extra={
                    <Space>
                        <Input
                            prefix={<SearchOutlined />}
                            placeholder="Tìm theo tên hoặc danh mục..."
                            style={{ width: 260 }}
                            allowClear
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />

                        <Select
                            value={stockFilter}
                            style={{ width: 160 }}
                            onChange={setStockFilter}
                        >
                            <Option value="ALL">Tất cả</Option>
                            <Option value="IN_STOCK">Còn hàng</Option>
                            <Option value="OUT_STOCK">Hết hàng</Option>
                        </Select>

                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setOpenAdd(true)}
                        >
                            Thêm sản phẩm
                        </Button>
                    </Space>
                }
            >
                <Table
                    rowKey="_id"
                    loading={loading}
                    columns={columns}
                    dataSource={filteredProducts}
                    pagination={{ pageSize: 8 }}
                />
            </Card>

            {/* ===== SUMMARY ===== */}
            <Row gutter={16} style={{ marginTop: 24 }}>
                <Col span={8}>
                    <Card>
                        <Text type="secondary">Tổng sản phẩm</Text>
                        <Title level={3}>{total}</Title>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Text type="secondary">Còn hàng</Text>
                        <Title level={3}>{inStock}</Title>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Text type="secondary">Hết hàng</Text>
                        <Title level={3}>{outStock}</Title>
                    </Card>
                </Col>
            </Row>

            {/* ===== ADD PRODUCT MODAL ===== */}
            <AddProduct
                open={openAdd}
                onClose={() => setOpenAdd(false)}
                onSuccess={fetchProducts}
            />
        </>
    );
};

export default ProductManage;
