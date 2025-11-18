// src/pages/AboutUs.jsx
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Users, Trophy, Heart, Target, Sparkles, Globe, BookOpen, Award, Flame, Star, School, UsersRound 
} from "lucide-react";

// Thay logo của bạn ở đây (đã đổi thành logo chính thức Super Panda)

// 5 hình ảnh trung tâm – bạn chỉ cần đặt vào thư mục public/images/center/
const centerImages = [
  "/about1.jpg",
  "/about2.jpg",
  "/about3.jpg",
];

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 overflow-hidden">
      {/* Hero Section - Super Panda */}
      <section className="relative pt-20 pb-32">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img 
              src="logoRM.png"
              alt="Super Panda Logo" 
              className="mx-auto h-32 w-32 object-contain rounded-3xl shadow-2xl bg-white p-5 mb-8 border-4 border-red-200"
            />
            <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-red-600 via-rose-600 to-red-700 bg-clip-text text-transparent mb-6">
              Super Panda – Chúng Tôi Là Ai?
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-5xl mx-auto leading-relaxed font-medium">
              Hệ thống học tiếng Anh trực tuyến & trung tâm hàng đầu Việt Nam<br />
              <span className="text-red-600 font-bold">Nơi gấu trúc đỏ giúp bạn nói tiếng Anh như người bản xứ!</span>
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="mt-16 flex flex-wrap justify-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {[
              { icon: UsersRound, number: "68,000+", label: "Panda Learners" },
              { icon: Trophy, number: "Top 3", label: "App Tiếng Anh VN 2025" },
              { icon: Flame, number: "42 ngày", label: "Streak kỷ lục" },
              { icon: Star, number: "4.95", label: "Đánh giá App Store" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.12, rotate: 2 }}
                className="bg-white rounded-3xl shadow-2xl p-8 min-w-56 border-2 border-red-200 hover:border-red-500 transition-all"
              >
                <stat.icon className="w-14 h-14 text-red-600 mx-auto mb-4" />
                <div className="text-4xl font-extrabold text-red-600">{stat.number}</div>
                <div className="text-gray-700 font-bold text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Hình ảnh trung tâm thực tế */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-extrabold bg-gradient-to-r from-red-600 to-rose-700 bg-clip-text text-transparent">
              Không Gian Học Tập Thực Tế Tại Super Panda
            </h2>
            <p className="text-xl text-gray-600 mt-4">Học online kết hợp offline – hiệu quả gấp đôi!</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {centerImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="group relative overflow-hidden rounded-3xl shadow-xl"
              >
                <img 
                  src={img} 
                  alt={`Super Panda Center ${i+1}`}
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <div className="text-white">
                    <School className="w-8 h-8 mb-2" />
                    <p className="text-xl font-bold">Trung tâm Super Panda</p>
                    <p className="text-sm opacity-90">Mặt hồ tân xã , thạch thất hà nội</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-gradient-to-br from-red-600 to-rose-700 rounded-3xl p-12 text-white shadow-2xl">
                <Target className="w-20 h-20 mb-8" />
                <h2 className="text-5xl font-extrabold mb-8">Sứ Mệnh</h2>
                <p className="text-xl leading-relaxed opacity-95">
                  Giúp <strong>1 triệu người Việt</strong> nói tiếng Anh tự tin như người bản xứ trước 2030 — 
                  bằng phương pháp học vui như chơi, nhớ lâu như khắc vào não!
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-gradient-to-br from-rose-600 to-red-700 rounded-3xl p-12 text-white shadow-2xl">
                <Sparkles className="w-20 h-20 mb-8" />
                <h2 className="text-5xl font-extrabold mb-8">Tầm Nhìn</h2>
                <p className="text-xl leading-relaxed opacity-95">
                  Trở thành biểu tượng giáo dục Việt Nam — như <strong>Duolingo của Việt Nam</strong>, 
                  nhưng <strong>gần gũi hơn, hiệu quả hơn, và có trái tim Việt</strong>.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Giá trị cốt lõi */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-5xl font-extrabold bg-gradient-to-r from-red-600 to-rose-700 bg-clip-text text-transparent mb-20"
          >
            Giá Trị Cốt Lõi Của Super Panda
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: Heart, title: "Yêu thương như gia đình", desc: "Mỗi học viên là một người thân — chúng tôi không bỏ rơi ai." },
              { icon: BookOpen, title: "Học vui – Nhớ lâu", desc: "Dùng trò chơi, âm nhạc, phim ảnh — biến tiếng Anh thành niềm vui." },
              { icon: Award, title: "Kết quả thực sự", desc: "Hàng nghìn học viên đạt IELTS 7.5+, nói tiếng Anh trôi chảy sau 6 tháng." },
            ].map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -15 }}
                className="bg-gradient-to-br from-red-50 to-rose-50 rounded-3xl p-10 shadow-xl border-2 border-red-200 hover:border-red-500 transition-all"
              >
                <v.icon className="w-20 h-20 text-red-600 mx-auto mb-6" />
                <h3 className="text-2xl font-extrabold text-gray-800 mb-4">{v.title}</h3>
                <p className="text-gray-700 text-lg leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Cuối */}
      <section className="py-32 text-center bg-gradient-to-b from-transparent to-red-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="max-w-5xl mx-auto px-6"
        >
          <h2 className="text-5xl md:text-7xl font-extrabold text-gray-800 mb-8">
            Bạn Đã Sẵn Sàng Trở Thành <span className="text-red-600">Super Panda</span> Chưa?
          </h2>
          <p className="text-2xl text-gray-700 mb-12">
            Hành trình chinh phục tiếng Anh bắt đầu ngay hôm nay — cùng gấu trúc đỏ!
          </p>

          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            <Link to="/register">
              <button className="px-16 py-8 bg-gradient-to-r from-red-600 to-rose-600 text-white text-2xl font-extrabold rounded-full shadow-2xl hover:shadow-red-600/60 transform hover:scale-110 transition-all duration-300">
                Bắt Đầu Học Miễn Phí!
              </button>
            </Link>
            <Link to="/leaderboard">
              <button className="px-16 py-8 bg-white text-red-600 border-4 border-red-600 text-2xl font-extrabold rounded-full shadow-2xl hover:bg-red-50 transform hover:scale-110 transition-all duration-300">
                Xem Top Panda
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

   
    </div>
  );
};

export default AboutUs;