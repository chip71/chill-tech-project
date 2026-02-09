import Groq from "groq-sdk";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// nhớ sản phẩm khách đang hỏi
let pendingProduct = null;

export const getAIResponse = async (userMessage, userId) => {
  try {
    const msg = userMessage.toLowerCase().trim();

    // ===== 1. DETECT CONFIRM TRƯỚC =====
    const confirmWords = ["có", "ok", "đồng ý", "chốt", "mua", "thêm"];

    const isConfirm = confirmWords.includes(msg);

    if (isConfirm && pendingProduct && userId) {
      await Cart.updateOne(
        { user: userId },
        {
          $push: {
            items: {
              product: pendingProduct._id,
              quantity: 1,
            },
          },
        },
        { upsert: true }
      );

      const added = pendingProduct;
      pendingProduct = null;

      return `
🛒 **ĐÃ THÊM VÀO GIỎ HÀNG**

📦 ${added.productName}
💰 **${added.price?.toLocaleString()}đ**
📊 Còn: ${added.stockQuantity}

👉 Bạn vào giỏ hàng thanh toán nhé 😄
      `;
    }

    // ===== 2. SEARCH PRODUCT =====
    let products = await Product.find({
      status: "ACTIVE",
      $or: [
        { productName: { $regex: msg, $options: "i" } },
        { description: { $regex: msg, $options: "i" } },
        { category: { $regex: msg, $options: "i" } },
      ],
    })
      .limit(5)
      .lean();

    if (products.length) {
      pendingProduct = products[0];
    }

    // ===== 3. CONTEXT =====
    let context = "";

    if (products.length) {
      context += "🔥 SẢN PHẨM HIỆN CÓ:\n";

      products.forEach(p => {
        context += `
📦 ${p.productName}
💰 **${p.price?.toLocaleString()}đ**
📊 Tồn kho: ${p.stockQuantity}
`;
      });
    } else {
      context = "❌ Không tìm thấy sản phẩm phù hợp.";
    }

    // ===== 4. AI CHAT =====
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: `
Bạn là trợ lý bán hàng ChillTech sử dụng dữ liệu trong database không đi lan man.

🔥 DÙNG NHIỀU ICON:
💰 📦 🛒 😊 👍 ✨

🔥 Nếu có sản phẩm:
→ hỏi "Bạn muốn thêm vào giỏ hàng không? 🛒"

🔥 Giá luôn in đậm:
ví dụ **250.000đ**

🔥 Trả lời ngắn gọn thân thiện.
🔥 Chỉ dùng dữ liệu context.
          `,
        },
        {
          role: "user",
          content: `${context}\n\nKhách hỏi: ${userMessage}`,
        },
      ],
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("AI Service Error:", error);
    return "😢 AI đang bận, thử lại giúp mình nhé!";
  }
};
