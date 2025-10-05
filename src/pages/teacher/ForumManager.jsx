import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Table, Button, Modal, Form, Input, Select, Tag, List, Avatar, message, Tabs, Badge } from 'antd';
import { Plus, Users, BookOpen, Mail, Search, Trash2, Eye, UserPlus, BookMarked } from 'lucide-react';
import { forumApi, forumService } from '../../services/forumApi';
import { courseApi } from '../../services/courseApi';
import { userApi } from '../../services/userApi';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const { Option } = Select;
const { Search: AntSearch } = Input;
const { TextArea } = Input;
const { TabPane } = Tabs;

const ForumManager = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
  const [addCourseModalVisible, setAddCourseModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [classLoading, setClassLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('classes');
  const [form] = Form.useForm();
  const [memberForm] = Form.useForm();
  const [courseForm] = Form.useForm();

  useEffect(() => {
    if (user?.id) {
      fetchClasses();
      fetchCourses();
    }
  }, [user]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await forumApi.getClasses(user.id);
      const classesWithDetails = await Promise.all(
        response.data.map(async (classItem) => {
          try {
            const membersResponse = await forumApi.getClassMembers(classItem.id);
            const coursesCount = 0; // You might want to fetch this from API
            return {
              ...classItem,
              memberCount: membersResponse.data.length,
              courseCount: coursesCount
            };
          } catch (error) {
            console.error('Error fetching class members:', error);
            return { ...classItem, memberCount: 0, courseCount: 0 };
          }
        })
      );
      setClasses(classesWithDetails);
    } catch (error) {
      console.error('Error fetching classes:', error);
      message.error('Không thể tải danh sách lớp học');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await courseApi.getAllCourses();
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      message.error('Không thể tải danh sách khóa học');
    }
  };

  const handleCreateClass = async (values) => {
    try {
      const classData = {
        ...values,
        teacherId: user.id,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      await forumApi.createClass(classData);
      message.success('Tạo lớp học thành công!');
      setModalVisible(false);
      form.resetFields();
      fetchClasses();
    } catch (error) {
      console.error('Error creating class:', error);
      message.error('Tạo lớp học thất bại!');
    }
  };

  const handleAddMember = async (values) => {
    try {
      if (!selectedClass) {
        message.error('Vui lòng chọn lớp học trước!');
        return;
      }

      console.log('🔍 Searching for user with email:', values.email);

      // First, find user by email
      const usersResponse = await userApi.getAllUsers();
      const targetUser = usersResponse.data.find(u => 
        u.email.toLowerCase() === values.email.toLowerCase() && u.role === 'student'
      );

      if (!targetUser) {
        message.error('Không tìm thấy học viên với email này!');
        return;
      }

      console.log('✅ Found user:', targetUser.name);

      // Check if user is already in class
      const membersResponse = await forumApi.getClassMembers(selectedClass.id);
      const existingMember = membersResponse.data.find(m => m.userId === targetUser.id);
      
      if (existingMember) {
        message.error('Học viên đã có trong lớp học!');
        return;
      }

      // Add member to class
      await forumApi.addMember(selectedClass.id, values.email);
      message.success(`Đã thêm học viên ${targetUser.name} vào lớp!`);
      setAddMemberModalVisible(false);
      memberForm.resetFields();
      fetchClassDetails(selectedClass.id);
    } catch (error) {
      console.error('Error adding member:', error);
      message.error(error.message || 'Thêm học viên thất bại!');
    }
  };

  // Trong ForumManager component, sửa các hàm sau:

const handleAddCourse = async (values) => {
    try {
      if (!selectedClass) {
        message.error('Vui lòng chọn lớp học trước!');
        return;
      }
  
      const selectedCourse = courses.find(c => c.id === values.courseId);
      
      if (!selectedCourse) {
        message.error('Khóa học không tồn tại!');
        return;
      }
  
      // Thêm khóa học vào lớp
      await forumApi.addCourseToClass(selectedClass.id, values.courseId, user.id);
      message.success(`Đã thêm khóa học "${selectedCourse.title}" vào lớp "${selectedClass.name}"!`);
      setAddCourseModalVisible(false);
      courseForm.resetFields();
      
      // Refresh class details
      fetchClassDetails(selectedClass.id);
    } catch (error) {
      console.error('Error adding course:', error);
      message.error('Thêm khóa học thất bại!');
    }
  };
  
  // Sửa hàm getClassCourses
  const getClassCourses = () => {
    if (!selectedClass || !selectedClass.courses) return [];
    return selectedClass.courses.map(item => item.course).filter(Boolean);
  };

  const fetchClassDetails = async (classId) => {
    try {
      setClassLoading(true);
      const classDetails = await forumService.getClassWithDetails(classId);
      setSelectedClass(classDetails);
      console.log('📊 Class details:', classDetails);
    } catch (error) {
      console.error('Error fetching class details:', error);
      message.error('Không thể tải chi tiết lớp học');
    } finally {
      setClassLoading(false);
    }
  };

  const handleViewClass = (classItem) => {
    setActiveTab('details');
    fetchClassDetails(classItem.id);
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await forumApi.removeMember(memberId);
      message.success('Đã xóa học viên khỏi lớp!');
      fetchClassDetails(selectedClass.id);
    } catch (error) {
      console.error('Error removing member:', error);
      message.error('Xóa học viên thất bại!');
    }
  };


  const columns = [
    {
      title: 'Tên lớp',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div className="font-semibold">{text}</div>
          <div className="text-sm text-gray-500">{record.description}</div>
        </div>
      )
    },
    {
      title: 'Số thành viên',
      dataIndex: 'memberCount',
      key: 'memberCount',
      render: (count) => (
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-1" />
          {count}
        </div>
      )
    },
    {
      title: 'Khóa học',
      dataIndex: 'courseCount',
      key: 'courseCount',
      render: (count) => (
        <div className="flex items-center">
          <BookOpen className="w-4 h-4 mr-1" />
          {count}
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
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
      )
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h1>
          <p className="text-gray-600">Bạn cần đăng nhập để truy cập trang này</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Quản Lý Lớp Học</h1>
              <p className="text-gray-600">Tạo và quản lý các lớp học, thêm học viên và khóa học</p>
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
              onChange={setActiveTab}
              items={[
                {
                  key: 'classes',
                  label: (
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Danh sách lớp học
                      <Badge 
                        count={classes.length} 
                        style={{ backgroundColor: '#1890ff', marginLeft: 8 }} 
                      />
                    </span>
                  ),
                  children: (
                    <Table
                      columns={columns}
                      dataSource={classes}
                      rowKey="id"
                      loading={loading}
                      pagination={{ pageSize: 10 }}
                    />
                  )
                },
                {
                  key: 'details',
                  label: (
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-2" />
                      Chi tiết lớp học
                    </span>
                  ),
                  children: selectedClass ? (
                    <div className="grid lg:grid-cols-3 gap-8">
                      {/* Class Info */}
                      <div className="lg:col-span-2">
                        <div className="mb-6">
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {selectedClass.name}
                          </h2>
                          <p className="text-gray-600 mb-4">{selectedClass.description}</p>
                          <div className="flex space-x-4">
                            <Tag color="blue">Giáo viên: {user?.name}</Tag>
                            <Tag color={selectedClass.isActive ? 'green' : 'red'}>
                              {selectedClass.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                            </Tag>
                          </div>
                        </div>

                        {/* Members Section */}
                        <Card 
                          title={
                            <div className="flex items-center justify-between">
                              <span className="flex items-center">
                                <Users className="w-5 h-5 mr-2" />
                                Thành viên lớp học ({selectedClass.members?.length || 0})
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
                          {selectedClass.members && selectedClass.members.length > 0 ? (
                            <List
                              dataSource={selectedClass.members}
                              renderItem={(member) => (
                                <List.Item
                                  actions={[
                                    <Button 
                                      size="small" 
                                      danger 
                                      onClick={() => handleRemoveMember(member.id)}
                                    >
                                      Xóa
                                    </Button>
                                  ]}
                                >
                                  <List.Item.Meta
                                    avatar={<Avatar src={member.user?.avatar} />}
                                    title={member.user?.name}
                                    description={member.user?.email}
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

                        {/* Courses Section */}
                        <Card 
                          title={
                            <div className="flex items-center justify-between">
                              <span className="flex items-center">
                                <BookOpen className="w-5 h-5 mr-2" />
                                Khóa học trong lớp ({getClassCourses().length})
                              </span>
                              <Button 
                                type="primary" 
                                size="small" 
                                icon={<BookMarked size={14} />}
                                onClick={() => setAddCourseModalVisible(true)}
                              >
                                Thêm khóa học
                              </Button>
                            </div>
                          }
                        >
                          {getClassCourses().length > 0 ? (
                            <List
                              dataSource={getClassCourses()}
                              renderItem={(course) => (
                                <List.Item
                                  actions={[
                                    <Link to={`/courses/${course.id}`} key="view">
                                      <Button size="small" type="link">
                                        Xem khóa học
                                      </Button>
                                    </Link>
                                  ]}
                                >
                                  <List.Item.Meta
                                    avatar={
                                      <img 
                                        src={course.image} 
                                        alt={course.title}
                                        className="w-12 h-12 object-cover rounded"
                                      />
                                    }
                                    title={course.title}
                                    description={
                                      <div>
                                        <div className="text-sm text-gray-600">{course.description}</div>
                                        <div className="flex space-x-2 mt-1">
                                          <Tag color="blue" className="capitalize">{course.level}</Tag>
                                          <Tag color="green">{course.duration}</Tag>
                                          <Tag color="orange">{course.students} học viên</Tag>
                                        </div>
                                      </div>
                                    }
                                  />
                                </List.Item>
                              )}
                            />
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                              <p>Chưa có khóa học nào trong lớp</p>
                              <Button 
                                type="primary" 
                                className="mt-4"
                                onClick={() => setAddCourseModalVisible(true)}
                              >
                                Thêm khóa học đầu tiên
                              </Button>
                            </div>
                          )}
                        </Card>
                      </div>

                      {/* Quick Actions */}
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
                            <Button 
                              block 
                              icon={<BookMarked size={16} />}
                              onClick={() => setAddCourseModalVisible(true)}
                            >
                              Thêm khóa học
                            </Button>
                            <Button 
                              block 
                              icon={<Mail size={16} />}
                            >
                              Gửi thông báo
                            </Button>
                          </div>
                        </Card>

                        {/* Class Stats */}
                        <Card className="mt-6" title="Thống kê lớp">
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span>Tổng thành viên:</span>
                              <span className="font-semibold">
                                {selectedClass.members?.length || 0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Khóa học:</span>
                              <span className="font-semibold">
                                {getClassCourses().length}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Ngày tạo:</span>
                              <span className="font-semibold">
                                {new Date(selectedClass.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Trạng thái:</span>
                              <Tag color={selectedClass.isActive ? 'green' : 'red'}>
                                {selectedClass.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
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
                      <p>Vui lòng chọn một lớp học từ danh sách để xem chi tiết</p>
                    </div>
                  )
                }
              ]}
            />
          </Card>
        </motion.div>
      </div>

      {/* Create Class Modal */}
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
            rules={[{ required: true, message: 'Vui lòng nhập tên lớp học!' }]}
          >
            <Input placeholder="VD: Lớp Giao Tiếp Cơ Bản - K1" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả lớp học"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Mô tả về lớp học, mục tiêu học tập..."
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex justify-end space-x-4">
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Tạo Lớp Học
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Member Modal */}
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
              { required: true, message: 'Vui lòng nhập email học viên!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input 
              prefix={<Mail className="text-gray-400" />}
              placeholder="Nhập email học viên đã đăng ký trong hệ thống"
            />
          </Form.Item>

          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-blue-700">
              💡 Lưu ý: Học viên phải đã có tài khoản trong hệ thống với email này.
              <br />
              📧 Email demo: student@example.com hoặc student2@example.com
            </p>
          </div>

          <Form.Item className="mb-0">
            <div className="flex justify-end space-x-4">
              <Button onClick={() => {
                setAddMemberModalVisible(false);
                memberForm.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Thêm Học Viên
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Course Modal */}
      <Modal
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
      </Modal>
    </div>
  );
};

export default ForumManager;