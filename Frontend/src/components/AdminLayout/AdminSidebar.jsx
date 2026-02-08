import { Layout, Menu } from "antd";
import {
  AppstoreOutlined,
  ShoppingOutlined,
  UserOutlined,
  TagsOutlined,
  BarChartOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";

const { Sider } = Layout;

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Sider
      width={240}
      style={{
        background: "#ffffff",
        borderRight: "1px solid #f0f0f0",
        height: "100vh",
        position: "sticky",
        top: 0,
        left: 0,
      }}
    >
      {/* ===== LOGO / BRAND ===== */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          paddingLeft: 24,
          fontSize: 18,
          fontWeight: 700,
          color: "#1677ff",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        Chill Tech
      </div>

      {/* ===== MENU ===== */}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={(e) => navigate(e.key)}
        style={{
          borderRight: 0,
          padding: "8px",
          fontWeight: 500,
        }}
        items={[
          {
            key: "/admin",
            icon: <AppstoreOutlined />,
            label: "Tổng quan",
          },
          {
            key: "/admin/products",
            icon: <ShoppingOutlined />,
            label: "Sản phẩm",
          },
          {
            key: "/admin/orders",
            icon: <ShoppingOutlined />,
            label: "Đơn hàng",
          },
          {
            key: "/admin/customers",
            icon: <UserOutlined />,
            label: "Khách hàng",
          },

          // ✅ CHỈ THÊM MỤC NÀY
          {
            key: "/admin/banners",
            icon: <TagsOutlined />,
            label: "Banner",
          },

          {
            key: "/admin/reports",
            icon: <BarChartOutlined />,
            label: "Báo cáo",
          },
          {
            key: "/admin/settings",
            icon: <SettingOutlined />,
            label: "Cài đặt",
          },
        ]}
      />
    </Sider>
  );
};

export default AdminSidebar;
