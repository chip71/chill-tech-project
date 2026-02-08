const bcrypt = require("bcryptjs");
const Account = require("../models/Account");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const createUser = async (userData) => {
  const {
    customerName,
    address,
    gender,
    email,
    password,
    phone,
  } = userData;

  // check email tồn tại
  const existed = await Account.findOne({ email });
  if (existed) {
    const err = new Error("EMAIL_EXISTED");
    err.code = 11000;
    throw err;
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const account = await Account.create({
    email,
    password: hashedPassword,
    phone,
    role: "CUSTOMER",
    status: "ACTIVE",
  });

  const customer = await Customer.create({
    account: account._id,
    customerName,
    address,
    gender,
  });

  return { account, customer };
};

const getCustomersForAdmin = async () => {
  const customers = await Customer.find()
    .populate({
      path: "account",
      select: "email phone status",
    })
    .lean();

  // Tính số đơn + tổng chi tiêu
  const result = await Promise.all(
    customers.map(async (c) => {
      const orders = await Order.find({ customer: c._id }).lean();

      const totalSpent = orders.reduce(
        (sum, o) => sum + o.totalAmount,
        0
      );

      return {
        _id: c._id,
        customerName: c.customerName,
        address: c.address,
        email: c.account?.email,
        phone: c.account?.phone,
        status: c.account?.status === "ACTIVE" ? "Hoạt động" : "Không hoạt động",
        orders: orders.length,
        totalSpent,
        isVIP: totalSpent >= 20000000, // 🔥 RULE VIP
      };
    })
  );

  return result;
};
const getCustomerDetailForAdmin = async (customerId) => {
  const customer = await Customer.findById(customerId)
    .populate({
      path: "account",
      select: "email phone status",
    })
    .lean();

  if (!customer) {
    throw new Error("Không tìm thấy khách hàng");
  }

  const orders = await Order.find({ customer: customerId })
    .select("totalAmount orderStatus createdAt")
    .sort({ createdAt: -1 })
    .lean();

  const totalSpent = orders.reduce(
    (sum, o) => sum + o.totalAmount,
    0
  );

  return {
    _id: customer._id,
    customerName: customer.customerName,
    address: customer.address,
    email: customer.account?.email,
    phone: customer.account?.phone,
    status: customer.account?.status,
    orders,
    totalOrders: orders.length,
    totalSpent,
    isVIP: totalSpent >= 20000000,
  };
};
const updateMyProfile = async (accountId, data) => {
  const { customerName, phone, address, gender } = data;

  const account = await Account.findById(accountId);
  if (!account) throw new Error("Account not found");

  const customer = await Customer.findOne({ account: accountId });
  if (!customer) throw new Error("Customer not found");

  // Update account
  if (phone !== undefined) {
    account.phone = phone;
    await account.save();
  }

  // Update customer
  customer.customerName = customerName ?? customer.customerName;
  customer.address = address ?? customer.address;
  customer.gender = gender ?? customer.gender;

  await customer.save();

  return {
    account: {
      email: account.email,
      phone: account.phone,
    },
    customer: {
      customerName: customer.customerName,
      address: customer.address,
      gender: customer.gender,
    },
  };
};

module.exports = {
  createUser,
  getCustomersForAdmin,
  getCustomerDetailForAdmin,
  updateMyProfile,
};
