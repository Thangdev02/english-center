import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, Table, Tag, Progress, Statistic, Row, Col, Button } from "antd";
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Delete,
} from "lucide-react";
import { Link } from "react-router-dom";
import { courseApi } from "../../services/courseApi";

const AdminDashboard = () => {
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const stats = [
    {
      title: "Tổng học viên",
      value: 1250,
      icon: <Users className="w-8 h-8 text-blue-500" />,
      change: "+12%",
      color: "blue",
    },
    {
      title: "Tổng khóa học",
      value: 45,
      icon: <BookOpen className="w-8 h-8 text-green-500" />,
      change: "+5%",
      color: "green",
    },
    {
      title: "Doanh thu",
      value: "125M",
      icon: <DollarSign className="w-8 h-8 text-purple-500" />,
      change: "+23%",
      color: "purple",
    },
    {
      title: "Tỷ lệ hoàn thành",
      value: "78%",
      icon: <TrendingUp className="w-8 h-8 text-orange-500" />,
      change: "+8%",
      color: "orange",
    },
  ];

  useEffect(() => {
    fetchRecentCourses();
  }, []);

  const fetchRecentCourses = async () => {
    try {
      setLoading(true);
      const response = await courseApi.getAllCourses({
        page: 1,
        size: 2,
        sortBy: "createdDate",
        isAsc: false,
      });
      setRecentCourses(response.data?.data?.items || []);
    } catch (error) {
      console.error("Error fetching recent courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Tên khóa học",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Cấp độ",
      dataIndex: "level",
      key: "level",
      render: (level) => {
        const levelMap = {
          0: { text: "Beginner", color: "green" },
          1: { text: "Intermediate", color: "blue" },
          2: { text: "Advanced", color: "orange" },
        };
        const levelInfo = levelMap[level] || { text: "Unknown", color: "gray" };
        return <Tag color={levelInfo.color}>{levelInfo.text}</Tag>;
      },
    },
    {
      title: "Thời lượng",
      dataIndex: "duration",
      key: "duration",
      render: (duration) => `${duration}`,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <div className="flex space-x-2">
          <Link to={`/admin/courses/${record.id}`}>
            <Button type="link" icon={<Edit size={16} />} />
          </Link>
        </div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Dashboard Quản Trị
          </h1>

          <Row gutter={[16, 16]} className="mb-8">
            {stats.map((stat, index) => (
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
                        <div
                          className={`text-sm ${
                            stat.change.startsWith("+")
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {stat.change} so với tháng trước
                        </div>
                      </div>
                      {stat.icon}
                    </div>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card
              title="Khóa học gần đây"
              extra={
                <Link to="/admin/courses">
                  <Button type="link">Xem tất cả</Button>
                </Link>
              }
            >
              <Table
                columns={columns}
                dataSource={recentCourses}
                pagination={false}
                rowKey="id"
                size="small"
                loading={loading}
              />
            </Card>

            <Card title="Thao tác nhanh">
              <div className="grid grid-cols-2 gap-4">
                <Link to="/admin/courses/add">
                  <Button type="primary" size="large" block>
                    Thêm khóa học
                  </Button>
                </Link>
                <Link to="/admin/users">
                  <Button size="large" block>
                    Quản lý người dùng
                  </Button>
                </Link>
                <Link to="/admin/exams">
                  <Button size="large" block>
                    Bài thi miễn phí
                  </Button>
                </Link>
                <Button size="large" block>
                  Cài đặt hệ thống
                </Button>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
