import { Avatar, Button, Card, Input } from "antd";
import { motion } from "framer-motion";
import { Calendar, Mail, Phone, Search, UserCheck, Users } from "lucide-react";
import { useCallback, useState } from "react";
import PaginatedTable from "../../components/PaginatedTable";
import { forumApi } from "../../services/forumApi";

const StudentManagement = () => {
  const [searchParams, setSearchParams] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [tableKey, setTableKey] = useState(0);

  // Fetcher function for PaginatedTable
  const fetchStudentsPage = useCallback(
    async ({ page, size }) => {
      try {
        const params = {
          page,
          size,
          ...(searchParams.name && { name: searchParams.name.trim() }),
          ...(searchParams.email && { email: searchParams.email.trim() }),
          ...(searchParams.phone && { phone: searchParams.phone.trim() }),
        };

        const response = await forumApi.getClassMembers(params);
        const data = response?.data?.data ?? {};

        return {
          items: data.items ?? [],
          total: data.total ?? 0,
          page: data.page ?? page,
          size: data.size ?? size,
        };
      } catch (error) {
        console.error("Error fetching students:", error);
        return { items: [], total: 0, page, size };
      }
    },
    [searchParams]
  );

  const handleSearch = () => {
    // Force re-render of PaginatedTable by changing key
    setTableKey((prev) => prev + 1);
  };

  const handleReset = () => {
    setSearchParams({ name: "", email: "", phone: "" });
    setTableKey((prev) => prev + 1);
  };

  const columns = [
    {
      title: "Học viên",
      key: "student",
      width: 250,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            style={{
              backgroundColor: "#1890ff",
              verticalAlign: "middle",
            }}
          >
            {record.firstName?.[0]?.toUpperCase()}
          </Avatar>
          <div>
            <div className="font-semibold">
              {record.firstName} {record.lastName}
            </div>
            <div className="text-xs text-gray-500">{record.studentId}</div>
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
      title: "Lớp học",
      dataIndex: "forumName",
      key: "forumName",
      width: 200,
      render: (forumName) => (
        <div className="flex items-center gap-2">
          <Users size={14} className="text-gray-400" />
          <span className="text-sm">{forumName}</span>
        </div>
      ),
    },
    {
      title: "Ngày tham gia",
      dataIndex: "assignDate",
      key: "assignDate",
      width: 150,
      render: (date) => (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-sm">
            {new Date(date).toLocaleDateString("vi-VN")}
          </span>
        </div>
      ),
    },
    // {
    //   title: "Trạng thái",
    //   key: "status",
    //   width: 120,
    //   render: () => (
    //     <Badge
    //       status="success"
    //       text={<span className="text-sm">Đang học</span>}
    //     />
    //   ),
    // },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <UserCheck className="w-8 h-8 text-blue-600" />
                Quản lý học viên
              </h1>
              <p className="text-gray-600 mt-1">
                Danh sách học viên trong các lớp học
              </p>
            </div>
          </div>

          {/* Search Filters */}
          <Card className="mb-6" title="Tìm kiếm học viên">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên học viên
                </label>
                <Input
                  placeholder="Nhập tên học viên"
                  prefix={<Search size={16} />}
                  value={searchParams.name}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, name: e.target.value })
                  }
                  onPressEnter={handleSearch}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  placeholder="Nhập email"
                  prefix={<Mail size={16} />}
                  value={searchParams.email}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, email: e.target.value })
                  }
                  onPressEnter={handleSearch}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <Input
                  placeholder="Nhập số điện thoại"
                  prefix={<Phone size={16} />}
                  value={searchParams.phone}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, phone: e.target.value })
                  }
                  onPressEnter={handleSearch}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={handleReset}>Đặt lại</Button>
              <Button
                type="primary"
                icon={<Search size={16} />}
                onClick={handleSearch}
              >
                Tìm kiếm
              </Button>
            </div>
          </Card>

          {/* Students Table */}
          <Card>
            <PaginatedTable
              key={tableKey}
              columns={columns}
              fetchData={fetchStudentsPage}
              rowKey="id"
              initialPage={1}
              initialSize={10}
            />
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentManagement;
