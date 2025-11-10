import {
  Button,
  Calendar,
  Card,
  Input,
  List,
  message,
  Modal,
  Select,
  Spin,
  Tag,
  Checkbox,
  Form,
  Table,
} from "antd";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, MapPin, Users, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { forumApi } from "../../services/forumApi";

// Extend dayjs with isBetween plugin
dayjs.extend(isBetween);

const { Option } = Select;
const { TextArea } = Input;

const TeacherSchedule = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [selectedClassForAttendance, setSelectedClassForAttendance] =
    useState(null);
  const [attendanceDate, setAttendanceDate] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchClassesByMonth(currentMonth);
    }
  }, [user, currentMonth]);

  const fetchClassesByMonth = async (date) => {
    try {
      setLoading(true);
      const startOfMonth = date.startOf("month").format("YYYY-MM-DD");
      const endOfMonth = date.endOf("month").format("YYYY-MM-DD");

      const response = await forumApi.getClassesByTime({
        fromDate: startOfMonth,
        toDate: endOfMonth,
      });

      const data = response?.data?.data || [];
      console.log("📅 Classes by time:", data);
      setClasses(data);
    } catch (err) {
      console.error("Error fetching classes:", err);
      message.error("Không thể tải dữ liệu lịch dạy");
    } finally {
      setLoading(false);
    }
  };

  const dayNames = {
    1: "T2",
    2: "T3",
    3: "T4",
    4: "T5",
    5: "T6",
    6: "T7",
    7: "CN",
  };

  const isClassOnDate = (classItem, date) => {
    const classStartDate = dayjs(classItem.startDate);
    const classEndDate = dayjs(classItem.endDate);
    const currentDate = dayjs(date);

    // Check if the date is within the class date range
    if (!currentDate.isBetween(classStartDate, classEndDate, "day", "[]")) {
      return false;
    }

    // Check if the day of week matches
    const dayOfWeek = currentDate.day(); // 0 (Sunday) to 6 (Saturday)
    const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek; // Convert Sunday from 0 to 7

    return classItem.dayOfWeeks && classItem.dayOfWeeks.includes(adjustedDay);
  };

  const calculateMonthlyHours = () => {
    let totalMinutes = 0;

    classes.forEach((classItem) => {
      if (!classItem.startTime || !classItem.endTime) return;

      // Parse time strings "HH:mm:ss"
      const [startHour, startMin] = classItem.startTime.split(":").map(Number);
      const [endHour, endMin] = classItem.endTime.split(":").map(Number);

      // Calculate duration in minutes per session
      const durationMinutes =
        endHour * 60 + endMin - (startHour * 60 + startMin);

      // Count number of sessions this month
      const startOfMonth = currentMonth.startOf("month");
      const endOfMonth = currentMonth.endOf("month");
      let sessionsCount = 0;

      for (
        let d = startOfMonth;
        d.isBefore(endOfMonth) || d.isSame(endOfMonth, "day");
        d = d.add(1, "day")
      ) {
        if (isClassOnDate(classItem, d)) {
          sessionsCount++;
        }
      }

      totalMinutes += durationMinutes * sessionsCount;
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (minutes > 0) {
      return `${hours}h ${minutes}p`;
    }
    return `${hours}h`;
  };

  const getClassesForDate = (date) => {
    return classes.filter((classItem) => isClassOnDate(classItem, date));
  };

  const dateCellRender = (value) => {
    const dateClasses = getClassesForDate(value);
    return (
      <div className="min-h-[80px]">
        {dateClasses.map((classItem) => (
          <div
            key={classItem.id}
            className="mb-1 p-1 text-xs rounded cursor-pointer bg-blue-100 border border-blue-200 hover:bg-blue-200 transition-colors"
            onClick={() => handleClassClick(classItem)}
          >
            <div className="font-medium truncate">{classItem.name}</div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-3 h-3 mr-1" />
              {classItem.startTime?.slice(0, 5)} -{" "}
              {classItem.endTime?.slice(0, 5)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleAttendanceClick = async (classItem, date) => {
    if (!classItem.numberOfStudents || classItem.numberOfStudents === 0) {
      message.warning("Lớp học chưa có học viên");
      return;
    }

    setSelectedClassForAttendance(classItem);
    setAttendanceDate(date);
    setAttendanceModalVisible(true);
    await fetchAttendances(classItem.id, date);
  };

  const fetchAttendances = async (forumId, date) => {
    try {
      setLoadingAttendance(true);
      const formattedDate = dayjs(date).format("YYYY-MM-DD");
      const response = await forumApi.getAttendances(forumId, formattedDate);

      if (
        !response.data?.data ||
        (Array.isArray(response.data.data) && response.data.data.length === 0)
      ) {
        // Empty array - need to create attendance
        await forumApi.postAttendances(forumId, formattedDate);
        // Fetch again after creating
        const newResponse = await forumApi.getAttendances(
          forumId,
          formattedDate
        );
        setAttendances(newResponse.data?.data || []);
      } else {
        setAttendances(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching attendances:", error);
      message.error(
        error.response?.data?.data || "Không thể tải danh sách điểm danh"
      );
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleAttendanceChange = (attendanceId, field, value) => {
    setAttendances((prev) =>
      prev.map((att) =>
        att.id === attendanceId ? { ...att, [field]: value } : att
      )
    );
  };

  const handleSaveAttendance = async () => {
    try {
      setSavingAttendance(true);

      const attendanceData = attendances.map((att) => ({
        attendanceId: att.id,
        isPresent: att.isPresent,
        note: att.note || null,
      }));

      await forumApi.updateAttendance(
        selectedClassForAttendance.id,
        attendanceDate.format("YYYY-MM-DD"),
        attendanceData
      );

      message.success("Cập nhật điểm danh thành công!");
      setAttendanceModalVisible(false);
    } catch (error) {
      console.error("Error saving attendance:", error);
      message.error(
        error.response?.data?.data || "Không thể cập nhật điểm danh"
      );
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleClassClick = (classItem) => {
    Modal.info({
      title: classItem.name,
      content: (
        <div className="space-y-2">
          {classItem.description && (
            <p className="text-gray-700 mb-3">{classItem.description}</p>
          )}

          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-gray-600" />
            <span>
              {classItem.startTime?.slice(0, 5)} -{" "}
              {classItem.endTime?.slice(0, 5)}
            </span>
          </div>

          {classItem.dayOfWeeks && classItem.dayOfWeeks.length > 0 && (
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-gray-600" />
              <span>
                Lịch học:{" "}
                {classItem.dayOfWeeks.map((d) => dayNames[d] || d).join(", ")}
              </span>
            </div>
          )}

          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 text-gray-600" />
            <span>{classItem.numberOfStudents || 0} học viên</span>
          </div>

          {classItem.teacherInfo && (
            <div className="mt-3 p-3 bg-gray-50 rounded">
              <div className="text-sm font-medium text-gray-700 mb-1">
                Giáo viên:
              </div>
              <div className="text-sm">
                {classItem.teacherInfo.firstName}{" "}
                {classItem.teacherInfo.lastName}
              </div>
              <div className="text-xs text-gray-500">
                {classItem.teacherInfo.email}
              </div>
            </div>
          )}

          <div className="mt-2 text-xs text-gray-500">
            Thời gian: {dayjs(classItem.startDate).format("DD/MM/YYYY")} -{" "}
            {dayjs(classItem.endDate).format("DD/MM/YYYY")}
          </div>
        </div>
      ),
      okText: "Đóng",
      width: 500,
    });
  };

  const todayClasses = getClassesForDate(selectedDate);

  const attendanceColumns = [
    {
      title: "Học viên",
      dataIndex: "studentName",
      key: "studentName",
      width: 200,
    },
    {
      title: "Có mặt",
      dataIndex: "isPresent",
      key: "isPresent",
      width: 100,
      render: (isPresent, record) => (
        <Checkbox
          checked={isPresent}
          onChange={(e) =>
            handleAttendanceChange(record.id, "isPresent", e.target.checked)
          }
        />
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "checkInTime",
      key: "checkInTime",
      width: 150,
      render: (time) => (time ? dayjs(time, "HH:mm:ss").format("HH:mm") : "-"),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      render: (note, record) => (
        <Input.TextArea
          value={note || ""}
          onChange={(e) =>
            handleAttendanceChange(record.id, "note", e.target.value)
          }
          placeholder="Nhập ghi chú..."
          rows={2}
          maxLength={200}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate("/teacher")}
            className="mb-4"
          >
            Quay lại Dashboard
          </Button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lịch Dạy Học</h1>
              <p className="text-gray-600">
                Quản lý lịch dạy và lớp học của bạn
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <Calendar
                  value={selectedDate}
                  onChange={setSelectedDate}
                  cellRender={dateCellRender}
                  headerRender={({ value, onChange }) => (
                    <div className="flex justify-between items-center mb-4">
                      <Button
                        onClick={() => {
                          const newMonth = value.subtract(1, "month");
                          onChange(newMonth);
                          setCurrentMonth(newMonth);
                        }}
                      >
                        Tháng trước
                      </Button>
                      <span className="text-lg font-semibold">
                        {value.format("MMMM YYYY")}
                      </span>
                      <Button
                        onClick={() => {
                          const newMonth = value.add(1, "month");
                          onChange(newMonth);
                          setCurrentMonth(newMonth);
                        }}
                      >
                        Tháng sau
                      </Button>
                    </div>
                  )}
                />
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card title={`Lịch dạy - ${selectedDate.format("DD/MM/YYYY")}`}>
                {loading ? (
                  <div className="text-center py-8">
                    <Spin size="large" />
                  </div>
                ) : todayClasses.length > 0 ? (
                  <List
                    dataSource={todayClasses}
                    renderItem={(classItem) => (
                      <List.Item>
                        <div className="w-full">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-semibold">
                              {classItem.name}
                            </div>
                            <Tag color="blue">Lớp học</Tag>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <Clock className="w-4 h-4 mr-1" />
                            {classItem.startTime?.slice(0, 5)} -{" "}
                            {classItem.endTime?.slice(0, 5)}
                          </div>
                          {classItem.dayOfWeeks &&
                            classItem.dayOfWeeks.length > 0 && (
                              <div className="flex items-center text-sm text-gray-600 mb-1">
                                <MapPin className="w-4 h-4 mr-1" />
                                Lịch:{" "}
                                {classItem.dayOfWeeks
                                  .map((d) => dayNames[d] || d)
                                  .join(", ")}
                              </div>
                            )}
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <Users className="w-4 h-4 mr-1" />
                            {classItem.numberOfStudents || 0} học viên
                          </div>
                          <Button
                            type="primary"
                            size="middle"
                            icon={<UserCheck className="w-3 h-3" />}
                            onClick={() =>
                              handleAttendanceClick(classItem, selectedDate)
                            }
                            disabled={
                              !classItem.numberOfStudents ||
                              classItem.numberOfStudents === 0
                            }
                            className="w-full"
                          >
                            Điểm danh
                          </Button>
                        </div>
                      </List.Item>
                    )}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Không có lịch dạy nào trong ngày</p>
                  </div>
                )}
              </Card>

              <Card className="mt-6" title="Thống kê tháng">
                {loading ? (
                  <div className="text-center py-4">
                    <Spin />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Số lớp:</span>
                      <span className="font-semibold">{classes.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tổng học viên:</span>
                      <span className="font-semibold">
                        {classes.reduce(
                          (sum, cls) => sum + (cls.numberOfStudents || 0),
                          0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Giờ dạy trong tháng:</span>
                      <span className="font-semibold">
                        {calculateMonthlyHours()}
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Attendance Modal */}
          <Modal
            title={
              <div>
                <div className="text-lg font-semibold">
                  Điểm danh - {selectedClassForAttendance?.name}
                </div>
                <div className="text-sm text-gray-500 font-normal">
                  Ngày: {attendanceDate?.format("DD/MM/YYYY")}
                </div>
              </div>
            }
            open={attendanceModalVisible}
            onCancel={() => setAttendanceModalVisible(false)}
            width={800}
            footer={[
              <Button
                key="cancel"
                onClick={() => setAttendanceModalVisible(false)}
              >
                Hủy
              </Button>,
              <Button
                key="save"
                type="primary"
                loading={savingAttendance}
                onClick={handleSaveAttendance}
              >
                Lưu điểm danh
              </Button>,
            ]}
          >
            {loadingAttendance ? (
              <div className="text-center py-8">
                <Spin size="large" />
                <p className="mt-4 text-gray-500">Đang tải danh sách...</p>
              </div>
            ) : (
              <div>
                <div className="mb-4 p-3 bg-blue-50 rounded">
                  <div className="text-sm text-gray-700">
                    <strong>Tổng số học viên:</strong> {attendances.length}
                  </div>
                  <div className="text-sm text-gray-700">
                    <strong>Có mặt:</strong>{" "}
                    {attendances.filter((a) => a.isPresent).length}
                  </div>
                  <div className="text-sm text-gray-700">
                    <strong>Vắng:</strong>{" "}
                    {attendances.filter((a) => !a.isPresent).length}
                  </div>
                </div>
                <Table
                  dataSource={attendances}
                  columns={attendanceColumns}
                  rowKey="id"
                  pagination={false}
                  scroll={{ y: 400 }}
                />
              </div>
            )}
          </Modal>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherSchedule;
