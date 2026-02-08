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
        fontFamily: "Arial, sans-serif",
        color: "#333",
        lineHeight: "1.6",
      }}
    >
      {/* ===== HERO ===== */}
      <section
        style={{
          width: "100%",
          height: "320px",
          background:
            "linear-gradient(180deg, #0b1c36 0%, #12294a 50%, #0b1c36 100%)",
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
            }}
          >
            CHÍNH SÁCH ĐỔI TRẢ & BẢO HÀNH
          </h1>
          <p style={{ fontSize: "1.2rem", opacity: 0.9 }}>
            Cam kết quyền lợi tối đa cho khách hàng Chill Tech
          </p>
        </div>
      </section>

      {/* ===== OVERVIEW ===== */}
      <section style={sectionStyle}>
        <h2 style={{ fontSize: "2rem", marginBottom: "24px" }}>
          Nguyên Tắc Chung
        </h2>
        <p style={{ maxWidth: "900px", textAlign: "justify" }}>
          Chill Tech cam kết cung cấp các sản phẩm linh kiện điện lạnh chính hãng,
          đúng tiêu chuẩn kỹ thuật. Chính sách đổi trả và bảo hành được xây dựng
          nhằm bảo vệ quyền lợi khách hàng và đảm bảo sự minh bạch trong quá trình
          mua bán.
        </p>
      </section>

      {/* ===== CONDITIONS ===== */}
      <div style={{ backgroundColor: "#f5f5f5" }}>
        <section style={sectionStyle}>
          <h2 style={{ fontSize: "2rem", marginBottom: "40px" }}>
            Điều Kiện Đổi Trả
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
                title: "Thời gian áp dụng",
                desc: "Trong vòng 7 ngày kể từ ngày nhận hàng.",
              },
              {
                title: "Tình trạng sản phẩm",
                desc: "Sản phẩm chưa qua sử dụng, còn nguyên tem niêm phong.",
              },
              {
                title: "Lỗi kỹ thuật",
                desc: "Sản phẩm bị lỗi do nhà sản xuất hoặc hư hỏng khi vận chuyển.",
              },
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  background: "#fff",
                  padding: "28px",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <h3 style={{ color: "#0958d9", marginTop: 0 }}>
                  {item.title}
                </h3>
                <p style={{ margin: 0, color: "#595959" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ===== NOT APPLIED ===== */}
      <section style={sectionStyle}>
        <h2 style={{ fontSize: "2rem", marginBottom: "24px" }}>
          Trường Hợp Không Áp Dụng
        </h2>
        <ul style={{ paddingLeft: "20px", maxWidth: "900px" }}>
          <li>Sản phẩm bị hư hỏng do sử dụng sai kỹ thuật.</li>
          <li>Sản phẩm đã bị tháo lắp, can thiệp bên trong.</li>
          <li>Sản phẩm không còn hóa đơn mua hàng tại Chill Tech.</li>
          <li>Sản phẩm thuộc danh mục thanh lý, giảm giá đặc biệt.</li>
        </ul>
      </section>

      {/* ===== PROCESS ===== */}
      <div style={{ backgroundColor: "#f5f5f5" }}>
        <section style={sectionStyle}>
          <h2 style={{ fontSize: "2rem", textAlign: "center", marginBottom: "48px" }}>
            Quy Trình Đổi Trả
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
              "Cung cấp hóa đơn & hình ảnh sản phẩm",
              "Xác nhận tình trạng sản phẩm",
              "Đổi sản phẩm mới hoặc hoàn tiền",
            ].map((step, index) => (
              <div
                key={index}
                style={{
                  background: "#fff",
                  padding: "28px",
                  borderRadius: "12px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "2rem",
                    color: "#0958d9",
                    marginBottom: "12px",
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
        <h2 style={{ fontSize: "2rem", marginBottom: "24px" }}>
          Cam Kết Chill Tech
        </h2>
        <p style={{ maxWidth: "900px", margin: "0 auto", color: "#595959" }}>
          Chill Tech luôn đặt uy tín và quyền lợi khách hàng lên hàng đầu. Mọi
          trường hợp đổi trả và bảo hành đều được xử lý minh bạch, nhanh chóng và
          đúng quy định.
        </p>
      </section>
    </main>
  );
};

export default Warranty;
