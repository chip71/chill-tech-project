import {
  Card,
  Table,
  Typography,
  Tag,
  Space,
  Input,
  Row,
  Col,
  Select,
  Button,
  message,
  DatePicker,
  Tooltip,
} from "antd";
import { SearchOutlined, EyeOutlined, PrinterOutlined } from "@ant-design/icons";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const API_URL = "http://localhost:9999";

/* ================= STATUS CONFIG ================= */
const STATUS_COLOR = {
  "Chờ thanh toán": "gold",
  "Đang xử lý": "blue",
  "Đã thanh toán": "cyan",
  "Đang giao hàng": "processing",
  "Đã giao": "green",
  "Hủy đơn": "red",
};

/**
 * LUẬT CHUYỂN TRẠNG THÁI
 */
const STATUS_FLOW = {
  "Chờ thanh toán": ["Hủy đơn"],
  "Đang xử lý": ["Đã thanh toán"],
  "Đã thanh toán": ["Đang giao hàng"],
  "Đang giao hàng": [],
  "Đã giao": [],
  "Hủy đơn": [],
};

/* ================= MONEY HELPERS ================= */
const fmtVND = (n = 0) => `${Number(n || 0).toLocaleString("vi-VN")} ₫`;

// Giả định: giá bán & phí ship là GIÁ ĐÃ BAO GỒM VAT 10% (phổ biến ở VN)
// => tách ra: trước thuế + tiền thuế
const VAT_RATE = 0.1;
const splitVatIncluded = (amount = 0) => {
  const inc = Number(amount || 0);
  const ex = inc / (1 + VAT_RATE);
  const vat = inc - ex;
  return { inc, ex, vat };
};

