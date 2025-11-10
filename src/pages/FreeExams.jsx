import React, { useState, useEffect, useCallback } from "react";
import { Card, Tag, Button, Skeleton, message, Empty, Pagination } from "antd";
import { Clock, FileText, PlayCircle, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { examApi } from "../services/examApi";

const FreeExams = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalExams, setTotalExams] = useState(0);
  const pageSize = 9;

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      const response = await examApi.getAllExams({
        page: currentPage,
        size: pageSize,
      });

      const examsData = response.data?.data?.items || [];
      const total = response.data?.data?.total || 0;

      setExams(examsData);
      setTotalExams(total);
    } catch (error) {
      console.error("Error fetching exams:", error);
      message.error("Không thể tải danh sách bài thi");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTakeExam = async (examId) => {
    try {
      message.loading({ content: "Đang khởi tạo bài thi...", key: "takeExam" });

      const response = await examApi.takeFreeExam(examId);
      const examDoingId = response.data?.data?.id;

      if (!examDoingId) {
        throw new Error("Không nhận được ID bài thi");
      }

      message.success({
        content: "Bắt đầu làm bài thi!",
        key: "takeExam",
        duration: 1,
      });
      navigate(`/exams/${examDoingId}`);
    } catch (error) {
      console.error("Error starting exam:", error);
      message.error({
        content: error.response?.data?.message || "Không thể bắt đầu bài thi",
        key: "takeExam",
      });
    }
  };

  const getExamTypeColor = (type) => {
    return type === 0 ? "blue" : "green";
  };

  const getExamTypeText = (type) => {
    return type === 0 ? "Trắc nghiệm" : "Tự luận";
  };

  const formatDuration = (duration) => {
    if (!duration) return "Chưa xác định";
    const [hours, minutes, seconds] = duration.split(":");
    if (hours !== "00") {
      return `${parseInt(hours)} giờ ${parseInt(minutes)} phút`;
    } else if (minutes !== "00") {
      return `${parseInt(minutes)} phút`;
    }
    return `${parseInt(seconds)} giây`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
            <BookOpen className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bài Thi Miễn Phí
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Thử sức với các bài thi miễn phí để đánh giá và nâng cao kiến thức
            của bạn
          </p>
          <div className="mt-6 flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Trắc nghiệm</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Tự luận</span>
            </div>
          </div>
        </div>

        {/* Exams Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-full">
                <Skeleton active paragraph={{ rows: 4 }} />
              </Card>
            ))}
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-16">
            <Empty
              description="Chưa có bài thi nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {exams.map((exam) => (
                <Card
                  key={exam.id}
                  hoverable
                  className="h-full flex flex-col transition-all duration-300 hover:shadow-xl"
                  cover={
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 h-40 flex items-center justify-center">
                      <FileText className="w-16 h-16 text-white opacity-80" />
                    </div>
                  }
                >
                  <div className="flex flex-col h-full">
                    {/* Exam Type Badge */}
                    <div className="mb-3">
                      <Tag
                        color={getExamTypeColor(exam.type)}
                        className="text-sm"
                      >
                        {getExamTypeText(exam.type)}
                      </Tag>
                    </div>

                    {/* Exam Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {exam.name}
                    </h3>

                    {/* Description */}
                    {exam.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
                        {exam.description}
                      </p>
                    )}

                    {/* Exam Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-blue-500" />
                        <span>Thời gian: {formatDuration(exam.duration)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FileText className="w-4 h-4 mr-2 text-purple-500" />
                        <span>Số câu hỏi: {exam.quantity} câu</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      type="primary"
                      size="large"
                      icon={<PlayCircle className="w-4 h-4" />}
                      onClick={() => handleTakeExam(exam.id)}
                      className="w-full"
                    >
                      Làm bài thi
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalExams > pageSize && (
              <div className="flex justify-center mt-8">
                <Pagination
                  current={currentPage}
                  total={totalExams}
                  pageSize={pageSize}
                  onChange={handlePageChange}
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} của ${total} bài thi`
                  }
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        )}

        {/* Info Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <Card className="text-center">
            <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
              <PlayCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Làm bài dễ dàng</h3>
            <p className="text-gray-600 text-sm">
              Giao diện thân thiện, dễ sử dụng cho mọi đối tượng
            </p>
          </Card>
          <Card className="text-center">
            <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Đa dạng bài thi</h3>
            <p className="text-gray-600 text-sm">
              Nhiều loại bài thi từ trắc nghiệm đến tự luận
            </p>
          </Card>
          <Card className="text-center">
            <div className="inline-block p-3 bg-purple-100 rounded-full mb-4">
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Linh hoạt thời gian</h3>
            <p className="text-gray-600 text-sm">
              Làm bài thi bất cứ lúc nào bạn muốn
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FreeExams;
