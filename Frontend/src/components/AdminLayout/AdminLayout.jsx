import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

const { Sider, Content } = Layout;

const AdminLayout = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={240} theme="light">
        <AdminSidebar />
      </Sider>

      <Layout>
        <AdminHeader />
        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