const escapeHtml = (s = "") =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const OrderManage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateRange, setDateRange] = useState(null);

  const navigate = useNavigate();

  /* ================= LOAD ORDERS ================= */
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/orders`, {
        withCredentials: true,
      });
      setOrders(res.data.data || []);
    } catch {
      message.error("Không tải được danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* ================= UPDATE STATUS ================= */
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API_URL}/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      message.success(`Đã chuyển trạng thái → ${newStatus}`);
      fetchOrders();
    } catch {
      message.error("Cập nhật trạng thái thất bại");
    }
  };

  /* ================= INVOICE PRINT ================= */
  const printVatInvoice = async (orderId) => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/orders/${orderId}`, {
        withCredentials: true,
      });
      const order = res.data?.data;
      if (!order) return message.error("Không lấy được dữ liệu đơn hàng");

      if (!order.invoice?.taxCode && !order.invoice?.companyName) {
        return message.warning("Đơn này không có thông tin xuất hóa đơn đỏ (VAT)");
      }

      const seller = {
        name: "CHILLTECH",
        taxCode: "0100000000", // TODO: thay bằng MST công ty bạn
        address: "Hà Nội, Việt Nam", // TODO: thay địa chỉ công ty
        phone: "0123 456 789",
        bank: "Ngân hàng ... - STK ... - Chủ TK ...",
      };

      const buyer = {
        companyName: order.invoice?.companyName || "",
        taxCode: order.invoice?.taxCode || "",
        address: order.invoice?.invoiceAddress || "",
        email: order.invoice?.invoiceEmail || "",
      };

      const receiverName =
        order.customerInfo?.receiverName ||
        order.customer?.customerName ||
        "";
      const receiverPhone = order.customerInfo?.phone || order.customer?.account?.phone || "";
      const shippingAddress = order.shippingAddress || "";
      const shippingUnit = order.shippingUnit || "";
      const createdAt = order.createdAt ? dayjs(order.createdAt).format("DD/MM/YYYY") : "";

      const items = Array.isArray(order.items) ? order.items : [];
      let sumEx = 0;
      let sumVat = 0;
      let sumInc = 0;

      const itemRows = items
        .map((it, idx) => {
          const qty = Number(it.quantity || 0);
          const unitInc = Number(it.price || 0); // giá lưu trong order item
          const lineInc = unitInc * qty;

          const { ex: lineEx, vat: lineVat } = splitVatIncluded(lineInc);
          sumEx += lineEx;
          sumVat += lineVat;
          sumInc += lineInc;

          const unitEx = unitInc / (1 + VAT_RATE);

          const productName =
            (it.product && (it.product.productName || it.product.name)) ||
            "Sản phẩm";

          return `
            <tr>
              <td class="c">${idx + 1}</td>
              <td>${escapeHtml(productName)}</td>
              <td class="c">Cái</td>
              <td class="r">${qty}</td>
              <td class="r">${fmtVND(unitEx)}</td>
              <td class="r">${fmtVND(lineEx)}</td>
              <td class="c">10%</td>
              <td class="r">${fmtVND(lineVat)}</td>
              <td class="r">${fmtVND(lineInc)}</td>
            </tr>
          `;
        })
        .join("");

      // Shipping fee
      const shippingFee = Number(order.shippingFee || 0);
      if (shippingFee > 0) {
        const { ex: shipEx, vat: shipVat, inc: shipInc } = splitVatIncluded(shippingFee);
        sumEx += shipEx;
        sumVat += shipVat;
        sumInc += shipInc;
      }

      // Tổng theo order.totalAmount (should match sumInc nếu đúng)
      const totalAmount = Number(order.totalAmount || 0);

      const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Hóa đơn VAT - ${escapeHtml(order._id || "")}</title>
  <style>
    @page { size: A4; margin: 14mm; }
    body { font-family: Arial, Helvetica, sans-serif; color:#111; }
    .row { display:flex; justify-content:space-between; gap:16px; }
    .muted { color:#555; font-size:12px; }
    h1 { font-size:18px; margin: 6px 0 2px; text-align:center; letter-spacing:0.5px; }
    .sub { text-align:center; font-size:12px; margin-bottom:10px; }
    .box { border:1px solid #ddd; padding:10px; border-radius:8px; }
    .kv { font-size:12.5px; line-height:1.55; }
    .kv b { display:inline-block; min-width:150px; }
    table { width:100%; border-collapse:collapse; margin-top:10px; }
    th, td { border:1px solid #ddd; padding:7px 8px; font-size:12px; vertical-align:top; }
    th { background:#f5f5f5; text-align:center; }
    .c { text-align:center; }
    .r { text-align:right; white-space:nowrap; }
    .sig { margin-top:22px; display:flex; justify-content:space-between; gap:18px; }
    .sig .col { width:33.33%; text-align:center; }
    .sig .title { font-weight:700; margin-bottom:70px; }
    .note { margin-top:10px; font-size:12px; color:#444; }
    .totals { margin-top:10px; width:100%; }
    .totals td { border:none; padding:3px 0; font-size:12.5px; }
    .totals .label { text-align:right; padding-right:10px; color:#333; }
    .totals .value { text-align:right; white-space:nowrap; font-weight:700; }
  </style>
</head>
<body>
  <div class="row">
    <div class="box" style="flex:1">
      <div style="font-weight:800; font-size:14px;">${escapeHtml(seller.name)}</div>
      <div class="kv">
        <div><b>MST:</b> ${escapeHtml(seller.taxCode)}</div>
        <div><b>Địa chỉ:</b> ${escapeHtml(seller.address)}</div>
        <div><b>Điện thoại:</b> ${escapeHtml(seller.phone)}</div>
        <div><b>Thanh toán:</b> ${escapeHtml(seller.bank)}</div>
      </div>
    </div>
    <div class="box" style="width:240px;">
      <div class="kv">
        <div><b>Mẫu số:</b> 01GTKT0/001</div>
        <div><b>Ký hiệu:</b> CT/26E</div>
        <div><b>Số:</b> CT-${escapeHtml(String(order._id || "").slice(-6).toUpperCase())}</div>
        <div><b>Ngày:</b> ${escapeHtml(createdAt)}</div>
      </div>
    </div>
  </div>

  <h1>HÓA ĐƠN GIÁ TRỊ GIA TĂNG (VAT)</h1>
  <div class="sub muted">(Giá đã bao gồm VAT 10% – hệ thống tự tách tiền thuế)</div>

  <div class="box">
    <div class="kv">
      <div><b>Đơn vị mua hàng:</b> ${escapeHtml(buyer.companyName)}</div>
      <div><b>MST:</b> ${escapeHtml(buyer.taxCode)}</div>
      <div><b>Địa chỉ:</b> ${escapeHtml(buyer.address)}</div>
      <div><b>Email nhận HĐ:</b> ${escapeHtml(buyer.email)}</div>
      <div><b>Người nhận hàng:</b> ${escapeHtml(receiverName)} ${receiverPhone ? `- ${escapeHtml(receiverPhone)}` : ""}</div>
      <div><b>Địa chỉ giao/nhận:</b> ${escapeHtml(shippingAddress)}</div>
      <div><b>Hình thức nhận:</b> ${escapeHtml(order.receiveMethod === "pickup" ? "Nhận tại cửa hàng" : "Giao hàng")}</div>
      <div><b>ĐV vận chuyển:</b> ${escapeHtml(shippingUnit)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:38px;">STT</th>
        <th>Tên hàng hóa/dịch vụ</th>
        <th style="width:62px;">ĐVT</th>
        <th style="width:62px;">SL</th>
        <th style="width:120px;">Đơn giá (chưa VAT)</th>
        <th style="width:120px;">Thành tiền (chưa VAT)</th>
        <th style="width:70px;">Thuế suất</th>
        <th style="width:110px;">Tiền thuế</th>
        <th style="width:120px;">Tổng (có VAT)</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows || `<tr><td class="c" colspan="9">Không có dữ liệu</td></tr>`}
      ${
        shippingFee > 0
          ? (() => {
              const { ex: shipEx, vat: shipVat, inc: shipInc } = splitVatIncluded(shippingFee);
              return `
                <tr>
                  <td class="c">-</td>
                  <td>Phí vận chuyển</td>
                  <td class="c">Lần</td>
                  <td class="r">1</td>
                  <td class="r">${fmtVND(shipEx)}</td>
                  <td class="r">${fmtVND(shipEx)}</td>
                  <td class="c">10%</td>
                  <td class="r">${fmtVND(shipVat)}</td>
                  <td class="r">${fmtVND(shipInc)}</td>
                </tr>
              `;
            })()
          : ""
      }
    </tbody>
  </table>

  <table class="totals">
    <tr>
      <td class="label">Cộng tiền hàng (chưa VAT):</td>
      <td class="value">${fmtVND(sumEx)}</td>
    </tr>
    <tr>
      <td class="label">Tiền thuế GTGT (10%):</td>
      <td class="value">${fmtVND(sumVat)}</td>
    </tr>
    <tr>
      <td class="label">Tổng tiền thanh toán (có VAT):</td>
      <td class="value">${fmtVND(sumInc)}</td>
    </tr>
    <tr>
      <td class="label muted">Đối soát tổng đơn (Order.totalAmount):</td>
      <td class="value muted">${fmtVND(totalAmount)}</td>
    </tr>
  </table>

  <div class="note">
    Ghi chú hóa đơn: ${escapeHtml(order.invoice?.invoiceNote || "")}
  </div>

  <div class="sig">
    <div class="col">
      <div class="title">Người mua hàng</div>
      <div>(Ký, ghi rõ họ tên)</div>
    </div>
    <div class="col">
      <div class="title">Người bán hàng</div>
      <div>(Ký, đóng dấu)</div>
    </div>
    <div class="col">
      <div class="title">Thủ trưởng đơn vị</div>
      <div>(Ký, đóng dấu)</div>
    </div>
  </div>
</body>
</html>
      `.trim();

      const w = window.open("", "_blank");
      if (!w) return message.error("Trình duyệt chặn popup. Hãy cho phép mở cửa sổ mới để in.");

      w.document.open();
      w.document.write(html);
      w.document.close();

      // đợi render xong rồi in
      setTimeout(() => {
        w.focus();
        w.print();
      }, 250);
    } catch (e) {
      message.error("Không thể in hóa đơn VAT");
    }
  };

  /* ================= FILTER ================= */
  const filteredOrders = useMemo(() => {
    let data = [...orders];

    if (searchText) {
      const kw = searchText.toLowerCase();
      data = data.filter(
        (o) =>
          o.customer?.customerName?.toLowerCase().includes(kw) ||
          o.customer?.account?.phone?.includes(kw)
      );
    }

    if (statusFilter !== "ALL") {
      data = data.filter((o) => o.orderStatus === statusFilter);
    }

    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange;
      const s = start.startOf("day").valueOf();
      const e = end.endOf("day").valueOf();

      data = data.filter((o) => {
        const t = dayjs(o.createdAt).valueOf();
        return t >= s && t <= e;
      });
    }

    return data;
  }, [orders, searchText, statusFilter, dateRange]);

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "_id",
      width: 120,
      render: (id) => id.slice(-6).toUpperCase(),
    },
    {
      title: "Khách hàng",
      render: (_, r) => (
        <div>
          <b>{r.customer?.customerName}</b>
          <div style={{ fontSize: 12, color: "#888" }}>
            {r.customer?.account?.phone}
          </div>
        </div>
      ),
    },
    {
      title: "Ngày đặt",
      render: (_, r) => dayjs(r.createdAt).format("DD/MM/YYYY"),
    },
    {
      title: "Hóa đơn",
      width: 120,
      render: (_, r) =>
        r.invoice?.taxCode || r.invoice?.companyName ? (
          <Tag color="green">Có VAT</Tag>
        ) : (
          <Tag>Không</Tag>
        ),
    },
    {
      title: "Nội dung chuyển tiền",
      dataIndex: "paymentContent",
      render: (v) => <Text copyable>{v}</Text>,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      render: (v) => `${Number(v || 0).toLocaleString("vi-VN")} ₫`,
    },
    {
      title: "Trạng thái",
      width: 220,
      render: (_, r) => {
        const nextStatus = STATUS_FLOW[r.orderStatus]?.[0];

        if (!nextStatus) {
          return <Tag color={STATUS_COLOR[r.orderStatus]}>{r.orderStatus}</Tag>;
        }

        return (
          <Select
            value={r.orderStatus}
            style={{ width: 200 }}
            onChange={() => updateOrderStatus(r._id, nextStatus)}
          >
            <Select.Option value={r.orderStatus} disabled>
              {r.orderStatus}
            </Select.Option>
            <Select.Option value={nextStatus}>→ {nextStatus}</Select.Option>
          </Select>
        );
      },
    },
    {
      title: "Thao tác",
      width: 160,
      render: (_, r) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              onClick={() => navigate(`/admin/orders/${r._id}`)}
            />
          </Tooltip>

          <Tooltip title="In hóa đơn VAT">
            <Button
              icon={<PrinterOutlined />}
              disabled={!(r.invoice?.taxCode || r.invoice?.companyName)}
              onClick={() => printVatInvoice(r._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  /* ================= SUMMARY ================= */
  const totalOrders = filteredOrders.length;
  const pendingOrders = filteredOrders.filter((o) => o.orderStatus === "Chờ thanh toán").length;
  const processingOrders = filteredOrders.filter((o) => o.orderStatus === "Đang xử lý").length;
  const completedOrders = filteredOrders.filter((o) => o.orderStatus === "Đã giao").length;

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Title level={3}>Quản lý đơn hàng</Title>
        <Text type="secondary">Theo dõi và cập nhật trạng thái đơn hàng</Text>
      </div>

      <Card
        title="Danh sách đơn hàng"
        extra={
          <Space wrap>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Tìm tên hoặc SĐT..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            <Select value={statusFilter} style={{ width: 180 }} onChange={setStatusFilter}>
              <Option value="ALL">Tất cả</Option>
              {Object.keys(STATUS_COLOR).map((s) => (
                <Option key={s} value={s}>
                  {s}
                </Option>
              ))}
            </Select>

            <RangePicker format="DD/MM/YYYY" onChange={setDateRange} />
          </Space>
        }
      >
        <Table
          rowKey="_id"
          loading={loading}
          columns={columns}
          dataSource={filteredOrders}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={6}>
          <Card>
            <Text type="secondary">Tổng đơn</Text>
            <Title level={3}>{totalOrders}</Title>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Text type="secondary">Chờ thanh toán</Text>
            <Title level={3}>{pendingOrders}</Title>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Text type="secondary">Đang xử lý</Text>
            <Title level={3}>{processingOrders}</Title>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Text type="secondary">Hoàn thành</Text>
            <Title level={3}>{completedOrders}</Title>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default OrderManage;