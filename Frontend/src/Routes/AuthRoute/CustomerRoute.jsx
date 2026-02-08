import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const CustomerRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  return user.role === "CUSTOMER"
    ? <Outlet />
    : <Navigate to="/403" replace />;
};

export default CustomerRoute;
