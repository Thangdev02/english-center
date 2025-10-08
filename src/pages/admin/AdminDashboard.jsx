import React from 'react';
import { motion } from 'framer-motion';
import { Card, Table, Tag, Progress, Statistic, Row, Col, Button } from 'antd';
import { Users, BookOpen, DollarSign, TrendingUp, Eye, Edit, Delete } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const stats = [
    {
      title: 'Tổng học viên',
      value: 1250,
      icon: <Users className="w-8 h-8 text-blue-500" />,
      change: '+12%',
      color: 'blue'
    },
    {
      title: 'Tổng khóa học',
      value: 45,
      icon: <BookOpen className="w-8 h-8 text-green-500" />,
      change: '+5%',
      color: 'green'
    },
    {
      title: 'Doanh thu',
      value: '125M',
      icon: <DollarSign className="w-8 h-8 text-purple-500" />,
      change: '+23%',
      color: 'purple'
    },
    {
      title: 'Tỷ lệ hoàn thành',
      value: '78%',
      icon: <TrendingUp className="w-8 h-8 text-orange-500" />,
      change: '+8%',
      color: 'orange'
    }
  ];

  const recentCourses = [
    {
      id: 1,
      name: 'Tiếng Anh Giao Tiếp',
      students: 250,
      revenue: '25,000,000₫',
      status: 'active',
      rating: 4.8
    },
    {
      id: 2,
      name: 'Luyện Thi IELTS',
      students: 180,
      revenue: '45,000,000₫',
      status: 'active',
      rating: 4.9
    }
  ];

  const columns = [
    {
      title: 'Tên khóa học',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Học viên',
      dataIndex: 'students',
      key: 'students'
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue'
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => <Tag color="gold">{rating}/5.0</Tag>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: () => (
        <div className="flex space-x-2">
          <Button type="link" icon={<Eye size={16} />} />
          <Button type="link" icon={<Edit size={16} />} />
          <Button type="link" danger icon={<Delete size={16} />} />
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Quản Trị</h1>

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
                        <div className={`text-sm ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
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
            <Card title="Khóa học gần đây" extra={<Button type="link">Xem tất cả</Button>}>
              <Table
                columns={columns}
                dataSource={recentCourses}
                pagination={false}
                rowKey="id"
                size="small"
              />
            </Card>

            <Card title="Thao tác nhanh">
              <div className="grid grid-cols-2 gap-4">
                <Link to="/admin/addCourses">
                <Button type="primary" size="large" block>
                  Thêm khóa học
                </Button>
                </Link>
                <Button size="large" block>
                  Quản lý người dùng
                </Button>
                <Button size="large" block>
                  Xem báo cáo
                </Button>
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