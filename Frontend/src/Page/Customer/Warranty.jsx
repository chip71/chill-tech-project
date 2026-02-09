import React from "react";

const Warranty = () => {
  const sectionStyle = {
    padding: "80px 24px",
    maxWidth: "1200px",
    margin: "0 auto",
  };

  const flexCenter = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  };

  return (
    <main
      style={{
        backgroundColor: "#fff",
        fontFamily: "Inter, Arial, sans-serif",
        color: "#1f1f1f",
        lineHeight: "1.7",
      }}
    >
      {/* ===== HERO ===== */}
      <section
        style={{
          width: "100%",
          height: "340px",
          background:
            "linear-gradient(135deg, #0b1c36 0%, #163b6c 50%, #0b1c36 100%)",
          ...flexCenter,
          textAlign: "center",
          color: "#fff",
        }}
      >
        <div style={{ maxWidth: "900px", padding: "0 16px" }}>
          <h1
            style={{
              fontSize: "3rem",
              marginBottom: "16px",
              fontWeight: 700,
              letterSpacing: "0.5px",
            }}
          >
            CHÍNH SÁCH BẢO HÀNH
          </h1>
          <p style={{ fontSize: "1.15rem", opacity: 0.9 }}>
            Bảo vệ quyền lợi – Đồng hành cùng khách hàng Chill Tech
          </p>
        </div>
      </section>

      {/* ===== OVERVIEW ===== */}
      <section style={sectionStyle}>
        <h2 style={{ fontSize: "2.1rem", marginBottom: "24px" }}>
          Nguyên Tắc Bảo Hành
        </h2>
        <p style={{ maxWidth: "900px", textAlign: "justify", color: "#444" }}>
          Chill Tech cam kết cung cấp các sản phẩm linh kiện điện lạnh chính hãng,
          đạt tiêu chuẩn kỹ thuật và được áp dụng chính sách bảo hành minh bạch.
          Chính sách này nhằm đảm bảo quyền lợi lâu dài cho khách hàng trong suốt
          quá trình sử dụng sản phẩm.
        </p>
      </section>

      {/* ===== WARRANTY CONDITIONS ===== */}
      <div style={{ backgroundColor: "#f6f8fb" }}>
        <section style={sectionStyle}>
          <h2 style={{ fontSize: "2.1rem", marginBottom: "40px" }}>
            Điều Kiện Bảo Hành
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "32px",
            }}
          >
            {[
              {
                title: "Thời hạn bảo hành",
                desc: "Theo thời gian quy định của từng sản phẩm hoặc nhà sản xuất.",
              },
              {
                title: "Nguồn gốc sản phẩm",
                desc: "Sản phẩm được mua trực tiếp tại Chill Tech.",
              },
              {
                title: "Lỗi kỹ thuật",
                desc: "Sản phẩm phát sinh lỗi do nhà sản xuất trong quá trình sử dụng bình thường.",
              },
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  background: "#fff",
                  padding: "32px",
                  borderRadius: "14px",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                  transition: "transform 0.2s ease",
                }}
              >
                <h3
                  style={{
                    color: "#0958d9",
                    marginTop: 0,
                    marginBottom: "12px",
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ margin: 0, color: "#555" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ===== NOT COVERED ===== */}
      <section style={sectionStyle}>
        <h2 style={{ fontSize: "2.1rem", marginBottom: "24px" }}>
          Trường Hợp Không Được Bảo Hành
        </h2>
        <ul style={{ paddingLeft: "20px", maxWidth: "900px", color: "#444" }}>
          <li>Sản phẩm hư hỏng do sử dụng sai hướng dẫn kỹ thuật.</li>
          <li>Sản phẩm bị rơi vỡ, cháy nổ, ngập nước hoặc tác động ngoại lực.</li>
          <li>Sản phẩm đã bị tháo lắp, sửa chữa bởi bên không được ủy quyền.</li>
          <li>Sản phẩm không còn hóa đơn hoặc thông tin mua hàng tại Chill Tech.</li>
        </ul>
      </section>

      {/* ===== WARRANTY PROCESS ===== */}
      <div style={{ backgroundColor: "#f6f8fb" }}>
        <section style={sectionStyle}>
          <h2
            style={{
              fontSize: "2.1rem",
              textAlign: "center",
              marginBottom: "48px",
            }}
          >
            Quy Trình Bảo Hành
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "32px",
            }}
          >
            {[
              "Liên hệ bộ phận hỗ trợ Chill Tech",
              "Cung cấp hóa đơn & thông tin sản phẩm",
              "Kiểm tra và xác nhận lỗi kỹ thuật",
              "Tiến hành bảo hành theo quy định",
            ].map((step, index) => (
              <div
                key={index}
                style={{
                  background: "#fff",
                  padding: "32px",
                  borderRadius: "14px",
                  textAlign: "center",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    backgroundColor: "#0958d9",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.2rem",
                    margin: "0 auto 16px",
                    fontWeight: 600,
                  }}
                >
                  {index + 1}
                </div>
                <p style={{ margin: 0 }}>{step}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ===== COMMITMENT ===== */}
      <section style={{ ...sectionStyle, textAlign: "center" }}>
        <h2 style={{ fontSize: "2.1rem", marginBottom: "24px" }}>
          Cam Kết Chill Tech
        </h2>
        <p style={{ maxWidth: "900px", margin: "0 auto", color: "#555" }}>
          Chill Tech cam kết xử lý các yêu cầu bảo hành một cách minh bạch, nhanh
          chóng và đúng quy định. Chúng tôi luôn đồng hành cùng khách hàng trong
          suốt vòng đời sản phẩm.
        </p>
      </section>
    </main>
  );
};

export default Warranty;
