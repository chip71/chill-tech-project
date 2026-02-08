import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  message,
  InputNumber,
  Typography,
  Upload,
  ColorPicker,
  Radio,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import api from "../../service/api";

const { Title, Text } = Typography;

const DEFAULT_BG =
  "radial-gradient(circle at 30% 40%, #1d4ed8 0%, #0b1220 45%, #000 100%)";

const AdminBanner = () => {
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState([]);

  // modal
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  // preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  // upload
  const [uploading, setUploading] = useState(false);

  // image mode: link or upload
  const [imageMode, setImageMode] = useState("link"); // "link" | "upload"

  // bg picker
  const [bgMode, setBgMode] = useState("gradient"); // "solid" | "gradient"
  const [bgSolid, setBgSolid] = useState("#0b1220");
  const [bgG1, setBgG1] = useState("#1d4ed8");
  const [bgG2, setBgG2] = useState("#000000");

  const buildBgValue = (mode, solid, g1, g2) => {
    if (mode === "solid") return solid;
    return `radial-gradient(circle at 30% 40%, ${g1} 0%, #0b1220 45%, ${g2} 100%)`;
  };

  const syncBgValueToForm = (mode, solid, g1, g2) => {
    form.setFieldsValue({ bgValue: buildBgValue(mode, solid, g1, g2) });
  };

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/banners");
      setBanners(res?.data?.data || []);
    } catch (e) {
      console.error(e);
      message.error("Không tải được danh sách banner");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const onCreate = () => {
    setEditing(null);
    form.resetFields();

    form.setFieldsValue({
      imageOnly: false,
      title: "",
      subtitle: "",
      ctaText: "XEM NGAY",
      ctaLink: "/products",
      imageUrl: "",
      bgValue: DEFAULT_BG,
      glowText: "",
      page: "home",
      order: 0,
      active: true,
    });

    setImageMode("link");
    setBgMode("gradient");
    setBgSolid("#0b1220");
    setBgG1("#1d4ed8");
    setBgG2("#000000");
    syncBgValueToForm("gradient", "#0b1220", "#1d4ed8", "#000000");

    setOpen(true);
  };

  const onEdit = (record) => {
    setEditing(record);
    form.resetFields();

    form.setFieldsValue({
      imageOnly: !!record.imageOnly,
      title: record.title,
      subtitle: record.subtitle,
      ctaText: record.ctaText,
      ctaLink: record.ctaLink,
      imageUrl: record.imageUrl,
      bgValue: record.bgValue || DEFAULT_BG,
      glowText: record.glowText,
      page: record.page || "home",
      order: record.order ?? 0,
      active: !!record.active,
    });

    const url = record.imageUrl || "";
    setImageMode(url ? "link" : "link");

    setBgMode("gradient");
    setBgSolid("#0b1220");
    setBgG1("#1d4ed8");
    setBgG2("#000000");

    setOpen(true);
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();

      // ✅ validate theo chế độ banner
      if (!values.imageUrl) {
        message.error("Vui lòng chọn/nhập imageUrl");
        return;
      }
      if (!values.imageOnly && !values.title?.trim()) {
        message.error("Vui lòng nhập tiêu đề");
        return;
      }

      // Nếu chọn "Chỉ dùng ảnh" thì không bắt buộc các field text
      const payload = {
        ...values,
        title: values.imageOnly ? (values.title || "") : values.title,
        subtitle: values.imageOnly ? (values.subtitle || "") : values.subtitle,
        ctaText: values.imageOnly ? (values.ctaText || "") : values.ctaText,
        glowText: values.imageOnly ? (values.glowText || "") : values.glowText,
        bgValue: values.imageOnly ? (values.bgValue || DEFAULT_BG) : values.bgValue,
      };

      setLoading(true);
      if (editing?._id) {
        await api.put(`/admin/banners/${editing._id}`, payload);
        message.success("Cập nhật banner thành công");
      } else {
        await api.post("/admin/banners", payload);
        message.success("Tạo banner thành công");
      }

      setOpen(false);
      setEditing(null);
      await fetchBanners();
    } catch (e) {
      if (e?.errorFields) return;
      console.error(e);
      message.error(e?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (record) => {
    Modal.confirm({
      title: "Xoá banner?",
      content: `Bạn chắc chắn muốn xoá banner "${record.title || record._id}"?`,
      okText: "Xoá",
      okButtonProps: { danger: true },
      cancelText: "Huỷ",
      onOk: async () => {
        try {
          setLoading(true);
          await api.delete(`/admin/banners/${record._id}`);
          message.success("Đã xoá banner");
          await fetchBanners();
        } catch (e) {
          console.error(e);
          message.error(e?.response?.data?.message || "Xoá thất bại");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const onToggle = async (record) => {
    try {
      setBanners((prev) =>
        prev.map((b) => (b._id === record._id ? { ...b, active: !b.active } : b))
      );
      await api.patch(`/admin/banners/${record._id}/toggle`);
      message.success("Đã cập nhật trạng thái");
    } catch (e) {
      console.error(e);
      message.error("Không cập nhật được trạng thái");
      setBanners((prev) =>
        prev.map((b) => (b._id === record._id ? { ...b, active: !b.active } : b))
      );
    }
  };

  const openPreview = (record) => {
    setPreviewItem(record);
    setPreviewOpen(true);
  };

  // Upload ảnh banner (chỉ cần đổi endpoint nếu backend bạn khác)
  const uploadImage = async (file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      // ✅ nếu endpoint upload của bạn khác, đổi tại đây
      const res = await api.post("/admin/products/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageUrl =
        res?.data?.imageUrl || res?.data?.data?.imageUrl || res?.data?.data?.path;

      if (!imageUrl) {
        message.error("Upload thành công nhưng không nhận được imageUrl");
        return;
      }

      form.setFieldsValue({ imageUrl });
      message.success("Upload ảnh thành công");
    } catch (e) {
      console.error(e);
      message.error(e?.response?.data?.message || "Upload ảnh thất bại");
    } finally {
      setUploading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "Thứ tự",
        dataIndex: "order",
        width: 80,
        sorter: (a, b) => (a.order ?? 0) - (b.order ?? 0),
      },
      {
        title: "Trang",
        dataIndex: "page",
        width: 110,
        render: (v) => (
          <Tag color={v === "products" ? "geekblue" : "blue"}>
            {v === "products" ? "Products" : "Home"}
          </Tag>
        ),
        filters: [
          { text: "Home", value: "home" },
          { text: "Products", value: "products" },
        ],
        onFilter: (value, record) => record.page === value,
      },
      {
        title: "Kiểu",
        dataIndex: "imageOnly",
        width: 110,
        render: (v) => (
          <Tag color={v ? "gold" : "green"}>{v ? "Chỉ ảnh" : "Có chữ"}</Tag>
        ),
        filters: [
          { text: "Có chữ", value: "text" },
          { text: "Chỉ ảnh", value: "image" },
        ],
        onFilter: (value, record) =>
          value === "image" ? !!record.imageOnly : !record.imageOnly,
      },
      {
        title: "Tiêu đề",
        dataIndex: "title",
        render: (v, r) => (
          <div>
            <div style={{ fontWeight: 700 }}>{v || "(Chỉ ảnh)"}</div>
            {r.subtitle ? (
              <div style={{ color: "#6b7280", fontSize: 12 }}>{r.subtitle}</div>
            ) : null}
          </div>
        ),
      },
      {
        title: "Ảnh",
        dataIndex: "imageUrl",
        width: 150,
        render: (v) =>
          v ? (
            <img
              src={v.startsWith("http") ? v : `http://localhost:9999${v}`}
              alt="banner"
              style={{
                width: 120,
                height: 54,
                objectFit: "cover",
                borderRadius: 10,
                border: "1px solid #eee",
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <Text type="secondary">Chưa có</Text>
          ),
      },
      {
        title: "Active",
        dataIndex: "active",
        width: 100,
        render: (_, r) => (
          <Switch checked={!!r.active} onChange={() => onToggle(r)} />
        ),
      },
      {
        title: "Hành động",
        width: 220,
        render: (_, r) => (
          <Space>
            <Button icon={<EyeOutlined />} onClick={() => openPreview(r)}>
              Preview
            </Button>
            <Button icon={<EditOutlined />} onClick={() => onEdit(r)}>
              Sửa
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={() => onDelete(r)}>
              Xoá
            </Button>
          </Space>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [banners]
  );

  const watchedBg = Form.useWatch("bgValue", form);
  const watchedTitle = Form.useWatch("title", form);
  const watchedSubtitle = Form.useWatch("subtitle", form);
  const watchedCtaText = Form.useWatch("ctaText", form);
  const watchedGlowText = Form.useWatch("glowText", form);
  const watchedImageOnly = Form.useWatch("imageOnly", form);
  const watchedImageUrl = Form.useWatch("imageUrl", form);

  return (
    <div style={{ padding: 20 }}>
      <Card style={{ borderRadius: 14 }}>
        <Row align="middle" justify="space-between" gutter={[12, 12]}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              Quản lý Banner
            </Title>
            <Text type="secondary">
              Admin có thể chỉnh tiêu đề, hình ảnh, màu nền và bật/tắt banner.
            </Text>
          </Col>

          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchBanners}>
                Tải lại
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
                Thêm banner
              </Button>
            </Space>
          </Col>
        </Row>

        <div style={{ marginTop: 18 }}>
          <Table
            rowKey="_id"
            loading={loading}
            columns={columns}
            dataSource={banners}
            pagination={{ pageSize: 8 }}
          />
        </div>
      </Card>

      {/* CREATE/EDIT MODAL */}
      <Modal
        open={open}
        title={editing ? "Sửa banner" : "Thêm banner"}
        onCancel={() => {
          setOpen(false);
          setEditing(null);
        }}
        onOk={onSubmit}
        okText={editing ? "Lưu" : "Tạo"}
        confirmLoading={loading}
        width={860}
      >
        <Form layout="vertical" form={form}>
          <Row gutter={[12, 12]}>
            <Col xs={24} md={16}>
              <Form.Item
                label="Chế độ banner"
                name="imageOnly"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Chỉ dùng ảnh"
                  unCheckedChildren="Có chữ"
                />
              </Form.Item>

              <Form.Item label="Tiêu đề" name="title">
                <Input placeholder="VD: Linh kiện điện lạnh chính hãng..." />
              </Form.Item>

              {!watchedImageOnly ? (
                <>
                  <Form.Item label="Phụ đề" name="subtitle">
                    <Input placeholder="VD: Ưu đãi hôm nay / Sản phẩm nổi bật..." />
                  </Form.Item>

                  <Row gutter={[12, 12]}>
                    <Col xs={24} md={12}>
                      <Form.Item label="Chữ nút (CTA)" name="ctaText">
                        <Input placeholder="XEM NGAY" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Link nút" name="ctaLink">
                        <Input placeholder="/products" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[12, 12]}>
                    <Col xs={24} md={12}>
                      <Form.Item label="Glow text" name="glowText">
                        <Input placeholder="HOT / SALE / CHILL..." />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Trang hiển thị" name="page">
                        <Select
                          options={[
                            { value: "home", label: "Home" },
                            { value: "products", label: "Products" },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[12, 12]}>
                    <Col xs={24} md={12}>
                      <Form.Item label="Thứ tự (order)" name="order">
                        <InputNumber min={0} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Bật/Tắt (active)"
                        name="active"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* ✅ NỀN: PICKER */}
                  <Form.Item label="Nền banner">
                    <Radio.Group
                      value={bgMode}
                      onChange={(e) => {
                        const mode = e.target.value;
                        setBgMode(mode);
                        syncBgValueToForm(mode, bgSolid, bgG1, bgG2);
                      }}
                      options={[
                        { label: "Màu đơn", value: "solid" },
                        { label: "Gradient", value: "gradient" },
                      ]}
                    />

                    <div style={{ marginTop: 12 }}>
                      {bgMode === "solid" ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <ColorPicker
                            value={bgSolid}
                            onChange={(c) => {
                              const hex = c.toHexString();
                              setBgSolid(hex);
                              syncBgValueToForm("solid", hex, bgG1, bgG2);
                            }}
                            showText
                          />
                          <span style={{ color: "#6b7280" }}>Chọn màu nền</span>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            gap: 16,
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
                              Màu 1
                            </div>
                            <ColorPicker
                              value={bgG1}
                              onChange={(c) => {
                                const hex = c.toHexString();
                                setBgG1(hex);
                                syncBgValueToForm("gradient", bgSolid, hex, bgG2);
                              }}
                              showText
                            />
                          </div>

                          <div>
                            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
                              Màu 2
                            </div>
                            <ColorPicker
                              value={bgG2}
                              onChange={(c) => {
                                const hex = c.toHexString();
                                setBgG2(hex);
                                syncBgValueToForm("gradient", bgSolid, bgG1, hex);
                              }}
                              showText
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <Divider style={{ margin: "12px 0" }} />

                    <Form.Item name="bgValue" noStyle>
                      <Input type="hidden" />
                    </Form.Item>

                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      * Hệ thống tự tạo bgValue, bạn không cần gõ.
                    </div>
                  </Form.Item>
                </>
              ) : (
                <>
                  {/* Chỉ dùng ảnh: vẫn cho chọn trang + order + active */}
                  <Row gutter={[12, 12]}>
                    <Col xs={24} md={12}>
                      <Form.Item label="Trang hiển thị" name="page">
                        <Select
                          options={[
                            { value: "home", label: "Home" },
                            { value: "products", label: "Products" },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Thứ tự (order)" name="order">
                        <InputNumber min={0} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label="Bật/Tắt (active)"
                    name="active"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item label="Link khi bấm banner" name="ctaLink">
                    <Input placeholder="/products" />
                  </Form.Item>

                  <Form.Item name="bgValue" noStyle>
                    <Input type="hidden" />
                  </Form.Item>
                </>
              )}
            </Col>

            <Col xs={24} md={8}>
              <Card size="small" title="Hình ảnh" style={{ borderRadius: 12 }}>
                <Radio.Group
                  value={imageMode}
                  onChange={(e) => setImageMode(e.target.value)}
                  options={[
                    { label: "Dán link ảnh", value: "link" },
                    { label: "Upload ảnh", value: "upload" },
                  ]}
                />

                <div style={{ marginTop: 12 }}>
                  {imageMode === "link" ? (
                    <Form.Item
                      label="imageUrl"
                      name="imageUrl"
                      rules={[{ required: true, message: "Nhập link ảnh" }]}
                    >
                      <Input placeholder="https://... hoặc /uploads/..." />
                    </Form.Item>
                  ) : (
                    <>
                      <Form.Item
                        label="imageUrl"
                        name="imageUrl"
                        rules={[{ required: true, message: "Vui lòng upload ảnh" }]}
                      >
                        <Input
                          placeholder="/uploads/xxx.png (tự điền sau upload)"
                          disabled
                        />
                      </Form.Item>

                      <Upload
                        beforeUpload={(file) => {
                          uploadImage(file);
                          return false;
                        }}
                        showUploadList={false}
                      >
                        <Button
                          icon={<UploadOutlined />}
                          loading={uploading}
                          disabled={uploading}
                          block
                        >
                          Upload ảnh
                        </Button>
                      </Upload>
                    </>
                  )}
                </div>

                <div style={{ marginTop: 10, fontSize: 12, color: "#6b7280" }}>
                  * Chỉ cần 1 trong 2: dán link hoặc upload.
                </div>
              </Card>

              <Card
                size="small"
                title="Preview nhanh"
                style={{ borderRadius: 12, marginTop: 12 }}
              >
                <div
                  style={{
                    height: 130,
                    borderRadius: 12,
                    background: watchedBg || DEFAULT_BG,
                    position: "relative",
                    overflow: "hidden",
                    padding: 12,
                    color: "#fff",
                  }}
                >
                  {watchedImageOnly && watchedImageUrl ? (
                    <img
                      src={
                        watchedImageUrl.startsWith("http")
                          ? watchedImageUrl
                          : `http://localhost:9999${watchedImageUrl}`
                      }
                      alt="preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 10,
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <>
                      <div
                        style={{
                          position: "absolute",
                          left: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: 44,
                          fontWeight: 900,
                          color: "rgba(255,255,255,0.08)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {watchedGlowText || ""}
                      </div>

                      <div style={{ position: "relative", zIndex: 2 }}>
                        <div style={{ fontSize: 12, opacity: 0.85 }}>
                          {watchedSubtitle || ""}
                        </div>
                        <div style={{ fontWeight: 900, lineHeight: 1.1 }}>
                          {watchedTitle || "Tiêu đề banner"}
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 10px",
                              borderRadius: 999,
                              border: "1px solid rgba(255,255,255,0.25)",
                              background: "rgba(0,0,0,0.25)",
                              fontWeight: 700,
                              fontSize: 12,
                            }}
                          >
                            {watchedCtaText || "XEM NGAY"} →
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* PREVIEW MODAL */}
      <Modal
        open={previewOpen}
        title="Preview banner"
        onCancel={() => {
          setPreviewOpen(false);
          setPreviewItem(null);
        }}
        footer={null}
        width={980}
      >
        {previewItem ? (
          previewItem.imageOnly ? (
            <div
              style={{
                borderRadius: 16,
                overflow: "hidden",
                background: "#0b1220",
              }}
            >
              {previewItem.imageUrl ? (
                <img
                  src={
                    previewItem.imageUrl.startsWith("http")
                      ? previewItem.imageUrl
                      : `http://localhost:9999${previewItem.imageUrl}`
                  }
                  alt="preview"
                  style={{ width: "100%", height: 380, objectFit: "cover" }}
                />
              ) : null}
              <div style={{ padding: 12, color: "#6b7280", fontSize: 12 }}>
                Link: {previewItem.ctaLink}
              </div>
            </div>
          ) : (
            <div
              style={{
                borderRadius: 16,
                overflow: "hidden",
                background: previewItem.bgValue || DEFAULT_BG,
                padding: 24,
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr",
                alignItems: "center",
                gap: 20,
                minHeight: 320,
                position: "relative",
                color: "#fff",
              }}
            >
              {previewItem.glowText ? (
                <div
                  style={{
                    position: "absolute",
                    left: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 120,
                    fontWeight: 900,
                    letterSpacing: 2,
                    color: "rgba(255,255,255,0.06)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {previewItem.glowText}
                </div>
              ) : null}

              <div style={{ position: "relative", zIndex: 2 }}>
                <div style={{ opacity: 0.8 }}>{previewItem.subtitle}</div>
                <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.05 }}>
                  {previewItem.title}
                </div>
                <div style={{ marginTop: 16 }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "10px 18px",
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.3)",
                      background: "rgba(0,0,0,0.28)",
                      fontWeight: 900,
                    }}
                  >
                    {previewItem.ctaText || "XEM NGAY"} →
                  </span>
                </div>
                <div style={{ marginTop: 10, opacity: 0.75, fontSize: 12 }}>
                  Link: {previewItem.ctaLink}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", zIndex: 2 }}>
                {previewItem.imageUrl ? (
                  <img
                    src={
                      previewItem.imageUrl.startsWith("http")
                        ? previewItem.imageUrl
                        : `http://localhost:9999${previewItem.imageUrl}`
                    }
                    alt="preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 280,
                      objectFit: "contain",
                      filter: "drop-shadow(0 18px 50px rgba(0,0,0,0.55))",
                    }}
                  />
                ) : null}
              </div>
            </div>
          )
        ) : null}
      </Modal>
    </div>
  );
};

export default AdminBanner;
