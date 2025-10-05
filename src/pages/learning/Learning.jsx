import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, Button, Progress, Tabs, List, Layout } from 'antd';
import { PlayCircle, CheckCircle, BookOpen, FileText, MessageCircle } from 'lucide-react';

const { Sider, Content } = Layout;

const Learning = () => {
  const { courseId } = useParams();
  const [currentLesson, setCurrentLesson] = useState(1);
  const [completedLessons, setCompletedLessons] = useState([1]);

  // Mock data
  const course = {
    id: 1,
    title: "Tiếng Anh Giao Tiếp Cơ Bản",
    progress: 25,
    curriculum: [
      {
        chapter: "Chương 1: Làm quen với tiếng Anh",
        lessons: [
          { id: 1, title: "Bảng chữ cái và phát âm cơ bản", duration: "15 phút", type: "video" },
          { id: 2, title: "Chào hỏi và giới thiệu bản thân", duration: "20 phút", type: "video" },
          { id: 3, title: "Bài tập thực hành chương 1", duration: "30 phút", type: "quiz" },
        ]
      },
      {
        chapter: "Chương 2: Giao tiếp hàng ngày",
        lessons: [
          { id: 4, title: "Mua sắm và giao dịch", duration: "30 phút", type: "video" },
          { id: 5, title: "Nhà hàng và ẩm thực", duration: "25 phút", type: "video" },
        ]
      }
    ]
  };

  const currentLessonData = course.curriculum
    .flatMap(chapter => chapter.lessons)
    .find(lesson => lesson.id === currentLesson);

  const markAsComplete = (lessonId) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons([...completedLessons, lessonId]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Layout className="min-h-screen">
        {/* Sidebar */}
        <Sider
          width={350}
          className="bg-white shadow-lg"
          breakpoint="lg"
          collapsedWidth="0"
        >
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">{course.title}</h2>
            <div className="mt-2">
              <Progress percent={course.progress} size="small" />
              <div className="text-sm text-gray-600 mt-1">
                {course.progress}% hoàn thành
              </div>
            </div>
          </div>

          <div className="overflow-y-auto h-[calc(100vh-80px)]">
            {course.curriculum.map((chapter, chapterIndex) => (
              <div key={chapterIndex} className="border-b">
                <div className="p-4 bg-gray-50">
                  <h3 className="font-semibold">{chapter.chapter}</h3>
                </div>
                <List
                  dataSource={chapter.lessons}
                  renderItem={(lesson) => (
                    <List.Item
                      className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                        currentLesson === lesson.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                      }`}
                      onClick={() => setCurrentLesson(lesson.id)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-3">
                          {completedLessons.includes(lesson.id) ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <PlayCircle className="w-5 h-5 text-gray-400" />
                          )}
                          <div>
                            <div className="font-medium">{lesson.title}</div>
                            <div className="text-sm text-gray-500 flex items-center space-x-2">
                              <span>{lesson.duration}</span>
                              <span>•</span>
                              <span className="capitalize">{lesson.type}</span>
                            </div>
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

        {/* Main Content */}
        <Layout>
          <Content className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              {/* Lesson Header */}
              <Card className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {currentLessonData?.title}
                    </h1>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <span>{currentLessonData?.duration}</span>
                      <span>•</span>
                      <span className="capitalize">{currentLessonData?.type}</span>
                    </div>
                  </div>
                  {!completedLessons.includes(currentLesson) && (
                    <Button 
                      type="primary" 
                      size="large"
                      onClick={() => markAsComplete(currentLesson)}
                    >
                      Đánh dấu hoàn thành
                    </Button>
                  )}
                </div>
              </Card>

              {/* Lesson Content */}
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
                    <div className="aspect-video bg-black rounded-lg mb-6 flex items-center justify-center">
                      <div className="text-center text-white">
                        <PlayCircle className="w-16 h-16 mx-auto mb-4" />
                        <p>Video bài giảng</p>
                      </div>
                    </div>

                    <div className="prose max-w-none">
                      <h3>Bài học: {currentLessonData?.title}</h3>
                      <p>
                        Trong bài học này, chúng ta sẽ học về các chủ đề cơ bản trong tiếng Anh.
                        Hãy chú ý lắng nghe và thực hành theo hướng dẫn.
                      </p>
                      
                      <h4>Nội dung chính:</h4>
                      <ul>
                        <li>Giới thiệu bản thân</li>
                        <li>Chào hỏi cơ bản</li>
                        <li>Hỏi thăm sức khỏe</li>
                        <li>Từ vựng thông dụng</li>
                      </ul>

                      <h4>Bài tập thực hành:</h4>
                      <p>
                        Hãy thực hành các câu chào hỏi với bạn bè hoặc ghi âm lại
                        để tự đánh giá phát âm của mình.
                      </p>
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
                    <div className="space-y-4">
                      <Card size="small" className="cursor-pointer hover:shadow-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-8 h-8 text-blue-500" />
                            <div>
                              <div className="font-medium">Từ vựng bài học.pdf</div>
                              <div className="text-sm text-gray-500">2.5 MB</div>
                            </div>
                          </div>
                          <Button type="link">Tải xuống</Button>
                        </div>
                      </Card>

                      <Card size="small" className="cursor-pointer hover:shadow-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-8 h-8 text-green-500" />
                            <div>
                              <div className="font-medium">Bài tập thực hành.docx</div>
                              <div className="text-sm text-gray-500">1.2 MB</div>
                            </div>
                          </div>
                          <Button type="link">Tải xuống</Button>
                        </div>
                      </Card>
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
                      <p>Chức năng thảo luận sẽ được tích hợp trong phiên bản tới</p>
                    </div>
                  </Tabs.TabPane>
                </Tabs>
              </Card>

              {/* Navigation */}
              <div className="flex justify-between mt-6">
                <Button size="large">
                  Bài trước
                </Button>
                <Button type="primary" size="large">
                  Bài tiếp theo
                </Button>
              </div>
            </motion.div>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default Learning;