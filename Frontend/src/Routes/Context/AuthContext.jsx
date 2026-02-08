import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();
const API_URL = "http://localhost:9999";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/auth/me`,
        { withCredentials: true }
      );

      // ✅ MAP RÕ RÀNG – KHÔNG GHI ĐÈ ROLE
      const mapped = {
        id: res.data.account.id,
        email: res.data.account.email,
        role: res.data.account.role, // 👈 QUAN TRỌNG
        customerName: res.data.customer?.customerName || null,
      };

      setUser(mapped);
      return mapped;
    } catch (error) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        fetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
