import React from 'react';

const About = () => {
  // Styles chung cho các section
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
    <main style={{ backgroundColor: "#fff", fontFamily: "Arial, sans-serif", color: "#333", lineHeight: "1.6" }}>
      
      {/* ===== HERO SECTION ===== */}
      <section
        style={{
          width: "100%",
          height: "340px",
          background: "linear-gradient(180deg, #0b1c36 0%, #12294a 50%, #0b1c36 100%)",
          ...flexCenter,
          textAlign: "center",
          color: "#fff",
        }}
      >
        <div style={{ maxWidth: "900px", padding: "0 16px" }}>
          <h1 style={{ fontSize: "3rem", margin: "0 0 16px 0", fontWeight: "700", letterSpacing: "1px" }}>
            VỀ CHILL TECH
          </h1>
          <p style={{ fontSize: "1.2rem", color: "rgba(255,255,255,0.9)", margin: 0 }}>
            Hơn 15 năm cung cấp linh kiện điện lạnh chính hãng cho các doanh nghiệp trên toàn Việt Nam
          </p>
        </div>
      </section>

      {/* ===== BRAND STORY SECTION ===== */}
      <section style={sectionStyle}>
        <div style={{ ...flexCenter, gap: "48px" }}>
          <div style={{ flex: "1 1 450px" }}>
            <h2 style={{ fontSize: "2rem", color: "#0b1c36", marginBottom: "24px" }}>Câu Chuyện Thương Hiệu</h2>
            <p style={{ marginBottom: "16px", textAlign: "justify" }}>
              Cách đây 25 năm, chàng trai trẻ <strong>Lê Hữu Phú</strong> phải gác lại ước mơ đại học sau biến cố gia đình: 
              mẹ mất vì bệnh nặng, cha yếu mắt không thể lao động, và em gái còn đang học cấp hai. Gánh nặng mưu sinh 
              khiến ông phải lao vào đủ nghề — từ làm đường, làm đồng tôm, đến bán sắt vụn — chỉ mong lo được cho gia đình.
            </p>
            <p style={{ textAlign: "justify" }}>
              Trong hành trình đó, ông nhận ra tiềm năng của ngành điện lạnh và quyết định gắn bó lâu dài. Từ việc thu mua 
              phế liệu, ông dần mở rộng sang tái chế, kinh doanh linh kiện điện lạnh. Nhờ nỗ lực và ý chí bền bỉ, ông được 
              một người chú trong họ nhận ra tài năng và hỗ trợ vốn để mở cửa hàng đầu tiên tại phố Lê Lai. Từ một cửa hàng nhỏ, 
              bằng sự kiên trì, tinh thần học hỏi và uy tín trong kinh doanh, ông Lê Hữu Phú đã gây dựng nên doanh nghiệp 
              vật tư điện lạnh lớn mạnh, được khách hàng tin tưởng và đối tác đánh giá cao như hiện nay.
            </p>
          </div>
          <div style={{ flex: "1 1 400px", background: "linear-gradient(135deg, #f0f5ff 0%, #d6e4ff 100%)", padding: "20px", borderRadius: "16px" }}>
            <img 
              src="phuhien.jpg" 
              alt="CHILLTECH Office" 
              style={{ width: "100%", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", display: "block" }} 
            />
          </div>
        </div>
      </section>

      {/* ===== MISSION & VISION SECTION ===== */}
      <div style={{ backgroundColor: "#f5f5f5" }}>
        <section style={sectionStyle}>
          <h2 style={{ fontSize: "2rem", textAlign: "center", marginBottom: "48px" }}>Sứ Mệnh & Tầm Nhìn</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px" }}>
            <div style={{ backgroundColor: "#fff", padding: "32px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <h3 style={{ color: "#0958d9", fontSize: "1.5rem", marginTop: 0 }}>Sứ Mệnh</h3>
              <p style={{ color: "#595959", margin: 0 }}>
                Cung cấp linh kiện điện lạnh chính hãng, chất lượng cao với giá cạnh tranh, giúp các doanh nghiệp nâng
                cao hiệu suất sản xuất và giảm chi phí vận hành.
              </p>
            </div>
            <div style={{ backgroundColor: "#fff", padding: "32px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <h3 style={{ color: "#0958d9", fontSize: "1.5rem", marginTop: 0 }}>Tầm Nhìn</h3>
              <p style={{ color: "#595959", margin: 0 }}>
                Trở thành nhà cung cấp linh kiện điện lạnh hàng đầu tại Đông Nam Á, được khách hàng tin tưởng và lựa
                chọn hàng đầu.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ===== CORE VALUES SECTION ===== */}
      <section style={{ ...sectionStyle, textAlign: "center" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: "64px" }}>Giá Trị Cốt Lõi</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "40px" }}>
          {[
            { title: "Chất Lượng", desc: "100% sản phẩm chính hãng, kiểm định kỹ lưỡng" },
            { title: "Tận Tâm", desc: "Lắng nghe và đáp ứng nhu cầu khách hàng" },
            { title: "Hiệu Quả", desc: "Giao hàng nhanh, dịch vụ chuyên nghiệp" },
            { title: "Phát Triển", desc: "Liên tục cập nhật sản phẩm mới" }
          ].map((item, index) => (
            <div key={index}>
              <div style={{ fontSize: "40px", color: "#0958d9", marginBottom: "16px" }}>★</div>
              <h4 style={{ fontSize: "1.25rem", margin: "0 0 8px 0" }}>{item.title}</h4>
              <p style={{ color: "#8c8c8c", fontSize: "0.9rem", margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ACHIEVEMENTS SECTION ===== */}
      <div style={{ backgroundColor: "#f5f5f5" }}>
        <section style={sectionStyle}>
          <h2 style={{ fontSize: "2rem", textAlign: "center", marginBottom: "48px" }}>Thành Tựu</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "32px" }}>
            {[
              { label: "Năm kinh nghiệm", value: "15+" },
              { label: "Khách hàng hài lòng", value: "5000+" },
              { label: "Mẫu mã sản phẩm", value: "40+" }
            ].map((stat, index) => (
              <div key={index} style={{ backgroundColor: "#fff", padding: "32px", borderRadius: "12px", textAlign: "center" }}>
                <div style={{ color: "#8c8c8c", fontSize: "1rem", marginBottom: "8px" }}>{stat.label}</div>
                <div style={{ color: "#0958d9", fontSize: "2.5rem", fontWeight: "700" }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

    </main>
  );
};

export default About;