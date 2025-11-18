import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence,motion } from "framer-motion";
import {
  Card,
  Input,
  Select,
  Button,
  Tag,
  Skeleton,
  message,
  Pagination,
} from "antd";
import { Search, Filter, BookOpen, Users, Star, Clock } from "lucide-react";
import { courseApi } from "../../services/courseApi";

const { Search: AntSearch } = Input;
const { Option } = Select;

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const pageSize = 10;

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        size: pageSize,
      };

      if (searchTerm) {
        params.name = searchTerm;
      }

      if (levelFilter !== "all") {
        params.level =
          levelFilter === "beginner"
            ? 0
            : levelFilter === "intermediate"
            ? 1
            : 2;
      }

      const response = await courseApi.getAllCourses(params);
      const items = response.data?.data?.items || [];

      const coursesData = items.map((course) => ({
        id: course.id,
        courseId: course.courseId,
        title: course.courseName || course.name,
        description: course.description || "Khóa học chất lượng cao",
        image:
          course.imageUrl ||
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
        level: course.level,
        duration: course.duration,
        isActive: course.isActive,
        teacher: course.teacher
          ? `${course.teacher.firstName} ${course.teacher.lastName}`
          : "Chưa có giáo viên",
        teacherId: course.teacherAccountId,
        rating: (4 + Math.random()).toFixed(1),
        students: Math.floor(Math.random() * 2000) + 100,
      }));

      setCourses(coursesData);
      setTotalCourses(response.data?.data?.total || 0);
    } catch (error) {
      console.error("Error fetching courses:", error);
      message.error("Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, levelFilter]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleLevelChange = (value) => {
    setLevelFilter(value);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchTerm("");
    setLevelFilter("all");
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton.Input active size="large" className="!w-64 !h-12 mx-auto mb-4" />
            <Skeleton.Input active size="default" className="!w-96 !h-6 mx-auto" />
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-red-100">
            <Skeleton active paragraph={{ rows: 1 }} />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card key={item} className="shadow-lg border-0 rounded-2xl overflow-hidden">
                <Skeleton.Image active className="!w-full !h-48" />
                <div className="p-4"><Skeleton active paragraph={{ rows: 4 }} /></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-red-900 mb-4 tracking-tight">
            KHÓA HỌC TIẾNG ANH SUPER PANDA
          </h1>
          <p className="text-xl text-red-700 max-w-3xl mx-auto font-medium">
            Hơn 50+ khóa học IELTS từ 4.0 → 8.5+ – Cam kết đầu ra bằng văn bản
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-gradient-to-r from-red-50 to-white rounded-2xl shadow-xl p-6 mb-10 border border-red-100">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <AntSearch
                placeholder="Tìm khóa học: IELTS Writing, Speaking, 7.0+..."
                prefix={<Search className="text-red-600" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={handleSearch}
                size="large"
                allowClear
                className="font-medium"
                style={{ height: '48px' }}
              />
            </div>

            <Select
              value={levelFilter}
              onChange={handleLevelChange}
              size="large"
              className="w-full lg:w-56"
              style={{ height: '48px' }}
            >
              <Option value="all">
                <span className="font-medium">Tất cả trình độ</span>
              </Option>
              <Option value="beginner"> Beginner (0 → 4.0)</Option>
              <Option value="intermediate"> Intermediate (4.0 → 6.0)</Option>
              <Option value="advanced"> Advanced (6.0+)</Option>
            </Select>

            <Button
              type="default"
              icon={<Filter size={18} />}
              onClick={handleReset}
              size="large"
              className="border-red-600 text-red-600 hover:bg-red-50 font-medium h-12"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Course Grid */}
        <AnimatePresence>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -12 }}
                className="group"
              >
                <Card
                  cover={
                    <div className="relative overflow-hidden rounded-t-2xl">
                      <img
                        alt={course.title}
                        src={course.image}
                        className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      {course.students > 1000 && (
                        <Tag className="absolute top-4 left-4 bg-red-600 text-white border-0 font-bold px-3 py-1 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400" />
                          BESTSELLER
                        </Tag>
                      )}
                    </div>
                  }
                  className="shadow-xl hover:shadow-2xl transition-all duration-500 h-full border-0 rounded-2xl overflow-hidden bg-white"
                  actions={[
                    <Link
                      to={`/courses/${course.courseId || course.id}`}
                      key="view"
                      className="flex justify-center"
                    >
                      <Button
                        type="primary"
                        size="large"
                        className="bg-red-600 hover:bg-red-700 text-white font-bold h-12 px-8 rounded-xl border-0 shadow-md"
                      >
                       Xem chi tiết
                      </Button>
                    </Link>,
                  ]}
                >
                  <div className="space-y-3 p-2">
                    <h3 className="font-bold text-xl text-red-900 line-clamp-2 group-hover:text-red-700 transition-colors">
                      {course.title}
                    </h3>

                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="flex items-center text-sm text-red-600 font-medium">
                      <BookOpen className="w-4 h-4 mr-1" />
                      <span>{course.teacher}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center text-yellow-600 font-bold">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="ml-1">{course.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-red-100">
                      <Tag
                        color={
                          course.level === 0
                            ? "green"
                            : course.level === 1
                            ? "blue"
                            : "volcano"
                        }
                        className="font-bold text-xs border-0 px-3 py-1"
                      >
                        {course.level === 0
                          ? "BEGINNER"
                          : course.level === 1
                          ? "INTERMEDIATE"
                          : "ADVANCED"}
                      </Tag>
                      {course.students > 500 && (
                        <span className="text-xs text-red-600 font-bold">
                          {course.students.toLocaleString()}+ học viên
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {/* Empty State */}
        {courses.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="text-red-200 text-8xl mb-6">Book</div>
            <h3 className="text-2xl font-bold text-red-900 mb-3">
              Không tìm thấy khóa học
            </h3>
            <p className="text-red-600 max-w-md mx-auto">
              Hãy thử tìm với từ khóa khác hoặc bỏ bộ lọc để xem tất cả khóa học
            </p>
            <Button
              onClick={handleReset}
              size="large"
              className="mt-6 bg-red-600 text-white hover:bg-red-700 font-bold h-12 px-8 rounded-xl"
            >
              Xem tất cả khóa học
            </Button>
          </div>
        )}

        {/* Pagination */}
        {courses.length > 0 && (
          <div className="flex justify-center mt-16">
            <Pagination
              current={currentPage}
              total={totalCourses}
              pageSize={pageSize}
              onChange={handlePageChange}
              showSizeChanger={false}
              className="custom-pagination"
              itemRender={(page, type, originalElement) => {
                if (type === 'page') {
                  return (
                    <span className="text-red-900 font-bold hover:text-red-700">
                      {page}
                    </span>
                  );
                }
                return originalElement;
              }}
              showTotal={(total, range) => (
                <span className="text-red-700 font-medium">
                  Hiển thị {range[0]}-{range[1]} trong <strong className="text-red-900">{total}</strong> khóa học
                </span>
              )}
            />
          </div>
        )}
      </div>

      {/* Custom CSS for Pagination */}
      <style jsx>{`
        .custom-pagination .ant-pagination-item-active {
          background: #dc2626 !important;
          border-color: #dc2626 !important;
        }
        .custom-pagination .ant-pagination-item-active a {
          color: white !important;
        }
        .custom-pagination .ant-pagination-item a {
          color: #991b1b !important;
          font-weight: 600;
        }
        .custom-pagination .ant-pagination-item a:hover {
          color: #dc2626 !important;
        }
      `}</style>
    </div>
  );
};

export default Courses;