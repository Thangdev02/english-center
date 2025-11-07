import { Button, Card, message, Skeleton } from "antd";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  Award,
  BookOpen,
  Clock,
  Globe,
  Heart,
  PlayCircle,
  Shield,
  Smartphone,
  Star,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { courseApi } from "../services/courseApi";

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const coursesRef = useRef(null);
  const ctaRef = useRef(null);

  const isHeroInView = useInView(heroRef, { once: true });
  const isStatsInView = useInView(statsRef, { once: true });
  const isFeaturesInView = useInView(featuresRef, { once: true });
  const isCoursesInView = useInView(coursesRef, { once: true });
  const isCtaInView = useInView(ctaRef, { once: true });

  const [features] = useState([
    {
      icon: <BookOpen className="h-16 w-16 text-primary-600" />,
      title: "Lộ trình cá nhân hóa",
      description:
        "Hệ thống AI thiết kế lộ trình học tập phù hợp với trình độ và mục tiêu của bạn",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Users className="h-16 w-16 text-primary-600" />,
      title: "Giáo viên hàng đầu",
      description:
        "Đội ngũ giảng viên bản ngữ và Việt Nam với chứng chỉ quốc tế và kinh nghiệm giảng dạy",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: <Trophy className="h-16 w-16 text-primary-600" />,
      title: "Học tập tương tác",
      description:
        "Công nghệ Gamification biến mỗi bài học thành trải nghiệm thú vị và đầy cảm hứng",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: <Globe className="h-16 w-16 text-primary-600" />,
      title: "Môi trường quốc tế",
      description:
        "Kết nối với cộng đồng học viên toàn cầu và thực hành trong môi trường đa văn hóa",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: <Shield className="h-16 w-16 text-primary-600" />,
      title: "Cam kết chất lượng",
      description:
        "Hoàn tiền 100% nếu không đạt kết quả như cam kết sau khóa học",
      gradient: "from-indigo-500 to-blue-500",
    },
    {
      icon: <Smartphone className="h-16 w-16 text-primary-600" />,
      title: "Học mọi lúc mọi nơi",
      description:
        "Ứng dụng di động thông minh cho phép học offline và đồng bộ dữ liệu đa thiết bị",
      gradient: "from-rose-500 to-orange-500",
    },
  ]);

  const [stats] = useState([
    {
      number: "50.000+",
      label: "Học viên thành công",
      icon: <Users className="w-8 h-8" />,
    },
    {
      number: "95%",
      label: "Hài lòng với khóa học",
      icon: <Heart className="w-8 h-8" />,
    },
    {
      number: "500+",
      label: "Giờ học chất lượng",
      icon: <Clock className="w-8 h-8" />,
    },
    {
      number: "4.9/5",
      label: "Đánh giá trung bình",
      icon: <Star className="w-8 h-8" />,
    },
  ]);

  useEffect(() => {
    const fetchPopularCourses = async () => {
      try {
        setLoading(true);
        const response = await courseApi.getAllCourses({
          page: 1,
          size: 3,
        });

        const items = response.data?.data?.items || [];
        const popularCourses = items.map((course) => ({
          id: course.id,
          courseId: course.courseId,
          title: course.courseName || course.name,
          level: course.level,
          teacher: course.teacher
            ? `${course.teacher.firstName} ${course.teacher.lastName}`
            : "Chưa có giáo viên",
          image:
            course.imageUrl ||
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
          description: course.description || "Khóa học chất lượng cao",
          duration: course.duration,
          isActive: course.isActive,
        }));
        setCourses(popularCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
        message.error("Không thể tải danh sách khóa học");
      } finally {
        setLoading(false);
      }
    };

    fetchPopularCourses();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <div className="min-h-screen bg-white">
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-0 left-0 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-secondary-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              <span className="text-primary-100 font-medium">
                Nền tảng học tiếng Anh số 1 Việt Nam
              </span>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-tight">
              Master
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                English
              </span>
            </h1>

            <p className="text-2xl md:text-3xl mb-8 text-primary-100 max-w-4xl mx-auto leading-relaxed">
              Khám phá thế giới với tiếng Anh -{" "}
              <span className="font-semibold text-white">
                Hệ thống học tập thông minh
              </span>{" "}
              với công nghệ AI tiên tiến
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Link to="/courses">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="large"
                    type="primary"
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 border-0 font-bold h-14 px-10 text-lg shadow-2xl"
                  >
                    <PlayCircle className="inline w-6 h-6 mr-3" />
                    Bắt đầu học ngay
                  </Button>
                </motion.div>
              </Link>
              <Link to="/register">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="large"
                    className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 hover:border-white/50 h-14 px-10 text-lg font-semibold"
                  >
                    Đăng ký miễn phí
                  </Button>
                </motion.div>
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {stat.number}
                  </div>
                  <div className="text-primary-200 text-sm">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      <section
        ref={statsRef}
        className="py-20 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isStatsInView ? { opacity: 1, y: 0 } : {}}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex justify-center mb-4 text-primary-600">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section ref={featuresRef} className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isFeaturesInView ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-50 text-primary-600 font-semibold mb-6">
              <Award className="w-4 h-4 mr-2" />
              Tính năng nổi bật
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Trải nghiệm học tập
              <span className="block bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Đột phá
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Công nghệ học tập thế hệ mới kết hợp phương pháp giảng dạy tiên
              tiến mang đến hiệu quả vượt trội
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isFeaturesInView ? "visible" : "hidden"}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                <Card
                  className="text-center border-0 shadow-xl hover:shadow-2xl transition-all duration-500 h-full bg-gradient-to-br from-white to-gray-50 group-hover:from-white group-hover:to-primary-50"
                  bodyStyle={{ padding: "3rem 2rem" }}
                >
                  <div
                    className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section
        ref={coursesRef}
        className="py-20 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isCoursesInView ? { opacity: 1, y: 0 } : {}}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16"
          >
            <div className="max-w-2xl">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-50 text-yellow-600 font-semibold mb-4">
                <TrendingUp className="w-4 h-4 mr-2" />
                Khóa học được yêu thích
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-4">
                Khám phá
                <span className="block bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  Khóa học nổi bật
                </span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Các khóa học được thiết kế chuyên sâu bởi đội ngũ chuyên gia với
                phương pháp giảng dạy hiện đại
              </p>
            </div>
            <Link to="/courses">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="primary"
                  size="large"
                  className="h-12 px-8 font-semibold mt-6 lg:mt-0"
                >
                  Xem tất cả khóa học
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Card key={item} className="shadow-lg border-0 overflow-hidden">
                  <Skeleton.Image active className="!w-full !h-48" />
                  <div className="p-6">
                    <Skeleton active paragraph={{ rows: 3 }} />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={isCoursesInView ? "visible" : "hidden"}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {courses.map((course) => (
                <motion.div
                  key={course.id}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <Card
                    cover={
                      <div className="relative overflow-hidden">
                        <img
                          alt={course.title}
                          src={course.image}
                          className="h-52 w-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/400x300?text=Course+Image";
                          }}
                        />
                        <div className="absolute top-4 left-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              course.level === 0
                                ? "bg-green-100 text-green-800"
                                : course.level === 1
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {course.level === 0
                              ? "Beginner"
                              : course.level === 1
                              ? "Intermediate"
                              : "Advanced"}
                          </span>
                        </div>
                        {!course.isActive && (
                          <div className="absolute top-4 right-4">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                              Không hoạt động
                            </span>
                          </div>
                        )}
                      </div>
                    }
                    className="shadow-xl hover:shadow-2xl transition-all duration-500 border-0 overflow-hidden"
                    actions={[
                      <Link
                        to={`/courses/${course.courseId || course.id}`}
                        key="view"
                      >
                        <Button
                          type="primary"
                          size="large"
                          className="w-full font-semibold"
                        >
                          Xem chi tiết
                        </Button>
                      </Link>,
                    ]}
                  >
                    <div className="p-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {course.title}
                      </h3>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {course.description}
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {course.duration}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {course.teacher}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {!loading && courses.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-gray-300 text-8xl mb-6">📚</div>
              <h3 className="text-2xl font-semibold text-gray-600 mb-4">
                Đang cập nhật khóa học
              </h3>
              <p className="text-gray-500 text-lg max-w-md mx-auto">
                Chúng tôi đang chuẩn bị những khóa học chất lượng nhất cho bạn.
                Hãy quay lại sau nhé!
              </p>
            </motion.div>
          )}
        </div>
      </section>

      <section
        ref={ctaRef}
        className="py-20 bg-gradient-to-r from-primary-600 to-primary-800"
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isCtaInView ? { opacity: 1, y: 0 } : {}}
            className="text-center text-white max-w-4xl mx-auto"
          >
            <h2 className="text-5xl font-bold mb-6">
              Sẵn sàng chinh phục
              <span className="block text-yellow-300">Tiếng Anh?</span>
            </h2>
            <p className="text-xl text-primary-100 mb-10 leading-relaxed">
              Tham gia cộng đồng 50.000+ học viên đã thành công với
              EnglishMaster. Bắt đầu hành trình của bạn ngay hôm nay!
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/register">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="large"
                    className="bg-white text-primary-600 hover:bg-gray-100 border-0 font-bold h-14 px-12 text-lg shadow-2xl"
                  >
                    Đăng ký học thử miễn phí
                  </Button>
                </motion.div>
              </Link>
              <Link to="/courses">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="large"
                    className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-primary-600 h-14 px-12 text-lg font-semibold"
                  >
                    Xem lộ trình học
                  </Button>
                </motion.div>
              </Link>
            </div>
            <p className="text-primary-200 mt-6">
              ⚡ Học thử 7 ngày miễn phí • Hoàn tiền 100% nếu không hài lòng
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
