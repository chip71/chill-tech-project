import { useEffect, useState } from "react";
import {
    Card,
    Descriptions,
    Spin,
    Row,
    Col,
    Button,
    Space,
    Modal,
    Form,
    Input,
    Select,
    message,
    Avatar,
    Typography,
    Divider,
} from "antd";
import {
    LockOutlined,
    ProfileOutlined,
    EditOutlined,
    UserOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:9999";
const { Option } = Select;
const { Title, Text } = Typography;

const CustomerProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [pwdOpen, setPwdOpen] = useState(false);
    const [form] = Form.useForm();
    const [pwdForm] = Form.useForm();
    const [pwdLoading, setPwdLoading] = useState(false);
    const navigate = useNavigate();

    /* ===== LẤY THÔNG TIN NGƯỜI DÙNG ===== */
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(
                    `${API_URL}/api/auth/me`,
                    { withCredentials: true }
                );
                setProfile(res.data);
            } catch (error) {
                console.error("FETCH PROFILE ERROR:", error);
                message.error("Không thể tải thông tin người dùng");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    /* ===== MỞ MODAL CHỈNH SỬA ===== */
    const openEditModal = () => {
        form.setFieldsValue({
            customerName: profile?.customer?.customerName,
            phone: profile?.account?.phone,
            address: profile?.customer?.address,
            gender: profile?.customer?.gender,
        });
        setEditOpen(true);
    };

    /* ===== CẬP NHẬT THÔNG TIN ===== */
    const handleUpdateProfile = async (values) => {
        // ===== VALIDATE =====
        if (!values.customerName || values.customerName.trim().length < 2) {
            message.error("Họ tên phải có ít nhất 2 ký tự");
            return;
        }

        if (
            values.phone &&
            !/^(0[3|5|7|8|9])[0-9]{8}$/.test(values.phone)
        ) {
            message.error("Số điện thoại không hợp lệ");
            return;
        }

        if (values.address && values.address.trim().length < 5) {
            message.error("Địa chỉ phải có ít nhất 5 ký tự");
            return;
        }

        if (!values.gender) {
            message.error("Vui lòng chọn giới tính");
            return;
        }

        try {
            const res = await axios.put(
                `${API_URL}/api/customers/me`,
                {
                    ...values,
                    customerName: values.customerName.trim(),
                    address: values.address?.trim(),
                },
                { withCredentials: true }
            );

            setProfile((prev) => ({
                ...prev,
                account: {
                    ...prev.account,
                    phone: res.data.data.account.phone,
                },
                customer: {
                    ...prev.customer,
                    ...res.data.data.customer,
                },
            }));

            message.success("Cập nhật thông tin thành công");
            setEditOpen(false);
        } catch (error) {
            console.error("UPDATE PROFILE ERROR:", error);
            message.error(
                error.response?.data?.message || "Cập nhật thất bại"
            );
        }
    };


    /* ===== ĐỔI MẬT KHẨU ===== */
    const handleChangePassword = async (values) => {
        try {
            setPwdLoading(true);
            await axios.put(
                `${API_URL}/api/auth/change-password`,
                values,
                { withCredentials: true }
            );
            message.success("Đổi mật khẩu thành công");
            setPwdOpen(false);
            pwdForm.resetFields();
        } catch (error) {
            message.error(
                error?.response?.data?.message || "Đổi mật khẩu thất bại"
            );
        } finally {
            setPwdLoading(false);
        }
    };


    const openPasswordModal = () => {
        pwdForm.resetFields();
        setPwdOpen(true);
    };


    /* ===== TRẠNG THÁI LOADING ===== */
    if (loading) {
        return (
            <div style={{ textAlign: "center", marginTop: 100 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!profile) return null;

    const { account, customer } = profile;

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f5f7fa",
                padding: "40px 16px",
            }}
        >
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                <Title level={2} style={{ marginBottom: 24 }}>
                    Tài khoản của tôi
                </Title>

                <Row gutter={[24, 24]}>
                    {/* ===== CỘT TRÁI ===== */}
                    <Col xs={24} md={8}>
                        <Card
                            bordered={false}
                            style={{
                                borderRadius: 12,
                                textAlign: "center",
                                boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                            }}
                        >
                            <Avatar
                                size={96}
                                icon={<UserOutlined />}
                                style={{
                                    backgroundColor: "#1677ff",
                                    marginBottom: 12,
                                }}
                            />

                            <Title level={4} style={{ marginBottom: 4 }}>
                                {customer?.customerName || "Khách hàng"}
                            </Title>

                            <Text type="secondary">
                                {account?.email}
                            </Text>

                            <Divider />

                            <Space
                                direction="vertical"
                                size="middle"
                                style={{ width: "100%" }}
                            >
                                <Button
                                    icon={<EditOutlined />}
                                    block
                                    onClick={openEditModal}
                                >
                                    Chỉnh sửa thông tin
                                </Button>

                                <Button
                                    icon={<LockOutlined />}
                                    block
                                    onClick={openPasswordModal}
                                >
                                    Đổi mật khẩu
                                </Button>

                                <Button
                                    icon={<ProfileOutlined />}
                                    block
                                    onClick={() => navigate("/customer-orders")}
                                >
                                    Đơn hàng của tôi
                                </Button>
                            </Space>
                        </Card>
                    </Col>

                    {/* ===== CỘT PHẢI ===== */}
                    <Col xs={24} md={16}>
                        <Card
                            bordered={false}
                            style={{
                                borderRadius: 12,
                                boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                            }}
                        >
                            <Title level={4} style={{ marginBottom: 16 }}>
                                Thông tin cá nhân
                            </Title>

                            <Descriptions
                                bordered
                                column={1}
                                size="middle"
                                labelStyle={{
                                    width: 180,
                                    fontWeight: 600,
                                    background: "#fafafa",
                                }}
                            >
                                <Descriptions.Item label="Họ và tên">
                                    {customer?.customerName || "—"}
                                </Descriptions.Item>

                                <Descriptions.Item label="Email">
                                    {account?.email || "—"}
                                </Descriptions.Item>

                                <Descriptions.Item label="Số điện thoại">
                                    {account?.phone || "—"}
                                </Descriptions.Item>

                                <Descriptions.Item label="Địa chỉ">
                                    {customer?.address || "—"}
                                </Descriptions.Item>

                                <Descriptions.Item label="Giới tính">
                                    {customer?.gender || "—"}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* ===== MODAL CHỈNH SỬA ===== */}
            <Modal
                title="Chỉnh sửa thông tin cá nhân"
                open={editOpen}
                onCancel={() => setEditOpen(false)}
                onOk={() => form.submit()}
                okText="Lưu"
                destroyOnClose
            >
                <Form
                    layout="vertical"
                    form={form}
                    onFinish={handleUpdateProfile}
                >
                    {/* HỌ TÊN */}
                    <Form.Item
                        label="Họ và tên"
                        name="customerName"
                        rules={[
                            { required: true, message: "Vui lòng nhập họ tên" },
                            { min: 2, message: "Họ tên tối thiểu 2 ký tự" },
                            {
                                validator: (_, value) =>
                                    value && value.trim().length === 0
                                        ? Promise.reject("Họ tên không hợp lệ")
                                        : Promise.resolve(),
                            },
                        ]}
                    >
                        <Input placeholder="Nhập họ và tên" />
                    </Form.Item>

                    {/* SỐ ĐIỆN THOẠI */}
                    <Form.Item
                        label="Số điện thoại"
                        name="phone"
                        rules={[
                            { required: true, message: "Vui lòng nhập số điện thoại" },
                            {
                                pattern: /^(0[3|5|7|8|9])[0-9]{8}$/,
                                message: "Số điện thoại không hợp lệ",
                            },
                        ]}
                    >
                        <Input placeholder="VD: 0987654321" />
                    </Form.Item>

                    {/* ĐỊA CHỈ */}
                    <Form.Item
                        label="Địa chỉ"
                        name="address"
                        rules={[
                            { required: true, message: "Vui lòng nhập địa chỉ" },
                            { min: 5, message: "Địa chỉ tối thiểu 5 ký tự" },
                            {
                                validator: (_, value) =>
                                    value && value.trim().length === 0
                                        ? Promise.reject("Địa chỉ không hợp lệ")
                                        : Promise.resolve(),
                            },
                        ]}
                    >
                        <Input.TextArea rows={2} placeholder="Nhập địa chỉ" />
                    </Form.Item>

                    {/* GIỚI TÍNH */}
                    <Form.Item
                        label="Giới tính"
                        name="gender"
                        rules={[
                            { required: true, message: "Vui lòng chọn giới tính" },
                        ]}
                    >
                        <Select placeholder="Chọn giới tính">
                            <Option value="MALE">Nam</Option>
                            <Option value="FEMALE">Nữ</Option>
                            <Option value="OTHER">Khác</Option>
                        </Select>
                    </Form.Item>
                </Form>

            </Modal>
            {/* ===== MODAL: ĐỔI MẬT KHẨU ===== */}
            <Modal
                title="Đổi mật khẩu"
                open={pwdOpen}
                onCancel={() => setPwdOpen(false)}
                onOk={() => pwdForm.submit()}
                okText="Cập nhật"
                cancelText="Hủy"
                confirmLoading={pwdLoading}
                destroyOnClose
            >
                <Form
                    layout="vertical"
                    form={pwdForm}
                    onFinish={handleChangePassword}
                >
                    <Form.Item
                        label="Mật khẩu hiện tại"
                        name="currentPassword"
                        rules={[{ required: true, message: "Nhập mật khẩu hiện tại" }]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu hiện tại" />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu mới"
                        name="newPassword"
                        rules={[
                            { required: true, message: "Nhập mật khẩu mới" },
                            { min: 8, message: "Mật khẩu mới ít nhất 8 ký tự" },
                        ]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu mới" />
                    </Form.Item>

                    <Form.Item
                        label="Xác nhận mật khẩu mới"
                        name="confirmPassword"
                        dependencies={["newPassword"]}
                        rules={[
                            { required: true, message: "Nhập lại mật khẩu mới" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("newPassword") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(
                                        new Error("Mật khẩu xác nhận không khớp")
                                    );
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Nhập lại mật khẩu mới" />
                    </Form.Item>
                </Form>
            </Modal>

        </div>
    );
};

export default CustomerProfile;
