/* Home.jsx */
import React, { useEffect, useRef, useState } from "react";
import { Button, Card, Form, Input, Select, message, Skeleton } from "antd";
import { motion, useInView } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  Facebook,
  Calendar,
  Star,
  GraduationCap,
  Users,
  Target,
  Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";
import { courseApi } from "../services/courseApi";

const { Option } = Select;

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slideIdx, setSlideIdx] = useState(0);
  const [teacherIdx, setTeacherIdx] = useState(0);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const heroRef = useRef(null);
  const reasonsRef = useRef(null);
  const bannerRef = useRef(null);
  const coursesRef = useRef(null);
  const ctaFormRef = useRef(null);
  const teachersRef = useRef(null);
  const testimonialsRef = useRef(null);

  const isHeroInView = useInView(heroRef, { once: true });
  const isReasonsInView = useInView(reasonsRef, { once: true });
  const isBannerInView = useInView(bannerRef, { once: true });
  const isCoursesInView = useInView(coursesRef, { once: true });
  const isCtaFormInView = useInView(ctaFormRef, { once: true });
  const isTeachersInView = useInView(teachersRef, { once: true });
  const isTestimonialsInView = useInView(testimonialsRef, { once: true });

  // === HERO SLIDER IMAGES ===
  const HERO_IMAGES = [
    "./realBanner.jpg",
    "./realbanner2.png",
  ];

  // === AUTO SLIDE HERO ===
  useEffect(() => {
    const id = setInterval(() => {
      setSlideIdx((i) => (i + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const nextSlide = () => setSlideIdx((i) => (i + 1) % HERO_IMAGES.length);
  const prevSlide = () => setSlideIdx((i) => (i - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);

  // === DATA ===
  const REASONS = [
    {
      icon: <GraduationCap className="w-12 h-12 text-red-600" />,
      title: "Trung tâm tiếng Trung hàng đầu",
      desc: "Tự hào là trung tâm đầu tiên phong trào đào tạo tiếng Trung chuẩn quốc tế. Cam kết đầu ra chất lượng hàng đầu tại Việt Nam.",
    },
    {
      icon: <Users className="w-12 h-12 text-red-600" />,
      title: "Giảng viên chất lượng, trình độ cao",
      desc: "Đội ngũ giảng viên bản ngữ & Việt Nam có chứng chỉ quốc tế, giàu kinh nghiệm, phương pháp giảng dạy hiện đại, thân thiện.",
    },
    {
      icon: <Target className="w-12 h-12 text-red-600" />,
      title: "Chất lượng đào tạo luôn được nâng cao",
      desc: "SUPER PANDA không ngừng nâng cấp chương trình, công nghệ học tập để mang lại kết quả tốt nhất cho học viên.",
    },
    {
      icon: <Trophy className="w-12 h-12 text-red-600" />,
      title: "Học viên đạt trình độ Hsk3 - Hsk6",
      desc: "Hàng trăm học viên đạt Hks3 – Hks6. SUPER PANDA là bệ phóng cho tương lai của bạn.",
    },
  ];

  const TEACHERS = [
    {
      name: "Lưu Quỳnh Chi",
      title: "Trình độ Hsk6",
      desc: "Nhiều năm giảng dạy Tiếng Trung",
      img: "./LHC.jpg",
    },
    {
      name: "Hoàng Đức Bình",
      title: "Trình độ Hsk6 , Hskk Cao Cấp ",
      desc: "3 năm kinh nghiệm dạy Tiếng Trung Giản Thể và Phồn thể",
      img: "./HDB.jpg",
    },
    {
      name: "Trần Thị Bình ",
      title: "Trình độ Hsk6 , Hskk Cao Cấp",
      desc: "Tốt nghiệp loại giỏi khoa Ngôn Ngữ Trung",
      img: "TTB.jpg",
    },

  ];

  const TESTIMONIALS = [
    {
      name: "Nguyễn Minh Anh",
      level: "IELTS 8.0",
      course: "SV ĐH Bách Khoa",
      quote: "Chỉ sau 3 tháng học tại Super Panda, em đã đạt Hks4",
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600",
      signature: "Minh Anh",
    },
    {
      name: "Trần Đức Huy",
      level: "IELTS 7.5",
      course: "Học viên",
      quote: "Lớp học online nhưng chất lượng như offline. Thầy cô tận tâm, bài giảng dễ hiểu.",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
      signature: "Đức Huy",
    },
    {
      name: "Lê Thị Ngọc",
      level: "IELTS 7.0",
      course: "Học viên",
      quote: "Từ hsk3 lên hsk5 chỉ trong 60 buổi. Super Panda thực sự là nơi thay đổi cuộc đời mình!",
      img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600",
      signature: "Thị Ngọc",
    },
  ];

  // === FETCH COURSES ===
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const { data } = await courseApi.getAllCourses({ page: 1, size: 6 });
        const items = data?.data?.items || [];
        const mapped = items.map((c) => ({
          id: c.id,
          title: c.courseName || c.name,
          desc: c.description || "Khóa học tiếng Trung chất lượng cao",
          img: c.imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
        }));
        setCourses(mapped);
      } catch (err) {
        message.error("Không thể tải khóa học");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // === AUTO SLIDE TEACHER & TESTIMONIAL ===
  useEffect(() => {
    const id = setInterval(() => {
      setTeacherIdx((i) => (i + 1) % TEACHERS.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const nextTeacher = () => setTeacherIdx((i) => (i + 1) % TEACHERS.length);
  const prevTeacher = () => setTeacherIdx((i) => (i - 1 + TEACHERS.length) % TEACHERS.length);
  const nextTestimonial = () => setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length);
  const prevTestimonial = () => setTestimonialIdx((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  // === ANIMATION ===
  const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } };
  const item = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-white">
      {/* === HERO SLIDER === */}
      <section ref={heroRef} className="relative h-[65vh] md:h-[75vh] overflow-hidden">
      {HERO_IMAGES.map((img, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === slideIdx ? "opacity-100" : "opacity-0"
              }`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        ))}

        <button onClick={prevSlide} className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 z-10">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button onClick={nextSlide} className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 z-10">
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {HERO_IMAGES.map((_, i) => (
            <button key={i} onClick={() => setSlideIdx(i)} className={`w-3 h-3 rounded-full transition-all ${i === slideIdx ? "bg-white w-8" : "bg-white/50"}`} />
          ))}
        </div>
      </section>

      {/* === LÝ DO NÊN CHỌN === */}
      <section ref={reasonsRef} className="py-20 bg-gradient-to-b from-red-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 initial={{ opacity: 0, y: 30 }} animate={isReasonsInView ? { opacity: 1, y: 0 } : {}} className="text-4xl md:text-5xl font-bold text-center text-red-900 mb-16">
            LÝ DO NÊN CHỌN TIẾNG TRUNG SUPER PANDA
          </motion.h2>
          <motion.div variants={container} initial="hidden" animate={isReasonsInView ? "visible" : "hidden"} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {REASONS.map((r, i) => (
              <motion.div key={i} variants={item} className="text-cente r">
                <div className="flex justify-center mb-4">{r.icon}</div>
                <h3 className="text-xl text-center font-bold text-gray-900 mb-3">{r.title}</h3>
                <p className="text-gray-600 leading-relaxed">{r.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* === BANNER GIÁO TRÌNH === */}
      <section ref={bannerRef} className="py-16 bg-red-900">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={isBannerInView ? { opacity: 1, scale: 1 } : {}}>
            <p className="text-white text-xl mb-4">MUA SÁCH GIÁO TRÌNH TIẾNG TRUNG </p>
            <Button className="bg-white text-red-900 font-bold px-12 py-6 rounded-full text-lg">TẠI ĐÂY</Button>
          </motion.div>
        </div>
      </section>

      {/* === CÁC KHÓA HỌC === */}
      <section ref={coursesRef} className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 initial={{ opacity: 0, y: 30 }} animate={isCoursesInView ? { opacity: 1, y: 0 } : {}} className="text-4xl md:text-5xl font-bold text-center text-red-900 mb-16">
            CÁC KHÓA HỌC TIẾNG TRUNG TẠI SUPER PANDA
          </motion.h2>
          {loading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden rounded-2xl shadow-lg">
                  <Skeleton.Image active className="!h-64 !w-full" />
                  <div className="p-6"><Skeleton active /></div>
                </Card>
              ))}
            </div>
          ) : (
            <motion.div variants={container} initial="hidden" animate={isCoursesInView ? "visible" : "hidden"} className="grid md:grid-cols-3 gap-8">
              {courses.slice(0, 3).map((c, i) => (
                <motion.div key={i} variants={item} whileHover={{ y: -10 }}>
                  <Link to={`/courses/${c.id}`}>
                    <Card className="overflow-hidden rounded-2xl shadow-xl border-0">
                      <img src={c.img} alt={c.title} className="w-full h-64 object-cover rounded-t-2xl" />
                      <div className="p-6">
                        <h3 className="text-2xl font-bold text-red-900 mb-3">{c.title}</h3>
                        <p className="text-gray-600">{c.desc}</p>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* === CTA FORM === */}
      <section ref={ctaFormRef} className="py-20 bg-gradient-to-r from-red-900 to-red-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={isCtaFormInView ? { opacity: 1, x: 0 } : {}}>
              <h2 className="text-5xl font-bold text-white mb-6">
                TỪ CƠ BẢN
                <span className="block text-yellow-400">ĐẾN NÂNG CAO</span>
              </h2>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 inline-block">
                <p className="text-white font-bold text-xl">LỘ TRÌNH HỌC TÍCH HỢP THEO CHUẨN HSK</p>
              </div>
              <p className="text-red-100 mt-4">CHINH PHỤC HSK – MỞ RA CÁNH CỬA TƯƠNG LAI</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} animate={isCtaFormInView ? { opacity: 1, x: 0 } : {}}>
              <Card className="bg-white/10 backdrop-blur-md border-0 p-6">
                <Form layout="vertical">
                  <Form.Item label={<span className="text-white font-semibold">Tên của bạn (bắt buộc)</span>}>
                    <Input className="h-12 rounded-lg" />
                  </Form.Item>
                  <Form.Item label={<span className="text-white font-semibold">Số điện thoại (bắt buộc)</span>}>
                    <Input className="h-12 rounded-lg" />
                  </Form.Item>
                  <Form.Item label={<span className="text-white font-semibold">Email (bắt buộc)</span>}>
                    <Input className="h-12 rounded-lg" />
                  </Form.Item>
                  <Form.Item label={<span className="text-white font-semibold">Mục tiêu HSK</span>}>
                    <Select className="h-12 rounded-lg w-full">
                      <Option value="3">Hsk3</Option>
                      <Option value="4">Hsk4</Option>
                      <Option value="5">Hsk5</Option>
                      <Option value="6">Hsk6</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label={<span className="text-white font-semibold">Hình thức học</span>}>
                    <Select className="h-12 rounded-lg w-full">
                      <Option value="online">Online</Option>
                      <Option value="offline">Offline</Option>
                    </Select>
                  </Form.Item>
                  <Button className="w-full bg-yellow-400 text-red-900 h-14 text-lg font-bold rounded-lg hover:bg-yellow-300">
                    ĐĂNG KÝ TƯ VẤN MIỄN PHÍ
                  </Button>
                </Form>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* === GIẢNG VIÊN – 3 NGƯỜI, LAYOUT ĐẸP === */}
      <section ref={teachersRef} className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isTeachersInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-black text-center text-red-900 mb-24 tracking-tight "
          >
            GIẢNG VIÊN TẠI SUPER PANDA
          </motion.h2>

          {/* Grid giảng viên – 1 / 2 / 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {TEACHERS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={isTeachersInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="relative"
              >
                {/* Card */}
                <div className="relative bg-white p-8 rounded-2xl shadow-xl text-center border border-red-200">

                  {/* Avatar */}
                  <div className="relative mx-auto w-48 h-48 -mt-20 mb-4">
                    <div className="w-full h-full rounded-2xl overflow-hidden border-4 border-red-300 shadow-lg">
                      <img
                        src={t.img}
                        alt={t.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Tên */}
                  <h3 className="text-xl font-extrabold text-red-900 tracking-tight">
                    {t.name}
                  </h3>

                  {/* Chức danh */}
                  <p className="text-red-600 font-bold text-sm mt-1 leading-tight">
                    {t.title}
                  </p>

                  {/* Mô tả */}
                  <p className="text-gray-700 font-medium text-sm mt-3 leading-relaxed">
                    {t.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === CẢM NHẬN HỌC VIÊN – SLIDER GIẤY NHĂN === */}
      <section ref={testimonialsRef} className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isTestimonialsInView ? { opacity: 1, y: 0 } : {}}
            className="text-4xl md:text-5xl font-bold text-center text-red-900 mb-6"
          >
            CẢM NHẬN CỦA HỌC VIÊN
          </motion.h2>

          <div className="relative">
            <div className="overflow-hidden py-10">
              <motion.div
                animate={{ x: `-${testimonialIdx * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex"
              >
                {TESTIMONIALS.map((t, i) => (
                  <div key={i} className="w-full flex-shrink-0 px-8">
                    <motion.div
                      whileHover={{ rotate: 0, scale: 1.02 }}
                      initial={{ rotate: i % 2 === 0 ? -2 : 2 }}
                      className="bg-white p-8 rounded-2xl shadow-2xl mx-auto max-w-2xl"
                      style={{
                        backgroundSize: "100% 100%",
                      }}
                    >
                      <div className="flex flex-col items-center text-center space-y-6">
                        <img
                          src={t.img}
                          alt={t.name}
                          className="w-32 h-32 rounded-full object-cover border-4 border-red-600 shadow-lg"
                        />
                        <div>
                          <p className="text-3xl font-bold text-red-600 mb-1">{t.level}</p>
                          <p className="text-xl font-semibold text-gray-900">{t.name}</p>
                          <p className="text-sm text-gray-600 italic">{t.course}</p>
                        </div>
                        <p className="text-gray-700 italic leading-relaxed text-lg">"{t.quote}"</p>
                        <div className="text-red-600 font-signature text-2xl">— {t.signature}</div>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </motion.div>
            </div>

            <button onClick={prevTestimonial} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-xl z-20">
              <ChevronLeft className="w-6 h-6 text-red-600" />
            </button>
            <button onClick={nextTestimonial} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-xl z-20">
              <ChevronRight className="w-6 h-6 text-red-600" />
            </button>

            <div className="flex justify-center gap-2 mt-8">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === testimonialIdx ? "bg-red-600 w-8" : "bg-gray-300"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

     

      {/* === FLOATING BUTTONS === */}
      <div className="fixed bottom-6 left-6 flex flex-col gap-3 z-50">
        <a href="https://zalo.me/0369960429" className="bg-green-500 text-white p-4 rounded-full shadow-lg flex items-center gap-2 hover:scale-110 transition-transform">
          <MessageCircle className="w-5 h-5" /> Chat Zalo
        </a>
        <a href="https://www.facebook.com/profile.php?id=61551807950988&locale=vi_VN" className="bg-blue-600 text-white p-4 rounded-full shadow-lg flex items-center gap-2 hover:scale-110 transition-transform">
          <Facebook className="w-5 h-5" /> Chat Facebook
        </a>
        <a href="tel:0931715889" className="bg-red-600 text-white p-4 rounded-full shadow-lg flex items-center gap-2 hover:scale-110 transition-transform">
          <Phone className="w-5 h-5" /> Hotline: 0931715889
        </a>
      </div>

      {/* Custom Font Signature */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        .font-signature {
          font-family: 'Dancing Script', cursive;
        }
      `}</style>
    </div>
  );
};

export default Home;