import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./config/configDB";
import { viewEngine } from "./config/viewEngine";
import { initWebRoutes } from "./routes/web";
import { initAPIRoutes } from "./routes/api";
const cookieParser = require("cookie-parser");
// ✅ SỬA: Bỏ ../ vì index.js và controller đều nằm trong src


dotenv.config();

const app = express();
const PORT = process.env.PORT || 9999;
const path = require("path");

connectDB();

app.use(
  cors({
    origin: process.env.REACT_URL,
    credentials: true,
  })
);

app.use(cookieParser());

// ✅ GIỮ nguyên (tránh phá cái bạn đang dùng)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ THÊM: serve đúng nơi multer đang lưu (public/uploads)
app.use("/uploads/products", express.static(path.join(__dirname, "public", "uploads", "products")));
app.use("/uploads/reviews", express.static(path.join(__dirname, "public", "uploads", "reviews")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

viewEngine(app);
initWebRoutes(app);
initAPIRoutes(app);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});