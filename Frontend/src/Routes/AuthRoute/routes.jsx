import HomePage from "../../Page/Customer/HomePage";
import ProductList from "../../Page/Customer/ProductList";
import LoginPage from "../../Page/Customer/LoginPage";
import RegisterPage from "../../Page/Customer/RegisterPage";
import ProductDetail from "../../Page/Customer/ProductDetail";
import Cart from "../../Page/Customer/Cart";
import About from "../../Page/Customer/AboutUs";
import CheckOut from "../../Page/Customer/Checkout";
import Paid from "../../Page/Customer/Paid";
import AdminDashboard from "../../Page/Admin/AdminDashboard";
import ProductManage from "../../Page/Admin/ProductManage";
import AddProduct from "../../Page/Admin/AddProduct";
import EditProduct from "../../Page/Admin/EditProduct";
import OrderManage from "../../Page/Admin/OrderManage";
import AdminViewOrderdetail from "../../Page/Admin/AdminViewOrderdetail";
import CustomerManage from "../../Page/Admin/CustomerManage";
import AdminCustomerDetail from "../../Page/Admin/AdminCustomerDetail";
import CustomerProfile from "../../Page/Customer/CustomerProfile";
import CustomerOrerList from "../../Page/Customer/CustomerOrerList";
import AdminBanner from "../../Page/Admin/AdminBanner";
import Warranty from "../../Page/Customer/Warranty";
import Category from "../../Page/Customer/Category";
import CategoryManage from "../../Page/Admin/CategoryManage";
import AdminSettings from "../../Page/Admin/AdminSetting";
import AdminReport from "../../Page/Admin/AdminReport";
export const publicRoutes = [
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/products",
    element: <ProductList />,
  },
  {
    path: "/products/:id",
    element: <ProductDetail />,
  },
  {
    path: "/categories",
    element: <Category />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/warranty",
    element: <Warranty />,
  }
];

export const guestRoutes = [
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
];

export const customerRoutes = [
  {
    path: "/cart",
    element: <Cart />,
  },
  {
    path: "/checkout",
    element: <CheckOut />,
  },
  {
    path: "/payment/:orderId",
    element: <Paid />,
  },
  {
    path: "/profile",
    element: <CustomerProfile />,
  },
  {
    path: "/customer-orders",
    element: <CustomerOrerList />,
  },

];

export const adminRoutes = [
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
  {
    path: "/admin/products",
    element: <ProductManage />,
  },
  {
    path: "/admin/products/add",
    element: <AddProduct />,
  },
  {
    path: "/admin/products/edit/:id",
    element: <EditProduct />,
  },
  {
    path: "/admin/orders",
    element: <OrderManage />,
  },
  {
    path: "/admin/orders/:id",
    element: <AdminViewOrderdetail />,
  },
  {
    path: "/admin/customers",
    element: <CustomerManage />,
  },
  {
    path: "/admin/customers/:id",
    element: <AdminCustomerDetail />,
  },
  {
    path: "/admin/categories",
    element: <CategoryManage />,
  },
  {
    path: "/admin/settings",
    element: <AdminSettings />
  },
  {
    path: "admin/reports",
    element: <AdminReport />
  },
  {
    path: "/admin/banners",
    element: <AdminBanner />,
  },
];
