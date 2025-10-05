import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, List, Tag, Button, Empty, Skeleton, message, Tabs, Progress } from 'antd';
import { Users, BookOpen, Clock, PlayCircle, ArrowLeft, Eye, FileText } from 'lucide-react';
import { forumService } from '../../services/forumApi';
import { courseApi } from '../../services/courseApi';
import { useAuth } from '../../context/AuthContext';
import { examApi } from '../../services/examApi';

const { TabPane } = Tabs;

const StudentClassDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [classDetail, setClassDetail] = useState(null);
    const [classCourses, setClassCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('courses');
    const [enrolling, setEnrolling] = useState(false);
    const [classExams, setClassExams] = useState([]);
    const [examsLoading, setExamsLoading] = useState(false);
    useEffect(() => {
        if (id) {
            fetchClassDetail();
            fetchClassExams();
        }
    }, [id]);

    const fetchClassDetail = async () => {
        try {
            setLoading(true);
            const classResponse = await forumService.getClassWithDetails(id);
            console.log('📊 Class details:', classResponse);

            setClassDetail(classResponse);

            if (classResponse.courses) {
                const courses = classResponse.courses.map(item => item.course).filter(Boolean);
                setClassCourses(courses);
            }
        } catch (error) {
            console.error('Error fetching class detail:', error);
            message.error('Không thể tải thông tin lớp học');
        } finally {
            setLoading(false);
        }
    };
    const fetchClassExams = async () => {
        try {
            setExamsLoading(true);
            const response = await examApi.getClassExams(id);
            const examsWithDetails = await Promise.all(
                response.data.map(async (classExam) => {
                    const examResponse = await examApi.getExam(classExam.examId);
                    const resultResponse = await examApi.getStudentExamResult(classExam.examId, user.id);

                    return {
                        ...classExam,
                        exam: examResponse.data,
                        hasTaken: resultResponse.data.length > 0,
                        result: resultResponse.data[0] || null
                    };
                })
            );
            setClassExams(examsWithDetails);
        } catch (error) {
            console.error('Error fetching class exams:', error);
        } finally {
            setExamsLoading(false);
        }
    };

    const handleStartLearning = async (courseId) => {
        if (!user?.id) {
            message.error('Vui lòng đăng nhập để học');
            return;
        }

        try {
            setEnrolling(true);
            console.log('🔄 Starting learning process for course:', courseId, 'user:', user.id);

            // Kiểm tra xem học sinh đã đăng ký khóa học chưa
            const enrollmentsResponse = await courseApi.getMyEnrollments(user.id);
            console.log('📋 Existing enrollments:', enrollmentsResponse.data);

            const existingEnrollment = enrollmentsResponse.data.find(
                e => e.courseId === courseId && e.userId === user.id
            );

            if (existingEnrollment) {
                // Đã đăng ký, chuyển đến trang học
                console.log('✅ Already enrolled, redirecting to learning page with enrollment:', existingEnrollment.id);
                navigate(`/learning/${existingEnrollment.id}`);
                return;
            }

            console.log('🔄 Enrolling in course:', courseId);

            // Tự động đăng ký khóa học với user ID thực tế
            const enrollResponse = await courseApi.enrollCourse(courseId, user.id);
            console.log('✅ Enrollment response:', enrollResponse);

            if (enrollResponse.data && enrollResponse.data.id) {
                message.success('Đã tự động đăng ký khóa học!');

                // Chuyển hướng ngay lập tức đến trang học với enrollment ID mới
                console.log('🎯 Redirecting to learning page with new enrollment:', enrollResponse.data.id);
                navigate(`/learning/${enrollResponse.data.id}`);
            } else {
                // Nếu không có ID ngay lập tức, thử tìm lại
                console.log('🔄 Enrollment created but no ID, searching for it...');

                setTimeout(async () => {
                    try {
                        const newEnrollments = await courseApi.getMyEnrollments(user.id);
                        const newEnrollment = newEnrollments.data.find(
                            e => e.courseId === courseId && e.userId === user.id
                        );

                        if (newEnrollment) {
                            console.log('✅ Found new enrollment:', newEnrollment.id);
                            navigate(`/learning/${newEnrollment.id}`);
                        } else {
                            console.error('❌ No enrollment found after enrollment');
                            message.error('Không thể tìm thấy thông tin đăng ký');
                        }
                    } catch (searchError) {
                        console.error('❌ Error searching for enrollment:', searchError);
                        message.error('Lỗi khi tìm thông tin đăng ký');
                    }
                }, 1000);
            }

        } catch (error) {
            console.error('❌ Error enrolling course:', error);
            message.error('Không thể bắt đầu học: ' + (error.message || 'Lỗi không xác định'));
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4">
                    <Skeleton active />
                </div>
            </div>
        );
    }

    if (!classDetail) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 text-center">
                    <Empty
                        description="Lớp học không tồn tại hoặc bạn không có quyền truy cập"
                    />
                    <Link to="/student/classes">
                        <Button type="primary" className="mt-4">
                            Quay lại danh sách lớp học
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <Link
                        to="/student/classes"
                        className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại danh sách lớp học
                    </Link>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {classDetail.name}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {classDetail.description}
                            </p>
                        </div>
                        <Tag color={classDetail.isActive ? 'green' : 'red'}>
                            {classDetail.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                        </Tag>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card>
                                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                                    <TabPane
                                        tab={
                                            <span className="flex items-center">
                                                <BookOpen className="w-4 h-4 mr-2" />
                                                Khóa học trong lớp ({classCourses.length})
                                            </span>
                                        }
                                        key="courses"
                                    >
                                        {classCourses.length > 0 ? (
                                            <div className="grid md:grid-cols-2 gap-6">
                                                {classCourses.map((course, index) => (
                                                    <motion.div
                                                        key={course.id}
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: index * 0.1 }}
                                                    >
                                                        <Card
                                                            cover={
                                                                <img
                                                                    alt={course.title}
                                                                    src={course.image}
                                                                    className="h-48 object-cover"
                                                                />
                                                            }
                                                            actions={[
                                                                <Button
                                                                    type="primary"
                                                                    icon={<PlayCircle className="w-4 h-4" />}
                                                                    onClick={() => handleStartLearning(course.id)}
                                                                    loading={enrolling}
                                                                    disabled={enrolling}
                                                                >
                                                                    {enrolling ? 'Đang xử lý...' : 'Bắt đầu học'}
                                                                </Button>,
                                                                <Link to={`/courses/${course.id}`}>
                                                                    <Button icon={<Eye className="w-4 h-4" />}>
                                                                        Xem chi tiết
                                                                    </Button>
                                                                </Link>
                                                            ]}
                                                        >
                                                            <div className="space-y-3">
                                                                <h3 className="font-semibold text-lg">
                                                                    {course.title}
                                                                </h3>
                                                                <p className="text-gray-600 text-sm">
                                                                    {course.description}
                                                                </p>

                                                                <div className="flex items-center justify-between text-sm text-gray-500">
                                                                    <div className="flex items-center">
                                                                        <Clock className="w-4 h-4 mr-1" />
                                                                        <span>{course.duration}</span>
                                                                    </div>
                                                                    <Tag color="blue" className="capitalize">
                                                                        {course.level}
                                                                    </Tag>
                                                                </div>

                                                                <div className="flex items-center text-sm text-gray-500">
                                                                    <Users className="w-4 h-4 mr-1" />
                                                                    <span>{course.students} học viên</span>
                                                                </div>
                                                            </div>
                                                        </Card>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <Empty
                                                description="Chưa có khóa học nào trong lớp"
                                            />
                                        )}
                                    </TabPane>
                                    <TabPane
                                        tab={
                                            <span className="flex items-center">
                                                <FileText className="w-4 h-4 mr-2" />
                                                Bài thi ({classExams.length})
                                            </span>
                                        }
                                        key="exams"
                                    >
                                        {classExams.length > 0 ? (
                                            <div className="space-y-4">
                                                {classExams.map((classExam, index) => (
                                                    <Card key={classExam.id}>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <h3 className="font-semibold text-lg">{classExam.exam.title}</h3>
                                                                <p className="text-gray-600">{classExam.exam.description}</p>

                                                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                                                    <div className="flex items-center">
                                                                        <Clock className="w-4 h-4 mr-1" />
                                                                        <span>{classExam.exam.duration} phút</span>
                                                                    </div>
                                                                    <div className="flex items-center">
                                                                        <FileText className="w-4 h-4 mr-1" />
                                                                        <span>{classExam.exam.totalQuestions} câu</span>
                                                                    </div>
                                                                    <div className="flex items-center">
                                                                        <span>Hạn nộp: {new Date(classExam.dueDate).toLocaleDateString('vi-VN')}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="text-right">
                                                                {classExam.hasTaken ? (
                                                                    <div>
                                                                        <Tag color="green">Đã hoàn thành</Tag>
                                                                        <div className="text-sm text-gray-600">
                                                                            Điểm: {classExam.result.score}/{classExam.exam.totalPoints}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <Button 
                                                                    type="primary" 
                                                                    onClick={() => {
                                                                      console.log('🎯 Clicked Start Exam:', classExam.examId);
                                                                      console.log('📝 Exam details:', classExam.exam);
                                                                      navigate(`/exam/${classExam.examId}`);
                                                                    }}
                                                                  >
                                                                    Bắt đầu thi
                                                                  </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <Empty description="Chưa có bài thi nào trong lớp" />
                                        )}
                                    </TabPane>
                                    <TabPane
                                        tab={
                                            <span className="flex items-center">
                                                <Users className="w-4 h-4 mr-2" />
                                                Thành viên ({classDetail.members?.length || 0})
                                            </span>
                                        }
                                        key="members"
                                    >
                                        {classDetail.members && classDetail.members.length > 0 ? (
                                            <List
                                                dataSource={classDetail.members}
                                                renderItem={(member) => (
                                                    <List.Item>
                                                        <List.Item.Meta
                                                            avatar={
                                                                <img
                                                                    src={member.user?.avatar}
                                                                    alt={member.user?.name}
                                                                    className="w-10 h-10 rounded-full"
                                                                />
                                                            }
                                                            title={member.user?.name}
                                                            description={member.user?.email}
                                                        />
                                                        <Tag color={member.role === 'teacher' ? 'red' : 'blue'}>
                                                            {member.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                                                        </Tag>
                                                    </List.Item>
                                                )}
                                            />
                                        ) : (
                                            <Empty description="Chưa có thành viên nào trong lớp" />
                                        )}
                                    </TabPane>
                                </Tabs>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Teacher Info */}
                            <Card title="Giáo viên">
                                <div className="flex items-center space-x-3">
                                    <img
                                        src={classDetail.teacher?.avatar}
                                        alt={classDetail.teacher?.name}
                                        className="w-12 h-12 rounded-full"
                                    />
                                    <div>
                                        <div className="font-semibold">
                                            {classDetail.teacher?.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Giáo viên chủ nhiệm
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Class Stats */}
                            <Card title="Thống kê lớp">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span>Tổng thành viên:</span>
                                        <span className="font-semibold">
                                            {classDetail.members?.length || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Khóa học:</span>
                                        <span className="font-semibold">
                                            {classCourses.length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Ngày tạo:</span>
                                        <span className="font-semibold">
                                            {new Date(classDetail.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentClassDetail;