import Groq from "groq-sdk";
import Product from "../models/Product.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const getAIResponse = async (userMessage) => {
  try {
    // 👉 Extract số lượng khách muốn mua (nếu có)
    const quantityMatch = userMessage.match(/\d+/);
    const quantity = quantityMatch ? parseInt(quantityMatch[0]) : null;

    // 👉 Search sản phẩm đúng schema MongoDB
    const products = await Product.find({
      status: "ACTIVE",
      $or: [
        { productName: { $regex: userMessage, $options: "i" } },
        { description: { $regex: userMessage, $options: "i" } },
        { category: { $regex: userMessage, $options: "i" } },
      ],
    })
      .limit(5)
      .lean();

    // 👉 Tạo context gửi AI
    let context = "Thông tin sản phẩm tại ChillTech:\n";

    if (products.length > 0) {
      products.forEach((p) => {
        const totalPrice =
          quantity && p.price ? quantity * p.price : null;

        context += `
- ${p.productName}
  💰 Giá: ${p.price || "Liên hệ"}đ
  📦 Tồn kho: ${p.stockQuantity ?? "Không rõ"} ${p.unit || "cái"}
  ${
    totalPrice
      ? `🧮 Nếu mua ${quantity}: ${totalPrice.toLocaleString()}đ`
      : ""
  }
  📝 Mô tả: ${p.description || "Đang cập nhật"}
`;
      });
    } else {
      context += "Không tìm thấy sản phẩm phù hợp.\n";
    }

    // 👉 Prompt AI
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
Bạn là trợ lý AI bán hàng ChillTech.

QUY TẮC QUAN TRỌNG:

- Luôn dùng dữ liệu sản phẩm được cung cấp.
- Nếu khách hỏi số lượng → trả lời theo "Tồn kho".
- Nếu khách hỏi mua bao nhiêu tiền:
  → lấy giá × số lượng trong context.
- Nếu không có sản phẩm:
  → hướng khách chat nhân viên hoặc gọi 0986 215 146.
- Không tự bịa dữ liệu.
- Trả lời ngắn gọn, thân thiện 😊.
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
    return "Xin lỗi, AI đang bận 😢. Anh/chị thử lại sau giúp em.";
  }
};
