import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, Button, Tabs, Tag, Skeleton, message, Modal } from "antd";
import {
  PlayCircle,
  Users,
  Clock,
  BookOpen,
  CheckCircle,
  Star,
  ArrowLeft,
} from "lucide-react";
import { courseApi } from "../../services/courseApi";

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

        // Fetch course details
        const courseResponse = await courseApi.getCourse(id);
        const courseData = courseResponse?.data?.data;

        // Fetch chapters with pagination
        const chaptersResponse = await courseApi.getChapters({
          courseId: id,
          page: 1,
          size: 100,
          sortBy: "number",
          isAsc: true,
        });
        const chapters = chaptersResponse.data?.data?.items || [];

        // Fetch lessons for each chapter
        const chaptersWithLessons = await Promise.all(
          chapters.map(async (chapter) => {
            try {
              const lessonsResponse = await courseApi.getLessons({
                chapterId: chapter.id,
                page: 1,
                size: 100,
              });
              return {
                ...chapter,
                lessons: lessonsResponse.data?.data?.items || [],
              };
            } catch (error) {
              console.error(
                `Error fetching lessons for chapter ${chapter.id}:`,
                error
              );
              return {
                ...chapter,
                lessons: [],
              };
            }
          })
        );

        // Fetch related courses
        const allCoursesResponse = await courseApi.getAllCourses({
          page: 1,
          size: 4,
        });
        const allCourses = allCoursesResponse.data?.data?.items || [];
        const related = allCourses
          .filter((c) => c.courseId !== id && c.level === courseData.level)
          .slice(0, 3);

        setCourse({
          id: courseData.id,
          courseId: courseData.id,
          title: courseData.name || courseData.name,
          description: courseData.description || "Khóa học chất lượng cao",
          image:
            courseData.imageUrl ||
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
          level: courseData.level,
          duration: courseData.duration,
          isActive: courseData.isActive,
          teacherId: courseData.teacherAccountId,
          teacher: courseData.teacher
            ? `${courseData.teacher.firstName} ${courseData.teacher.lastName}`
            : "Chưa có giáo viên",
          chapters: chaptersWithLessons,
        });

        setRelatedCourses(
          related.map((course) => ({
            id: course.courseId,
            courseId: course.courseId,
            title: course.courseName || course.name,
            description: course.description,
            image:
              course.imageUrl ||
              "https://via.placeholder.com/400x300?text=Course+Image",
            level: course.level,
            rating: (4 + Math.random()).toFixed(1),
            students: Math.floor(Math.random() * 2000) + 100,
          }))
        );
      } catch (error) {
        console.error("Error fetching course details:", error);
        message.error("Không thể tải thông tin khóa học");
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
      message.success("Đăng ký khóa học thành công!");
      setEnrollModal(false);
    } catch {
      message.error("Đăng ký thất bại!");
    }
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Khóa học không tồn tại
          </h1>
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
          <Link
            to="/courses"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách khóa học
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div>
              <Card className="mb-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full md:w-64 h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/400x300?text=Course+Image";
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Tag
                          color={
                            course.level === 0
                              ? "green"
                              : course.level === 1
                              ? "blue"
                              : "red"
                          }
                          className="mb-2"
                        >
                          {course.level === 0
                            ? "Beginner"
                            : course.level === 1
                            ? "Intermediate"
                            : "Advanced"}
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
                        <Clock className="w-5 h-5 mr-1" />
                        <span>{course.duration}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <BookOpen className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <div className="font-semibold">{course.teacher}</div>
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
                        <h3 className="text-xl font-semibold mb-3">
                          Giới thiệu khóa học
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {course.longDescription || course.description}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">
                          Thông tin khóa học
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                            <span>
                              Trình độ:{" "}
                              {course.level === 0
                                ? "Beginner"
                                : course.level === 1
                                ? "Intermediate"
                                : "Advanced"}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                            <span>Thời lượng: {course.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabPane>

                  <TabPane tab="Nội dung khóa học" key="curriculum">
                    <div className="space-y-6">
                      {course.chapters && course.chapters.length > 0 ? (
                        course.chapters.map((chapter) => (
                          <div key={chapter.id} className="border rounded-lg">
                            <div className="bg-gray-50 px-6 py-4 border-b">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-semibold text-lg">
                                    Chương {chapter.number}: {chapter.name}
                                  </h4>
                                  {chapter.description && (
                                    <p className="text-gray-600 text-sm mt-1">
                                      {chapter.description}
                                    </p>
                                  )}
                                </div>
                                <Tag color="blue">
                                  {chapter.lessons?.length || 0} bài học
                                </Tag>
                              </div>
                            </div>
                            <div className="divide-y">
                              {chapter.lessons && chapter.lessons.length > 0 ? (
                                chapter.lessons.map((lesson) => (
                                  <div
                                    key={lesson.id}
                                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                  >
                                    <div className="flex items-center flex-1">
                                      <PlayCircle className="w-5 h-5 text-primary-500 mr-3" />
                                      <div>
                                        <div className="font-medium">
                                          {lesson.name}
                                        </div>
                                        {lesson.content && (
                                          <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                                            {lesson.content}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                      {lesson.duration && (
                                        <span className="text-gray-500 text-sm flex items-center">
                                          <Clock className="w-4 h-4 mr-1" />
                                          {lesson.duration}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="px-6 py-4 text-center text-gray-500">
                                  Chưa có bài học nào
                                </div>
                              )}
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
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="shadow-lg border-0">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Thông tin khóa học
                  </h3>
                </div>

                <div className="space-y-4">
                  <Link to={`/learning/${course.id}`}>
                    <Button
                      type="primary"
                      size="large"
                      className="w-full h-12 text-lg font-semibold"
                      // onClick={() => setEnrollModal(true)}
                    >
                      Bắt đầu học
                    </Button>
                  </Link>
                </div>

                <div className="mt-6 space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Thời lượng:</span>
                    <span className="font-semibold">{course.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trình độ:</span>
                    <span className="font-semibold">
                      {course.level === 0
                        ? "Beginner"
                        : course.level === 1
                        ? "Intermediate"
                        : "Advanced"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Giáo viên:</span>
                    <span className="font-semibold">{course.teacher}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {relatedCourses.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Khóa học liên quan</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCourses.map((relatedCourse) => (
                <Card
                  key={relatedCourse.id}
                  cover={
                    <img
                      alt={relatedCourse.name}
                      src={
                        relatedCourse.imageUrl ||
                        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"
                      }
                      className="h-48 object-cover"
                    />
                  }
                  actions={[
                    <Link to={`/courses/${relatedCourse.id}`} key="view">
                      <Button type="primary">Xem chi tiết</Button>
                    </Link>,
                  ]}
                >
                  <Card.Meta
                    title={relatedCourse.name}
                    description={
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {relatedCourse.description}
                        </div>
                        <div className="flex justify-between items-center">
                          <Tag
                            color={
                              relatedCourse.level === 0
                                ? "green"
                                : relatedCourse.level === 1
                                ? "blue"
                                : "red"
                            }
                          >
                            {relatedCourse.level === 0
                              ? "Beginner"
                              : relatedCourse.level === 1
                              ? "Intermediate"
                              : "Advanced"}
                          </Tag>
                        </div>
                      </div>
                    }
                  />
                </Card>
              ))}
            </div>
          </div>
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
            Bạn sắp đăng ký khóa học "{course.title}"
          </p>
          <div className="flex space-x-4 justify-center">
            <Button size="large" onClick={() => setEnrollModal(false)}>
              Hủy
            </Button>
            <Button type="primary" size="large" onClick={handleEnroll}>
              Xác nhận đăng ký
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CourseDetail;
