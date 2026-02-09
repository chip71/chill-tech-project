import { useEffect, useMemo, useRef, useState } from "react";
import "./ChatWidget.css"; // Nhớ import file CSS vào đây

// assets
import chatLogo from "../../assets/chilltech.png";
import messIcon from "../../assets/Facebook_Messenger_logo_2025.svg.png";
import zaloIcon from "../../assets/images.png";

const QUICK_ACTIONS = [
  "Top sản phẩm yêu thích nhất",
  "Chat với nhân viên",
  "Tư vấn giá sỉ cho mặt hàng",
  "Hotline liên hệ - bảo hành",
];

const MESSENGER_LINK = "https://www.facebook.com/vattudienlanhphuhien";
const ZALO_LINK = "https://zalo.me/0379436536";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const bodyRef = useRef(null);

  const [actionsOpen, setActionsOpen] = useState(() => localStorage.getItem("qa_open") !== "0");
  const [isManualCloseInChat, setIsManualCloseInChat] = useState(() => localStorage.getItem("qa_inchat_hidden") === "1");
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem("chat_messages") || "[]"); } catch { return []; }
  });

  const hasUserMessaged = useMemo(() => messages.some(m => m.role === "me"), [messages]);
  const sessionId = useMemo(() => {
    let v = localStorage.getItem("chat_session_id");
    if (!v) {
      v = (crypto?.randomUUID?.() || String(Date.now())) + "-" + Math.random().toString(16).slice(2);
      localStorage.setItem("chat_session_id", v);
    }
    return v;
  }, []);

  useEffect(() => {
    localStorage.setItem("chat_messages", JSON.stringify(messages));
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("qa_open", actionsOpen ? "1" : "0");
    localStorage.setItem("qa_inchat_hidden", isManualCloseInChat ? "1" : "0");
  }, [actionsOpen, isManualCloseInChat]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: "bot", text: "Xin chào 👋 Mình là Trợ lý AI Chill Tech.\nRất sẵn lòng được hỗ trợ Anh/Chị ạ 😊" }]);
    }
  }, []);

  // ... Giữ nguyên các phần import và state

  const sendUserMessage = async (text) => {
    const t = String(text || "").trim();
    if (!t) return;

    setOpen(true);
    setMessages((prev) => [...prev, { role: "me", text: t }]);

    // Các logic điều hướng Zalo/Messenger giữ nguyên
    const isZaloAction = t.toLowerCase().includes("hotline") || t.toLowerCase().includes("giá xỉ");
    if (isZaloAction) { window.open(ZALO_LINK, "https://zalo.me/0379436536"); return; }
    if (t.toLowerCase().includes("chat với nhân viên")) { window.open(MESSENGER_LINK, "https://www.facebook.com/vattudienlanhphuhien"); return; }

    try {
      // GỌI ĐẾN BACKEND MỚI CỦA BẠN
      const res = await fetch("http://localhost:9999/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: t,
          userId: localStorage.getItem("userId"),
        })
        // Chỉ cần gửi message
      });

      const data = await res.json();

      // Hiển thị câu trả lời từ AI
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.reply || "Cảm ơn bạn, em đã nhận được thông tin!" }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Không kết nối được server AI. Bạn vui lòng kiểm tra lại." }
      ]);
    }
  };

  // ... Các phần còn lại của ChatWidget giữ nguyên

  const resetChat = () => {
    localStorage.removeItem("chat_messages");
    setMessages([{ role: "bot", text: "Chào bạn, mình có thể giúp gì thêm không?😄" }]);
  };

  return (
    <>
      {actionsOpen && !open && (
        <div className="cw-quick-actions">
          {QUICK_ACTIONS.map((q) => (
            <button key={q} className="cw-qa-btn-outer" onClick={() => sendUserMessage(q)}>{q}</button>
          ))}
        </div>
      )}

      <div className="cw-social-wrap">
        <button className="cw-social-btn" onClick={() => setOpen(!open)}><img src={chatLogo} alt="Chat" className="cw-logo-img" /></button>
        <a href={MESSENGER_LINK} target="_blank" rel="noreferrer" className="cw-social-btn"><img src={messIcon} alt="FB" /></a>
        <a href={ZALO_LINK} target="_blank" rel="noreferrer" className="cw-social-btn"><img src={zaloIcon} alt="Zalo" className="cw-zalo-img" /></a>
      </div>

      {!open && (
        <button className="cw-actions-toggle" onClick={() => setActionsOpen(!actionsOpen)}>
          {actionsOpen ? "▾" : "▴"}
        </button>
      )}

      <div className="cw-widget" style={{ display: open ? "flex" : "none" }}>
        <div className="cw-top-bar">
          <div className="cw-top-left">
            <div className="cw-brand-logo-wrap"><img src={chatLogo} alt="logo" /></div>
            <div>
              <div className="cw-brand-title">Trợ lý AI Chill Tech</div>
              <div className="cw-brand-sub">Tư vấn tự động 24/7</div>
            </div>
          </div>
          <div className="cw-top-actions">
            <button className="cw-icon-btn" onClick={resetChat} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '5px', borderRadius: '5px', marginRight: '5px', cursor: 'pointer' }}>↻</button>
            <button className="cw-icon-btn" onClick={() => setOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>–</button>
          </div>
        </div>

        <div className="cw-body" ref={bodyRef}>
          {!hasUserMessaged && !isManualCloseInChat && (
            <div className="cw-in-chat-qa-container">
              <div className="cw-qa-header">
                <span>Gợi ý cho bạn</span>
                <button onClick={() => setIsManualCloseInChat(true)} className="cw-mini-close" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ccc' }}>✕</button>
              </div>
              {QUICK_ACTIONS.map((q) => (
                <button key={q} className="cw-in-chat-btn" onClick={() => sendUserMessage(q)}>{q}</button>
              ))}
            </div>
          )}

          {!hasUserMessaged && isManualCloseInChat && (
            <button className="cw-reopen-in-chat" onClick={() => setIsManualCloseInChat(false)}>Hiện gợi ý ▴</button>
          )}

          {messages.map((m, idx) => (
            <div key={idx} className="cw-row" style={{ justifyContent: m.role !== "me" ? "flex-start" : "flex-end" }}>
              {m.role !== "me" && <div className="cw-avatar-wrap"><img src={chatLogo} alt="bot" style={{ width: '100%' }} /></div>}
              <div className={`cw-bubble ${m.role !== "me" ? "cw-bubble-bot" : "cw-bubble-me"}`}>{m.text}</div>
            </div>
          ))}
        </div>

        <div className="cw-bottom-area">
          <form className="cw-input-bar" onSubmit={(e) => { e.preventDefault(); if (input.trim()) { sendUserMessage(input); setInput(""); } }}>
            <input className="cw-text-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Nhập tin nhắn..." />
            <button type="submit" className="cw-send-btn">➤</button>
          </form>
          <div className="cw-footer-text">
            <div>Mọi Thông tin mang tính tham khảo. Liên hệ hotline để biết thêm chi tiết:  <b> 0986 215 146</b></div>

          </div>
        </div>
      </div>
    </>
  );
}