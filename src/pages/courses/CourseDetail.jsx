import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Tabs,
  Tag,
  Skeleton,
  message,
  Modal,
  Rate,
  List,
  Pagination,
  Input,
} from "antd";
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
import { useAuth } from "../../context/AuthContext";

const { TabPane } = Tabs;

// MÀU CHỦ ĐẠO SUPER PANDA
const RED_DARK = "#991b1b"; // đỏ đậm (tiêu đề, nút)
const RED_MAIN = "#dc2626"; // đỏ chính (icon, hover)
const RED_LIGHT = "#fee2e2"; // nền đỏ nhạt
const GRAY_DARK = "#1f2937"; // chữ chính
const GRAY_MED = "#6b7280"; // chữ phụ
const BG_LIGHT = "#f9fafb"; // nền card

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollModal, setEnrollModal] = useState(false);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [enrolling, setEnrolling] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsPagination, setReviewsPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [userRating, setUserRating] = useState(0);
  const [userReviewContent, setUserReviewContent] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchReviews = useCallback(
    async (page = 1, size = 5) => {
      try {
        setReviewsLoading(true);
        const response = await courseApi.getCourseReviews({
          page,
          size,
          courseId: id,
        });
        const data = response?.data?.data;

        if (data) {
          setReviews(data.items || []);
          setReviewsPagination({
            current: data.page || page,
            pageSize: data.size || size,
            total: data.total || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setReviewsLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const courseResponse = await courseApi.getCourse(id);
        const courseData = courseResponse?.data?.data;

        const chaptersResponse = await courseApi.getChapters({
          courseId: id,
          page: 1,
          size: 100,
          sortBy: "number",
          isAsc: true,
        });
        const chapters = chaptersResponse.data?.data?.items || [];

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
              return { ...chapter, lessons: [] };
            }
          })
        );

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
          related.map((c) => ({
            id: c.courseId,
            courseId: c.courseId,
            title: c.courseName || c.name,
            description: c.description,
            image:
              c.imageUrl ||
              "https://via.placeholder.com/400x300?text=Course+Image",
            level: c.level,
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
      fetchReviews(1, 5);
    }
  }, [id, fetchReviews]);

  const handleReviewsPageChange = (page, pageSize) => {
    fetchReviews(page, pageSize);
  };

  const handleSubmitReview = async () => {
    if (!user) {
      message.warning("Vui lòng đăng nhập để đánh giá!");
      return;
    }

    if (userRating === 0) {
      message.warning("Vui lòng chọn số sao đánh giá!");
      return;
    }

    try {
      setSubmittingReview(true);
      await courseApi.reviewCourse(id, {
        rating: userRating,
        content: userReviewContent.trim() || null,
      });
      message.success("Đánh giá thành công!");
      setUserRating(0);
      setUserReviewContent("");
      // Refresh reviews
      fetchReviews(1, reviewsPagination.pageSize);
    } catch (error) {
      console.error("Error submitting review:", error);
      message.error("Không thể gửi đánh giá. Vui lòng thử lại!");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleStartLearning = async () => {
    // Check if user is authenticated
    if (!user) {
      message.warning("Vui lòng đăng nhập để bắt đầu học!");
      return;
    }

    try {
      setEnrolling(true);
      // Enroll in the course
      await courseApi.enrollCourse(id);
      message.success("Đăng ký khóa học thành công!");
      // Navigate to learning page
      navigate(`/learning/${id}`);
    } catch (error) {
      console.error("Error enrolling in course:", error);
      // If already enrolled, just navigate
      if (
        error.response?.status === 409 ||
        error.response?.data?.data?.includes("Bạn đã đăng ký khóa học này")
      ) {
        message.info("Bạn đã đăng ký khóa học này!");
        navigate(`/learning/${id}`);
      } else {
        message.error("Không thể đăng ký khóa học. Vui lòng thử lại!");
      }
    } finally {
      setEnrolling(false);
      // navigate(`/learning/${id}`);
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
          <div className="text-6xl mb-4">Khóa học không tồn tại</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Khóa học không tồn tại
          </h1>
          <Link to="/courses">
            <Button style={{ background: RED_DARK, borderColor: RED_DARK }}>
              Quay lại danh sách khóa học
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/courses"
            className="inline-flex items-center text-red-700 hover:text-red-800 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" style={{ color: RED_MAIN }} />
            Quay lại danh sách khóa học
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Info Card */}
            <Card
              className="border-0 shadow-lg"
              style={{ background: BG_LIGHT }}
            >
              <div className="flex flex-col md:flex-row gap-6">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full md:w-64 h-48 object-cover rounded-xl shadow-md"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x300?text=Course+Image";
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Tag
                        color="red"
                        style={{
                          background: RED_DARK,
                          borderColor: RED_DARK,
                          fontWeight: "bold",
                        }}
                        className="mb-2 text-white"
                      >
                        {course.level === 0
                          ? "Beginner"
                          : course.level === 1
                          ? "Intermediate"
                          : "Advanced"}
                      </Tag>
                      <h1 className="text-3xl font-black text-red-900 mb-2 tracking-tight">
                        {course.title}
                      </h1>
                      <p className="text-gray-700 text-lg leading-relaxed">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-gray-700 mb-4">
                    <div className="flex items-center">
                      <Clock
                        className="w-5 h-5 mr-2"
                        style={{ color: RED_MAIN }}
                      />
                      <span className="font-medium">{course.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <BookOpen
                        className="w-6 h-6 mr-3"
                        style={{ color: RED_MAIN }}
                      />
                      <div>
                        <div className="font-bold text-red-900">
                          {course.teacher}
                        </div>
                        <div className="text-sm text-gray-600">Giáo viên</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tabs */}
            <Card
              className="border-0 shadow-lg"
              style={{ background: BG_LIGHT }}
            >
              <Tabs defaultActiveKey="overview" className="custom-tabs">
                <TabPane
                  tab={
                    <span className="font-bold text-red-900">Tổng quan</span>
                  }
                  key="overview"
                >
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-black text-red-900 mb-3">
                        Giới thiệu khóa học
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {course.longDescription || course.description}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-red-900 mb-3">
                        Thông tin khóa học
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <CheckCircle
                            className="w-5 h-5 mr-3"
                            style={{ color: RED_MAIN }}
                          />
                          <span className="font-medium">
                            Trình độ:{" "}
                            {course.level === 0
                              ? "Beginner"
                              : course.level === 1
                              ? "Intermediate"
                              : "Advanced"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle
                            className="w-5 h-5 mr-3"
                            style={{ color: RED_MAIN }}
                          />
                          <span className="font-medium">
                            Thời lượng: {course.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabPane>

                <TabPane
                  tab={
                    <span className="font-bold text-red-900">
                      Nội dung khóa học
                    </span>
                  }
                  key="curriculum"
                >
                  <div className="space-y-6">
                    {course.chapters?.length > 0 ? (
                      course.chapters.map((chapter) => (
                        <div
                          key={chapter.id}
                          className="border-2 border-red-100 rounded-xl overflow-hidden"
                        >
                          <div className="bg-red-50 px-6 py-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-black text-lg text-red-900">
                                  Chương {chapter.number}: {chapter.name}
                                </h4>
                                {chapter.description && (
                                  <p className="text-gray-700 text-sm mt-1">
                                    {chapter.description}
                                  </p>
                                )}
                              </div>
                              <Tag
                                style={{
                                  background: RED_DARK,
                                  color: "white",
                                  fontWeight: "bold",
                                }}
                              >
                                {chapter.lessons?.length || 0} bài học
                              </Tag>
                            </div>
                          </div>
                          <div className="divide-y divide-gray-200">
                            {chapter.lessons?.length > 0 ? (
                              chapter.lessons.map((lesson) => (
                                <div
                                  key={lesson.id}
                                  className="px-6 py-4 flex items-center justify-between hover:bg-red-50 transition-colors"
                                >
                                  <div className="flex items-center flex-1">
                                    <PlayCircle
                                      className="w-5 h-5 mr-3"
                                      style={{ color: RED_MAIN }}
                                    />
                                    <div>
                                      <div className="font-semibold text-gray-900">
                                        {lesson.name}
                                      </div>
                                      {lesson.content && (
                                        <div className="text-sm text-gray-600 mt-1 line-clamp-1">
                                          {lesson.content}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {lesson.duration && (
                                    <span className="text-gray-600 text-sm flex items-center">
                                      <Clock className="w-4 h-4 mr-1" />{" "}
                                      {lesson.duration}
                                    </span>
                                  )}
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

                <TabPane
                  tab={<span className="font-bold text-red-900">Đánh giá</span>}
                  key="reviews"
                >
                  <div className="space-y-6">
                    {/* Review Submission Form */}
                    <Card className="border-2 border-red-100">
                      <h3 className="text-xl font-black text-red-900 mb-4">
                        Đánh giá khóa học
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            Số sao đánh giá{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Rate
                            value={userRating}
                            onChange={setUserRating}
                            style={{ fontSize: 32, color: RED_MAIN }}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">
                            Nội dung đánh giá (không bắt buộc)
                          </label>
                          <Input.TextArea
                            value={userReviewContent}
                            onChange={(e) =>
                              setUserReviewContent(e.target.value)
                            }
                            rows={4}
                            placeholder="Chia sẻ trải nghiệm của bạn về khóa học..."
                            maxLength={500}
                            showCount
                          />
                        </div>
                        <Button
                          type="primary"
                          size="large"
                          onClick={handleSubmitReview}
                          loading={submittingReview}
                          style={{
                            background: RED_DARK,
                            borderColor: RED_DARK,
                          }}
                        >
                          Gửi đánh giá
                        </Button>
                      </div>
                    </Card>

                    {/* Reviews List */}
                    <Card className="border-2 border-red-100">
                      <h3 className="text-xl font-black text-red-900 mb-4">
                        Đánh giá từ học viên ({reviewsPagination.total})
                      </h3>
                      <List
                        loading={reviewsLoading}
                        dataSource={reviews}
                        locale={{ emptyText: "Chưa có đánh giá nào" }}
                        renderItem={(review) => (
                          <List.Item className="border-b border-gray-100 py-4">
                            <List.Item.Meta
                              avatar={
                                <div
                                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                                  style={{ background: RED_MAIN }}
                                >
                                  {review.student?.firstName?.charAt(0) || ""}
                                  {review.student?.lastName?.charAt(0) || ""}
                                </div>
                              }
                              title={
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-gray-900">
                                    {review.student?.firstName}{" "}
                                    {review.student?.lastName}
                                  </span>
                                  <Rate
                                    disabled
                                    value={review.rating}
                                    style={{ fontSize: 16, color: RED_MAIN }}
                                  />
                                </div>
                              }
                              description={
                                <div className="mt-2">
                                  {review.content && (
                                    <p className="text-gray-700 leading-relaxed">
                                      {review.content}
                                    </p>
                                  )}
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                      {reviewsPagination.total > 0 && (
                        <div className="mt-6 flex justify-center">
                          <Pagination
                            current={reviewsPagination.current}
                            pageSize={reviewsPagination.pageSize}
                            total={reviewsPagination.total}
                            onChange={handleReviewsPageChange}
                            showSizeChanger
                            showTotal={(total) => `Tổng ${total} đánh giá`}
                          />
                        </div>
                      )}
                    </Card>
                  </div>
                </TabPane>
              </Tabs>
            </Card>
          </div>

          {/* Right Column - Sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card
                className="shadow-xl border-0"
                style={{ background: BG_LIGHT }}
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-black text-red-900 mb-4 tracking-tight">
                    Thông tin khóa học
                  </h3>
                </div>

                <div className="space-y-4">
                  <Button
                    type="primary"
                    size="large"
                    className="w-full h-14 text-lg font-bold"
                    onClick={handleStartLearning}
                    loading={enrolling}
                    style={{
                      background: RED_DARK,
                      borderColor: RED_DARK,
                      boxShadow: "0 4px 12px rgba(153, 27, 27, 0.3)",
                    }}
                  >
                    Bắt đầu học
                  </Button>
                </div>

                <div className="mt-6 space-y-4 text-base">
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">
                      Thời lượng:
                    </span>
                    <span className="font-bold text-red-900">
                      {course.duration}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">Trình độ:</span>
                    <span className="font-bold text-red-900">
                      {course.level === 0
                        ? "Beginner"
                        : course.level === 1
                        ? "Intermediate"
                        : "Advanced"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">
                      Giáo viên:
                    </span>
                    <span className="font-bold text-red-900">
                      {course.teacher}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Related Courses */}
        {relatedCourses.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-black text-red-900 mb-8 text-center tracking-tight">
              Khóa học liên quan
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCourses.map((rc) => (
                <Card
                  key={rc.id}
                  cover={
                    <div className="relative overflow-hidden rounded-t-xl">
                      <img
                        alt={rc.title}
                        src={rc.image}
                        className="h-48 w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>
                  }
                  className="border-0 shadow-lg hover:shadow-xl transition-shadow"
                  style={{ background: BG_LIGHT }}
                >
                  <Card.Meta
                    title={
                      <span className="font-black text-red-900">
                        {rc.title}
                      </span>
                    }
                    description={
                      <div className="space-y-3">
                        <p className="text-gray-700 line-clamp-2">
                          {rc.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <Tag
                            style={{
                              background: RED_DARK,
                              color: "white",
                              fontWeight: "bold",
                            }}
                          >
                            {rc.level === 0
                              ? "Beginner"
                              : rc.level === 1
                              ? "Intermediate"
                              : "Advanced"}
                          </Tag>
                        </div>
                        <Link to={`/courses/${rc.id}`} className="block mt-3">
                          <Button
                            type="primary"
                            className="w-full font-bold"
                            style={{
                              background: RED_DARK,
                              borderColor: RED_DARK,
                            }}
                          >
                            Xem chi tiết
                          </Button>
                        </Link>
                      </div>
                    }
                  />
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        title={
          <span className="font-black text-red-900">Đăng ký khóa học</span>
        }
        open={enrollModal}
        onCancel={() => setEnrollModal(false)}
        footer={null}
        width={600}
      >
        <div className="text-center py-8">
          <BookOpen
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: RED_MAIN }}
          />
          <h3 className="text-xl font-black text-red-900 mb-2">
            Xác nhận đăng ký
          </h3>
          <p className="text-gray-700 mb-6">
            Bạn sắp đăng ký khóa học{" "}
            <strong className="text-red-900">"{course.title}"</strong>
          </p>
          <div className="flex space-x-4 justify-center">
            <Button size="large" onClick={() => setEnrollModal(false)}>
              Hủy
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={handleStartLearning}
              loading={enrolling}
              style={{ background: RED_DARK, borderColor: RED_DARK }}
            >
              Xác nhận đăng ký
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CourseDetail;
