import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  Trophy,
  User,
  LogOut,
  Menu,
  X,
  Shield,
  Building2
} from "lucide-react";
import { Dropdown, Button } from "antd";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <User size={16} />,
      label: <Link to="/profile">Hồ sơ</Link>,
    },
    {
      key: "logout",
      icon: <LogOut size={16} />,
      label: <span onClick={handleLogout}>Đăng xuất</span>,
    },
  ];

  if (user?.role === 0) {
    userMenuItems.unshift({
      key: "admin",
      icon: <Shield size={16} />,
      label: <Link to="/admin">Quản trị</Link>,
    });
  }

  if (user?.role === 2) {
    userMenuItems.unshift({
      key: "teacher",
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
        <div className="flex justify-around items-center h-28">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2  "
          >
            <Link
              to="/"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img src="/PanadLogo.png" alt="" className="w-24 h-24" />
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  marginLeft: "10px",
                }}
                className="text-red-800"
              >
                Super Panda
              </h2>
            </Link>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/courses"
              className="text-red-800 hover:text-red-600 transition-colors duration-200 font-medium"
            >
              Khóa học
            </Link>
            {user?.role === 1 && (
              <Link
                to="/exams"
                className="text-red-800 hover:text-red-600 transition-colors duration-200 font-medium"
              >
                Bài thi
              </Link>
            )}
            {user?.role === 1 && (
              <Link
                to="/student/classes"
                className="text-red-800 hover:text-red-600 transition-colors duration-200 font-medium"
              >
                Lớp học của tôi
              </Link>
            )}
            {user?.role === 1 && (
              <Link
                to="/leaderboard"
                className="text-red-800 hover:text-red-600 transition-colors duration-200 font-medium"
              >
                <Trophy className="inline w-4 h-4 mr-1" />
                Bảng xếp hạng
              </Link>
            )}
            {user?.role === 1 && (
              <Link
                to="/about"
                className="text-red-800 hover:text-red-600 transition-colors duration-200 font-medium"
              >
                <Building2 className="inline w-4 h-4 mr-1" />
                Về Chúng Tôi
              </Link>
            )}
            {user ? (
              <div className="flex items-center space-x-4">
                <Dropdown
                  menu={{ items: userMenuItems }}
                  placement="bottomRight"
                >
                  <Button type="text" className="flex items-center space-x-2">
                    <User size={16} />
                    <span>{user.firstName + " " + user.lastName}</span>
                  </Button>
                </Dropdown>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
              <Link
                to="/leaderboard"
                className="text-red-800 hover:text-red-600 transition-colors duration-200 font-medium"
              >
                <Trophy className="inline w-4 h-4 mr-1" />
                Bảng xếp hạng
              </Link>
              <Link
                to="/about"
                className="text-red-800 hover:text-red-600 transition-colors duration-200 font-medium"
              >
                <Building2 className="inline w-4 h-4 mr-1" />
                Về Chúng Tôi
              </Link>
                <Link to="/login">
                  <Button type="text">Đăng nhập</Button>
                </Link>
                <Link to="/register">
                  <Button  className="bg-red-600 border-none hover:bg-red-700" type="primary">Đăng ký</Button>
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

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
