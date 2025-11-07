import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
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

      // Add search term if exists
      if (searchTerm) {
        params.name = searchTerm;
      }

      // Add level filter if not 'all'
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
        rating: (4 + Math.random()).toFixed(1), // Temporary random rating
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
    setCurrentPage(1); // Reset to first page on search
  };

  const handleLevelChange = (value) => {
    setLevelFilter(value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleReset = () => {
    setSearchTerm("");
    setLevelFilter("all");
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton.Input
              active
              size="large"
              className="!w-64 !h-12 mx-auto mb-4"
            />
            <Skeleton.Input
              active
              size="default"
              className="!w-96 !h-6 mx-auto"
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <Skeleton active paragraph={{ rows: 1 }} />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card key={item} className="shadow-lg">
                <Skeleton.Image active className="!w-full !h-48" />
                <Skeleton active paragraph={{ rows: 4 }} />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Khóa học Tiếng Anh
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Khám phá các khóa học được thiết kế chuyên biệt cho mọi trình độ
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <AntSearch
                placeholder="Tìm kiếm khóa học theo tên..."
                prefix={<Search className="text-gray-400" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={handleSearch}
                size="large"
                allowClear
              />
            </div>

            <Select
              value={levelFilter}
              onChange={handleLevelChange}
              size="large"
              className="w-full lg:w-48"
              placeholder="Trình độ"
            >
              <Option value="all">Tất cả trình độ</Option>
              <Option value="beginner">Beginner</Option>
              <Option value="intermediate">Intermediate</Option>
              <Option value="advanced">Advanced</Option>
            </Select>

            <Button
              type="default"
              icon={<Filter size={16} />}
              onClick={handleReset}
              size="large"
            >
              Reset
            </Button>
          </div>
        </div>

        <AnimatePresence>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className="transform transition-transform duration-300 hover:-translate-y-2"
              >
                <Card
                  cover={
                    <div className="relative">
                      <img
                        alt={course.title}
                        src={course.image}
                        className="h-48 w-full object-cover"
                      />
                      {course.students > 1000 && (
                        <Tag color="red" className="absolute top-3 left-3">
                          Bestseller
                        </Tag>
                      )}
                    </div>
                  }
                  className="shadow-lg hover:shadow-xl transition-all duration-300 h-full"
                  actions={[
                    <Link
                      to={`/courses/${course.courseId || course.id}`}
                      key="view"
                    >
                      <Button type="primary">Xem chi tiết</Button>
                    </Link>,
                  ]}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                        {course.title}
                      </h3>
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex items-center text-sm text-gray-500">
                      <BookOpen className="w-4 h-4 mr-1" />
                      <span>Giáo viên: {course.teacher}</span>
                    </div>

                    <div className="flex justify-start items-center text-sm">
                      <div className="flex items-center text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{course.duration}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Tag
                        color={
                          course.level === 0
                            ? "green"
                            : course.level === 1
                            ? "blue"
                            : "red"
                        }
                        className="capitalize"
                      >
                        {course.level === 0
                          ? "Beginner"
                          : course.level === 1
                          ? "Intermediate"
                          : "Advanced"}
                      </Tag>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </AnimatePresence>

        {courses.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Không tìm thấy khóa học phù hợp
            </h3>
            <p className="text-gray-500">
              Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
            </p>
          </div>
        )}

        {courses.length > 0 && (
          <div className="flex justify-center mt-12">
            <Pagination
              current={currentPage}
              total={totalCourses}
              pageSize={pageSize}
              onChange={handlePageChange}
              showSizeChanger={false}
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} của ${total} khóa học`
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
