import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const GuestRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  
  if (user) return <Navigate to="/" replace />;

  
  return <Outlet />;
};

export default GuestRoute;
