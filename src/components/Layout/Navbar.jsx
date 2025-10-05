import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  Trophy, 
  User, 
  LogOut, 
  Menu, 
  X,
  Shield
} from 'lucide-react';
import { Dropdown, Button } from 'antd';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <User size={16} />,
      label: <Link to="/profile">Hồ sơ</Link>,
    },
    {
      key: 'logout',
      icon: <LogOut size={16} />,
      label: <span onClick={handleLogout}>Đăng xuất</span>,
    },
  ];

  if (user?.role === 'admin') {
    userMenuItems.unshift({
      key: 'admin',
      icon: <Shield size={16} />,
      label: <Link to="/admin">Quản trị</Link>,
    });
  }

  if (user?.role === 'teacher') {
    userMenuItems.unshift({
      key: 'teacher',
      icon: <Users size={16} />,
      label: <Link to="/teacher">Giáo viên</Link>,
    });
  }

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white shadow-lg sticky top-0 z-50"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <BookOpen className="h-8 w-8 text-primary-600" />
            <Link to="/" className="text-xl font-bold text-primary-600">
              EnglishMaster
            </Link>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/courses" 
              className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
            >
              Khóa học
            </Link>
            <Link 
              to="/student/classes" 
              className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
            >
              Lớp học của tôi
            </Link>
            <Link 
              to="/leaderboard" 
              className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
            >
              <Trophy className="inline w-4 h-4 mr-1" />
              Bảng xếp hạng
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                  <Button type="text" className="flex items-center space-x-2">
                    <User size={16} />
                    <span>{user.name}</span>
                  </Button>
                </Dropdown>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button type="text">Đăng nhập</Button>
                </Link>
                <Link to="/register">
                  <Button type="primary">Đăng ký</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="md:hidden py-4 border-t"
          >
            <div className="flex flex-col space-y-4">
              <Link 
                to="/courses" 
                className="text-gray-700 hover:text-primary-600"
                onClick={() => setIsOpen(false)}
              >
                Khóa học
              </Link>
              <Link 
              to="/student/classes" 
              className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
            >
              Lớp học của tôi
            </Link>
              <Link 
                to="/leaderboard" 
                className="text-gray-700 hover:text-primary-600"
                onClick={() => setIsOpen(false)}
              >
                Bảng xếp hạng
              </Link>
              
              {user ? (
                <>
                  <Link 
                    to="/profile" 
                    className="text-gray-700 hover:text-primary-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Hồ sơ
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-left text-gray-700 hover:text-primary-600"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-gray-700 hover:text-primary-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link 
                    to="/register" 
                    className="text-gray-700 hover:text-primary-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;