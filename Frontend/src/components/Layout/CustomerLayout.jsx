import { Layout } from "antd";
import AppHeader from "./Header";
import AppFooter from "./Footer";
import { Outlet } from "react-router-dom";

const CustomerLayout = () => {
  return (
    <Layout>
      <AppHeader />
      <Outlet />
      <AppFooter />
    </Layout>
  );
};

export default CustomerLayout;
