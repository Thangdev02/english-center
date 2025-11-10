import {
  Avatar,
  Button,
  Card,
  Form,
  Input,
  Table,
  Tabs,
  Tag,
  Upload,
  Empty,
  message,
} from "antd";
import { motion } from "framer-motion";
import {
  Award,
  BookOpen,
  Camera,
  Mail,
  Phone,
  User,
  FileText,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { examApi } from "../services/examApi";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { TabPane } = Tabs;

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();
  const [freeExams, setFreeExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [examsPagination, setExamsPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const onFinish = (values) => {
    updateProfile(values);
    setEditing(false);
  };

  const isStudent = user?.role === 1;

  const userStats = {
    completedCourses: 5,
    totalHours: 120,
    currentStreak: 15,
    points: 2450,
    level: "Intermediate",
  };

  const achievements = [
    {
      name: "Học viên chăm chỉ",
      icon: "🏆",
      description: "Hoàn thành 5 khóa học",
      earned: true,
    },
    {
      name: "Chuyên cần",
      icon: "🔥",
      description: "Duy trì streak 15 ngày",
      earned: true,
    },
    {
      name: "Master Vocabulary",
      icon: "📚",
      description: "Học 1000 từ vựng",
      earned: false,
    },
  ];

  useEffect(() => {
    form.setFieldsValue(user);
  }, [user, form]);

  const fetchFreeExams = async (page = 1, size = 10) => {
    if (!isStudent) return;

    try {
      setLoadingExams(true);
      const response = await examApi.getAllFreeExamDoings({ page, size });
      const data = response?.data?.data;

      if (data) {
        setFreeExams(data.items || []);
        setExamsPagination({
          current: data.page || page,
          pageSize: data.size || size,
          total: data.total || 0,
        });
      }
    } catch (err) {
      console.error("Error fetching free exams:", err);
      message.error("Không thể tải danh sách bài thi");
    } finally {
      setLoadingExams(false);
    }
  };

  const handleExamTableChange = (pagination) => {
    fetchFreeExams(pagination.current, pagination.pageSize);
  };

  const getExamTypeText = (type) => {
    return type === 0 ? "Trắc nghiệm" : "Tự luận";
  };

  const getExamTypeColor = (type) => {
    return type === 0 ? "blue" : "purple";
  };

  const getExamStatusText = (status) => {
    return status === 0 ? "Đang làm" : "Đã nộp";
  };

  const getExamStatusColor = (status) => {
    return status === 0 ? "orange" : "green";
  };

  const formatDuration = (duration) => {
    if (!duration) return "N/A";
    const [hours, minutes, seconds] = duration.split(":").map(Number);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
  };

  const freeExamsColumns = [
    {
      title: "Tên bài thi",
      dataIndex: "examName",
      key: "examName",
      width: 250,
    },
    {
      title: "Loại",
      dataIndex: "examType",
      key: "examType",
      width: 120,
      render: (type) => (
        <Tag color={getExamTypeColor(type)}>{getExamTypeText(type)}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={getExamStatusColor(status)}>
          {getExamStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "Điểm",
      dataIndex: "grade",
      key: "grade",
      width: 80,
      render: (grade) => (
        <span className="font-semibold text-blue-600">{grade || 0}</span>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "duration",
      key: "duration",
      width: 100,
      render: formatDuration,
    },
    {
      title: "Ngày làm",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 150,
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => navigate(`/exams/${record.id}`)}
        >
          {record.status === 0 ? "Tiếp tục" : "Xem kết quả"}
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card className="text-center">
                <div className="relative inline-block mb-4">
                  <Avatar
                    size={120}
                    src={user?.avatar}
                    icon={<User />}
                    className="border-4 border-white shadow-lg"
                  />
                  <Upload
                    showUploadList={false}
                    className="absolute bottom-2 right-2"
                  >
                    <Button
                      shape="circle"
                      icon={<Camera size={14} />}
                      size="small"
                      className="bg-primary-500 border-primary-500 text-white"
                    />
                  </Upload>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {user?.firstName + " " + user?.lastName}
                </h2>
                <Tag color="blue" className="mb-4 capitalize">
                  {user?.role === 1
                    ? "Học sinh"
                    : user?.role === 2
                    ? "Giáo viên"
                    : "Quản trị viên"}
                </Tag>

                <div className="space-y-3 text-left">
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-3" />
                    <span className="truncate">{user?.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-3" />
                    <span>{user?.phone || "Chưa cập nhật"}</span>
                  </div>
                </div>
              </Card>

              {isStudent && (
                <Card className="mt-6" title="Thống kê học tập">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Khóa học đã hoàn thành</span>
                        <span className="font-semibold">
                          {userStats.completedCourses}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Tổng giờ học</span>
                        <span className="font-semibold">
                          {userStats.totalHours}h
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Streak hiện tại</span>
                        <span className="font-semibold">
                          {userStats.currentStreak} ngày
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Điểm tích lũy</span>
                        <span className="font-semibold text-primary-600">
                          {userStats.points}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            <div className="lg:col-span-2">
              <Card>
                <Tabs defaultActiveKey="profile">
                  <TabPane
                    tab={
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Thông tin cá nhân
                      </span>
                    }
                    key="profile"
                  >
                    <Form
                      form={form}
                      layout="vertical"
                      initialValues={user}
                      onFinish={onFinish}
                    >
                      <div className="grid md:grid-cols-2 gap-4">
                        <Form.Item name="firstName" label="Họ">
                          <Input disabled={!editing} />
                        </Form.Item>
                        <Form.Item name="lastName" label="Tên">
                          <Input disabled={!editing} />
                        </Form.Item>
                      </div>

                      <Form.Item name="email" label="Email">
                        <Input disabled prefix={<Mail />} />
                      </Form.Item>

                      <Form.Item name="phone" label="Số điện thoại">
                        <Input disabled={!editing} prefix={<Phone />} />
                      </Form.Item>

                      {/* <Form.Item name="bio" label="Giới thiệu bản thân">
                        <Input.TextArea 
                          disabled={!editing}
                          rows={4}
                          placeholder="Giới thiệu về bản thân..."
                        />
                      </Form.Item> */}

                      <div className="flex space-x-4">
                        {editing ? (
                          <>
                            <Button type="primary" htmlType="submit">
                              Lưu thay đổi
                            </Button>
                            <Button onClick={() => setEditing(false)}>
                              Hủy
                            </Button>
                          </>
                        ) : (
                          <Button
                            type="primary"
                            onClick={() => setEditing(true)}
                          >
                            Chỉnh sửa hồ sơ
                          </Button>
                        )}
                      </div>
                    </Form>
                  </TabPane>

                  {isStudent && (
                    <TabPane
                      tab={
                        <span className="flex items-center">
                          <Award className="w-4 h-4 mr-2" />
                          Thành tích
                        </span>
                      }
                      key="achievements"
                    >
                      <div className="grid gap-4">
                        {achievements.map((achievement, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card
                              className={`border-l-4 ${
                                achievement.earned
                                  ? "border-l-green-500 bg-green-50"
                                  : "border-l-gray-300 bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <span className="text-2xl">
                                    {achievement.icon}
                                  </span>
                                  <div>
                                    <h4 className="font-semibold">
                                      {achievement.name}
                                    </h4>
                                    <p className="text-gray-600 text-sm">
                                      {achievement.description}
                                    </p>
                                  </div>
                                </div>
                                {achievement.earned ? (
                                  <Tag color="green">Đã đạt được</Tag>
                                ) : (
                                  <Tag color="default">Chưa đạt</Tag>
                                )}
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </TabPane>
                  )}

                  {isStudent && (
                    <TabPane
                      tab={
                        <span className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Khóa học của tôi
                        </span>
                      }
                      key="courses"
                    >
                      <div className="text-center text-gray-500 py-8">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>Bạn chưa tham gia khóa học nào</p>
                        <Button type="primary" className="mt-4">
                          <a href="/courses">Khám phá khóa học</a>
                        </Button>
                      </div>
                    </TabPane>
                  )}

                  {isStudent && (
                    <TabPane
                      tab={
                        <span className="flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          Bài thi miễn phí
                        </span>
                      }
                      key="freeExams"
                    >
                      <div className="mb-4">
                        <Button
                          type="primary"
                          onClick={() =>
                            fetchFreeExams(1, examsPagination.pageSize)
                          }
                        >
                          Tải danh sách bài thi
                        </Button>
                      </div>
                      {freeExams.length > 0 ? (
                        <Table
                          columns={freeExamsColumns}
                          dataSource={freeExams}
                          rowKey="id"
                          loading={loadingExams}
                          pagination={{
                            ...examsPagination,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} bài thi`,
                          }}
                          onChange={handleExamTableChange}
                          scroll={{ x: 1000 }}
                        />
                      ) : (
                        <Empty
                          description={
                            loadingExams
                              ? "Đang tải..."
                              : "Bạn chưa làm bài thi miễn phí nào. Nhấn nút 'Tải danh sách bài thi' để xem."
                          }
                        />
                      )}
                    </TabPane>
                  )}
                </Tabs>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
