import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Select,
  Button,
  Tag,
  Space,
  Badge,
  Avatar,
  Tooltip,
  Modal,
  message,
} from "antd";
import {
  Users,
  Shield,
  Mail,
  Phone,
  Calendar,
  Edit,
  Trash2,
  UserCheck,
  GraduationCap,
  ArrowLeft,
} from "lucide-react";
import PaginatedTable from "../../components/PaginatedTable";
import { userApi } from "../../services/userApi";

const { Option } = Select;

const UserManagement = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");
  const [tableKey, setTableKey] = useState(0);

  // Fetcher function for PaginatedTable
  const fetchUsersPage = useCallback(
    async ({ page, size }) => {
      try {
        const params = {
          page,
          size,
          ...(selectedRole && { role: selectedRole }),
        };

        const response = await userApi.getAllUsers(params);
        const data = response?.data?.data ?? {};

        return {
          items: data.items ?? [],
          total: data.total ?? 0,
          page: data.page ?? page,
          size: data.size ?? size,
        };
      } catch (error) {
        console.error("Error fetching users:", error);
        message.error("Không thể tải danh sách người dùng");
        return { items: [], total: 0, page, size };
      }
    },
    [selectedRole]
  );

  const handleRoleChange = (value) => {
    setSelectedRole(value);
    setTableKey((prev) => prev + 1);
  };

  const handleReset = () => {
    setSelectedRole("");
    setTableKey((prev) => prev + 1);
  };

  //   const handleEdit = (record) => {
  //     console.log("Edit user:", record);
  //     message.info("Chức năng đang phát triển");
  //   };

  //   const handleDelete = (record) => {
  //     Modal.confirm({
  //       title: "Xác nhận xóa người dùng",
  //       content: `Bạn có chắc chắn muốn xóa người dùng "${record.firstName} ${record.lastName}"?`,
  //       okText: "Xóa",
  //       okType: "danger",
  //       cancelText: "Hủy",
  //       onOk: async () => {
  //         try {
  //           await userApi.deleteUser(record.id);
  //           message.success("Xóa người dùng thành công");
  //           setTableKey((prev) => prev + 1);
  //         } catch (error) {
  //           console.error("Error deleting user:", error);
  //           message.error("Không thể xóa người dùng");
  //         }
  //       },
  //     });
  //   };

  const getRoleColor = (role) => {
    switch (role) {
      case 1:
        return "green";
      case 2:
        return "blue";
      default:
        return "default";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 1:
        return <GraduationCap size={14} />;
      case 2:
        return <UserCheck size={14} />;
      default:
        return null;
    }
  };

  const columns = [
    {
      title: "Người dùng",
      key: "user",
      width: 250,
      fixed: "left",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            style={{
              backgroundColor:
                getRoleColor(record.role) === "red"
                  ? "#ff4d4f"
                  : getRoleColor(record.role) === "blue"
                  ? "#1890ff"
                  : "#52c41a",
              verticalAlign: "middle",
            }}
          >
            {record.firstName?.[0]}
          </Avatar>
          <div>
            <div className="font-semibold">
              {record.firstName} {record.lastName}
            </div>
            <div className="text-xs text-gray-500">{record.username}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 220,
      render: (email) => (
        <div className="flex items-center gap-2">
          <Mail size={14} className="text-gray-400" />
          <span className="text-sm">{email}</span>
        </div>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 150,
      render: (phone) => (
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-gray-400" />
          <span className="text-sm">{phone || "N/A"}</span>
        </div>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      width: 120,
      render: (role) => (
        <Tag
          color={getRoleColor(role)}
          icon={getRoleIcon(role)}
          className="flex items-center gap-1 w-fit"
        >
          {role === 1 ? "Học viên" : role === 2 ? "Giáo viên" : role}
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
                <Users className="w-8 h-8 text-blue-600" />
                Quản lý người dùng
              </h1>
              <p className="text-gray-600 mt-1">
                Danh sách tất cả người dùng trong hệ thống
              </p>
            </div>
          </div>

          {/* Filter Card */}
          <Card className="mb-6" title="Lọc người dùng">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vai trò
                </label>
                <Select
                  placeholder="Chọn vai trò"
                  value={selectedRole || undefined}
                  onChange={handleRoleChange}
                  style={{ width: "100%" }}
                  allowClear
                >
                  <Option value="Student">
                    <div className="flex items-center gap-2">
                      <GraduationCap size={16} />
                      Học viên
                    </div>
                  </Option>
                  <Option value="Teacher">
                    <div className="flex items-center gap-2">
                      <UserCheck size={16} />
                      Giáo viên
                    </div>
                  </Option>
                </Select>
              </div>
              <Button onClick={handleReset}>Đặt lại</Button>
            </div>
          </Card>

          {/* Users Table */}
          <Card>
            <PaginatedTable
              key={tableKey}
              columns={columns}
              fetchData={fetchUsersPage}
              rowKey="id"
              initialPage={1}
              initialSize={10}
              scroll={{ x: 1200 }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
