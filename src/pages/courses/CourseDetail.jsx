import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, Button, Tabs, Tag, List, Progress, Modal, Skeleton, message } from 'antd';
import { PlayCircle, Users, Clock, BookOpen, CheckCircle, Star, ArrowLeft } from 'lucide-react';
import { courseApi, courseService } from '../../services/courseApi';

const { TabPane } = Tabs;

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollModal, setEnrollModal] = useState(false);
  const [relatedCourses, setRelatedCourses] = useState([]);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        
        const courseResponse = await courseApi.getCourse(id);
        const courseData = courseResponse.data;
        
        const chaptersResponse = await courseApi.getChapters(id);
        const chapters = chaptersResponse.data;

        const chaptersWithLessons = await Promise.all(
          chapters.map(async (chapter) => {
            const lessonsResponse = await courseApi.getLessons(chapter.id);
            return {
              ...chapter,
              lessons: lessonsResponse.data
            };
          })
        );

        const allCoursesResponse = await courseApi.getAllCourses();
        const related = allCoursesResponse.data
          .filter(c => c.id !== parseInt(id) && c.category === courseData.category)
          .slice(0, 3);

        setCourse({
          ...courseData,
          chapters: chaptersWithLessons,
          priceFormatted: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(courseData.price),
          originalPriceFormatted: courseData.originalPrice ? 
            new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(courseData.originalPrice) : null
        });

        setRelatedCourses(related.map(course => ({
          ...course,
          priceFormatted: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price)
        })));

      } catch (error) {
        console.error('Error fetching course details:', error);
        message.error('Không thể tải thông tin khóa học');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourseData();
    }
  }, [id]);

  const handleEnroll = async () => {
    try {
      message.success('Đăng ký khóa học thành công!');
      setEnrollModal(false);
    } catch (error) {
      message.error('Đăng ký thất bại!');
    }
  };

  const handleAddToCart = () => {
    message.info('Tính năng thêm vào giỏ hàng sẽ được tích hợp sau');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Skeleton active paragraph={{ rows: 2 }} />
          <div className="grid lg:grid-cols-3 gap-8 mt-6">
            <div className="lg:col-span-2">
              <Skeleton active paragraph={{ rows: 8 }} />
            </div>
            <div className="lg:col-span-1">
              <Skeleton active paragraph={{ rows: 6 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Khóa học không tồn tại</h1>
          <Link to="/courses">
            <Button type="primary">Quay lại danh sách khóa học</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link to="/courses" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách khóa học
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="mb-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-full md:w-64 h-48 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Tag color="blue" className="mb-2 capitalize">
                          {course.level}
                        </Tag>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                          {course.title}
                        </h1>
                        <p className="text-gray-600 text-lg">
                          {course.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                        <span className="font-semibold">{course.rating}</span>
                        <span className="ml-1">({course.students} đánh giá)</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-5 h-5 mr-1" />
                        <span>{course.students} học viên</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 mr-1" />
                        <span>{course.duration}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <BookOpen className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <div className="font-semibold">Giáo viên ID: {course.teacherId}</div>
                          <div className="text-sm text-gray-600">Giáo viên</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card>
                <Tabs defaultActiveKey="overview">
                  <TabPane tab="Tổng quan" key="overview">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-3">Giới thiệu khóa học</h3>
                        <p className="text-gray-700 leading-relaxed">
                          {course.longDescription || course.description}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">Thông tin khóa học</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                            <span>Trình độ: {course.level}</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                            <span>Thời lượng: {course.duration}</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                            <span>Học viên: {course.students}</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                            <span>Đánh giá: {course.rating}/5.0</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabPane>

                  <TabPane tab="Nội dung khóa học" key="curriculum">
                    <div className="space-y-6">
                      {course.chapters && course.chapters.length > 0 ? (
                        course.chapters.map((chapter, chapterIndex) => (
                          <div key={chapter.id} className="border rounded-lg">
                            <div className="bg-gray-50 px-6 py-4 border-b">
                              <h4 className="font-semibold text-lg">{chapter.title}</h4>
                              {chapter.description && (
                                <p className="text-gray-600 text-sm mt-1">{chapter.description}</p>
                              )}
                            </div>
                            <div className="divide-y">
                              {chapter.lessons && chapter.lessons.map((lesson) => (
                                <div key={lesson.id} className="px-6 py-4 flex items-center justify-between">
                                  <div className="flex items-center">
                                    <PlayCircle className="w-5 h-5 text-gray-400 mr-3" />
                                    <span>{lesson.title}</span>
                                    {lesson.isFree && (
                                      <Tag color="green" className="ml-3">
                                        Miễn phí
                                      </Tag>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <span className="text-gray-500 text-sm">{lesson.duration}</span>
                                    {lesson.isFree ? (
                                      <Button type="primary" size="small">
                                        Học thử
                                      </Button>
                                    ) : (
                                      <Button size="small" disabled>
                                        Khóa
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p>Chưa có nội dung khóa học</p>
                        </div>
                      )}
                    </div>
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
              className="sticky top-8"
            >
              <Card className="shadow-lg border-0">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    {course.priceFormatted}
                  </div>
                  {course.originalPriceFormatted && (
                    <div className="text-lg text-gray-500 line-through mb-2">
                      {course.originalPriceFormatted}
                    </div>
                  )}
                  {course.originalPrice && (
                    <div className="text-green-600 font-semibold">
                      Tiết kiệm {Math.round((1 - course.price / course.originalPrice) * 100)}%
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Button 
                    type="primary" 
                    size="large" 
                    className="w-full h-12 text-lg font-semibold"
                    onClick={() => setEnrollModal(true)}
                  >
                    Đăng ký ngay
                  </Button>
                  <Button 
                    size="large" 
                    className="w-full h-12"
                    onClick={handleAddToCart}
                  >
                    Thêm vào giỏ hàng
                  </Button>
                </div>

                <div className="mt-6 space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Thời lượng:</span>
                    <span className="font-semibold">{course.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trình độ:</span>
                    <span className="font-semibold capitalize">{course.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Học viên:</span>
                    <span className="font-semibold">{course.students}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Đánh giá:</span>
                    <span className="font-semibold">{course.rating}/5.0</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>

        {relatedCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold mb-6">Khóa học liên quan</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCourses.map((relatedCourse) => (
                <Card
                  key={relatedCourse.id}
                  cover={
                    <img 
                      alt={relatedCourse.title} 
                      src={relatedCourse.image}
                      className="h-48 object-cover"
                    />
                  }
                  actions={[
                    <Link to={`/courses/${relatedCourse.id}`} key="view">
                      <Button type="primary">Xem chi tiết</Button>
                    </Link>
                  ]}
                >
                  <Card.Meta
                    title={relatedCourse.title}
                    description={
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Tag color="blue" className="capitalize">
                            {relatedCourse.level}
                          </Tag>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm">{relatedCourse.rating}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>👥 {relatedCourse.students} học viên</span>
                          <span className="font-semibold text-primary-600">
                            {relatedCourse.priceFormatted}
                          </span>
                        </div>
                      </div>
                    }
                  />
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <Modal
        title="Đăng ký khóa học"
        open={enrollModal}
        onCancel={() => setEnrollModal(false)}
        footer={null}
        width={600}
      >
        <div className="text-center py-8">
          <BookOpen className="w-16 h-16 text-primary-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Xác nhận đăng ký</h3>
          <p className="text-gray-600 mb-6">
            Bạn sắp đăng ký khóa học "{course.title}" với giá {course.priceFormatted}
          </p>
          <div className="flex space-x-4 justify-center">
            <Button size="large" onClick={() => setEnrollModal(false)}>
              Hủy
            </Button>
            <Button type="primary" size="large" onClick={handleEnroll}>
              Xác nhận thanh toán
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CourseDetail;