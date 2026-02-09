import { useEffect, useMemo, useRef, useState } from "react";

// assets
import chatLogo from "../../assets/chilltech.png";
import messIcon from "../../assets/Facebook_Messenger_logo_2025.svg.png";
import zaloIcon from "../../assets/images.png";

const QUICK_ACTIONS = [
<<<<<<< Updated upstream
  "Top 5 sản phẩm yêu thích nhất",
  "chat với nhân viên",
  "tư vấn giá xỉ cho mặt hàng",
=======
  "Top sản phẩm yêu thích nhất",
  "Chat với nhân viên",
  "Tư vấn giá sỉ cho mặt hàng",
>>>>>>> Stashed changes
  "Hotline liên hệ - bảo hành",
  "Đại tiệc xả kho - GIẢM ĐẾN 80%",
];

// Link ngoài (giữ theo bạn)
const MESSENGER_LINK = "https://www.facebook.com/vattudienlanhphuhien";
const ZALO_LINK = "https://zalo.me/0986215146";

// Banner trong khung chat (nếu chưa có thì để rỗng)
const CHAT_BANNER_URL = ""; // ví dụ: import banner from "../../assets/banner.jpg"; rồi gán vào đây

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  // bật/tắt quick actions
  const [actionsOpen, setActionsOpen] = useState(() => {
    return localStorage.getItem("qa_open") !== "0";
  });

  const [messages, setMessages] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("chat_messages") || "[]");
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState("");
  const bodyRef = useRef(null);

  const sessionId = useMemo(() => {
    const k = "chat_session_id";
    let v = localStorage.getItem(k);
    if (!v) {
      v =
        (crypto?.randomUUID?.() || String(Date.now())) +
        "-" +
        Math.random().toString(16).slice(2);
      localStorage.setItem(k, v);
    }
    return v;
  }, []);

  useEffect(() => {
    localStorage.setItem("chat_messages", JSON.stringify(messages));
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("qa_open", actionsOpen ? "1" : "0");
  }, [actionsOpen]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "bot",
          text:
            "Xin chào 👋 Mình là Trợ lý AI ChillTech.\n" +
            "Mình có thể:\n" +
            "• Tư vấn sản phẩm\n" +
            "• Báo giá – khuyến mãi\n" +
            "• Hỗ trợ đặt hàng\n\n" +
            "Nếu cần nhân viên, bạn bấm “chat với nhân viên” nhé!",
        },
        { role: "bot", text: "Rất sẵn lòng được hỗ trợ Anh/Chị ạ 😊" },
      ]);
    }

    // deep-link: #chat=1&msg=...
    const parseHash = () => {
      const p = new URLSearchParams(window.location.hash.replace("#", ""));
      if (p.get("chat") === "1") {
        setOpen(true);
        setActionsOpen(true);
        const msg = p.get("msg");
        if (msg) sendUserMessage(msg);
      }
    };

    window.addEventListener("hashchange", parseHash);
    parseHash();
    return () => window.removeEventListener("hashchange", parseHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendUserMessage = async (text) => {
    const t = String(text || "").trim();
    if (!t) return;

    setOpen(true);
    setMessages((prev) => [...prev, { role: "me", text: t }]);

<<<<<<< Updated upstream
    // nếu user bấm "chat với nhân viên" thì mở messenger
    if (t.toLowerCase().includes("chat với nhân viên")) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Mình đang mở Messenger để bạn chat với nhân viên nhé…" },
      ]);
      setTimeout(() => {
        window.open(MESSENGER_LINK, "_blank", "noopener,noreferrer");
      }, 500);
      return;
    }
=======
    // Các logic điều hướng Zalo/Messenger giữ nguyên
    const isZaloAction = t.toLowerCase().includes("hotline") || t.toLowerCase().includes("giá xỉ");
    if (isZaloAction) { window.open(ZALO_LINK, "https://zalo.me/0379436536"); return; }
    if (t.toLowerCase().includes("chat với nhân viên")) { window.open(MESSENGER_LINK, "https://www.facebook.com/vattudienlanhphuhien"); return; }
