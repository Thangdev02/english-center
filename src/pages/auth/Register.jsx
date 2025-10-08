import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Form, Input, Button, Select, Divider, message } from 'antd';
import { Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
        name: `${values.firstName} ${values.lastName}`,
        email: values.email,
        phone: values.phone,
        password: values.password,
        role: values.role
      };

      await register(registerData);
      message.success('Đăng ký thành công!');
      navigate('/');
    } catch (error) {
      message.error(error.message || 'Đăng ký thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    message.info('Tính năng đăng ký Google sẽ được tích hợp sau');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center">
          <motion.h2 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-3xl font-bold text-gray-900 mb-2"
          >
            Đăng ký tài khoản
          </motion.h2>
          <p className="text-gray-600">
            Tạo tài khoản để bắt đầu hành trình học tiếng Anh của bạn
          </p>
        </div>

        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
          className="space-y-4"
          initialValues={{
            role: 'student'
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="firstName"
              label="Họ"
              rules={[
                { required: true, message: 'Vui lòng nhập họ!' },
                { min: 2, message: 'Họ phải có ít nhất 2 ký tự!' }
              ]}
            >
              <Input 
                prefix={<User className="text-gray-400" size={16} />}
                placeholder="Nhập họ"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="lastName"
              label="Tên"
              rules={[
                { required: true, message: 'Vui lòng nhập tên!' },
                { min: 2, message: 'Tên phải có ít nhất 2 ký tự!' }
              ]}
            >
              <Input 
                placeholder="Nhập tên"
                size="large"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input 
              prefix={<Mail className="text-gray-400" size={16} />}
              placeholder="Nhập email của bạn"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { pattern: /^(0|\+84)[3|5|7|8|9][0-9]{8}$/, message: 'Số điện thoại không hợp lệ!' }
            ]}
          >
            <Input 
              prefix={<Phone className="text-gray-400" size={16} />}
              placeholder="Nhập số điện thoại"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="role"
            label="Bạn là"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select placeholder="Chọn vai trò" size="large">
              <Option value="student">Học sinh</Option>
              <Option value="teacher">Giáo viên</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
              { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số!' }
            ]}
          >
            <Input.Password
              prefix={<Lock className="text-gray-400" size={16} />}
              placeholder="Nhập mật khẩu"
              size="large"
              iconRender={(visible) => 
                visible ? <Eye size={16} /> : <EyeOff size={16} />
              }
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<Lock className="text-gray-400" size={16} />}
              placeholder="Xác nhận mật khẩu"
              size="large"
              iconRender={(visible) => 
                visible ? <Eye size={16} /> : <EyeOff size={16} />
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
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </Button>
          </Form.Item>
        </Form>

        <Divider>Hoặc</Divider>

        <div className="space-y-4">
          <Button 
            size="large" 
            className="w-full h-12 border-gray-300 flex items-center justify-center"
            onClick={handleGoogleRegister}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Đăng ký với Google
          </Button>
        </div>

        <div className="text-center">
          <span className="text-gray-600">Đã có tài khoản? </span>
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
            Đăng nhập ngay
          </Link>
        </div>

        <div className="text-center text-xs text-gray-500">
          Bằng việc đăng ký, bạn đồng ý với <Link to="/terms" className="text-primary-600">Điều khoản sử dụng</Link> và <Link to="/privacy" className="text-primary-600">Chính sách bảo mật</Link> của chúng tôi.
        </div>
      </motion.div>
    </div>
  );
};

export default Register;