import mongoose from "mongoose";
import Review from "../models/Review";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING, {
      dbName: "ChilltechDB",
    });

    console.log("MongoDB connected successfully");

    // ✅ AUTO DROP UNIQUE INDEX: product_1_account_1 (để user comment nhiều lần)
    // Nếu index không tồn tại hoặc không drop được thì bỏ qua, không làm sập server.
    try {
      const indexes = await Review.collection.indexes();
      const existed = indexes.find((i) => i.name === "product_1_account_1");

      if (existed) {
        await Review.collection.dropIndex("product_1_account_1");
        console.log("✅ Dropped index: product_1_account_1");
      }
    } catch (err) {
      console.warn("⚠️ Skip dropping index (maybe not exist):", err?.message || err);
    }
  } catch (error) {
    console.error("MongoDB connection failed", error);
  }
};
