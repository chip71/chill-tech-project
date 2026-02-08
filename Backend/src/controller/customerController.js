const customerService = require("../service/customerService");

const handleRegisterCustomer = async (req, res) => {
  try {
    const {
      customerName,
      address,
      gender,
      email,
      password,
      phone,
    } = req.body;

    if (!email || !password || !customerName) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const result = await customerService.createUser({
      customerName,
      address,
      gender,
      email,
      password,
      phone,
    });

    return res.status(201).json({
      message: "Đăng ký thành công",
      data: {
        accountId: result.account._id,
        customerId: result.customer._id,
      },
    });
  } catch (error) {
  console.error("REGISTER ERROR FULL:", error); // 👈 BẮT BUỘC

  if (error.code === 11000) {
    return res.status(400).json({ message: "Email đã được sử dụng" });
  }

  return res.status(500).json({ message: error.message });
}
};
const getAdminCustomers = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    const customers = await customerService.getCustomersForAdmin();

    return res.json({
      data: customers,
    });
  } catch (error) {
    console.error("GET ADMIN CUSTOMERS ERROR:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

const getAdminCustomerDetail = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    const { id } = req.params;

    const data = await customerService.getCustomerDetailForAdmin(id);

    return res.json({ data });
  } catch (error) {
    console.error("GET CUSTOMER DETAIL ERROR:", error);
    return res.status(400).json({ message: error.message });
  }
};

const updateMyProfile = async (req, res) => {
  try {
   const accountId = req.user.accountId;// từ authMiddleware

    const {
      customerName,
      phone,
      address,
      gender,
    } = req.body;

    const data = await customerService.updateMyProfile(
      accountId,
      {
        customerName,
        phone,
        address,
        gender,
      }
    );

    return res.json({
      message: "Cập nhật thông tin thành công",
      data,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    return res.status(400).json({ message: error.message });
  }
};
module.exports = {
  handleRegisterCustomer,
  getAdminCustomers,
  getAdminCustomerDetail,
  updateMyProfile
};
