import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./Routes/Context/AuthContext";
import { CartProvider } from "./Routes/Context/CartContext";
import SystemRoute from "./Routes/AuthRoute/SystemRoute";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <SystemRoute />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
