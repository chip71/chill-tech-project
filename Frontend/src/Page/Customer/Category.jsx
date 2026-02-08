import { useEffect, useState } from "react";
import { Card, Row, Col, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:9999";

const Category = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/products/public`);
                const products = res.data.data || [];

                // Gom sản phẩm theo category
                const categoryMap = {};
                products.forEach((p) => {
                    const cat = p.category || "Khác";
                    if (!categoryMap[cat]) {
                        categoryMap[cat] = 0;
                    }
                    categoryMap[cat]++;
                });

                // Chuyển object → array
                const categoryList = Object.keys(categoryMap).map((key) => ({
                    name: key,
                    total: categoryMap[key],
                }));

                setCategories(categoryList);
            } catch (error) {
                console.error("GET CATEGORY ERROR:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return <Spin fullscreen />;
    const cardStyle = {
        borderRadius: 20,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.3s ease",
        background: "linear-gradient(135deg, #f8fafc, #eef2ff)",
        boxShadow: "0 10px 28px rgba(0,0,0,0.08)",
    };

    const cardHoverStyle = {
        transform: "translateY(-6px)",
        boxShadow: "0 18px 40px rgba(37,99,235,0.25)",
    };

    return (
        <div style={{ maxWidth: 1200, margin: "40px auto" }}>
            <h2 style={{ marginBottom: 24 }}>Danh mục sản phẩm</h2>

            <Row gutter={[24, 24]} align="stretch">
                {categories.map((cat) => (
                    <Col
                        xs={24}
                        sm={12}
                        md={8}
                        lg={6}
                        key={cat.name}
                        style={{ display: "flex" }}   // 🔥 quan trọng
                    >
                        <Card
                            hoverable
                            style={{
                                ...cardStyle,
                                width: "100%",
                                height: "100%",      // 🔥 card full height
                            }}
                            bodyStyle={{
                                padding: 20,
                                display: "flex",
                                flexDirection: "column",
                                height: "100%",      // 🔥 nội dung full height
                            }}
                            onMouseEnter={(e) =>
                                Object.assign(e.currentTarget.style, cardHoverStyle)
                            }
                            onMouseLeave={(e) =>
                                Object.assign(e.currentTarget.style, cardStyle)
                            }
                            onClick={() =>
                                navigate(`/products?category=${encodeURIComponent(cat.name)}`)
                            }
                        >
                            {/* TITLE */}
                            <h3
                                style={{
                                    fontSize: 18,
                                    fontWeight: 700,
                                    marginBottom: 8,
                                    color: "#0f172a",
                                    minHeight: 44, // 🔥 giữ đều khi tên dài/ngắn
                                }}
                            >
                                {cat.name}
                            </h3>

                            {/* PUSH TO BOTTOM */}
                            <div style={{ marginTop: "auto" }}>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: 14,
                                        color: "#475569",
                                        fontWeight: 600,
                                    }}
                                >
                                    {cat.total} sản phẩm
                                </p>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

        </div>
    );
};

export default Category;
