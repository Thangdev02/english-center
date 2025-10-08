import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, List, Tag, Empty, Skeleton, message, Tabs, Badge, Progress, Button } from 'antd';
import { Users, BookOpen, Eye, ArrowRight, Calendar, UserCheck } from 'lucide-react';
import { forumService } from '../../services/forumApi'; // Sửa import
import { courseApi } from '../../services/courseApi';
import { useAuth } from '../../context/AuthContext';

const { TabPane } = Tabs;

const StudentClasses = () => {
  const { user } = useAuth();
  const [myClasses, setMyClasses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('classes');

  useEffect(() => {
    if (user?.id) {
      fetchMyClasses();
      fetchEnrolledCourses();
    }
  }, [user]);

  const fetchMyClasses = async () => {
    try {
      setLoading(true);
      const classesWithDetails = await forumService.getMyClassesWithDetails(user.id);
      console.log('✅ My classes with details:', classesWithDetails);
      setMyClasses(classesWithDetails);
    } catch (error) {
      console.error('Error fetching my classes:', error);
      message.error('Không thể tải danh sách lớp học');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      // Lấy các khóa học đã đăng ký
      const enrollmentsResponse = await courseApi.getMyEnrollments();
      const coursesWithProgress = await Promise.all(
        enrollmentsResponse.data.map(async (enrollment) => {
          const courseResponse = await courseApi.getCourse(enrollment.courseId);
          return {
            ...courseResponse.data,
            progress: enrollment.progress,
            enrolledAt: enrollment.enrolledAt,
            enrollmentId: enrollment.id
          };
        })
      );
      setEnrolledCourses(coursesWithProgress);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      beginner: 'green',
      intermediate: 'blue',
      advanced: 'red'
    };
    return colors[level] || 'default';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Lớp Học Của Tôi
            </h1>
            <p className="text-gray-600 text-lg">
              Quản lý các lớp học và khóa học bạn đã tham gia
            </p>
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
                      Lớp học của tôi
                      <Badge 
                        count={myClasses.length} 
                        style={{ backgroundColor: '#1890ff', marginLeft: 8 }} 
                      />
                    </span>
                  ),
                  children: myClasses.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {myClasses.map((classItem, index) => (
                        <motion.div
                          key={classItem.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card
                            className="h-full hover:shadow-lg transition-shadow duration-300"
                            actions={[
                              <Link to={`/student/classes/${classItem.id}`} key="view">
                                <div className="flex items-center justify-center text-primary-600">
                                  <Eye className="w-4 h-4 mr-2" />
                                  Vào lớp học
                                </div>
                              </Link>
                            ]}
                          >
                            <div className="space-y-4">
                              <div>
                                <h3 className="font-bold text-lg text-gray-900 mb-2">
                                  {classItem.name}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                  {classItem.description}
                                </p>
                              </div>

                              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <img 
                                  src={classItem.teacher?.avatar} 
                                  alt={classItem.teacher?.name}
                                  className="w-10 h-10 rounded-full"
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-sm">
                                    {classItem.teacher?.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Giáo viên
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-between text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Users className="w-4 h-4 mr-1" />
                                  <span>{classItem.memberCount} thành viên</span>
                                </div>
                                <div className="flex items-center">
                                  <BookOpen className="w-4 h-4 mr-1" />
                                  <span>{classItem.courseCount} khóa học</span>
                                </div>
                              </div>

                              <div className="flex items-center text-xs text-gray-500">
                                <Calendar className="w-3 h-3 mr-1" />
                                <span>Tham gia: {formatDate(classItem.joinedAt)}</span>
                              </div>

                              <Tag color={classItem.isActive ? 'green' : 'red'}>
                                {classItem.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                              </Tag>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <div>
                          <p className="text-lg mb-2">Bạn chưa tham gia lớp học nào</p>
                          <p className="text-gray-500">
                            Hãy liên hệ với giáo viên để được thêm vào lớp học
                          </p>
                        </div>
                      }
                    />
                  )
                },
                {
                  key: 'courses',
                  label: (
                    <span className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Khóa học của tôi
                      <Badge 
                        count={enrolledCourses.length} 
                        style={{ backgroundColor: '#52c41a', marginLeft: 8 }} 
                      />
                    </span>
                  ),
                  children: enrolledCourses.length > 0 ? (
                    <List
                      dataSource={enrolledCourses}
                      renderItem={(course, index) => (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <List.Item
                            className="bg-white rounded-lg mb-4 shadow-sm hover:shadow-md transition-shadow"
                            actions={[
                              course.progress === 100 ? (
                                <Tag color="success">Đã hoàn thành</Tag>
                              ) : (
                                <Link to={`/learning/${course.enrollmentId}`}>
                                  <Button type="primary">
                                    {course.progress > 0 ? 'Tiếp tục học' : 'Bắt đầu học'}
                                  </Button>
                                </Link>
                              )
                            ]}
                          >
                            <List.Item.Meta
                              avatar={
                                <img 
                                  src={course.image} 
                                  alt={course.title}
                                  className="w-20 h-16 object-cover rounded-lg"
                                />
                              }
                              title={
                                <div className="flex items-center space-x-3">
                                  <span className="font-semibold">{course.title}</span>
                                  <Tag color={getLevelColor(course.level)} className="capitalize">
                                    {course.level}
                                  </Tag>
                                </div>
                              }
                              description={
                                <div className="space-y-2">
                                  <p className="text-gray-600">{course.description}</p>
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <div className="flex items-center">
                                      <UserCheck className="w-4 h-4 mr-1" />
                                      <span>Tiến độ: {course.progress}%</span>
                                    </div>
                                    <div className="flex items-center">
                                      <Calendar className="w-4 h-4 mr-1" />
                                      <span>Đăng ký: {formatDate(course.enrolledAt)}</span>
                                    </div>
                                  </div>
                                  {course.progress > 0 && (
                                    <Progress 
                                      percent={course.progress} 
                                      size="small" 
                                      className="mt-2"
                                    />
                                  )}
                                </div>
                              }
                            />
                          </List.Item>
                        </motion.div>
                      )}
                    />
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <div>
                          <p className="text-lg mb-2">Bạn chưa đăng ký khóa học nào</p>
                          <Link to="/courses">
                            <Button type="primary" icon={<ArrowRight className="w-4 h-4" />}>
                              Khám phá khóa học
                            </Button>
                          </Link>
                        </div>
                      }
                    />
                  )
                }
              ]}
            />
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentClasses;