import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

const CartContext = createContext();
const API_URL = "http://localhost:9999";

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ======================
     LOAD CART
  ====================== */
  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/cart`, {
        withCredentials: true,
      });
      setCartItems(res.data.data?.items || []);
    } catch {
      // chưa login hoặc chưa có cart
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  /* ======================
     ADD TO CART
  ====================== */
  const addToCart = async (product, quantity = 1) => {
    await axios.post(
      `${API_URL}/api/cart`,
      { productId: product._id, quantity },
      { withCredentials: true }
    );
    fetchCart();
  };

  /* ======================
     UPDATE QUANTITY
  ====================== */
  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;

    await axios.put(
      `${API_URL}/api/cart`,
      { productId, quantity },
      { withCredentials: true }
    );
    fetchCart();
  };

  /* ======================
     REMOVE ITEM
  ====================== */
  const removeFromCart = async (productId) => {
    await axios.delete(
      `${API_URL}/api/cart/${productId}`,
      { withCredentials: true }
    );
    fetchCart();
  };

  /* ======================
     CLEAR CART
  ====================== */
  const clearCart = async () => {
    await axios.delete(`${API_URL}/api/cart`, {
      withCredentials: true,
    });
    setCartItems([]);
  };

  /* ======================
     TOTAL ITEMS (HEADER)
  ====================== */
  const totalItems = useMemo(
  () => cartItems.length,
  [cartItems]
);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItems,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
