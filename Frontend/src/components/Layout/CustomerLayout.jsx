import { Layout } from "antd";
import AppHeader from "./Header";
import AppFooter from "./Footer";
import { Outlet } from "react-router-dom";
import ChatWidget from "../ChatBox/ChatWidget"; // <-- tạo component này ở src/components/ChatWidget.jsx

const CustomerLayout = () => {
  return (
    <Layout>
      <AppHeader />

      {/* Nội dung trang */}
      <Outlet />

      <AppFooter />

      {/* Chat nổi + quick actions */}
      <ChatWidget />
    </Layout>
  );
};

export default CustomerLayout;
