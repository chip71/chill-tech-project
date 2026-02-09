import { getAIResponse } from "../service/aiService";

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    const reply = await getAIResponse(message);
    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Error in aiController:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};