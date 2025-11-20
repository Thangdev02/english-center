import {
  Badge,
  Button,
  Card,
  Empty,
  List,
  message,
  Pagination,
  Progress,
  Tabs,
  Tag,
} from "antd";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Eye,
  UserCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { courseApi } from "../../services/courseApi";
import { forumApi } from "../../services/forumApi";

const { TabPane } = Tabs;

const StudentClasses = () => {
  const { user } = useAuth();
  const [myClasses, setMyClasses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("classes");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 9,
    total: 0,
    totalPages: 0,
  });
  const [coursesPagination, setCoursesPagination] = useState({
    current: 1,
    pageSize: 9,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (user?.id) {
      fetchMyClasses(pagination.current, pagination.pageSize);
      fetchEnrolledCourses(
        coursesPagination.current,
        coursesPagination.pageSize
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchMyClasses = async (page = 1, size = 9) => {
    try {
      setLoading(true);
      const response = await forumApi.getClasses({ page, size });
      const data = response?.data?.data;

      if (data) {
        setMyClasses(data.items || []);
        setPagination({
          current: data.page || page,
          pageSize: data.size || size,
          total: data.total || 0,
          totalPages: data.totalPages || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching my classes:", error);
      message.error("Không thể tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page, pageSize) => {
    fetchMyClasses(page, pageSize);
  };

  const fetchEnrolledCourses = async (page = 1, size = 9) => {
    try {
      setCoursesLoading(true);
      const response = await courseApi.getMyCourse({ page, size });
      const data = response?.data?.data;

      if (data) {
        setEnrolledCourses(data.items || []);
        setCoursesPagination({
          current: data.page || page,
          pageSize: data.size || size,
          total: data.total || 0,
          totalPages: data.totalPages || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      message.error("Không thể tải danh sách khóa học");
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleCoursesPageChange = (page, pageSize) => {
    fetchEnrolledCourses(page, pageSize);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const dayNames = {
    1: "T2",
    2: "T3",
    3: "T4",
    4: "T5",
    5: "T6",
    6: "T7",
    0: "CN",
  };

  const isActiveByDate = (startDate, endDate) => {
    try {
      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);
      return start <= now && now <= end;
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Lớp Học Của Tôi
            </h1>
            <p className="text-gray-600 text-lg">
              Quản lý các lớp học và khóa học bạn đã tham gia
            </p>
          </div>

          <Card>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: "classes",
                  label: (
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Lớp học của tôi
                      <Badge
                        count={pagination.total}
                        style={{ backgroundColor: "#1890ff", marginLeft: 8 }}
                      />
                    </span>
                  ),
                  children: loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3].map((n) => (
                        <Card key={n} loading={true} />
                      ))}
                    </div>
                  ) : myClasses.length > 0 ? (
                    <>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        {myClasses.map((classItem, index) => (
                          <motion.div
                            key={classItem.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card
                              className="h-full hover:shadow-lg transition-shadow duration-300"
                              actions={[
                                <Link
                                  to={`/student/classes/${classItem.id}`}
                                  key="view"
                                >
                                  <div className="flex items-center justify-center text-primary-600">
                                    <Eye className="w-4 h-4 mr-2" />
                                    Vào lớp học
                                  </div>
                                </Link>,
                              ]}
                            >
                              <div className="space-y-4">
                                <div>
                                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                                    {classItem.name}
                                  </h3>
                                  <p className="text-gray-600 text-sm">
                                    {classItem.description || "Chưa có mô tả"}
                                  </p>
                                </div>

                                {classItem.teacherInfo && (
                                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                      {classItem.teacherInfo.firstName?.[0]}
                                      {classItem.teacherInfo.lastName?.[0]}
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium text-sm">
                                        {classItem.teacherInfo.firstName}{" "}
                                        {classItem.teacherInfo.lastName}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Giáo viên
                                      </div>
                                    </div>
                                  </div>
                                )}

                                <div className="space-y-2">
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Users className="w-4 h-4 mr-2" />
                                    <span>
                                      {classItem.numberOfStudents || 0} học viên
                                    </span>
                                  </div>

                                  {classItem.dayOfWeeks &&
                                    classItem.dayOfWeeks.length > 0 && (
                                      <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <span>
                                          Lịch:{" "}
                                          {classItem.dayOfWeeks
                                            .map((d) => dayNames[d] || d)
                                            .join(", ")}
                                        </span>
                                      </div>
                                    )}

                                  {classItem.startTime && classItem.endTime && (
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Clock className="w-4 h-4 mr-2" />
                                      <span>
                                        {classItem.startTime.slice(0, 5)} -{" "}
                                        {classItem.endTime.slice(0, 5)}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {classItem.startDate && classItem.endDate && (
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    <span>
                                      {formatDate(classItem.startDate)} -{" "}
                                      {formatDate(classItem.endDate)}
                                    </span>
                                  </div>
                                )}

                                <Tag
                                  color={
                                    isActiveByDate(
                                      classItem.startDate,
                                      classItem.endDate
                                    )
                                      ? "green"
                                      : "red"
                                  }
                                >
                                  {isActiveByDate(
                                    classItem.startDate,
                                    classItem.endDate
                                  )
                                    ? "Đang hoạt động"
                                    : "Ngừng hoạt động"}
                                </Tag>
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </div>

                      <div className="flex justify-center mt-6">
                        <Pagination
                          current={pagination.current}
                          pageSize={pagination.pageSize}
                          total={pagination.total}
                          onChange={handlePageChange}
                          showSizeChanger
                          showTotal={(total) => `Tổng ${total} lớp học`}
                          pageSizeOptions={["6", "9", "12", "18"]}
                        />
                      </div>
                    </>
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <div>
                          <p className="text-lg mb-2">
                            Bạn chưa tham gia lớp học nào
                          </p>
                          <p className="text-gray-500">
                            Hãy liên hệ với giáo viên để được thêm vào lớp học
                          </p>
                        </div>
                      }
                    />
                  ),
                },
                {
                  key: "courses",
                  label: (
                    <span className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Khóa học của tôi
                      <Badge
                        count={coursesPagination.total}
                        style={{ backgroundColor: "#52c41a", marginLeft: 8 }}
                      />
                    </span>
                  ),
                  children: coursesLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3].map((n) => (
                        <Card key={n} loading={true} />
                      ))}
                    </div>
                  ) : enrolledCourses.length > 0 ? (
                    <>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        {enrolledCourses.map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card
                              className="h-full hover:shadow-lg transition-shadow duration-300"
                              cover={
                                item.course.imageUrl && (
                                  <img
                                    alt={item.course.name}
                                    src={item.course.imageUrl}
                                    className="h-48 object-cover"
                                  />
                                )
                              }
                              actions={[
                                <Link
                                  to={`/learning/${item.course.id}`}
                                  key="learn"
                                >
                                  <Button
                                    type="primary"
                                    icon={<ArrowRight className="w-4 h-4" />}
                                  >
                                    Bắt đầu học
                                  </Button>
                                </Link>,
                              ]}
                            >
                              <div className="space-y-3">
                                <div>
                                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                                    {item.course.name}
                                  </h3>
                                  <p className="text-gray-600 text-sm line-clamp-2">
                                    {item.course.description || "Chưa có mô tả"}
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Clock className="w-4 h-4 mr-2" />
                                    <span>{item.course.duration}</span>
                                  </div>

                                  <div className="flex items-center text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <span>
                                      Đăng ký: {formatDate(item.createdDate)}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  <Tag
                                    color={
                                      item.course.level === 0
                                        ? "green"
                                        : item.course.level === 1
                                        ? "blue"
                                        : "red"
                                    }
                                  >
                                    {item.course.level === 0
                                      ? "Beginner"
                                      : item.course.level === 1
                                      ? "Intermediate"
                                      : "Advanced"}
                                  </Tag>
                                  <Tag
                                    color={
                                      item.course.isActive
                                        ? "success"
                                        : "default"
                                    }
                                  >
                                    {item.course.isActive
                                      ? "Đang hoạt động"
                                      : "Ngừng hoạt động"}
                                  </Tag>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </div>

                      <div className="flex justify-center mt-6">
                        <Pagination
                          current={coursesPagination.current}
                          pageSize={coursesPagination.pageSize}
                          total={coursesPagination.total}
                          onChange={handleCoursesPageChange}
                          showSizeChanger
                          showTotal={(total) => `Tổng ${total} khóa học`}
                          pageSizeOptions={["6", "9", "12", "18"]}
                        />
                      </div>
                    </>
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <div>
                          <p className="text-lg mb-2">
                            Bạn chưa đăng ký khóa học nào
                          </p>
                          <Link to="/courses">
                            <Button
                              type="primary"
                              icon={<ArrowRight className="w-4 h-4" />}
                            >
                              Khám phá khóa học
                            </Button>
                          </Link>
                        </div>
                      }
                    />
                  ),
                },
              ]}
            />
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentClasses;
