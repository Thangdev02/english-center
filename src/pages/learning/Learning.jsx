import {
  Button,
  Card,
  Layout,
  List,
  Progress,
  Skeleton,
  Tabs,
  message,
} from "antd";
import {
  CheckCircle,
  Clock,
  FileText,
  MessageCircle,
  PlayCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { courseApi } from "../../services/courseApi";

const { Sider, Content } = Layout;

const Learning = () => {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [currentLessonData, setCurrentLessonData] = useState(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [completedLessons, setCompletedLessons] = useState([]);

  // Fetch course, chapters, and lessons
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);

        // Fetch course details
        const courseResponse = await courseApi.getCourse(courseId);
        const courseData = courseResponse.data;
        setCourse(courseData);

        // Fetch chapters with pagination
        const chaptersResponse = await courseApi.getChapters({
          courseId: courseId,
          page: 1,
          size: 100,
          sortBy: "number",
          isAsc: true,
        });

        const chaptersData = chaptersResponse.data?.data?.items || [];

        // Fetch lessons for each chapter
        const chaptersWithLessons = await Promise.all(
          chaptersData.map(async (chapter) => {
            const lessonsResponse = await courseApi.getLessons({
              chapterId: chapter.id,
              page: 1,
              size: 100,
            });
            return {
              ...chapter,
              lessons: lessonsResponse.data?.data?.items || [],
            };
          })
        );

        setChapters(chaptersWithLessons);

        // Set first lesson as current if available
        if (
          chaptersWithLessons.length > 0 &&
          chaptersWithLessons[0].lessons.length > 0
        ) {
          const firstLessonId = chaptersWithLessons[0].lessons[0].id;
          setCurrentLessonId(firstLessonId);
          await fetchLessonDetail(firstLessonId);
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
        message.error("Không thể tải dữ liệu khóa học");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  // Fetch lesson details when selected
  const fetchLessonDetail = async (lessonId) => {
    try {
      setLessonLoading(true);
      const response = await courseApi.getLesson(lessonId);
      setCurrentLessonData(response.data.data);
    } catch (error) {
      console.error("Error fetching lesson:", error);
      message.error("Không thể tải bài học");
    } finally {
      setLessonLoading(false);
    }
  };

  // Handle lesson selection
  const handleLessonClick = async (lessonId) => {
    setCurrentLessonId(lessonId);
    await fetchLessonDetail(lessonId);
  };

  const markAsComplete = (lessonId) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons([...completedLessons, lessonId]);
      message.success("Đã đánh dấu hoàn thành");
    }
  };

  // Calculate progress
  const totalLessons = chapters.reduce(
    (sum, chapter) => sum + (chapter.lessons?.length || 0),
    0
  );
  const progress =
    totalLessons > 0
      ? Math.round((completedLessons.length / totalLessons) * 100)
      : 0;

  // Navigation helpers
  const getAllLessons = () => {
    return chapters.flatMap((chapter) => chapter.lessons || []);
  };

  const handleNextLesson = async () => {
    const allLessons = getAllLessons();
    const currentIndex = allLessons.findIndex(
      (lesson) => lesson.id === currentLessonId
    );

    if (currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      setCurrentLessonId(nextLesson.id);
      await fetchLessonDetail(nextLesson.id);
    } else {
      message.info("Bạn đã học hết các bài trong khóa học");
    }
  };

  const handlePreviousLesson = async () => {
    const allLessons = getAllLessons();
    const currentIndex = allLessons.findIndex(
      (lesson) => lesson.id === currentLessonId
    );

    if (currentIndex > 0) {
      const previousLesson = allLessons[currentIndex - 1];
      setCurrentLessonId(previousLesson.id);
      await fetchLessonDetail(previousLesson.id);
    } else {
      message.info("Đây là bài học đầu tiên");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Không tìm thấy khóa học</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Layout className="min-h-screen">
        <Sider
          width={350}
          className="bg-white shadow-lg"
          breakpoint="lg"
          collapsedWidth="0"
        >
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">{course.courseName}</h2>
            <div className="mt-2">
              <Progress percent={progress} size="small" />
              <div className="text-sm text-gray-600 mt-1">
                {progress}% hoàn thành ({completedLessons.length}/{totalLessons}{" "}
                bài)
              </div>
            </div>
          </div>

          <div className="overflow-y-auto h-[calc(100vh-80px)]">
            {chapters.map((chapter) => (
              <div key={chapter.id} className="border-b">
                <div className="p-4 bg-gray-50">
                  <h3 className="font-semibold">
                    Chương {chapter.number}: {chapter.name}
                  </h3>
                  {chapter.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {chapter.description}
                    </p>
                  )}
                </div>
                <List
                  dataSource={chapter.lessons}
                  renderItem={(lesson) => (
                    <List.Item
                      className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                        currentLessonId === lesson.id
                          ? "bg-blue-50 border-r-2 border-blue-500"
                          : ""
                      }`}
                      onClick={() => handleLessonClick(lesson.id)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-3">
                          {completedLessons.includes(lesson.id) ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <PlayCircle className="w-5 h-5 text-gray-400" />
                          )}
                          <div>
                            <div className="font-medium">{lesson.name}</div>
                            {lesson.duration && (
                              <div className="text-sm text-gray-500 flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{lesson.duration}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            ))}
          </div>
        </Sider>

        <Layout>
          <Content className="p-6">
            <div className="max-w-4xl mx-auto">
              {lessonLoading ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : currentLessonData ? (
                <>
                  <Card className="mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                          {currentLessonData.name}
                        </h1>
                        <div className="flex items-center space-x-4 text-gray-600">
                          {currentLessonData.duration && (
                            <>
                              <span className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{currentLessonData.duration}</span>
                              </span>
                            </>
                          )}
                          {currentLessonData.createdDate && (
                            <>
                              <span>•</span>
                              <span className="text-sm">
                                {new Date(
                                  currentLessonData.createdDate
                                ).toLocaleDateString("vi-VN")}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      {!completedLessons.includes(currentLessonId) && (
                        <Button
                          type="primary"
                          size="large"
                          onClick={() => markAsComplete(currentLessonId)}
                        >
                          Đánh dấu hoàn thành
                        </Button>
                      )}
                    </div>
                  </Card>

                  <Card>
                    <Tabs defaultActiveKey="content">
                      <Tabs.TabPane
                        tab={
                          <span className="flex items-center">
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Nội dung
                          </span>
                        }
                        key="content"
                      >
                        {currentLessonData.videoUrl ? (
                          <div className="aspect-video bg-black rounded-lg mb-6">
                            <video
                              controls
                              className="w-full h-full rounded-lg"
                              src={currentLessonData.videoUrl}
                            >
                              Trình duyệt của bạn không hỗ trợ video.
                            </video>
                          </div>
                        ) : (
                          <div className="aspect-video bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
                            <div className="text-center text-gray-500">
                              <PlayCircle className="w-16 h-16 mx-auto mb-4" />
                              <p>Chưa có video bài giảng</p>
                            </div>
                          </div>
                        )}

                        <div className="prose max-w-none">
                          <h3>Bài học: {currentLessonData.name}</h3>

                          {currentLessonData.content ? (
                            <div className="text-gray-700 leading-relaxed">
                              {currentLessonData.content}
                            </div>
                          ) : (
                            <p className="text-gray-500">
                              Chưa có nội dung bài học
                            </p>
                          )}
                        </div>
                      </Tabs.TabPane>

                      <Tabs.TabPane
                        tab={
                          <span className="flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            Tài liệu
                          </span>
                        }
                        key="materials"
                      >
                        <div className="text-center py-12 text-gray-500">
                          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                          <p>Tài liệu bài học sẽ được cập nhật</p>
                        </div>
                      </Tabs.TabPane>

                      <Tabs.TabPane
                        tab={
                          <span className="flex items-center">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Thảo luận
                          </span>
                        }
                        key="discussion"
                      >
                        <div className="text-center py-12 text-gray-500">
                          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                          <p>
                            Chức năng thảo luận sẽ được tích hợp trong phiên bản
                            tới
                          </p>
                        </div>
                      </Tabs.TabPane>
                    </Tabs>
                  </Card>

                  <div className="flex justify-between mt-6">
                    <Button size="large" onClick={handlePreviousLesson}>
                      Bài trước
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      onClick={handleNextLesson}
                    >
                      Bài tiếp theo
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>Vui lòng chọn một bài học từ danh sách bên trái</p>
                </div>
              )}
            </div>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default Learning;
