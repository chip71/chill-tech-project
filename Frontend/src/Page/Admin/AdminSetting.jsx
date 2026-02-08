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
    message,
    Avatar,
    Typography,
    Divider,
} from "antd";
import {
    LockOutlined,
    EditOutlined,
    UserOutlined,
} from "@ant-design/icons";
import axios from "axios";

const API_URL = "http://localhost:9999";
const { Title, Text } = Typography;

const AdminSettings = () => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(false);
    const [pwdOpen, setPwdOpen] = useState(false);
    const [form] = Form.useForm();
    const [pwdForm] = Form.useForm();
    const [pwdLoading, setPwdLoading] = useState(false);

    /* ===== FETCH ADMIN INFO ===== */
    useEffect(() => {
        const fetchAdmin = async () => {
            try {
                const res = await axios.get(
                    `${API_URL}/api/auth/me`,
                    { withCredentials: true }
                );
                setAdmin(res.data);
            } catch (err) {
                message.error("Không thể tải thông tin admin");
            } finally {
                setLoading(false);
            }
        };

        fetchAdmin();
    }, []);

    /* ===== OPEN EDIT ===== */
    const openEditModal = () => {
        form.setFieldsValue({
            fullName: admin?.account?.fullName,
            phone: admin?.account?.phone,
        });
        setEditOpen(true);
    };

    /* ===== UPDATE PROFILE ===== */
    const handleUpdateProfile = async (values) => {
        try {
            const res = await axios.put(
                `${API_URL}/api/admins/me`,
                values,
                { withCredentials: true }
            );

            setAdmin((prev) => ({
                ...prev,
                account: {
                    ...prev.account,
                    ...res.data.data,
                },
            }));

            message.success("Cập nhật thông tin thành công");
            setEditOpen(false);
        } catch (err) {
            message.error(
                err.response?.data?.message || "Cập nhật thất bại"
            );
        }
    };

    /* ===== CHANGE PASSWORD ===== */
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
        } catch (err) {
            message.error(
                err.response?.data?.message || "Đổi mật khẩu thất bại"
            );
        } finally {
            setPwdLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: "center", marginTop: 120 }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!admin) return null;

    const { account } = admin;

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f5f7fa",
                padding: "32px",
            }}
        >
            <Title level={2}>Cài đặt hệ thống</Title>

            <Row gutter={[24, 24]}>
                {/* ===== LEFT ===== */}
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
                            style={{ background: "#1677ff", marginBottom: 12 }}
                        />

                        <Title level={4}>{account?.fullName || "Admin"}</Title>
                        <Text type="secondary">{account?.email}</Text>

                        <Divider />

                        <Space direction="vertical" style={{ width: "100%" }}>
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
                                onClick={() => setPwdOpen(true)}
                            >
                                Đổi mật khẩu
                            </Button>
                        </Space>
                    </Card>
                </Col>

                {/* ===== RIGHT ===== */}
                <Col xs={24} md={16}>
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: 12,
                            boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                        }}
                    >
                        <Title level={4}>Thông tin tài khoản</Title>

                        <Descriptions
                            bordered
                            column={1}
                            labelStyle={{
                                width: 180,
                                fontWeight: 600,
                                background: "#fafafa",
                            }}
                        >
                            {/* <Descriptions.Item label="Họ và tên">
                {account?.fullName || "—"}
              </Descriptions.Item> */}

                            <Descriptions.Item label="Email">
                                {account?.email}
                            </Descriptions.Item>

                            <Descriptions.Item label="Số điện thoại">
                                {account?.phone || "—"}
                            </Descriptions.Item>

                            <Descriptions.Item label="Vai trò">
                                ADMIN
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>
            </Row>

            {/* ===== MODAL EDIT ===== */}
            <Modal
                title="Chỉnh sửa thông tin"
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
                    {/* <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[{ required: true, message: "Nhập họ tên" }]}
          >
            <Input />
          </Form.Item> */}

                    <Form.Item
                        label="Số điện thoại"
                        name="phone"
                        rules={[
                            {
                                pattern: /^(0[3|5|7|8|9])[0-9]{8}$/,
                                message: "Số điện thoại không hợp lệ",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>

            {/* ===== MODAL PASSWORD ===== */}
            <Modal
                title="Đổi mật khẩu"
                open={pwdOpen}
                onCancel={() => setPwdOpen(false)}
                onOk={() => pwdForm.submit()}
                okText="Cập nhật"
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
                        rules={[{ required: true }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu mới"
                        name="newPassword"
                        rules={[{ required: true, min: 8 }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        label="Xác nhận mật khẩu"
                        name="confirmPassword"
                        dependencies={["newPassword"]}
                        rules={[
                            { required: true },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || value === getFieldValue("newPassword")) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject("Mật khẩu không khớp");
                                },
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminSettings;
