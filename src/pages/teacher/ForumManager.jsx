import {
  Avatar,
  Badge,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  List,
  message,
  Modal,
  Select,
  Spin,
  Tabs,
  Tag,
  TimePicker,
} from "antd";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  FileText,
  Mail,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PaginatedTable from "../../components/PaginatedTable";
import { useAuth } from "../../context/AuthContext";
import { forumApi } from "../../services/forumApi";

const { Option } = Select;
const { Search: AntSearch } = Input;
const { TextArea } = Input;
const { TabPane } = Tabs;

const ForumManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classesTotal, setClassesTotal] = useState(0);
  // const [courses, setCourses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
  // Only need setter to avoid linter when not reading value
  // const [, setAddCourseModalVisible] = useState(false);
  const [classLoading, setClassLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("classes");
  const [tableKey, setTableKey] = useState(0); // force reload table after create
  const [examsTableKey, setExamsTableKey] = useState(0);
  const [form] = Form.useForm();
  const [memberForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editModalVisible, setEditModalVisible] = useState(false);
  // const [courseForm] = Form.useForm();

  useEffect(() => {
    // Table self-loads via PaginatedTable
  }, [user]);

  // Server-side fetcher for PaginatedTable
  const fetchForumsPage = async ({ page, size }) => {
    const response = await forumApi.getClasses({ page, size });
    const data = response?.data?.data ?? {};
    return {
      items: data.items ?? [],
      total: data.total ?? 0,
      page: data.page ?? page,
      size: data.size ?? size,
    };
  };

  // Fetcher function for Class Exams PaginatedTable
  const fetchClassExamsPage = useCallback(
    async ({ page, size }) => {
      if (!selectedClass?.id) {
        return { items: [], total: 0, page: 1, size: 10 };
      }

      const response = await forumApi.getClassExams(selectedClass.id, {
        page,
        size,
      });
      const data = response?.data?.data ?? {};
      return {
        items: data.items ?? [],
        total: data.total ?? 0,
        page: data.page ?? page,
        size: data.size ?? size,
      };
    },
    [selectedClass?.id]
  );

  const handleDeleteClassExam = (record) => {
    Modal.confirm({
      title: "Xóa bài thi",
      content: `Bạn có chắc chắn muốn xóa bài thi "${
        record.examName || "này"
      }" khỏi lớp học?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await forumApi.removeClassExam(record.id);
          message.success("Xóa bài thi thành công!");
          setExamsTableKey((prev) => prev + 1); // Refresh table
        } catch (error) {
          console.error("Error deleting class exam:", error);
          message.error(
            error.response?.data?.message || "Xóa bài thi thất bại!"
          );
        }
      },
    });
  };

  // Fetch recent students (page=1, size=2

  // const fetchCourses = async () => {
  //   try {
  //     const response = await courseApi.getAllCourses();
  //     setCourses(response.data);
  //   } catch (error) {
  //     console.error('Error fetching courses:', error);
  //     message.error('Không thể tải danh sách khóa học');
  //   }
  // };

  const handleCreateClass = async (values) => {
    try {
      // Build payload to match API contract
      const classData = {
        name: values.name?.trim() || "",
        description: values.description ?? null,
        startDate: values.dateRange?.[0]?.format("YYYY-MM-DD[T]00:00:00") || "",
        endDate: values.dateRange?.[1]?.format("YYYY-MM-DD[T]00:00:00") || "",
        startTime: values.startTime?.format("HH:mm:ss") || "",
        endTime: values.endTime?.format("HH:mm:ss") || "",
        dayOfWeeks: values.dayOfWeeks || [],
      };

      await forumApi.createClass(classData);
      message.success("Tạo lớp học thành công!");
      setModalVisible(false);
      form.resetFields();
      // Force reload the paginated table
      setTableKey((k) => k + 1);
    } catch (error) {
      console.error("Error creating class:", error);
      message.error("Tạo lớp học thất bại!");
    }
  };

  const handleAddMember = async (values) => {
    try {
      if (!selectedClass) {
        message.error("Vui lòng chọn lớp học trước!");
        return;
      }

      await forumApi.addMember(selectedClass.id, values.email);
      message.success(`Đã thêm học viên vào lớp!`);
      setAddMemberModalVisible(false);
      memberForm.resetFields();
      fetchClassDetails(selectedClass.id);
      setTableKey((k) => k + 1);
    } catch (error) {
      console.error("Error adding member:", error);
      message.error(error.response?.data?.message || "Thêm học viên thất bại!");
    }
  };

  // const handleAddCourse = async (values) => {
  //     try {
  //       if (!selectedClass) {
  //         message.error('Vui lòng chọn lớp học trước!');
  //         return;
  //       }

  //       const selectedCourse = courses.find(c => c.id === values.courseId);

  //       if (!selectedCourse) {
  //         message.error('Khóa học không tồn tại!');
  //         return;
  //       }

  //       await forumApi.addCourseToClass(selectedClass.id, values.courseId, user.id);
  //       message.success(`Đã thêm khóa học "${selectedCourse.title}" vào lớp "${selectedClass.name}"!`);
  //       setAddCourseModalVisible(false);
  //       courseForm.resetFields();

  //       fetchClassDetails(selectedClass.id);
  //     } catch (error) {
  //       console.error('Error adding course:', error);
  //       message.error('Thêm khóa học thất bại!');
  //     }
  //   };

  const fetchClassDetails = async (classId) => {
    try {
      setClassLoading(true);
      const response = await forumApi.getClassById(classId);
      const classDetails = response?.data?.data;
      if (classDetails) {
        // Transform API response to match component expectations
        setSelectedClass({
          ...classDetails,
          members: classDetails.assignedStudents || [],
          isActive: isActiveByDate(
            classDetails.startDate,
            classDetails.endDate
          ),
          createdAt: classDetails.createdDate,
        });
        console.log(" Class details:", classDetails);
      }
    } catch (error) {
      console.error("Error fetching class details:", error);
      message.error("Không thể tải chi tiết lớp học");
    } finally {
      setClassLoading(false);
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    // When switching to exams tab, refresh the table to ensure it has the latest selectedClass
    if (key === "exams" && selectedClass?.id) {
      setExamsTableKey((prev) => prev + 1);
    }
  };

  const handleViewClass = (classItem) => {
    setActiveTab("details");
    fetchClassDetails(classItem.id);
  };

  const openEditModal = () => {
    if (!selectedClass) return;
    // Prefill form values from selectedClass
    editForm.setFieldsValue({
      name: selectedClass.name ?? null,
      description: selectedClass.description ?? null,
      dateRange:
        selectedClass.startDate && selectedClass.endDate
          ? [dayjs(selectedClass.startDate), dayjs(selectedClass.endDate)]
          : undefined,
      startTime: selectedClass.startTime
        ? dayjs(selectedClass.startTime, "HH:mm:ss")
        : undefined,
      endTime: selectedClass.endTime
        ? dayjs(selectedClass.endTime, "HH:mm:ss")
        : undefined,
      dayOfWeeks: selectedClass.dayOfWeeks || [],
    });
    setEditModalVisible(true);
  };

  const handleUpdateClass = async (values) => {
    try {
      const payload = {
        name: values.name ?? null,
        description: values.description ?? null,
        startDate: values.dateRange?.[0]
          ? values.dateRange[0].format("YYYY-MM-DD[T]00:00:00")
          : null,
        endDate: values.dateRange?.[1]
          ? values.dateRange[1].format("YYYY-MM-DD[T]00:00:00")
          : null,
        startTime: values.startTime
          ? values.startTime.format("HH:mm:ss")
          : null,
        endTime: values.endTime ? values.endTime.format("HH:mm:ss") : null,
        dayOfWeeks: values.dayOfWeeks || [],
      };

      await forumApi.updateClass(selectedClass.id, payload);
      message.success("Cập nhật diễn đàn thành công!");
      setEditModalVisible(false);
      // refresh details
      fetchClassDetails(selectedClass.id);
      setTableKey((k) => k + 1);
    } catch (error) {
      console.error("Error updating forum:", error);
      message.error("Cập nhật diễn đàn thất bại!");
    }
  };

  const handleRemoveMember = async (memberId) => {
    Modal.confirm({
      title: "Xác nhận xóa học viên",
      content: "Bạn có chắc chắn muốn xóa học viên này khỏi diễn đàn?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await forumApi.removeMember(memberId);
          message.success("Đã xóa học viên khỏi diễn đàn!");
          fetchClassDetails(selectedClass.id);
          setTableKey((k) => k + 1);
        } catch (error) {
          console.error("Error removing member:", error);
          message.error("Xóa học viên thất bại!");
        }
      },
    });
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

  const isActiveByDate = (start, end) => {
    try {
      const now = new Date();
      const s = new Date(start);
      const e = new Date(end);
      return s <= now && now <= e;
    } catch {
      return false;
    }
  };

  const columns = [
    {
      title: "Tên diễn đàn",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <div className="font-semibold">{text}</div>
          <div className="text-sm text-gray-500">{record.description}</div>
        </div>
      ),
    },
    {
      title: "Học viên",
      dataIndex: "numberOfStudents",
      key: "numberOfStudents",
      render: (count) => (
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-1" />
          {count ?? 0}
        </div>
      ),
    },
    {
      title: "Lịch học",
      dataIndex: "dayOfWeeks",
      key: "dayOfWeeks",
      render: (days) => (
        <div className="flex flex-wrap gap-1">
          {(days || []).map((d) => (
            <Tag key={d}>{dayNames[d] ?? d}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Thời gian",
      key: "time",
      render: (_, r) => (
        <span>
          {(r.startTime ?? "").slice(0, 5)} - {(r.endTime ?? "").slice(0, 5)}
        </span>
      ),
    },
    {
      title: "Khoảng ngày",
      key: "dateRange",
      render: (_, r) => (
        <span>
          {r.startDate ? new Date(r.startDate).toLocaleDateString("vi-VN") : ""}{" "}
          - {r.endDate ? new Date(r.endDate).toLocaleDateString("vi-VN") : ""}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, r) => (
        <Tag color={isActiveByDate(r.startDate, r.endDate) ? "green" : "red"}>
          {isActiveByDate(r.startDate, r.endDate)
            ? "Đang hoạt động"
            : "Ngừng hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button
            size="small"
            icon={<Eye size={14} />}
            onClick={() => handleViewClass(record)}
          >
            Chi tiết
          </Button>
        </div>
      ),
    },
  ];

  const examsColumns = [
    {
      title: "Tên bài thi",
      dataIndex: "examName",
      key: "examName",
      render: (text, record) => (
        <div>
          <div className="font-semibold">{text || "Chưa có tên"}</div>
          <div className="text-sm text-gray-500">
            {record.description || "Chưa có mô tả"}
          </div>
        </div>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 130,
      render: (type) => {
        if (type === 0) return <Tag color="blue">Trắc nghiệm</Tag>;
        if (type === 1) return <Tag color="green">Tự luận</Tag>;
        return <Tag>Chưa xác định</Tag>;
      },
    },
    {
      title: "Thời gian",
      dataIndex: "duration",
      key: "duration",
      width: 120,
      render: (duration) => {
        if (!duration) return "-";
        // Format TimeOnly (HH:mm:ss) to readable format
        const parts = duration.split(":");
        if (parts.length >= 2) {
          const hours = parseInt(parts[0]);
          const minutes = parseInt(parts[1]);
          if (hours > 0) return `${hours}h ${minutes}m`;
          return `${minutes} phút`;
        }
        return duration;
      },
    },
    {
      title: "Số câu hỏi",
      dataIndex: "quantity",
      key: "quantity",
      width: 120,
      render: (quantity) => (quantity ? `${quantity} câu` : "-"),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Button
          type="text"
          size="small"
          danger
          icon={<Trash2 size={14} />}
          onClick={() => handleDeleteClassExam(record)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="text-6xl mb-4">block icon</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Vui lòng đăng nhập
          </h1>
          <p className="text-gray-600">
            Bạn cần đăng nhập để truy cập trang này
          </p>
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
          <Button
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate("/teacher")}
            className="mb-4"
          >
            Quay lại Dashboard
          </Button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quản Lý Lớp Học
              </h1>
              <p className="text-gray-600">
                Tạo và quản lý các lớp học, thêm học viên và khóa học
              </p>
            </div>
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={() => setModalVisible(true)}
            >
              Tạo Lớp Học
            </Button>
          </div>

          <Card>
            <Tabs
              activeKey={activeTab}
              onChange={handleTabChange}
              items={[
                {
                  key: "classes",
                  label: (
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Danh sách lớp học
                      <Badge
                        count={classesTotal}
                        style={{ backgroundColor: "#1890ff", marginLeft: 8 }}
                      />
                    </span>
                  ),
                  children: (
                    <PaginatedTable
                      key={tableKey}
                      columns={columns}
                      rowKey="id"
                      fetchData={fetchForumsPage}
                      initialPage={1}
                      initialSize={10}
                      onDataLoaded={({ total }) => {
                        setClassesTotal(total);
                      }}
                    />
                  ),
                },
                {
                  key: "details",
                  label: (
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-2" />
                      Chi tiết lớp học
                    </span>
                  ),
                  children: classLoading ? (
                    <div className="flex justify-center items-center py-20">
                      <Spin size="large" tip="Đang tải chi tiết lớp học..." />
                    </div>
                  ) : selectedClass ? (
                    <div className="grid lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2">
                        <div className="mb-6">
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {selectedClass.name}
                          </h2>
                          <p className="text-gray-600 mb-4">
                            {selectedClass.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Tag color="blue">Giáo viên: {user?.name}</Tag>
                            <Tag
                              color={selectedClass.isActive ? "green" : "red"}
                            >
                              {selectedClass.isActive
                                ? "Đang hoạt động"
                                : "Ngừng hoạt động"}
                            </Tag>
                            {selectedClass.dayOfWeeks &&
                              selectedClass.dayOfWeeks.length > 0 && (
                                <Tag color="purple">
                                  📅{" "}
                                  {selectedClass.dayOfWeeks
                                    .map((d) => dayNames[d])
                                    .join(", ")}
                                </Tag>
                              )}
                            {selectedClass.startTime && (
                              <Tag color="cyan">
                                🕐 {selectedClass.startTime.slice(0, 5)} -{" "}
                                {selectedClass.endTime?.slice(0, 5)}
                              </Tag>
                            )}
                            <Tag color="orange">
                              👥 {selectedClass.numberOfStudents || 0} học viên
                            </Tag>
                            <Button
                              size="small"
                              icon={<Pencil size={14} />}
                              onClick={openEditModal}
                            >
                              Chỉnh sửa
                            </Button>
                          </div>
                        </div>

                        <Card
                          title={
                            <div className="flex items-center justify-between">
                              <span className="flex items-center">
                                <Users className="w-5 h-5 mr-2" />
                                Thành viên lớp học (
                                {selectedClass.members?.length || 0})
                              </span>
                              <Button
                                type="primary"
                                size="small"
                                icon={<UserPlus size={14} />}
                                onClick={() => setAddMemberModalVisible(true)}
                              >
                                Thêm học viên
                              </Button>
                            </div>
                          }
                          className="mb-6"
                        >
                          {selectedClass.members &&
                          selectedClass.members.length > 0 ? (
                            <List
                              dataSource={selectedClass.members}
                              renderItem={(member) => (
                                <List.Item
                                  actions={[
                                    <Button
                                      size="small"
                                      danger
                                      onClick={() =>
                                        handleRemoveMember(member.id)
                                      }
                                    >
                                      Xóa
                                    </Button>,
                                  ]}
                                >
                                  <List.Item.Meta
                                    avatar={
                                      <Avatar>
                                        {member.firstName?.[0] || "S"}
                                      </Avatar>
                                    }
                                    title={`${member.firstName || ""} ${
                                      member.lastName || ""
                                    }`}
                                    description={
                                      <div>
                                        <div>{member.email}</div>
                                        <div className="text-xs text-gray-400">
                                          {member.phone && `📞 ${member.phone}`}
                                          {member.assignDate && (
                                            <span className="ml-2">
                                              Tham gia:{" "}
                                              {new Date(
                                                member.assignDate
                                              ).toLocaleDateString("vi-VN")}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    }
                                  />
                                </List.Item>
                              )}
                            />
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                              <p>Chưa có học viên nào trong lớp</p>
                              <Button
                                type="primary"
                                className="mt-4"
                                onClick={() => setAddMemberModalVisible(true)}
                              >
                                Thêm học viên đầu tiên
                              </Button>
                            </div>
                          )}
                        </Card>
                      </div>

                      <div className="lg:col-span-1">
                        <Card title="Thao tác nhanh">
                          <div className="space-y-4">
                            <Button
                              type="primary"
                              block
                              icon={<UserPlus size={16} />}
                              onClick={() => setAddMemberModalVisible(true)}
                            >
                              Thêm học viên
                            </Button>
                            {/* <Button 
                              block 
                              icon={<BookMarked size={16} />}
                              onClick={() => setAddCourseModalVisible(true)}
                            >
                              Thêm khóa học
                            </Button> */}
                            <Button block icon={<Mail size={16} />}>
                              Gửi thông báo
                            </Button>
                          </div>
                        </Card>

                        <Card className="mt-6" title="Thống kê lớp">
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span>Tổng thành viên:</span>
                              <span className="font-semibold">
                                {selectedClass.numberOfStudents || 0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Lịch học:</span>
                              <span className="font-semibold">
                                {(selectedClass.dayOfWeeks || [])
                                  .map((d) => dayNames[d])
                                  .join(", ")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Giờ học:</span>
                              <span className="font-semibold">
                                {(selectedClass.startTime || "").slice(0, 5)} -{" "}
                                {(selectedClass.endTime || "").slice(0, 5)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Thời gian:</span>
                              <span className="font-semibold text-xs">
                                {selectedClass.startDate &&
                                  new Date(
                                    selectedClass.startDate
                                  ).toLocaleDateString("vi-VN")}
                                {" - "}
                                {selectedClass.endDate &&
                                  new Date(
                                    selectedClass.endDate
                                  ).toLocaleDateString("vi-VN")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Ngày tạo:</span>
                              <span className="font-semibold">
                                {selectedClass.createdAt &&
                                  new Date(
                                    selectedClass.createdAt
                                  ).toLocaleDateString("vi-VN")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Trạng thái:</span>
                              <Tag
                                color={selectedClass.isActive ? "green" : "red"}
                              >
                                {selectedClass.isActive
                                  ? "Đang hoạt động"
                                  : "Ngừng hoạt động"}
                              </Tag>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Eye className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg mb-2">Chưa chọn lớp học</p>
                      <p>
                        Vui lòng chọn một lớp học từ danh sách để xem chi tiết
                      </p>
                    </div>
                  ),
                },
                {
                  key: "exams",
                  label: (
                    <span className="flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Danh sách bài thi
                    </span>
                  ),
                  children: !selectedClass ? (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg mb-2">Chưa chọn lớp học</p>
                      <p>
                        Vui lòng chọn một lớp học từ danh sách để xem bài thi
                      </p>
                    </div>
                  ) : (
                    <PaginatedTable
                      key={examsTableKey}
                      columns={examsColumns}
                      rowKey="id"
                      fetchData={fetchClassExamsPage}
                      initialPage={1}
                      initialSize={10}
                    />
                  ),
                },
              ]}
            />
          </Card>
        </motion.div>
      </div>

      <Modal
        title="Tạo Lớp Học Mới"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateClass}
          className="mt-6"
        >
          <Form.Item
            name="name"
            label="Tên lớp học"
            rules={[{ required: true, message: "Vui lòng nhập tên lớp học!" }]}
          >
            <Input placeholder="VD: Lớp Giao Tiếp Cơ Bản - K1" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả lớp học"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <TextArea
              rows={4}
              placeholder="Mô tả về lớp học, mục tiêu học tập..."
            />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Khoảng ngày"
            rules={[{ required: true, message: "Vui lòng chọn khoảng ngày!" }]}
          >
            <DatePicker.RangePicker format="DD/MM/YYYY" className="w-full" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="startTime"
              label="Giờ bắt đầu"
              rules={[
                { required: true, message: "Vui lòng chọn giờ bắt đầu!" },
              ]}
            >
              <TimePicker format="HH:mm" className="w-full" />
            </Form.Item>
            <Form.Item
              name="endTime"
              label="Giờ kết thúc"
              rules={[
                { required: true, message: "Vui lòng chọn giờ kết thúc!" },
              ]}
            >
              <TimePicker format="HH:mm" className="w-full" />
            </Form.Item>
          </div>

          <Form.Item
            name="dayOfWeeks"
            label="Lịch học trong tuần"
            rules={[
              { required: true, message: "Vui lòng chọn ít nhất một ngày!" },
            ]}
          >
            <Select mode="multiple" placeholder="Chọn các ngày trong tuần">
              <Select.Option value={1}>Thứ 2</Select.Option>
              <Select.Option value={2}>Thứ 3</Select.Option>
              <Select.Option value={3}>Thứ 4</Select.Option>
              <Select.Option value={4}>Thứ 5</Select.Option>
              <Select.Option value={5}>Thứ 6</Select.Option>
              <Select.Option value={6}>Thứ 7</Select.Option>
              <Select.Option value={7}>Chủ nhật</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex justify-end space-x-4">
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Tạo Lớp Học
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Chỉnh Sửa Diễn Đàn"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateClass}
          className="mt-6"
        >
          <Form.Item name="name" label="Tên diễn đàn">
            <Input placeholder="VD: Forum luyện nói - K1" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={4} placeholder="Mô tả về diễn đàn..." />
          </Form.Item>

          <Form.Item name="dateRange" label="Khoảng ngày">
            <DatePicker.RangePicker format="DD/MM/YYYY" className="w-full" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="startTime" label="Giờ bắt đầu">
              <TimePicker format="HH:mm" className="w-full" />
            </Form.Item>
            <Form.Item name="endTime" label="Giờ kết thúc">
              <TimePicker format="HH:mm" className="w-full" />
            </Form.Item>
          </div>

          <Form.Item name="dayOfWeeks" label="Lịch học trong tuần">
            <Select mode="multiple" placeholder="Chọn các ngày trong tuần">
              <Select.Option value={1}>Thứ 2</Select.Option>
              <Select.Option value={2}>Thứ 3</Select.Option>
              <Select.Option value={3}>Thứ 4</Select.Option>
              <Select.Option value={4}>Thứ 5</Select.Option>
              <Select.Option value={5}>Thứ 6</Select.Option>
              <Select.Option value={6}>Thứ 7</Select.Option>
              <Select.Option value={7}>Chủ nhật</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex justify-end space-x-4">
              <Button
                onClick={() => {
                  setEditModalVisible(false);
                  editForm.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Thêm Học Viên Vào Lớp"
        open={addMemberModalVisible}
        onCancel={() => {
          setAddMemberModalVisible(false);
          memberForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={memberForm}
          layout="vertical"
          onFinish={handleAddMember}
          className="mt-6"
        >
          <Form.Item
            name="email"
            label="Email học viên"
            rules={[
              { required: true, message: "Vui lòng nhập email học viên!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              prefix={<Mail className="text-gray-400" />}
              placeholder="Nhập email học viên đã đăng ký trong hệ thống"
            />
          </Form.Item>

          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-blue-700">
              Lưu ý: Học viên phải đã có tài khoản trong hệ thống với email này.
            </p>
          </div>

          <Form.Item className="mb-0">
            <div className="flex justify-end space-x-4">
              <Button
                onClick={() => {
                  setAddMemberModalVisible(false);
                  memberForm.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Thêm Học Viên
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* <Modal
        title="Thêm Khóa Học Vào Lớp"
        open={addCourseModalVisible}
        onCancel={() => {
          setAddCourseModalVisible(false);
          courseForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={courseForm}
          layout="vertical"
          onFinish={handleAddCourse}
          className="mt-6"
        >
          <Form.Item
            name="courseId"
            label="Chọn khóa học"
            rules={[{ required: true, message: 'Vui lòng chọn khóa học!' }]}
          >
            <Select placeholder="Chọn khóa học từ danh sách">
              {courses.map(course => (
                <Option key={course.id} value={course.id}>
                  <div className="flex items-center">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-8 h-8 object-cover rounded mr-3"
                    />
                    <div>
                      <div className="font-medium">{course.title}</div>
                      <div className="text-sm text-gray-500">
                        {course.level} • {course.duration} • {course.students} học viên
                      </div>
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex justify-end space-x-4">
              <Button onClick={() => {
                setAddCourseModalVisible(false);
                courseForm.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Thêm Khóa Học
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal> */}
    </div>
  );
};

export default ForumManager;
