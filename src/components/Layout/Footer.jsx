import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary-400" />
              <span className="text-xl font-bold">EnglishMaster</span>
            </div>
            <p className="text-gray-400">
              Nền tảng học tiếng Anh trực tuyến hàng đầu Việt Nam với phương pháp giảng dạy hiện đại và hiệu quả.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center text-gray-400">
                <Phone className="w-4 h-4 mr-2" />
                <span>1900 1234</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/courses" className="hover:text-white transition-colors">Khóa học</Link></li>
              <li><Link to="/leaderboard" className="hover:text-white transition-colors">Bảng xếp hạng</Link></li>
              <li><Link to="/forum" className="hover:text-white transition-colors">Diễn đàn</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Về chúng tôi</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/help" className="hover:text-white transition-colors">Trung tâm trợ giúp</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Liên hệ</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Chính sách bảo mật</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Điều khoản sử dụng</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-3" />
                <span>support@englishmaster.edu.vn</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-3" />
                <span>+84 1900 1234</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-3" />
                <span>123 Nguyễn Văn Linh, Quận 7, TP.HCM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 EnglishMaster. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;