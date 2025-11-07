import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Input,
  message,
  Modal,
  Pagination,
  Progress,
  Radio,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { examApi } from "../../services/examApi";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const StudentExam = () => {
  const { id } = useParams(); // exam doing id
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [examData, setExamData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState({}); // {questionHistoryId: answerId}
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);

  const autoSaveIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const QUESTIONS_PER_PAGE = 10;

  // Fetch exam doing data
  const fetchExamDoing = useCallback(async () => {
    try {
      setLoading(true);
      const response = await examApi.getExamDoings(id);
      const data = response?.data?.data;

      if (!data) {
        message.error("Không tìm thấy bài kiểm tra");
        navigate(-1);
        return;
      }

      setExamData(data);

      // Parse duration (TimeOnly format "HH:mm:ss") to seconds
      if (data.duration) {
        const [hours, minutes, seconds] = data.duration.split(":").map(Number);
        setTimeRemaining(hours * 3600 + minutes * 60 + seconds);
      }

      // Initialize answers from existing data
      const initialAnswers = {};
      data.questionHistories.forEach((qh) => {
        if (qh.yourAnswer) {
          // For multiple choice, find the answer ID by matching content
          if (qh.questionType === 0 && qh.answers) {
            const matchedAnswer = qh.answers.find(
              (ans) => ans.content === qh.yourAnswer
            );
            if (matchedAnswer) {
              initialAnswers[qh.id] = matchedAnswer.id;
            }
          } else {
            // For essay questions, store the text directly
            initialAnswers[qh.id] = qh.yourAnswer;
          }
        }
      });
      setAnswers(initialAnswers);
    } catch (err) {
      console.error("Error fetching exam doing:", err);
      message.error("Không thể tải bài kiểm tra");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      fetchExamDoing();
    }
  }, [id, fetchExamDoing]);

  // Format time remaining
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Auto-save progress
  const handleAutoSave = useCallback(async () => {
    try {
      await examApi.updateExamDoing(id, {
        duration: formatTime(timeRemaining),
        status: 0,
      });
    } catch (err) {
      console.error("Auto-save error:", err);
    }
  }, [id, timeRemaining]);

  // Submit exam
  const submitExam = useCallback(async () => {
    try {
      setIsSubmitting(true);

      // Save all essay answers before submitting
      const essayQuestions = examData.questionHistories.filter(
        (qh) => qh.questionType === 1
      );

      for (const qh of essayQuestions) {
        if (answers[qh.id]) {
          await examApi.updateExamDoing(id, {
            questionHistoryId: qh.id,
            yourAnswer: answers[qh.id],
            duration: formatTime(timeRemaining),
            status: 0,
          });
        }
      }

      // Submit the exam
      await examApi.updateExamDoing(id, {
        duration: formatTime(timeRemaining),
        status: 1, // Đã nộp
      });

      // Clear intervals
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }

      message.success("Nộp bài thành công!");

      // Reload the page to show results
      await fetchExamDoing();
    } catch (err) {
      console.error("Error submitting exam:", err);
      message.error("Không thể nộp bài. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }, [id, examData, answers, timeRemaining, fetchExamDoing]);

  const handleSubmitExam = useCallback(
    async (isAutoSubmit = false) => {
      if (isSubmitting) return;

      const unansweredCount =
        examData.questionHistories.length - Object.keys(answers).length;

      if (!isAutoSubmit && unansweredCount > 0) {
        Modal.confirm({
          title: "Xác nhận nộp bài",
          content: `Bạn còn ${unansweredCount} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài?`,
          okText: "Nộp bài",
          cancelText: "Tiếp tục làm",
          onOk: async () => {
            await submitExam();
          },
        });
      } else {
        await submitExam();
      }
    },
    [isSubmitting, examData, answers, submitExam]
  );

  // Countdown timer (only for in-progress exams)
  useEffect(() => {
    if (timeRemaining > 0 && examData?.status === 0) {
      countdownIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmitExam(true); // Auto submit when time's up
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
      };
    }
  }, [timeRemaining, examData?.status, handleSubmitExam]);

  // Auto-save every 5 seconds (only for in-progress exams)
  useEffect(() => {
    if (examData?.status === 0) {
      autoSaveIntervalRef.current = setInterval(() => {
        handleAutoSave();
      }, 5000);

      return () => {
        if (autoSaveIntervalRef.current) {
          clearInterval(autoSaveIntervalRef.current);
        }
      };
    }
  }, [examData?.status, handleAutoSave]);

  // Handle answer selection
  const handleAnswerChange = async (
    questionHistoryId,
    answerId,
    answerContent,
    questionType
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionHistoryId]: answerId,
    }));

    // For multiple choice, immediately save the answer
    if (questionType === 0) {
      try {
        await examApi.updateExamDoing(id, {
          questionHistoryId,
          yourAnswer: answerContent, // Send answer content, not ID
          duration: formatTime(timeRemaining),
          status: 0,
        });
      } catch (err) {
        console.error("Error saving answer:", err);
      }
    }
  };

  // Handle essay answer change
  const handleEssayChange = (questionHistoryId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionHistoryId]: value,
    }));
  };

  // Get current page questions
  const getCurrentPageQuestions = () => {
    if (!examData?.questionHistories) return [];
    const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
    const endIndex = startIndex + QUESTIONS_PER_PAGE;
    return examData.questionHistories.slice(startIndex, endIndex);
  };

  // Calculate progress
  const getProgress = () => {
    const total = examData?.questionHistories?.length || 0;
    const answered = Object.keys(answers).length;
    return total > 0 ? Math.round((answered / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!examData) {
    return null;
  }

  const currentQuestions = getCurrentPageQuestions();
  const progress = getProgress();
  const isTimeRunningOut = timeRemaining < 300; // Less than 5 minutes

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back button - Only show for completed exams */}
        {examData.status === 1 && (
          <Button
            type="link"
            onClick={() => navigate(-1)}
            className="mb-4"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            }
          >
            Quay lại
          </Button>
        )}

        {/* Header */}
        <Card className="mb-6 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <Title level={3} className="!mb-2">
                {examData.examName}
              </Title>
              <Space wrap>
                <Tag
                  icon={<FileTextOutlined />}
                  color={examData.examType === 0 ? "blue" : "purple"}
                >
                  {examData.examType === 0 ? "Trắc nghiệm" : "Tự luận"}
                </Tag>
                <Tag
                  icon={<CheckCircleOutlined />}
                  color={examData.status === 0 ? "orange" : "green"}
                >
                  {examData.status === 0 ? "Đang làm" : "Đã nộp"}
                </Tag>
                <Text type="secondary">{examData.quantity} câu hỏi</Text>
              </Space>
            </div>

            <div className="flex flex-col items-end gap-2">
              {examData.status === 0 ? (
                <>
                  <div
                    className={`flex items-center gap-2 text-lg font-semibold ${
                      isTimeRunningOut ? "text-red-500" : "text-blue-600"
                    }`}
                  >
                    <ClockCircleOutlined
                      className={isTimeRunningOut ? "animate-pulse" : ""}
                    />
                    <span>{formatTime(timeRemaining)}</span>
                  </div>
                  {isTimeRunningOut && (
                    <Tag icon={<WarningOutlined />} color="error">
                      Sắp hết giờ!
                    </Tag>
                  )}
                </>
              ) : (
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {examData.grade || 0} điểm
                  </div>
                  <div className="text-sm text-gray-600">
                    {examData.totalCorrectAnswers}/{examData.quantity} câu đúng
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Progress bar - Only show for in-progress exams */}
          {examData.status === 0 && (
            <div className="mt-4">
              <Text className="text-sm text-gray-600 mb-2 block">
                Tiến độ: {Object.keys(answers).length}/{examData.quantity} câu
              </Text>
              <Progress
                percent={progress}
                status={progress === 100 ? "success" : "active"}
                strokeColor={{
                  "0%": "#108ee9",
                  "100%": "#87d068",
                }}
              />
            </div>
          )}
        </Card>

        {/* Questions */}
        <Card className="mb-6 shadow-lg">
          <Space direction="vertical" size="large" className="w-full">
            {currentQuestions.map((question, index) => {
              const questionNumber =
                (currentPage - 1) * QUESTIONS_PER_PAGE + index + 1;
              const isAnswered = !!answers[question.id];

              return (
                <div
                  key={question.id}
                  className={`p-4 rounded-lg border-2 ${
                    isAnswered
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Tag
                      color={isAnswered ? "success" : "default"}
                      className="text-base px-3 py-1"
                    >
                      Câu {questionNumber}
                    </Tag>
                    <Paragraph className="flex-1 !mb-0 text-base font-medium">
                      {question.questionContent}
                    </Paragraph>
                  </div>

                  {question.questionType === 0 ? (
                    // Multiple choice
                    <Radio.Group
                      value={answers[question.id]}
                      onChange={(e) => {
                        const selectedAnswer = question.answers.find(
                          (ans) => ans.id === e.target.value
                        );
                        handleAnswerChange(
                          question.id,
                          e.target.value,
                          selectedAnswer?.content,
                          0
                        );
                      }}
                      disabled={examData.status === 1}
                      className="w-full"
                    >
                      <Space direction="vertical" className="w-full">
                        {question.answers?.map((answer) => {
                          const isCorrect = answer.isCorrect === true;
                          const isWrong = answer.isCorrect === false;
                          const isSelected = answers[question.id] === answer.id;

                          return (
                            <Radio
                              key={answer.id}
                              value={answer.id}
                              className={`text-base p-3 rounded-lg w-full ${
                                examData.status === 1
                                  ? isCorrect
                                    ? "!bg-green-100 !border-green-500"
                                    : isWrong && isSelected
                                    ? "!bg-red-100 !border-red-500"
                                    : ""
                                  : "hover:bg-blue-50"
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span>{answer.content}</span>
                                {examData.status === 1 && isCorrect && (
                                  <Tag color="success" className="ml-2">
                                    Đáp án đúng
                                  </Tag>
                                )}
                                {examData.status === 1 &&
                                  isWrong &&
                                  isSelected && (
                                    <Tag color="error" className="ml-2">
                                      Sai
                                    </Tag>
                                  )}
                              </div>
                            </Radio>
                          );
                        })}
                      </Space>
                    </Radio.Group>
                  ) : (
                    // Essay question
                    <TextArea
                      rows={6}
                      placeholder="Nhập câu trả lời của bạn..."
                      value={answers[question.id] || ""}
                      onChange={(e) =>
                        handleEssayChange(question.id, e.target.value)
                      }
                      disabled={examData.status === 1}
                      className="text-base"
                    />
                  )}
                </div>
              );
            })}
          </Space>

          {/* Pagination */}
          <div className="mt-6 flex justify-center">
            <Pagination
              current={currentPage}
              total={examData.questionHistories.length}
              pageSize={QUESTIONS_PER_PAGE}
              onChange={setCurrentPage}
              showSizeChanger={false}
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} trong ${total} câu`
              }
            />
          </div>
        </Card>

        {/* Question navigator */}
        <Card className="mb-6 shadow-lg" title="Câu hỏi">
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {examData.questionHistories.map((question, index) => {
              const questionNumber = index + 1;
              const isAnswered = !!answers[question.id];
              const isCurrentPage =
                Math.ceil(questionNumber / QUESTIONS_PER_PAGE) === currentPage;

              return (
                <Button
                  key={question.id}
                  type={isCurrentPage ? "primary" : "default"}
                  className={`${
                    isAnswered
                      ? "!bg-green-500 !border-green-500 hover:!bg-green-600"
                      : ""
                  }`}
                  onClick={() =>
                    setCurrentPage(
                      Math.ceil(questionNumber / QUESTIONS_PER_PAGE)
                    )
                  }
                >
                  {questionNumber}
                </Button>
              );
            })}
          </div>
          <div className="flex gap-4 mt-4 text-sm">
            <Space>
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <Text>Đã trả lời</Text>
            </Space>
            <Space>
              <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
              <Text>Chưa trả lời</Text>
            </Space>
          </div>
        </Card>

        {/* Submit button - Only show for in-progress exams */}
        {examData.status === 0 && (
          <Card className="shadow-lg">
            <div className="flex justify-between items-center">
              <Text type="secondary">
                Đã trả lời: {Object.keys(answers).length}/{examData.quantity}{" "}
                câu
              </Text>
              <Button
                type="primary"
                size="large"
                danger
                onClick={() => handleSubmitExam(false)}
                loading={isSubmitting}
              >
                Nộp bài
              </Button>
            </div>
          </Card>
        )}

        {/* Results summary - Only show for completed exams */}
        {examData.status === 1 && (
          <Card className="shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-gray-500 text-sm mb-1">Điểm số</div>
                <div className="text-2xl font-bold text-blue-600">
                  {examData.grade || 0}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 text-sm mb-1">Câu đúng</div>
                <div className="text-2xl font-bold text-green-600">
                  {examData.totalCorrectAnswers}/{examData.quantity}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 text-sm mb-1">Đã trả lời</div>
                <div className="text-2xl font-bold text-orange-600">
                  {examData.answeredQuestions}/{examData.quantity}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 text-sm mb-1">Thời gian</div>
                <div className="text-2xl font-bold text-purple-600">
                  {formatTime(timeRemaining)}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentExam;
