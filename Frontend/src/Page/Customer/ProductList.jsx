import { useEffect, useMemo, useState } from "react";
import {
  Row,
  Col,
  Card,
  Input,
  Select,
  Button,
  Tag,
  Empty,
  Slider,
  Divider,
  Space,
  Typography,
  Switch,
  Pagination,
  Segmented,
  Skeleton,
  Badge,
  Tooltip,
  message,
  Checkbox,
} from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FeaturedBanner from "../../components/FeaturedBanner/FeaturedBanner";
import axios from "axios";
import { useCart } from "../../Routes/Context/CartContext";
import { useAuth } from "../../Routes/Context/AuthContext";
import {
  ReloadOutlined,
  AppstoreOutlined,
  BarsOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

const API_URL = "http://localhost:9999";

const money = (v) => (Number(v) || 0).toLocaleString("vi-VN");
const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return "/no-image.png";

  // Link ngoài
  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  // Ảnh upload từ backend
  return `${API_URL}${imageUrl}`;
};

const ProductList = () => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // data
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // banners (from DB)
  const [banners, setBanners] = useState([]);

  // filters
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [categoriesSelected, setCategoriesSelected] = useState([]); // ✅ multi-category
  const [inStockOnly, setInStockOnly] = useState(false);

  // category view
  const [showAllCats, setShowAllCats] = useState(false);

  // price filter
  const [maxPrice, setMaxPrice] = useState(0);
  const [priceRange, setPriceRange] = useState([0, 0]);

  // UI
  const [view, setView] = useState("grid"); // grid | list
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);


  // ===== Styles (Blue theme) =====
  const buyBtnStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 14,
    border: "none",
    fontWeight: 900,
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    boxShadow: "0 10px 24px rgba(37, 99, 235, 0.35)",
  };

  const buyBtnHover = {
    transform: "translateY(-2px) scale(1.01)",
    boxShadow: "0 14px 32px rgba(37, 99, 235, 0.45)",
  };

  const viewBtnStyle = {
    width: "100%",
    borderRadius: 12,
    border: "1px solid rgba(37, 99, 235, 0.35)",
    color: "#1d4ed8",
    background: "#fff",
  };
  // ===============================

  // load products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Nếu backend bạn là /api/products thì đổi lại cho đúng.
        const res = await axios.get(`${API_URL}/api/products/public`);
        const data = res?.data?.data || [];

        const list = Array.isArray(data) ? data : [];
        setAllProducts(list);

        const prices = list
          .map((p) => Number(p.price))
          .filter((p) => Number.isFinite(p));

        const max = prices.length ? Math.max(...prices) : 0;
        setMaxPrice(max);
        setPriceRange([0, max]);
      } catch (e) {
        console.error(e);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // load banners (public)
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/banners`, {
          params: { page: "products" },
        });

        const list = res?.data?.data || [];
        const mapped = list.map((b) => ({
          id: b._id,
          title: b.title,
          subtitle: b.subtitle,
          glowText: b.glowText,
          ctaText: b.ctaText,
          href: b.ctaLink,
          imageUrl: b.imageUrl,
          bgColor: b.bgValue,
        }));
        setBanners(mapped);
      } catch (e) {
        console.error("Fetch banners failed:", e);
      }
    };

    fetchBanners();
  }, []);


  // categories list
  const categories = useMemo(() => {
    const unique = [
      ...new Set(allProducts.map((p) => p.category).filter(Boolean)),
    ];
    return unique;
  }, [allProducts]);

  // filter + sort
  const filtered = useMemo(() => {
    let data = [...allProducts];

    // search by name
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter((p) =>
        (p.productName || "").toLowerCase().includes(q)
      );
    }

    // multi categories
    if (categoriesSelected.length > 0) {
      const setLower = new Set(
        categoriesSelected.map((c) => String(c).trim().toLowerCase())
      );
      data = data.filter((p) =>
        setLower.has(String(p.category || "").trim().toLowerCase())
      );
    }

    // in stock
    if (inStockOnly) {
      data = data.filter((p) => Number(p.stockQuantity) > 0);
    }

    // price range
    data = data.filter((p) => {
      const price = Number(p.price);
      if (!Number.isFinite(price)) return false;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // sort
    if (sort === "price_asc")
      data.sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sort === "price_desc")
      data.sort((a, b) => (b.price || 0) - (a.price || 0));
    if (sort === "newest") {
      data.sort((a, b) => {
        const da = new Date(a.createdAt || 0).getTime();
        const db = new Date(b.createdAt || 0).getTime();
        return db - da;
      });
    }

    return data;
  }, [allProducts, search, categoriesSelected, inStockOnly, priceRange, sort]);

  // pagination
  const total = filtered.length;
  const pagedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // reset
  const resetFilters = () => {
    setSearch("");
    setSort("newest");
    setCategoriesSelected([]);
    setInStockOnly(false);
    setPriceRange([0, maxPrice]);
    setShowAllCats(false);
    setPage(1);
  };

  // move back to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, sort, categoriesSelected, inStockOnly, priceRange]);

  // ✅ fixed image container (no distortion)
  // (đổi qua cover để ảnh đều khung kiểu shop)
  const renderImage = (item) => {
    const src = resolveImageUrl(item.imageUrl);

    return (
      <div
        style={{
          height: 220,
          width: "100%",
          background: "#fff",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <img
          alt={item.productName}
          src={src}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/no-image.png";
          }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>
    );
  };

  // ✅ grid card fixed height + bottom buttons
  const ProductCardGrid = ({ item }) => {
    const stock = Number(item.stockQuantity) || 0;
    const inStock = stock > 0;


    const [isHoverBuy, setIsHoverBuy] = useState(false);

    return (
      <Badge.Ribbon
        text={inStock ? "Còn hàng" : "Hết hàng"}
        color={inStock ? "green" : "red"}
      >
        <Card
          hoverable
          style={{
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
            height: "100%",
          }}
          bodyStyle={{
            padding: 14,
            display: "flex",
            flexDirection: "column",
            height: 190,
          }}
          cover={<Link to={`/products/${item._id}`}>{renderImage(item)}</Link>}
        >
          <div style={{ minHeight: 44 }}>
            <Link
              to={`/products/${item._id}`}
              style={{ color: "#0b1f2a", textDecoration: "none" }}
            >
              <Text
                strong
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  lineHeight: 1.25,
                }}
              >
                {item.productName}
              </Text>
            </Link>
          </div>

          <div style={{ marginTop: 8 }}>
            <Text style={{ color: "#1d4ed8", fontSize: 24, fontWeight: 900, lineHeight: 1 }}>
              {item.price ? `${money(item.price)}₫` : "Liên hệ"}
            </Text>
          </div>

          <div style={{ marginTop: 6 }}>
            <Tag color={inStock ? "green" : "red"} style={{ margin: 0 }}>
              {inStock ? `Còn ${stock} sản phẩm` : "Tạm hết"}
            </Tag>
          </div>

          <div style={{ flex: 1 }} />

          <Space style={{ width: "100%", marginTop: 12 }}>
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              disabled={!inStock}
              onClick={() => {
                if (!user) {
                  message.info("Vui lòng đăng nhập để thêm vào giỏ");
                  navigate("/login", { replace: true, state: { from: location.pathname + location.search } });
                  return;
                }
                addToCart(item, 1);
                message.success("Đã thêm vào giỏ!");
              }}
              onMouseEnter={() => setIsHoverBuy(true)}
              onMouseLeave={() => setIsHoverBuy(false)}
              style={{
                ...buyBtnStyle,
                ...(isHoverBuy ? buyBtnHover : null),
                opacity: inStock ? 1 : 0.6,
                cursor: inStock ? "pointer" : "not-allowed",
                color: "#fff",
              }}
            >
              MUA NGAY
            </Button>

            <Tooltip title="Xem chi tiết">
              <Button style={viewBtnStyle}>
                <Link to={`/products/${item._id}`} style={{ color: "inherit" }}>
                  Xem thêm →
                </Link>
              </Button>
            </Tooltip>
          </Space>
        </Card>
      </Badge.Ribbon>
    );
  };

  // ✅ list view row: chống tràn nút bằng flex-wrap
  const ProductRowList = ({ item }) => {
    const stock = Number(item.stockQuantity) || 0;
    const inStock = stock > 0;
    const src = resolveImageUrl(item.imageUrl);


    const [isHoverBuy, setIsHoverBuy] = useState(false);

    return (
      <Card hoverable style={{ borderRadius: 14 }} bodyStyle={{ padding: 14 }}>
        <div
          style={{
            display: "flex",
            gap: 14,
            alignItems: "center",
            flexWrap: "wrap",
            width: "100%",
          }}
        >
          {/* IMAGE */}
          <Link to={`/products/${item._id}`} style={{ flex: "0 0 auto" }}>
            <div
              style={{
                width: 150,
                height: 110,
                borderRadius: 12,
                overflow: "hidden",
                background: "#fff",
                border: "1px solid #f0f0f0",
              }}
            >
              <img
                src={src}
                alt={item.productName}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          </Link>

          {/* INFO */}
          <div style={{ flex: "1 1 260px", minWidth: 220 }}>
            <Space wrap size={[6, 6]}>
              <Tag color="blue">{item.category || "Chưa phân loại"}</Tag>
              <Tag color={inStock ? "green" : "red"}>
                {inStock ? "Còn hàng" : "Hết hàng"}
              </Tag>
            </Space>

            <div style={{ marginTop: 6 }}>
              <Link to={`/products/${item._id}`} style={{ color: "#0b1f2a" }}>
                <Text strong style={{ fontSize: 16 }}>
                  {item.productName}
                </Text>
              </Link>
            </div>

            <Text type="secondary">
              {inStock ? `Còn ${stock} sản phẩm` : "Tạm hết"}
            </Text>
          </div>

          {/* PRICE + BUTTONS */}
          <div
            style={{
              marginLeft: "auto",
              flex: "0 0 auto",
              minWidth: 240,
              textAlign: "right",
            }}
          >
            <Text style={{ color: "#1d4ed8", fontSize: 24, fontWeight: 900, lineHeight: 1 }}>
              {item.price ? `${money(item.price)}₫` : "Liên hệ"}
            </Text>

            <div
              style={{
                marginTop: 10,
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                flexWrap: "wrap",
              }}
            >
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                disabled={!inStock}
                onMouseEnter={() => setIsHoverBuy(true)}
                onMouseLeave={() => setIsHoverBuy(false)}
                onClick={() => {
                  if (!user) {
                    message.info("Vui lòng đăng nhập để thêm vào giỏ");
                    navigate("/login", { replace: true, state: { from: location.pathname + location.search } });
                    return;
                  }
                  addToCart(item, 1);
                  message.success("Đã thêm vào giỏ!");
                }}
                style={{
                  ...buyBtnStyle,
                  ...(isHoverBuy ? buyBtnHover : null),
                  width: 260,
                  color: "#fff",
                  opacity: inStock ? 1 : 0.6,
                  cursor: inStock ? "pointer" : "not-allowed",
                }}
              >
                MUA NGAY
              </Button>

              <Button style={{ ...viewBtnStyle, width: 260 }}>
                <Link to={`/products/${item._id}`} style={{ color: "inherit" }}>
                  Xem thêm →
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <Title level={3} style={{ margin: 0 }}>
          Sản phẩm linh kiện điện lạnh
        </Title>
        <Text type="secondary">

        </Text>
      </div>

      {/* Featured banner (from DB) */}
      {banners.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <FeaturedBanner items={banners} height={280} />
        </div>
      )}

      {/* Top controls */}
      <Card style={{ borderRadius: 14, marginBottom: 18 }} bodyStyle={{ padding: 14 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={10}>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              placeholder="Tìm kiếm: gas lạnh, ống đồng, phụ kiện..."
            />
          </Col>

          <Col xs={12} md={5}>
            <Select value={sort} onChange={setSort} style={{ width: "100%" }}>
              <Option value="newest">Mới nhất</Option>
              <Option value="price_asc">Giá tăng dần</Option>
              <Option value="price_desc">Giá giảm dần</Option>
            </Select>
          </Col>

          <Col xs={12} md={4}>
            <Segmented
              block
              value={view}
              onChange={setView}
              options={[
                { label: "Lưới", value: "grid", icon: <AppstoreOutlined /> },
                { label: "Danh sách", value: "list", icon: <BarsOutlined /> },
              ]}
            />
          </Col>

          <Col xs={24} md={5} style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button icon={<ReloadOutlined />} onClick={resetFilters}>
              Reset lọc
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={[18, 18]}>
        {/* Sidebar Filters */}
        <Col xs={24} md={6}>
          <div style={{ position: "sticky", top: 16 }}>
            <Card title="Bộ lọc" style={{ borderRadius: 14 }}>
              {/* ✅ Multi category */}
              <div style={{ marginBottom: 10 }}>
                <Text strong>Danh mục</Text>

                <div
                  style={{
                    marginTop: 10,
                    maxHeight: 240,
                    overflowY: "auto",
                    paddingRight: 6,
                  }}
                >
                  <Checkbox
                    checked={categoriesSelected.length === 0}
                    onChange={() => setCategoriesSelected([])}
                  >
                    <span style={{ fontWeight: categoriesSelected.length === 0 ? 600 : 400 }}>
                      Tất cả
                    </span>
                  </Checkbox>

                  <Divider style={{ margin: "10px 0" }} />

                  <Checkbox.Group
                    value={categoriesSelected}
                    onChange={(vals) => setCategoriesSelected(vals)}
                    style={{ width: "100%" }}
                  >
                    <Space direction="vertical" size={8} style={{ width: "100%" }}>
                      {(showAllCats ? categories : categories.slice(0, 8)).map((cat) => (
                        <Checkbox key={cat} value={cat}>
                          <span style={{ fontWeight: categoriesSelected.includes(cat) ? 600 : 400 }}>
                            {cat}
                          </span>
                        </Checkbox>
                      ))}
                    </Space>
                  </Checkbox.Group>
                </div>

                {categories.length > 8 && (
                  <Button
                    type="link"
                    style={{ padding: 0, marginTop: 6 }}
                    onClick={() => setShowAllCats((v) => !v)}
                  >
                    {showAllCats ? "Thu gọn" : "Hiển thị thêm"}
                  </Button>
                )}
              </div>

              <Divider style={{ margin: "12px 0" }} />

              <Space
                align="center"
                style={{ width: "100%", justifyContent: "space-between" }}
              >
                <Text strong>Chỉ còn hàng</Text>
                <Switch checked={inStockOnly} onChange={setInStockOnly} />
              </Space>

              <Divider style={{ margin: "12px 0" }} />

              <Text strong>Lọc theo giá</Text>
              <div style={{ marginTop: 10 }}>
                <Slider
                  range
                  min={0}
                  max={maxPrice || 0}
                  value={priceRange}
                  onChange={setPriceRange}
                  tooltip={{
                    formatter: (value) => `${money(value)}₫`,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                  }}
                >
                  <span>{money(priceRange[0])}₫</span>
                  <span>{money(priceRange[1])}₫</span>
                </div>
              </div>
            </Card>
          </div>
        </Col>

        {/* Products */}
        <Col xs={24} md={18}>
          {loading ? (
            <Row gutter={[16, 16]}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Col xs={24} sm={12} lg={8} key={i}>
                  <Card style={{ borderRadius: 14 }}>
                    <Skeleton active />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : total === 0 ? (
            <Empty description="Không có sản phẩm phù hợp" />
          ) : (
            <>
              {view === "grid" ? (
                // ✅ FIX: ít sản phẩm thì card to hơn và nằm giữa (như ảnh bạn muốn)
                <Row gutter={[16, 16]} align="stretch" justify="center">
                  {(() => {
                    const count = pagedProducts.length;
                    const lgSpan = count <= 2 ? 10 : 8; // ✅ 1-2 sp: to hơn, căn giữa

                    return pagedProducts.map((item) => (
                      <Col
                        xs={24}
                        sm={12}
                        lg={lgSpan}
                        key={item._id}
                        style={{ display: "flex" }}
                      >
                        <div style={{ width: "100%" }}>
                          <ProductCardGrid item={item} />
                        </div>
                      </Col>
                    ));
                  })()}
                </Row>
              ) : (
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  {pagedProducts.map((item) => (
                    <ProductRowList key={item._id} item={item} />
                  ))}
                </Space>
              )}

              <div style={{ display: "flex", justifyContent: "center", marginTop: 18 }}>
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={total}
                  showSizeChanger
                  pageSizeOptions={[6, 9, 12, 18]}
                  onChange={(p, ps) => {
                    setPage(p);
                    setPageSize(ps);
                  }}
                />
              </div>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ProductList;
