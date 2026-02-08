import { Layout, Space, Avatar, Dropdown, Typography } from "antd";
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../Routes/Context/AuthContext";

const { Header } = Layout;
const { Text } = Typography;

const AdminHeader = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogout = async () => {
    await axios.post(
      "http://localhost:9999/api/auth/logout",
      {},
      { withCredentials: true }
    );
    setUser(null);
    navigate("/login");
  };

  const items = [
    {
      key: "profile",
      label: "Tài khoản",
      icon: <UserOutlined />,
    },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      style={{
        height: 64,
        padding: "0 24px",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      {/* ===== LEFT: TITLE ===== */}
      <div>
        <Text
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#1f2937",
            letterSpacing: 0.2,
          }}
        >
          Quản lý cửa hàng
        </Text>
      </div>

      {/* ===== RIGHT: ACTIONS ===== */}
      <Space size={20}>
        <BellOutlined
          style={{
            fontSize: 18,
            color: "#4b5563",
            cursor: "pointer",
          }}
        />

        <Dropdown menu={{ items }} placement="bottomRight">
          <Space style={{ cursor: "pointer" }}>
            <Avatar
              size={36}
              style={{
                backgroundColor: "#1677ff",
                fontWeight: 600,
              }}
              icon={<UserOutlined />}
            />
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default AdminHeader;