>>>>>>> Stashed changes

    try {
      const res = await fetch("http://localhost:9999/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sessionId, message: t }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.reply || "Mình chưa có câu trả lời." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Không kết nối được server. Bạn kiểm tra backend/CORS nhé." },
      ]);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const t = input.trim();
    if (!t) return;
    sendUserMessage(t);
    setInput("");
  };

  const toggleChat = () => {
    setOpen((v) => !v);
    setActionsOpen(true);
  };

  return (
    <>
      {/* QUICK ACTIONS */}
      {actionsOpen && (
        <div style={styles.quickActions}>
          {QUICK_ACTIONS.map((q) => (
            <button key={q} style={styles.qa} onClick={() => sendUserMessage(q)}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* CỘT ICON BÊN PHẢI (ĐÚNG THỨ TỰ): CHAT -> MESS -> ZALO */}
      <div style={styles.socialWrap}>
        {/* 1) CHAT HỆ THỐNG */}
        <button
          style={{ ...styles.socialBtn, ...styles.chatBtn }}
          onClick={toggleChat}
          aria-label="Chat hệ thống"
          title="Chat với chúng tôi"
        >
          <img src={chatLogo} alt="Chat" style={{ ...styles.socialImg, ...styles.logoImg }} />
        </button>

        {/* 2) MESSENGER */}
        <a
          href={MESSENGER_LINK}
          target="_blank"
          rel="noreferrer"
          style={styles.socialBtn}
          aria-label="Chat Messenger"
          title="Chat Messenger"
        >
          <img
            src={messIcon}
            alt="Messenger"
            style={{ ...styles.socialImg, ...styles.messImg }}
          />
        </a>

        {/* 3) ZALO */}
        {ZALO_LINK && (
          <a
            href={ZALO_LINK}
            target="_blank"
            rel="noreferrer"
            style={styles.socialBtn}
            aria-label="Chat Zalo"
            title="Chat Zalo"
          >
            <img src={zaloIcon} alt="Zalo" style={{ ...styles.socialImg, ...styles.zaloImg }} />
          </a>
        )}
      </div>

      {/* NÚT BẬT/TẮT QUICK ACTIONS */}
      <button
        style={styles.actionsToggle}
        onClick={() => setActionsOpen((v) => !v)}
        aria-label="Bật/tắt menu nhanh"
        title={actionsOpen ? "Ẩn menu nhanh" : "Hiện menu nhanh"}
      >
        {actionsOpen ? "▾" : "▴"}
      </button>

      {/* CHAT BOX (UI KHUNG CHAT GIỐNG PICO) */}
      <div style={{ ...styles.widget, display: open ? "flex" : "none" }} aria-hidden={!open}>
        {/* HEADER ĐỎ */}
        <div style={styles.topBar}>
          <div style={styles.topLeft}>
            <div style={styles.brandLogoWrap}>
              <img src={chatLogo} alt="logo" style={styles.brandLogo} />
            </div>
            <div>
              <div style={styles.brandTitle}>Trợ lý AI ChillTech</div>
              <div style={styles.brandSub}>Tư vấn tự động 24/7</div>
            </div>
          </div>

          <div style={styles.topActions}>
            <button
              style={styles.iconBtn}
              title="Làm mới"
              onClick={() => {
                localStorage.removeItem("chat_messages");
                setMessages([
                  { role: "bot", text: "Xin chào Anh/Chị! Em là trợ lý ảo của ChillTech." },
                  { role: "bot", text: "Rất sẵn lòng được hỗ trợ Anh/Chị ạ 😊" },
                ]);
              }}
            >
              ↻
            </button>
            <button style={styles.iconBtn} title="Thu nhỏ" onClick={() => setOpen(false)}>
              –
            </button>
          </div>
        </div>

        {/* BANNER (nếu có) */}
        {CHAT_BANNER_URL ? (
          <div style={styles.banner}>
            <img src={CHAT_BANNER_URL} alt="banner" style={styles.bannerImg} />
          </div>
        ) : null}

        {/* BODY (bong bóng giống pico + avatar bot) */}
        <div style={styles.body} ref={bodyRef}>
          {messages.map((m, idx) => {
            const isBot = m.role !== "me";
            return (
              <div
                key={idx}
                style={{
                  ...styles.row,
                  justifyContent: isBot ? "flex-start" : "flex-end",
                }}
              >
                {isBot ? (
                  <div style={styles.avatarWrap}>
                    <img src={chatLogo} alt="bot" style={styles.avatar} />
                  </div>
                ) : null}

                <div style={{ ...styles.bubble, ...(isBot ? styles.bubbleBot : styles.bubbleMe) }}>
                  {m.text}
                </div>

                {isBot ? (
                  <button style={styles.heartBtn} title="Thích">
                    ♡
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>

<<<<<<< Updated upstream
        {/* INPUT BAR (menu trái + input + send phải) */}
        <form style={styles.inputBar} onSubmit={onSubmit}>
          <button type="button" style={styles.menuBtn} title="Menu">
            ☰
          </button>

          <input
            style={styles.textInput}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập tin nhắn..."
          />

          <button type="submit" style={styles.sendBtn} title="Gửi">
            ➤
          </button>
        </form>
=======
        <div className="cw-bottom-area">
          <form className="cw-input-bar" onSubmit={(e) => { e.preventDefault(); if(input.trim()){ sendUserMessage(input); setInput(""); } }}>
            {/* <button type="button" className="cw-menu-btn" style={{width:'36px', height:'36px', border:'none', background:'#f3f4f6', borderRadius:'10px'}}>☰</button> */}
            <input className="cw-text-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Nhập tin nhắn..." />
            <button type="submit" className="cw-send-btn">➤</button>
          </form>
          <div className="cw-footer-text">
            <div>Mọi Thông tin mang tính tham khảo. Liên hệ hotline để biết thêm chi tiết:  <b> 0986 215 146</b></div>
           
          </div>
        </div>
>>>>>>> Stashed changes
      </div>
    </>
  );
}

const styles = {
  quickActions: {
    position: "fixed",
    right: 16,
    bottom: 220,
    zIndex: 9998,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  qa: {
    background: "#fff",
    border: "2px solid #20137d",
    color: "#6536f1",
    padding: "10px 12px",
    borderRadius: 18,
    cursor: "pointer",
    fontWeight: 700,
    maxWidth: 260,
    textAlign: "left",
    boxShadow: "0 8px 24px rgba(0,0,0,.12)",
  },

  // Cột icon bên phải giống Pico/Shopee
  socialWrap: {
    position: "fixed",
    right: 16,
    bottom: 16,
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  socialBtn: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    overflow: "hidden",
    background: "#fff",
    boxShadow: "0 10px 30px rgba(0,0,0,.18)",
    display: "grid",
    placeItems: "center",
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  socialImg: { width: "100%", height: "100%", display: "block" },
  chatBtn: {},
  logoImg: { objectFit: "contain", width: "88%", height: "88%" },
  messImg: { objectFit: "cover", transform: "scale(1.08)" },
  zaloImg: { objectFit: "contain", width: "82%", height: "82%" },

  actionsToggle: {
    position: "fixed",
    right: 16,
    bottom: 196,
    zIndex: 9999,
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "none",
    background: "#fff",
    boxShadow: "0 10px 30px rgba(0,0,0,.18)",
    cursor: "pointer",
    fontSize: 18,
  },

  // ===== KHUNG CHAT GIỐNG PICO =====
  widget: {
    position: "fixed",
    right: 88, // né cột icon
    bottom: 16,
    zIndex: 9999,
    width: 360,
    maxWidth: "calc(100vw - 120px)",
    height: 540,
    maxHeight: "calc(100vh - 32px)",
    background: "#fff",
    borderRadius: 18,
    boxShadow: "0 18px 60px rgba(0,0,0,.22)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
  },

  topBar: {
    height: 56,
    background: "#e11d2e",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 12px",
  },
  topLeft: { display: "flex", gap: 10, alignItems: "center" },
  brandLogoWrap: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    overflow: "hidden",
    background: "#fff",
    display: "grid",
    placeItems: "center",
  },
  brandLogo: { width: "100%", height: "100%", objectFit: "cover" },
  brandTitle: { fontWeight: 900, fontSize: 14, lineHeight: 1.1 },
  brandSub: { fontSize: 12, opacity: 0.9 },

  topActions: { display: "flex", gap: 8, alignItems: "center" },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    border: "none",
    background: "rgba(255,255,255,.18)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 900,
  },

  banner: { height: 92, background: "#fff" },
  bannerImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },

  body: { flex: 1, background: "#fff", padding: 12, overflowY: "auto" },
  row: { display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 10 },

  avatarWrap: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    overflow: "hidden",
    background: "#fff",
    boxShadow: "0 8px 20px rgba(0,0,0,.10)",
    flex: "0 0 auto",
  },
  avatar: { width: "100%", height: "100%", objectFit: "cover" },

  bubble: {
    maxWidth: "70%",
    padding: "12px 14px",
    borderRadius: 14,
    fontSize: 14,
    lineHeight: 1.35,
    boxShadow: "0 6px 18px rgba(0,0,0,.06)",
    whiteSpace: "pre-line",
  },
  bubbleBot: { background: "#f3f4f6", color: "#111827", borderTopLeftRadius: 18 },
  bubbleMe: {
    background: "#fff",
    color: "#e11d2e",
    border: "1.6px solid #e11d2e",
    borderTopRightRadius: 18,
  },

  heartBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "#9ca3af",
    fontSize: 18,
    lineHeight: 1,
    padding: 0,
    marginBottom: 4,
  },

  inputBar: {
    height: 56,
    borderTop: "1px solid #eee",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 10px",
    background: "#fff",
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    border: "none",
    background: "#f3f4f6",
    cursor: "pointer",
    fontSize: 18,
  },
  textInput: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    border: "1px solid #e5e7eb",
    outline: "none",
    padding: "0 12px",
    fontSize: 14,
    background: "#fff",
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    border: "none",
    background: "#f3f4f6",
    cursor: "pointer",
    fontSize: 18,
  },
};
