import {
  Button,
  Card,
  Empty,
  List,
  message,
  Pagination,
  Skeleton,
  Tabs,
  Tag,
  Table,
  Progress,
  Calendar,
  Badge,
} from "antd";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  FileText,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { examApi } from "../../services/examApi";
import { forumApi } from "../../services/forumApi";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

// Extend dayjs with isBetween plugin
dayjs.extend(isBetween);

const { TabPane } = Tabs;

const StudentClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classDetail, setClassDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [examsLoading, setExamsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("members");
  const [classExams, setClassExams] = useState([]);
  const [examHistory, setExamHistory] = useState([]);
  const [examsPagination, setExamsPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
    totalPages: 0,
  });
  const [historyPagination, setHistoryPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [attendanceDashboard, setAttendanceDashboard] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchClassDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (id && activeTab === "exams") {
      fetchClassExams(examsPagination.current, examsPagination.pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, activeTab]);

  useEffect(() => {
    if (id && activeTab === "history") {
      fetchExamHistory(historyPagination.current, historyPagination.pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, activeTab]);

  useEffect(() => {
    if (id && activeTab === "attendance") {
      fetchAttendanceDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, activeTab]);

  const fetchClassDetail = async () => {
    try {
      setLoading(true);
      const response = await forumApi.getClassById(id);
      const data = response?.data?.data;

      if (data) {
        console.log("📊 Class details:", data);
        setClassDetail(data);
      }
    } catch (error) {
      console.error("Error fetching class detail:", error);
      message.error("Không thể tải thông tin lớp học");
    } finally {
      setLoading(false);
    }
  };

  const fetchClassExams = async (page = 1, size = 5) => {
    try {
      setExamsLoading(true);
      const response = await forumApi.getClassExams(id, { page, size });
      const data = response?.data?.data;

      if (data) {
        setClassExams(data.items || []);
        setExamsPagination({
          current: data.page || page,
          pageSize: data.size || size,
          total: data.total || 0,
          totalPages: data.totalPages || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching class exams:", error);
      message.error("Không thể tải danh sách bài thi");
    } finally {
      setExamsLoading(false);
    }
  };

  const handleExamsPageChange = (page, pageSize) => {
    fetchClassExams(page, pageSize);
  };

  const fetchExamHistory = async (page = 1, size = 10) => {
    try {
      setHistoryLoading(true);
      const response = await forumApi.getClassExamsHistory(id, { page, size });
      const data = response?.data?.data;

      if (data) {
        setExamHistory(data.items || []);
        setHistoryPagination({
          current: data.page || page,
          pageSize: data.size || size,
          total: data.total || 0,
          totalPages: data.totalPages || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching exam history:", error);
      message.error("Không thể tải lịch sử thi");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleHistoryPageChange = (page, pageSize) => {
    fetchExamHistory(page, pageSize);
  };

  const fetchAttendanceDashboard = async () => {
    try {
      setAttendanceLoading(true);
      const response = await forumApi.getAttendancesDashboard(id);
      setAttendanceDashboard(response.data?.data || null);
    } catch (error) {
      console.error("Error fetching attendance dashboard:", error);
      message.error("Không thể tải báo cáo điểm danh");
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleTakeExam = async (forumExamId) => {
    try {
      message.loading({ content: "Đang chuẩn bị bài thi...", key: "takeExam" });
      const response = await examApi.takeExam(forumExamId);
      const data = response?.data?.data;

      if (data?.id) {
        message.success({
          content: "Bắt đầu làm bài!",
          key: "takeExam",
          duration: 1,
        });
        navigate(`/student/exams/${data.id}`);
      } else {
        message.error({
          content: "Không thể bắt đầu bài thi",
          key: "takeExam",
        });
      }
    } catch (error) {
      console.error("Error taking exam:", error);
      message.error({ content: "Không thể bắt đầu bài thi", key: "takeExam" });
    }
  };

  const dayNames = {
    0: "CN",
    1: "T2",
    2: "T3",
    3: "T4",
    4: "T5",
    5: "T6",
    6: "T7",
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

  const formatDuration = (duration) => {
    if (!duration) return "-";
    const parts = duration.split(":");
    if (parts.length >= 2) {
      const hours = parseInt(parts[0]);
      const minutes = parseInt(parts[1]);
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes} phút`;
    }
    return duration;
  };

  const getExamTypeText = (type) => {
    if (type === 0) return "Trắc nghiệm";
    if (type === 1) return "Tự luận";
    return "Chưa xác định";
  };

  const getExamTypeColor = (type) => {
    if (type === 0) return "blue";
    if (type === 1) return "green";
    return "default";
  };

  const getExamStatusText = (status) => {
    if (status === 0) return "Đang làm";
    if (status === 1) return "Đã nộp";
    return "Chưa xác định";
  };

  const getExamStatusColor = (status) => {
    if (status === 0) return "orange";
    if (status === 1) return "green";
    return "default";
  };

  const getAttendanceStatusIcon = (status) => {
    if (status === "Có mặt")
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === "Vắng mặt")
      return <XCircle className="w-4 h-4 text-red-500" />;
    if (status === "Chưa điểm danh")
      return <AlertCircle className="w-4 h-4 text-orange-500" />;
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  const getAttendanceStatusColor = (status) => {
    if (status === "Có mặt") return "green";
    if (status === "Vắng mặt") return "red";
    if (status === "Chưa điểm danh") return "orange";
    return "default";
  };

  const getAttendanceForDate = (date) => {
    if (!attendanceDashboard?.items) return null;
    const dateStr = dayjs(date).format("YYYY-MM-DD");
    return attendanceDashboard.items.find((item) => item.date === dateStr);
  };

  const getListData = (value) => {
    const attendance = getAttendanceForDate(value);
    if (!attendance) return [];

    const statusConfig = {
      "Có mặt": { type: "success", content: "Có mặt" },
      "Vắng mặt": { type: "error", content: "Vắng mặt" },
      "Chưa điểm danh": { type: "warning", content: "Chưa điểm danh" },
      "Chưa học": { type: "default", content: "Chưa học" },
    };

    const config = statusConfig[attendance.status] || {
      type: "default",
      content: attendance.status,
    };

    return [config];
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul className="events">
        {listData.map((item, index) => (
          <li key={index}>
            <Badge status={item.type} text={item.content} />
          </li>
        ))}
      </ul>
    );
  };

  const attendanceColumns = [
    {
      title: "Ngày học",
      dataIndex: "date",
      key: "date",
      width: 150,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 180,
      render: (status) => (
        <div className="flex items-center space-x-2">
          {getAttendanceStatusIcon(status)}
          <Tag color={getAttendanceStatusColor(status)}>{status}</Tag>
        </div>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      render: (note) => note || "-",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Skeleton active />
        </div>
      </div>
    );
  }

  if (!classDetail) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <Empty description="Lớp học không tồn tại hoặc bạn không có quyền truy cập" />
          <Link to="/student/classes">
            <Button type="primary" className="mt-4">
              Quay lại danh sách lớp học
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/student/classes"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách lớp học
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {classDetail.name}
              </h1>
              <p className="text-gray-600 mt-1">
                {classDetail.description || "Chưa có mô tả"}
              </p>

              {/* Class schedule info */}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                {classDetail.dayOfWeeks &&
                  classDetail.dayOfWeeks.length > 0 && (
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      <span>
                        {classDetail.dayOfWeeks
                          .map((d) => dayNames[d] || d)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                {classDetail.startTime && classDetail.endTime && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>
                      {classDetail.startTime.slice(0, 5)} -{" "}
                      {classDetail.endTime.slice(0, 5)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Tag
              color={
                isActiveByDate(classDetail.startDate, classDetail.endDate)
                  ? "green"
                  : "red"
              }
            >
              {isActiveByDate(classDetail.startDate, classDetail.endDate)
                ? "Đang hoạt động"
                : "Ngừng hoạt động"}
            </Tag>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                  <TabPane
                    tab={
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Thành viên ({classDetail.numberOfStudents || 0})
                      </span>
                    }
                    key="members"
                  >
                    {classDetail.assignedStudents &&
                    classDetail.assignedStudents.length > 0 ? (
                      <List
                        dataSource={classDetail.assignedStudents}
                        renderItem={(student) => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                  {student.firstName?.[0]}
                                  {student.lastName?.[0]}
                                </div>
                              }
                              title={`${student.firstName} ${student.lastName}`}
                              description={
                                <div>
                                  <div>{student.email}</div>
                                  {student.phone && (
                                    <div className="text-xs">
                                      📞 {student.phone}
                                    </div>
                                  )}
                                  {student.assignDate && (
                                    <div className="text-xs text-gray-400">
                                      Tham gia:{" "}
                                      {new Date(
                                        student.assignDate
                                      ).toLocaleDateString("vi-VN")}
                                    </div>
                                  )}
                                </div>
                              }
                            />
                            <Tag color="blue">Học sinh</Tag>
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Empty description="Chưa có thành viên nào trong lớp" />
                    )}
                  </TabPane>
                  <TabPane
                    tab={
                      <span className="flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Bài thi mới
                      </span>
                    }
                    key="exams"
                  >
                    {examsLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((n) => (
                          <Card key={n} loading={true} />
                        ))}
                      </div>
                    ) : classExams.length > 0 ? (
                      <>
                        <div className="space-y-4 mb-6">
                          {classExams.map((exam) => (
                            <Card
                              key={exam.id}
                              className="hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-semibold text-lg">
                                      {exam.examName || "Chưa có tên"}
                                    </h3>
                                    <Tag color={getExamTypeColor(exam.type)}>
                                      {getExamTypeText(exam.type)}
                                    </Tag>
                                  </div>

                                  <p className="text-gray-600 mb-3">
                                    {exam.description || "Chưa có mô tả"}
                                  </p>

                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center">
                                      <Clock className="w-4 h-4 mr-1" />
                                      <span>
                                        {formatDuration(exam.duration)}
                                      </span>
                                    </div>
                                    <div className="flex items-center">
                                      <FileText className="w-4 h-4 mr-1" />
                                      <span>{exam.quantity || 0} câu hỏi</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right ml-4">
                                  <Button
                                    type="primary"
                                    onClick={() => {
                                      if (exam.id) {
                                        handleTakeExam(exam.id);
                                      } else {
                                        message.warning(
                                          "Bài thi chưa có thông tin"
                                        );
                                      }
                                    }}
                                  >
                                    Bắt đầu thi
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>

                        <div className="flex justify-center">
                          <Pagination
                            current={examsPagination.current}
                            pageSize={examsPagination.pageSize}
                            total={examsPagination.total}
                            onChange={handleExamsPageChange}
                            showSizeChanger
                            showTotal={(total) => `Tổng ${total} bài thi`}
                            pageSizeOptions={["5", "10", "15", "20"]}
                          />
                        </div>
                      </>
                    ) : (
                      <Empty description="Chưa có bài thi nào trong lớp" />
                    )}
                  </TabPane>
                  <TabPane
                    tab={
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Lịch sử thi
                      </span>
                    }
                    key="history"
                  >
                    {historyLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((n) => (
                          <Card key={n} loading={true} />
                        ))}
                      </div>
                    ) : examHistory.length > 0 ? (
                      <>
                        <div className="space-y-4 mb-6">
                          {examHistory.map((history) => (
                            <Card
                              key={history.id}
                              className="hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-semibold text-lg">
                                      {history.examName || "Chưa có tên"}
                                    </h3>
                                    <Tag
                                      color={getExamTypeColor(history.examType)}
                                    >
                                      {getExamTypeText(history.examType)}
                                    </Tag>
                                    <Tag
                                      color={getExamStatusColor(history.status)}
                                    >
                                      {getExamStatusText(history.status)}
                                    </Tag>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    <div>
                                      <div className="text-gray-500">
                                        Điểm số
                                      </div>
                                      <div className="font-semibold text-lg text-blue-600">
                                        {history.grade || 0}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-gray-500">
                                        Câu đúng
                                      </div>
                                      <div className="font-semibold">
                                        {history.totalCorrectAnswers}/
                                        {history.quantity}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-gray-500">
                                        Đã trả lời
                                      </div>
                                      <div className="font-semibold">
                                        {history.answeredQuestions}/
                                        {history.quantity}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-gray-500">
                                        Thời gian
                                      </div>
                                      <div className="font-semibold">
                                        {formatDuration(history.duration)}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {history.status === 0 && (
                                  <div className="text-right ml-4">
                                    <Button
                                      type="primary"
                                      onClick={() => {
                                        navigate(
                                          `/student/exams/${history.id}`
                                        );
                                      }}
                                    >
                                      Tiếp tục làm
                                    </Button>
                                  </div>
                                )}
                                {history.status === 1 && (
                                  <div className="text-right ml-4">
                                    <Button
                                      onClick={() => {
                                        navigate(
                                          `/student/exams/${history.id}`
                                        );
                                      }}
                                    >
                                      Xem kết quả
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>

                        <div className="flex justify-center">
                          <Pagination
                            current={historyPagination.current}
                            pageSize={historyPagination.pageSize}
                            total={historyPagination.total}
                            onChange={handleHistoryPageChange}
                            showSizeChanger
                            showTotal={(total) => `Tổng ${total} bài thi`}
                            pageSizeOptions={["5", "10", "15", "20"]}
                          />
                        </div>
                      </>
                    ) : (
                      <Empty description="Chưa có lịch sử thi nào" />
                    )}
                  </TabPane>

                  {/* Attendance Report Tab */}
                  <TabPane
                    tab={
                      <span className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Báo cáo điểm danh
                      </span>
                    }
                    key="attendance"
                  >
                    {attendanceLoading ? (
                      <div className="space-y-4">
                        <Skeleton active paragraph={{ rows: 6 }} />
                      </div>
                    ) : attendanceDashboard ? (
                      <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <Card className="text-center">
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                              {attendanceDashboard.totalDate || 0}
                            </div>
                            <div className="text-gray-600">Tổng số buổi</div>
                          </Card>
                          <Card className="text-center">
                            <div className="text-3xl font-bold text-green-600 mb-2">
                              {attendanceDashboard.totalPresent || 0}
                            </div>
                            <div className="text-gray-600">Có mặt</div>
                            <Progress
                              percent={Math.round(
                                ((attendanceDashboard.totalPresent || 0) /
                                  (attendanceDashboard.totalDate || 1)) *
                                  100
                              )}
                              size="small"
                              status="success"
                              className="mt-2"
                            />
                          </Card>
                          <Card className="text-center">
                            <div className="text-3xl font-bold text-red-600 mb-2">
                              {attendanceDashboard.totalAbsent || 0}
                            </div>
                            <div className="text-gray-600">Vắng mặt</div>
                            <Progress
                              percent={Math.round(
                                ((attendanceDashboard.totalAbsent || 0) /
                                  (attendanceDashboard.totalDate || 1)) *
                                  100
                              )}
                              size="small"
                              status="exception"
                              className="mt-2"
                            />
                          </Card>
                        </div>

                        {/* Calendar View */}
                        <Card title="Lịch điểm danh" className="mb-6">
                          <div className="mb-4 flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center">
                              <Badge status="success" />
                              <span className="ml-2">Có mặt</span>
                            </div>
                            <div className="flex items-center">
                              <Badge status="error" />
                              <span className="ml-2">Vắng mặt</span>
                            </div>
                            <div className="flex items-center">
                              <Badge status="warning" />
                              <span className="ml-2">Chưa điểm danh</span>
                            </div>
                            <div className="flex items-center">
                              <Badge status="default" />
                              <span className="ml-2">Chưa học</span>
                            </div>
                          </div>
                          <Calendar
                            cellRender={dateCellRender}
                            fullscreen={false}
                          />
                        </Card>

                        {/* Attendance Table */}
                        <Card title="Chi tiết điểm danh">
                          <Table
                            dataSource={attendanceDashboard.items || []}
                            columns={attendanceColumns}
                            rowKey="date"
                            pagination={{
                              pageSize: 10,
                              showSizeChanger: true,
                              showTotal: (total) => `Tổng ${total} buổi học`,
                            }}
                            scroll={{ x: 600 }}
                          />
                        </Card>
                      </>
                    ) : (
                      <Empty description="Chưa có dữ liệu điểm danh" />
                    )}
                  </TabPane>
                </Tabs>
              </Card>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <Card title="Giáo viên">
                {classDetail.teacherInfo ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                      {classDetail.teacherInfo.firstName?.[0]}
                      {classDetail.teacherInfo.lastName?.[0]}
                    </div>
                    <div>
                      <div className="font-semibold">
                        {classDetail.teacherInfo.firstName}{" "}
                        {classDetail.teacherInfo.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        Giáo viên chủ nhiệm
                      </div>
                      {classDetail.teacherInfo.email && (
                        <div className="text-xs text-gray-400">
                          {classDetail.teacherInfo.email}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <Empty
                    description="Chưa có thông tin giáo viên"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
              </Card>

              <Card title="Thống kê lớp">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Tổng thành viên:</span>
                    <span className="font-semibold">
                      {classDetail.numberOfStudents || 0}
                    </span>
                  </div>
                  {classDetail.dayOfWeeks &&
                    classDetail.dayOfWeeks.length > 0 && (
                      <div className="flex justify-between">
                        <span>Lịch học:</span>
                        <span className="font-semibold">
                          {classDetail.dayOfWeeks
                            .map((d) => dayNames[d] || d)
                            .join(", ")}
                        </span>
                      </div>
                    )}
                  {classDetail.startTime && classDetail.endTime && (
                    <div className="flex justify-between">
                      <span>Giờ học:</span>
                      <span className="font-semibold">
                        {classDetail.startTime.slice(0, 5)} -{" "}
                        {classDetail.endTime.slice(0, 5)}
                      </span>
                    </div>
                  )}
                  {classDetail.startDate && classDetail.endDate && (
                    <div className="flex justify-between">
                      <span>Thời gian:</span>
                      <span className="font-semibold text-xs">
                        {new Date(classDetail.startDate).toLocaleDateString(
                          "vi-VN"
                        )}{" "}
                        -{" "}
                        {new Date(classDetail.endDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Ngày tạo:</span>
                    <span className="font-semibold">
                      {classDetail.createdDate &&
                        new Date(classDetail.createdDate).toLocaleDateString(
                          "vi-VN"
                        )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trạng thái:</span>
                    <Tag
                      color={
                        isActiveByDate(
                          classDetail.startDate,
                          classDetail.endDate
                        )
                          ? "green"
                          : "red"
                      }
                    >
                      {isActiveByDate(
                        classDetail.startDate,
                        classDetail.endDate
                      )
                        ? "Đang hoạt động"
                        : "Ngừng hoạt động"}
                    </Tag>
                  </div>
                </div>
              </Card>

              {(classDetail.classMeetUrl || classDetail.subClassMeetUrl) && (
                <Card title="Phòng học trực tuyến" className="mt-6">
                  <div className="space-y-3">
                    {classDetail.classMeetUrl && (
                      <div>
                        <div className="text-sm text-gray-500 mb-1">
                          Phòng học chính:
                        </div>
                        <a
                          href={classDetail.classMeetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 break-all block mb-1"
                        >
                          {classDetail.classMeetUrl}
                        </a>
                        <Button
                          type="link"
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              classDetail.classMeetUrl
                            );
                            message.success("Đã sao chép link!");
                          }}
                          className="p-0 h-auto"
                        >
                          Sao chép
                        </Button>
                      </div>
                    )}
                    {classDetail.subClassMeetUrl && (
                      <div>
                        <div className="text-sm text-gray-500 mb-1">
                          Phòng học phụ:
                        </div>
                        <a
                          href={classDetail.subClassMeetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 break-all block mb-1"
                        >
                          {classDetail.subClassMeetUrl}
                        </a>
                        <Button
                          type="link"
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              classDetail.subClassMeetUrl
                            );
                            message.success("Đã sao chép link!");
                          }}
                          className="p-0 h-auto"
                        >
                          Sao chép
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentClassDetail;
