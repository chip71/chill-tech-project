import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./config/configDB";
import { viewEngine } from "./config/viewEngine";
import { initWebRoutes } from "./routes/web";
import { initAPIRoutes } from "./routes/api";
const cookieParser = require("cookie-parser");

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
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


viewEngine(app);
initWebRoutes(app);
initAPIRoutes(app);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
