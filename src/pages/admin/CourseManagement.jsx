import React, { useState, useCallback } from "react";
import {
  Card,
  Input,
  Button,
  Tag,
  Space,
  Avatar,
  Modal,
  message,
  Switch,
} from "antd";
import {
  BookOpen,
  Search,
  Calendar,
  Clock,
  User,
  Edit,
  Trash2,
  Plus,
  Eye,
  ArrowLeft,
} from "lucide-react";
import PaginatedTable from "../../components/PaginatedTable";
import { courseApi } from "../../services/courseApi";
import { useNavigate } from "react-router-dom";

const CourseManagement = () => {
  const navigate = useNavigate();
  const [searchName, setSearchName] = useState("");
  const [tableKey, setTableKey] = useState(0);

  // Fetcher function for PaginatedTable
  const fetchCoursesPage = useCallback(
    async ({ page, size }) => {
      try {
        const params = {
          page,
          size,
          ...(searchName && { name: searchName }),
        };

        const response = await courseApi.getAllCourses(params);
        const data = response?.data?.data ?? {};

        return {
          items: data.items ?? [],
          total: data.total ?? 0,
          page: data.page ?? page,
          size: data.size ?? size,
        };
      } catch (error) {
        console.error("Error fetching courses:", error);
        message.error("Không thể tải danh sách khóa học");
        return { items: [], total: 0, page, size };
      }
    },
    [searchName]
  );

  const handleSearch = () => {
    setTableKey((prev) => prev + 1);
  };

  const handleReset = () => {
    setSearchName("");
    setTableKey((prev) => prev + 1);
  };

  const handleAddCourse = () => {
    navigate("/admin/courses/add");
  };

  const handleEdit = (record) => {
    console.log("Edit course:", record);
    navigate(`/admin/courses/${record.id}`);
  };

  const handleView = (record) => {
    console.log("View course:", record);
    navigate(`/courses/${record.id}`);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Xác nhận xóa khóa học",
      content: `Bạn có chắc chắn muốn xóa khóa học "${record.name}"?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await courseApi.deleteCourse(record.id);
          message.success("Xóa khóa học thành công");
          setTableKey((prev) => prev + 1);
        } catch (error) {
          console.error("Error deleting course:", error);
          message.error("Không thể xóa khóa học");
        }
      },
    });
  };

  const handleToggleActive = async (record, checked) => {
    try {
      await courseApi.updateCourse(record.id, { isActive: checked });
      message.success(`${checked ? "Kích hoạt" : "Ẩn"} khóa học thành công`);
      setTableKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error updating course status:", error);
      message.error("Không thể cập nhật trạng thái khóa học");
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 1:
        return "green";
      case 2:
        return "blue";
      case 3:
        return "red";
      default:
        return "default";
    }
  };

  const getLevelText = (level) => {
    switch (level) {
      case 1:
        return "Beginner";
      case 2:
        return "Intermediate";
      case 3:
        return "Advanced";
      default:
        return "Unknown";
    }
  };

  const columns = [
    {
      title: "Khóa học",
      key: "course",
      width: 300,
      fixed: "left",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={50}
            shape="square"
            src={record.imageUrl}
            style={{
              backgroundColor: "#1890ff",
              verticalAlign: "middle",
            }}
          >
            {record.name?.[0]}
          </Avatar>
          <div>
            <div className="font-semibold text-sm">{record.name}</div>
            <div className="text-xs text-gray-500 line-clamp-1">
              {record.description || "Chưa có mô tả"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Trình độ",
      dataIndex: "level",
      key: "level",
      width: 120,
      render: (level) => (
        <Tag color={getLevelColor(level)} className="capitalize">
          {getLevelText(level)}
        </Tag>
      ),
    },
    {
      title: "Thời lượng",
      dataIndex: "duration",
      key: "duration",
      width: 130,
      render: (duration) => (
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-gray-400" />
          <span className="text-sm">{duration}</span>
        </div>
      ),
    },
    {
      title: "Giáo viên",
      dataIndex: "teacherAccountId",
      key: "teacherAccountId",
      width: 200,
      render: (teacherAccountId) => (
        <div className="flex items-center gap-2">
          <User size={14} className="text-gray-400" />
          <span className="text-xs text-gray-600">
            {teacherAccountId
              ? teacherAccountId.substring(0, 8) + "..."
              : "N/A"}
          </span>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hiện" : "Ẩn"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 150,
      render: (date) => (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-sm">
            {date ? new Date(date).toLocaleDateString("vi-VN") : "N/A"}
          </span>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<Edit size={16} />}
            onClick={() => handleEdit(record)}
            className="text-yellow-600 hover:text-yellow-700"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="animate-fade-in">
          <Button
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate("/admin")}
            className="mb-4"
          >
            Quay lại Dashboard
          </Button>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-blue-600" />
                Quản lý khóa học
              </h1>
              <p className="text-gray-600 mt-1">
                Danh sách tất cả khóa học trong hệ thống
              </p>
            </div>
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={handleAddCourse}
              size="large"
              className="rounded-lg"
            >
              Thêm khóa học
            </Button>
          </div>

          {/* Filter Card */}
          <Card className="mb-6" title="Tìm kiếm khóa học">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên khóa học
                </label>
                <Input
                  placeholder="Nhập tên khóa học..."
                  prefix={<Search size={16} />}
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onPressEnter={handleSearch}
                  allowClear
                />
              </div>
              <Button type="primary" onClick={handleSearch}>
                Tìm kiếm
              </Button>
              <Button onClick={handleReset}>Đặt lại</Button>
            </div>
          </Card>

          {/* Courses Table */}
          <Card>
            <PaginatedTable
              key={tableKey}
              columns={columns}
              fetchData={fetchCoursesPage}
              rowKey="id"
              initialPage={1}
              initialSize={10}
              scroll={{ x: 1400 }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;
