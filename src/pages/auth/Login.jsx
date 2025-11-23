import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Form, Input, Button, Alert, message } from "antd";
import { Mail, Lock, Eye, EyeOff, WifiOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase/firebase-config";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login, apiConnected, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const user = await login(values);
      message.success("Đăng nhập thành công!");
      if (user.role === 0) {
        navigate("/admin");
      } else if (user.role === 2) {
        navigate("/teacher");
      } else {
        navigate("/");
      }
    } catch (error) {
      message.error(
        error.response?.data?.data?.[0]?.errorMessage ||
          error.response?.data?.data ||
          "Đăng nhập thất bại! Vui lòng kiểm tra lại email/mật khẩu."
      );
    } finally {
      setLoading(false);
    }
  };

  const onHandleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      console.debug("🏠 Google ID Token:", idToken);
      const user = await loginWithGoogle(idToken);
      if (user.role === 0) {
        navigate("/admin");
      } else if (user.role === 2) {
        navigate("/teacher");
      } else {
        navigate("/");
      }
    } catch (error) {
      message.error(
        error.response?.data?.data?.[0]?.errorMessage ||
          error.response?.data?.data ||
          "Đăng nhập thất bại! Vui lòng kiểm tra lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo + Title */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-10"
        >
          <img
            src="./logoRM.png"
            alt="Logo"
            className="mx-auto h-20 w-20 object-contain drop-shadow-lg mb-6 rounded-2xl"
          />
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-red-600 to-rose-700 bg-clip-text text-transparent">
            Chào mừng trở lại!
          </h1>
          <p className="mt-3 text-gray-600 text-lg font-medium">
            Đăng nhập để tiếp tục hành trình chinh phục kiến thức
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-red-100"
        >
          {/* Header Card - Đỏ đẹp */}
          <div className="bg-gradient-to-r from-red-600 to-rose-600 px-8 py-6 text-center">
            <h2 className="text-2xl font-bold text-white">
              Đăng Nhập Tài Khoản
            </h2>
          </div>

          <div className="p-8 pt-10">
            {/* Cảnh báo mất kết nối */}
            {!apiConnected && (
              <Alert
                message="Mất kết nối server"
                description="Không thể kết nối đến localhost:3001. Vui lòng chạy server."
                type="warning"
                showIcon
                icon={<WifiOff className="text-yellow-600" />}
                className="mb-6 rounded-xl"
              />
            )}

            <Form
              name="login"
              onFinish={onFinish}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="email"
                label={
                  <span className="font-semibold text-gray-700">
                    Email hoặc tên đăng nhập
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập email hoặc tên đăng nhập!",
                  },
                ]}
              >
                <Input
                  prefix={<Mail className="text-red-500" size={20} />}
                  placeholder="nhập email hoặc tên đăng nhập"
                  className="h-12 rounded-xl border-gray-300 hover:border-red-400 focus:border-red-500"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={
                  <span className="font-semibold text-gray-700">Mật khẩu</span>
                }
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              >
                <Input.Password
                  prefix={<Lock className="text-red-500" size={20} />}
                  placeholder="nhập mật khẩu của bạn"
                  className="h-12 rounded-xl"
                  iconRender={(visible) =>
                    visible ? (
                      <Eye className="text-gray-500" />
                    ) : (
                      <EyeOff className="text-gray-500" />
                    )
                  }
                />
              </Form.Item>

              <Form.Item className="mt-8">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 border-0 shadow-lg transform transition hover:scale-105"
                >
                  {loading ? "Đang đăng nhập..." : "ĐĂNG NHẬP"}
                </Button>
              </Form.Item>
            </Form>

            {/* Divider + Register Link */}
            <div className="mt-8 text-center">
              <span className="text-gray-600">Chưa có tài khoản? </span>
              <Link
                to="/register"
                className="font-bold text-red-600 hover:text-rose-700 transition"
              >
                Đăng ký ngay
              </Link>
            </div>

            {/* Google Login */}
            <div className="mt-6">
              <div className="text-center text-gray-500 mb-3">
                Hoặc tiếp tục với
              </div>
              <Button
                size="large"
                className="w-full h-12 rounded-xl border-gray-300 flex items-center justify-center gap-3 hover:border-red-300"
                onClick={onHandleGoogleLogin}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21.6 12.227c0-.68-.062-1.333-.176-1.958H12v3.708h5.47c-.236 1.272-.95 2.35-2.03 3.077v2.56h3.28c1.917-1.764 3.02-4.36 3.02-7.387z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 22c2.7 0 4.966-.9 6.62-2.44l-3.28-2.56c-.91.61-2.08.97-3.34.97-2.56 0-4.73-1.73-5.5-4.06H3.06v2.55C4.7 19.91 8.06 22 12 22z"
                    fill="#34A853"
                  />
                  <path
                    d="M6.5 13.91a5.4 5.4 0 010-3.82V7.55H3.06A9.99 9.99 0 002 12c0 1.6.37 3.12 1.06 4.45l3.44-2.54z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 6.5c1.47 0 2.8.5 3.85 1.48l2.88-2.88C16.96 3.58 14.7 3 12 3 8.06 3 4.7 5.09 3.06 7.95l3.44 2.55C7.27 8.23 9.44 6.5 12 6.5z"
                    fill="#EA4335"
                  />
                </svg>
                Đăng nhập bằng Google
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Footer nhỏ xinh */}
        <div className="text-center mt-10 text-gray-500 text-sm">
          © 2025 Tên App Của Bạn. Made with passion in Vietnam
        </div>
      </div>
    </div>
  );
};

export default Login;
