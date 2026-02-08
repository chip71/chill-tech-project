import {
  Card,
  Table,
  Typography,
  Button,
  Space,
  Input,
  Modal,
  message,
  Tag,
} from "antd";
import {
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const { Title, Text } = Typography;
const API_URL = "http://localhost:9999";

const CategoryManage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState(null);
  const [newName, setNewName] = useState("");

  /* ================= LOAD PRODUCTS ================= */
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/products`, {
        withCredentials: true,
      });
      setProducts(res.data.data || []);
    } catch {
      message.error("Không tải được danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ================= GROUP CATEGORY ================= */
  const categories = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      const cat = p.category || "Khác";
      if (!map[cat]) {
        map[cat] = {
          name: cat,
          total: 0,
          active: 0,
          inactive: 0,
        };
      }
      map[cat].total++;
      p.status === "ACTIVE" ? map[cat].active++ : map[cat].inactive++;
    });
    return Object.values(map);
  }, [products]);

  /* ================= RENAME CATEGORY ================= */
  const handleRename = async () => {
    try {
      const affected = products.filter(
        (p) => p.category === editing.name
      );

      await Promise.all(
        affected.map((p) =>
          axios.put(
            `${API_URL}/api/products/${p._id}`,
            { category: newName },
            { withCredentials: true }
          )
        )
      );

      message.success("Đã đổi tên danh mục");
      setEditing(null);
      fetchProducts();
    } catch {
      message.error("Đổi tên thất bại");
    }
  };

  /* ================= TOGGLE CATEGORY ================= */
  const handleToggle = async (cat) => {
    try {
      const affected = products.filter(
        (p) => p.category === cat.name
      );

      await Promise.all(
        affected.map((p) =>
          axios.put(
            `${API_URL}/api/products/${p._id}/toggle-status`,
            {},
            { withCredentials: true }
          )
        )
      );

      message.success("Đã cập nhật trạng thái danh mục");
      fetchProducts();
    } catch {
      message.error("Thao tác thất bại");
    }
  };

  /* ================= TABLE ================= */
  const columns = [
    {
      title: "Danh mục",
      dataIndex: "name",
      render: (v) => <Text strong>{v}</Text>,
    },
    {
      title: "Tổng sản phẩm",
      dataIndex: "total",
    },
    {
      title: "Đang bán",
      dataIndex: "active",
      render: (v) => <Tag color="green">{v}</Tag>,
    },
    {
      title: "Đã ẩn",
      dataIndex: "inactive",
      render: (v) => <Tag>{v}</Tag>,
    },
    {
      title: "Thao tác",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditing(record);
              setNewName(record.name);
            }}
          />
          <Button
            danger={record.active > 0}
            icon={
              record.active > 0 ? (
                <EyeInvisibleOutlined />
              ) : (
                <EyeOutlined />
              )
            }
            onClick={() => handleToggle(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Title level={3}>Quản lý danh mục</Title>
        <Text type="secondary">
          Danh mục được tạo tự động từ sản phẩm
        </Text>
      </div>

      <Card>
        <Table
          rowKey="name"
          loading={loading}
          columns={columns}
          dataSource={categories}
          pagination={false}
        />
      </Card>

      {/* ===== RENAME MODAL ===== */}
      <Modal
        open={!!editing}
        title="Đổi tên danh mục"
        onCancel={() => setEditing(null)}
        onOk={handleRename}
      >
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Tên danh mục mới"
        />
      </Modal>
    </>
  );
};

export default CategoryManage;
