import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Card,
  Table,
  Tag,
  Progress,
  Statistic,
  Row,
  Col,
  Button,
  List,
  Skeleton,
  message,
} from "antd";
import {
  Users,
  BookOpen,
  MessageCircle,
  Calendar,
  Eye,
  Edit,
  Plus,
  Clock,
  Mail,
  Notebook,
} from "lucide-react";
import { courseApi } from "../../services/courseApi";
import { forumApi } from "../../services/forumApi";
import { useAuth } from "../../context/AuthContext";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recentStudents, setRecentStudents] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [forumActivity, setForumActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch courses
        const coursesResponse = await courseApi.getTeacherCourses();
        const courses = coursesResponse.data;

        // Fetch forums with pagination params
        const classesResponse = await forumApi.getClasses({
          page: 1,
          size: 100,
        });
        const forumClasses = classesResponse?.data?.data?.items ?? [];

        // const totalStudents = courses.reduce(
        //   (sum, course) => sum + course.students,
        //   0
        // );
        const totalCourses = courses.length;
        const totalClasses = forumClasses.length;

        setStats({
          // students: totalStudents,
          courses: totalCourses,
          classes: totalClasses,
          messages: 12,
        });

        // Fetch recent students from forum accounts API
        try {
          setLoadingStudents(true);
          const recentStudentsResponse = await forumApi.getClassMembers({
            page: 1,
            size: 2,
          });
          console.log("Recent students response:", recentStudentsResponse);
          const recentStudentsData = recentStudentsResponse?.data?.data ?? {};
          const students = recentStudentsData.items ?? [];
          setRecentStudents(students);
          setStats({
            students: recentStudentsData.total || 0,
            courses: totalCourses,
            classes: totalClasses,
            messages: 12,
          });
        } catch (studentError) {
          console.error("Error fetching recent students:", studentError);
          setRecentStudents([]);
        } finally {
          setLoadingStudents(false);
        }

        setUpcomingClasses([
          {
            id: 1,
            title: "Lớp Giao Tiếp - Buổi 15",
            time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            students: 20,
            type: "online",
          },
          {
            id: 2,
            title: "Lớp IELTS - Writing",
            time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            students: 15,
            type: "offline",
          },
        ]);

        setForumActivity([
          {
            id: 1,
            title: "Câu hỏi mới về ngữ pháp",
            comments: 2,
            type: "question",
          },
          {
            id: 2,
            title: "Bài tập cần chấm",
            pending: 5,
            type: "assignment",
          },
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        message.error("Không thể tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchDashboardData();
    }
  }, [user]);

  const statsData = [
    {
      title: "Học viên",
      value: stats.students || 0,
      icon: <Users className="w-8 h-8 text-blue-500" />,
      // change: "+5%",
      color: "blue",
    },
    {
      title: "Khóa học",
      value: stats.courses || 0,
      icon: <BookOpen className="w-8 h-8 text-green-500" />,
      // change: "+1",
      color: "green",
    },
    {
      title: "Lớp học",
      value: stats.classes || 0,
      icon: <MessageCircle className="w-8 h-8 text-purple-500" />,
      // change: "+2",
      color: "purple",
    },
    {
      title: "Tin nhắn mới",
      value: stats.messages || 0,
      icon: <Mail className="w-8 h-8 text-orange-500" />,
      // change: "+3",
      color: "orange",
    },
  ];

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = date - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 24) {
      return `Hôm nay, ${date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (diffHours < 48) {
      return `Ngày mai, ${date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return date.toLocaleDateString("vi-VN", {
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Skeleton active paragraph={{ rows: 1 }} />
          <Row gutter={[16, 16]} className="mb-8">
            {[1, 2, 3, 4].map((item) => (
              <Col xs={24} sm={12} lg={6} key={item}>
                <Skeleton active paragraph={{ rows: 2 }} />
              </Col>
            ))}
          </Row>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton active paragraph={{ rows: 6 }} />
            </div>
            <div className="lg:col-span-1">
              <Skeleton active paragraph={{ rows: 4 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Giáo Viên
              </h1>
              <p className="text-gray-600">Xin chào, {user?.name}</p>
            </div>
          </div>

          <Row gutter={[16, 16]} className="mb-8">
            {statsData.map((stat, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {stat.value}
                        </div>
                        <div className="text-gray-600">{stat.title}</div>
                        <div className="text-sm text-green-500">
                          {stat.change}
                        </div>
                      </div>
                      {stat.icon}
                    </div>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card
                title="Học viên gần đây"
                loading={loadingStudents}
                extra={
                  <Link to="/teacher/students">
                    <Button type="link">Xem tất cả</Button>
                  </Link>
                }
              >
                <Table
                  dataSource={recentStudents}
                  pagination={false}
                  rowKey="id"
                  size="small"
                  locale={{
                    emptyText: "Chưa có học viên nào",
                  }}
                >
                  <Table.Column
                    title="Tên"
                    key="name"
                    render={(_, record) =>
                      `${record.firstName} ${record.lastName}`
                    }
                  />
                  <Table.Column title="Email" dataIndex="email" key="email" />
                  <Table.Column
                    title="Số điện thoại"
                    dataIndex="phone"
                    key="phone"
                  />
                  <Table.Column
                    title="Lớp học"
                    dataIndex="forumName"
                    key="forumName"
                  />
                  <Table.Column
                    title="Ngày tham gia"
                    dataIndex="assignDate"
                    key="assignDate"
                    render={(date) =>
                      new Date(date).toLocaleDateString("vi-VN")
                    }
                  />
                </Table>
              </Card>

              <Card className="mt-6" title="Thao tác nhanh">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Link to="/teacher/schedule">
                      <Button
                        type="primary"
                        size="large"
                        block
                        icon={<Calendar size={16} />}
                      >
                        Lịch dạy
                      </Button>
                    </Link>
                  </div>
                  <Link to="/teacher/exams">
                    <Button size="large" block icon={<Notebook size={16} />}>
                      Quản lý bài thi
                    </Button>
                  </Link>
                  <Link to="/teacher/forum">
                    <Button size="large" block icon={<Users size={16} />}>
                      Lớp học
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card
                title="Lịch dạy sắp tới"
                extra={
                  <Link to="/teacher/schedule">
                    <Button type="link">Xem lịch</Button>
                  </Link>
                }
              >
                <List
                  dataSource={upcomingClasses}
                  renderItem={(item) => (
                    <List.Item>
                      <div className="w-full">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-semibold">{item.title}</div>
                          <Tag
                            color={item.type === "online" ? "blue" : "green"}
                          >
                            {item.type === "online" ? "Online" : "Offline"}
                          </Tag>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatTime(item.time)}
                        </div>
                        <div className="text-sm text-gray-600">
                          👥 {item.students} học viên
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>

              <Card className="mt-6" title="Hoạt động diễn đàn">
                <div className="space-y-4">
                  {forumActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className={`p-3 rounded-lg cursor-pointer hover:shadow-md transition-shadow ${
                        activity.type === "question"
                          ? "bg-blue-50"
                          : "bg-green-50"
                      }`}
                    >
                      <div className="font-semibold">{activity.title}</div>
                      <div className="text-sm text-gray-600">
                        {activity.type === "question"
                          ? `${activity.comments} bình luận mới`
                          : `${activity.pending} bài chưa chấm`}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
