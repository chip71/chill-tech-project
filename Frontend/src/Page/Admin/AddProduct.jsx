import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Upload,
  Switch,
  message,
  Image,
  Space,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:9999";

const AddProduct = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [file, setFile] = useState(null);
  const [imageLink, setImageLink] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const formData = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== "imageUrl") {
          formData.append(key, value);
        }
      });

      // ✅ Ưu tiên upload ảnh
      if (file) {
        formData.append("image", file);
      }
      // ✅ Nếu không upload → dùng link
      else if (imageLink) {
        formData.append("imageUrl", imageLink);
      }

      await axios.post(`${API_URL}/api/products`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Thêm sản phẩm thành công");
      form.resetFields();
      setFile(null);
      setImageLink("");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Thêm sản phẩm thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Thêm sản phẩm mới"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="productName"
          label="Tên sản phẩm"
          rules={[{ required: true, message: "Nhập tên sản phẩm" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="category"
          label="Danh mục"
          rules={[{ required: true, message: "Nhập danh mục" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="price"
          label="Giá (VNĐ)"
          rules={[{ required: true, message: "Nhập giá" }]}
        >
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            formatter={(v) =>
              `₫ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(v) => v.replace(/[₫,\s]/g, "")}
          />
        </Form.Item>

        <Form.Item name="stockQuantity" label="Số lượng tồn kho">
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>

        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item name="unit" label="Đơn vị">
          <Input />
        </Form.Item>

        <Form.Item name="wpu" label="Khối lượng (kg / đơn vị)">
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>

        <Form.Item
          name="featured"
          label="Sản phẩm nổi bật"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        {/* ===== UPLOAD ẢNH ===== */}
        <Form.Item label="Upload ảnh">
          <Upload
            beforeUpload={(f) => {
              setFile(f);
              setImageLink("");
              return false;
            }}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>
        </Form.Item>

        {/* ===== LINK ẢNH ===== */}
        <Form.Item label="Hoặc link ảnh">
          <Input
            placeholder="https://example.com/image.jpg"
            value={imageLink}
            onChange={(e) => {
              setImageLink(e.target.value);
              setFile(null);
            }}
          />
        </Form.Item>

        {/* ===== PREVIEW ===== */}
        {(file || imageLink) && (
          <Space>
            <Image
              width={100}
              src={
                imageLink
                  ? imageLink
                  : URL.createObjectURL(file)
              }
            />
          </Space>
        )}

        <div style={{ textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Thêm sản phẩm
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddProduct;
