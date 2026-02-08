import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Upload,
  Switch,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:9999";

const AddProduct = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const formData = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      if (file) {
        formData.append("image", file);
      }

      await axios.post(`${API_URL}/api/products`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Thêm sản phẩm thành công");
      form.resetFields();
      setFile(null);
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
          <Input placeholder="VD: Compressor Danfoss" />
        </Form.Item>

        {/* ✅ DANH MỤC = INPUT */}
        <Form.Item
          name="category"
          label="Danh mục"
          rules={[{ required: true, message: "Nhập danh mục" }]}
        >
          <Input placeholder="VD: Máy nén lạnh, Dây điện, Vật tư lạnh..." />
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
          <Input placeholder="VD: cái, mét, kg..." />
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

        <Form.Item label="Hình ảnh">
          <Upload
            beforeUpload={(file) => {
              setFile(file);
              return false;
            }}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>
        </Form.Item>

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
