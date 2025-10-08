import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Form, Input, Button, Divider, Alert, message } from 'antd';
import { Mail, Lock, Eye, EyeOff, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login, apiConnected } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values);
      message.success('Đăng nhập thành công!');
      navigate('/');
    } catch (error) {
      message.error(error.message || 'Đăng nhập thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    message.info('Tính năng đăng nhập Google sẽ được tích hợp sau');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-xl p-8"
      >
        {!apiConnected && (
          <Alert
            message="Mất kết nối server"
            description="Không thể kết nối đến localhost:3001. Vui lòng chạy JSON Server."
            type="warning"
            showIcon
            icon={<WifiOff size={16} />}
          />
        )}

        <div className="text-center">
          <motion.h2 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-3xl font-bold text-gray-900 mb-2"
          >
            Đăng nhập
          </motion.h2>
          <p className="text-gray-600">
            Chào mừng trở lại! Vui lòng đăng nhập vào tài khoản của bạn.
          </p>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          className="space-y-6"
          initialValues={{
            email: 'student@example.com',
            password: 'password123'
          }}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input 
              prefix={<Mail className="text-gray-400" size={18} />}
              placeholder="Nhập email của bạn"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              prefix={<Lock className="text-gray-400" size={18} />}
              placeholder="Nhập mật khẩu"
              size="large"
              iconRender={(visible) => 
                visible ? <Eye size={18} /> : <EyeOff size={18} />
              }
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
              className="w-full h-12 text-lg font-semibold"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </Form.Item>
        </Form>

        <Divider>Hoặc</Divider>

        <div className="space-y-4">
          <Button 
            size="large" 
            className="w-full h-12 border-gray-300 flex items-center justify-center"
            onClick={handleGoogleLogin}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Đăng nhập với Google
          </Button>
        </div>

        <div className="text-center">
          <span className="text-gray-600">Chưa có tài khoản? </span>
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
            Đăng ký ngay
          </Link>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Tài khoản demo:</h4>
          <div className="text-xs space-y-1">
            <div><strong>Học sinh:</strong> student@example.com / password123</div>
            <div><strong>Giáo viên:</strong> teacher@example.com / password123</div>
            <div><strong>Admin:</strong> admin@example.com / password123</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;