import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Form, Input, Button, Select, message } from "antd";
import { Mail, Lock, User, Phone, Eye, EyeOff, UserCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";


const { Option } = Select;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const registerData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        username: values.username,
        password: values.password,
        role: parseInt(values.role), // 1: học sinh, 2: giáo viên
      };

      await register(registerData);
      message.success("Đăng ký thành công! Chào mừng bạn đến với cộng đồng!");
      navigate("/");
    } catch (error) {
      message.error(
        error.response?.data?.data?.[0]?.errorMessage ||
          error.response?.data?.data ||
          "Đăng ký thất bại! Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo + Tiêu đề */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-10"
        >
          <img
            src="./logoRM.png"
            alt="Logo"
            className="mx-auto h-24 w-24 object-contain rounded-2xl shadow-xl bg-white p-3"
          />
          <h1 className="mt-6 text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-red-600 to-rose-700 bg-clip-text text-transparent">
            Tạo Tài Khoản Mới
          </h1>
          <p className="mt-3 text-lg text-gray-600 font-medium">
            Tham gia cùng hàng nghìn học viên đang chinh phục tiếng Anh mỗi ngày
          </p>
        </motion.div>

        {/* Card chính */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-red-100"
        >
          {/* Header đỏ */}
          <div className="bg-gradient-to-r from-red-600 to-rose-600 px-8 py-6 text-center">
            <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-3">
              <UserCheck className="w-8 h-8" />
              Đăng Ký Thành Viên
            </h2>
          </div>

          <div className="p-8 lg:p-10">
            <Form
              name="register"
              onFinish={onFinish}
              layout="vertical"
              size="large"
              initialValues={{ role: "1" }}
              className="space-y-5"
            >
              {/* Vai trò */}
              <Form.Item
                name="role"
                label={<span className="text-lg font-semibold text-gray-700">Bạn là ai?</span>}
                rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
              >
                <Select
                  placeholder="Chọn vai trò của bạn"
                  className="h-14 rounded-xl text-lg"
                  dropdownClassName="rounded-xl"
                >
                  <Option value="1" className="text-lg py-3">
                    Học sinh
                  </Option>
                  <Option value="2" className="text-lg py-3">
                    Giáo viên
                  </Option>
                </Select>
              </Form.Item>

              {/* Họ + Tên */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Form.Item
                  name="firstName"
                  label="Họ"
                  rules={[
                    { required: true, message: "Vui lòng nhập họ!" },
                    { min: 2, message: "Họ phải ít nhất 2 ký tự!" },
                  ]}
                >
                  <Input
                    prefix={<User className="text-red-500" size={20} />}
                    placeholder="Nguyễn"
                    className="h-14 rounded-xl border-gray-300 hover:border-red-400 focus:border-red-500"
                  />
                </Form.Item>

                <Form.Item
                  name="lastName"
                  label="Tên"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên!" },
                    { min: 2, message: "Tên phải ít nhất 2 ký tự!" },
                  ]}
                >
                  <Input
                    placeholder="Văn A"
                    className="h-14 rounded-xl border-gray-300 hover:border-red-400 focus:border-red-500"
                  />
                </Form.Item>
              </div>

              {/* Email */}
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input
                  prefix={<Mail className="text-red-500" size={20} />}
                  placeholder="you@example.com"
                  className="h-14 rounded-xl"
                />
              </Form.Item>

              {/* Số điện thoại */}
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  {
                    pattern: /^(0|\+84)[3|5|7|8|9][0-9]{8}$/,
                    message: "Số điện thoại Việt Nam không hợp lệ!",
                  },
                ]}
              >
                <Input
                  prefix={<Phone className="text-red-500" size={20} />}
                  placeholder="0901234567"
                  className="h-14 rounded-xl"
                />
              </Form.Item>

              {/* Tên đăng nhập */}
              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[
                  { required: true, message: "Vui lòng nhập tên đăng nhập!" },
                  { min: 4, message: "Tên đăng nhập ít nhất 4 ký tự!" },
                ]}
              >
                <Input
                  placeholder="nhập tên đăng nhập của bạn"
                  className="h-14 rounded-xl"
                />
              </Form.Item>

              {/* Mật khẩu */}
              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu!" },
                  { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                ]}
              >
                <Input.Password
                  prefix={<Lock className="text-red-500" size={20} />}
                  placeholder="Tạo mật khẩu mạnh"
                  className="h-14 rounded-xl"
                  iconRender={(visible) =>
                    visible ? <Eye className="text-gray-500" /> : <EyeOff className="text-gray-500" />
                  }
                />
              </Form.Item>

              {/* Xác nhận mật khẩu */}
              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Vui lòng xác nhận lại mật khẩu!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Hai mật khẩu không khớp!"));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<Lock className="text-red-500" size={20} />}
                  placeholder="Nhập lại mật khẩu"
                  className="h-14 rounded-xl"
                  iconRender={(visible) =>
                    visible ? <Eye className="text-gray-500" /> : <EyeOff className="text-gray-500" />
                  }
                />
              </Form.Item>

              {/* Nút đăng ký */}
              <Form.Item className="mt-8">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full h-16 text-xl font-bold rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 border-0 shadow-xl transform transition hover:scale-105"
                >
                  {loading ? "Đang tạo tài khoản..." : "HOÀN TẤT ĐĂNG KÝ"}
                </Button>
              </Form.Item>
            </Form>

            {/* Đăng nhập nếu đã có tài khoản */}
            <div className="text-center mt-8">
              <span className="text-gray-600 text-lg">Đã có tài khoản? </span>
              <Link
                to="/login"
                className="text-lg font-bold text-red-600 hover:text-rose-700 transition"
              >
                Đăng nhập ngay
              </Link>
            </div>

            {/* Điều khoản */}
            <div className="text-center mt-6 text-sm text-gray-500">
              Bằng việc đăng ký, bạn đồng ý với{" "}
              <Link to="/terms" className="text-red-600 hover:underline font-medium">
                Điều khoản dịch vụ
              </Link>{" "}
              và{" "}
              <Link to="/privacy" className="text-red-600 hover:underline font-medium">
                Chính sách bảo mật
              </Link>{" "}
              của chúng tôi.
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          © 2025 Tên App Của Bạn • Made with passion in Vietnam
        </div>
      </div>
    </div>
  );
};

export default Register;