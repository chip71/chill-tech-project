const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Account = require("../models/Account");
const Customer = require("../models/Customer"); // 👈 FIX

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });
    }

    const account = await Account.findOne({ email });
    if (!account) {
      return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const isMatch = bcrypt.compareSync(password, account.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const token = jwt.sign(
      { id: account._id, role: account.role },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "7d" }
    );

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ message: "Đăng nhập thành công" });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Đăng nhập thất bại" });
  }
};

const logout = (req, res) => {
  res.clearCookie("access_token");
  return res.json({ message: "Đăng xuất thành công" });
};

const me = async (req, res) => {
  try {
    const token = req.cookies.access_token;
    if (!token) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret_key"
    );

    const account = await Account.findById(decoded.id).lean();
    const customer = await Customer.findOne({ account: account._id }).lean();

    return res.json({
      account: {
        id: account._id,
        email: account.email,
        role: account.role,
        phone: account.phone,          // ✅ THÊM
      },
      customer: {
        customerName: customer?.customerName,
        address: customer?.address,    // ✅ THÊM
        gender: customer?.gender,
      },
    });
  } catch (error) {
    console.error("ME ERROR:", error);
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};



// ===== CHANGE PASSWORD =====
const changePassword = async (req, res) => {
  try {
    const accountId = req.user?.accountId; // from authMiddleware
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!accountId) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    // 1) Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    if (String(newPassword).length < 8) {
      return res
        .status(400)
        .json({ message: "Mật khẩu mới phải có ít nhất 8 ký tự" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Mật khẩu xác nhận không khớp" });
    }

    if (newPassword === currentPassword) {
      return res
        .status(400)
        .json({ message: "Mật khẩu mới phải khác mật khẩu hiện tại" });
    }

    // 2) Find account
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: "Tài khoản không tồn tại" });
    }

    // 3) Check current password
    const isMatch = await bcrypt.compare(currentPassword, account.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    // 4) Hash new password (bcryptjs supports genSalt)
    const salt = await bcrypt.genSalt(10);
    account.password = await bcrypt.hash(newPassword, salt);
    await account.save();

    // (Optional) If you want to force re-login, you can clear cookie here
    // res.clearCookie("access_token");

    return res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    return res.status(500).json({ message: "Lỗi server khi đổi mật khẩu" });
  }
};


module.exports = {
  login,
  logout,
  me,
  changePassword,
};
