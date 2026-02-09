import React from "react";

const TermsPage = () => {
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
                    height: "320px",
                    background:
                        "linear-gradient(135deg, #0b1c36 0%, #163b6c 50%, #0b1c36 100%)",
                    ...flexCenter,
                    textAlign: "center",
                    color: "#fff",
                }}
            >
                <div style={{ maxWidth: 900, padding: "0 16px" }}>
                    <h1
                        style={{
                            fontSize: "3rem",
                            fontWeight: 700,
                            marginBottom: 12,
                            letterSpacing: "0.5px",
                        }}
                    >
                        ĐIỀU KHOẢN DỊCH VỤ
                    </h1>
                    <p style={{ fontSize: "1.1rem", opacity: 0.9 }}>
                        Cập nhật lần cuối: 09/02/2026
                    </p>
                </div>
            </section>

            {/* ===== INTRO ===== */}
            <section style={sectionStyle}>
                <Section title="1. Giới thiệu">
                    <p>
                        Chào mừng bạn đến với <strong>Chill Tech</strong>. Khi truy cập hoặc sử
                        dụng website <strong>https://chilltech.store</strong>, bạn xác nhận đã
                        đọc, hiểu và đồng ý tuân thủ các điều khoản dịch vụ dưới đây.
                    </p>
                </Section>
            </section>

            {/* ===== CONTENT BLOCK ===== */}
            <div style={{ backgroundColor: "#f6f8fb" }}>
                <section style={sectionStyle}>
                    <Section title="2. Tài khoản người dùng">
                        <ul>
                            <li>Thông tin đăng ký phải chính xác, đầy đủ và cập nhật.</li>
                            <li>Bạn chịu trách nhiệm bảo mật tài khoản và mật khẩu.</li>
                            <li>
                                Chill Tech có quyền khóa hoặc chấm dứt tài khoản nếu phát hiện
                                hành vi gian lận hoặc vi phạm điều khoản.
                            </li>
                        </ul>
                    </Section>

                    <Section title="3. Đặt hàng & Thanh toán">
                        <ul>
                            <li>Giá sản phẩm được niêm yết bằng Việt Nam Đồng (VND).</li>
                            <li>Đơn hàng chỉ được xử lý sau khi thanh toán thành công.</li>
                            <li>
                                Chill Tech có quyền hủy đơn hàng trong trường hợp lỗi giá hoặc
                                không đủ tồn kho.
                            </li>
                        </ul>
                    </Section>

                    <Section title="4. Giao hàng">
                        <ul>
                            <li>Thời gian giao hàng phụ thuộc vào đơn vị vận chuyển.</li>
                            <li>
                                Chill Tech không chịu trách nhiệm với các chậm trễ do yếu tố bất
                                khả kháng.
                            </li>
                        </ul>
                    </Section>
                </section>
            </div>

            {/* ===== USER OBLIGATION ===== */}
            <section style={sectionStyle}>
                <Section title="5. Nghĩa vụ người dùng">
                    <ul>
                        <li>Không sử dụng website cho mục đích vi phạm pháp luật.</li>
                        <li>Không xâm nhập, phá hoại hoặc can thiệp hệ thống.</li>
                        <li>
                            Không sao chép, phân phối nội dung khi chưa có sự cho phép của
                            Chill Tech.
                        </li>
                    </ul>
                </Section>

                <Section title="6. Quyền sở hữu trí tuệ">
                    <p>
                        Tất cả nội dung, hình ảnh, logo và tài sản trí tuệ khác thuộc quyền
                        sở hữu của Chill Tech và được bảo vệ theo quy định pháp luật hiện
                        hành.
                    </p>
                </Section>
            </section>

            {/* ===== LIABILITY ===== */}
            <div style={{ backgroundColor: "#f6f8fb" }}>
                <section style={sectionStyle}>
                    <Section title="7. Giới hạn trách nhiệm">
                        <p>
                            Chill Tech không chịu trách nhiệm đối với các thiệt hại gián tiếp,
                            ngẫu nhiên hoặc phát sinh do lỗi hệ thống, sự cố mạng hoặc bên thứ
                            ba.
                        </p>
                    </Section>

                    <Section title="8. Chấm dứt dịch vụ">
                        <p>
                            Chill Tech có quyền tạm ngừng hoặc chấm dứt dịch vụ để bảo trì hệ
                            thống hoặc ngăn chặn các hành vi vi phạm điều khoản.
                        </p>
                    </Section>
                </section>
            </div>

            {/* ===== CHANGES & CONTACT ===== */}
            <section style={{ ...sectionStyle }}>
                <Section title="9. Thay đổi điều khoản">
                    <p>
                        Chill Tech có thể cập nhật điều khoản dịch vụ bất kỳ lúc nào mà không
                        cần thông báo trước. Việc tiếp tục sử dụng website đồng nghĩa với
                        việc bạn chấp nhận các thay đổi đó.
                    </p>
                </Section>

                <Section title="10. Liên hệ">
                    <p>
                        Facebook:{" "}
                        <a
                            href="https://www.facebook.com/vattudienlanhphuhien"
                            target="_blank"
                            rel="noreferrer"
                        >
                            vattudienlanhphuhien
                        </a>
                    </p>
                    <p>Website: https://chilltech.store</p>
                    <p>Hotline: 0986 215 146</p>
                </Section>
            </section>
        </main>
    );
};

const Section = ({ title, children }) => (
    <div
        style={{
            maxWidth: 900,
            margin: "0 auto 40px",
            background: "#fff",
            padding: "32px",
            borderRadius: 14,
            boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
        }}
    >
        <h2
            style={{
                fontSize: "1.5rem",
                fontWeight: 600,
                marginBottom: 16,
                color: "#0958d9",
            }}
        >
            {title}
        </h2>
        <div style={{ color: "#444" }}>{children}</div>
    </div>
);

export default TermsPage;
