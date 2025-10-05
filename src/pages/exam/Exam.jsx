import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, Button, Progress, Radio, Checkbox, Space, Modal, Timeline } from 'antd';
import { Clock, AlertCircle, CheckCircle, Flag } from 'lucide-react';

const Exam = () => {
  const { courseId } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes in seconds
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Mock exam data
  const exam = {
    title: "Bài kiểm tra giữa kỳ - Tiếng Anh Giao Tiếp",
    duration: 60,
    totalQuestions: 20,
    questions: [
      {
        id: 1,
        type: 'multiple_choice',
        question: "Chọn từ có cách phát âm khác với các từ còn lại:",
        options: [
          "A. cat",
          "B. hat",
          "C. late",
          "D. bat"
        ],
        points: 1
      },
      {
        id: 2,
        type: 'multiple_choice',
        question: "Câu nào sau đây là đúng ngữ pháp?",
        options: [
          "A. She don't like apples",
          "B. She doesn't likes apples",
          "C. She doesn't like apples",
          "D. She don't likes apples"
        ],
        points: 1
      },
      {
        id: 3,
        type: 'reading',
        passage: "The quick brown fox jumps over the lazy dog. This sentence contains every letter in the English alphabet. It is often used for typing practice and testing typewriters and computer keyboards.",
        question: "What is the main purpose of this sentence?",
        options: [
          "A. To tell a story about animals",
          "B. To practice typing and test keyboards",
          "C. To teach the alphabet to children",
          "D. To demonstrate grammar rules"
        ],
        points: 2
      }
    ]
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateProgress = () => {
    const answered = Object.keys(answers).length;
    return (answered / exam.totalQuestions) * 100;
  };

  // Timer effect
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = exam.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Exam Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
              <p className="text-gray-600">Tổng số câu: {exam.totalQuestions}</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="flex items-center text-red-600 font-semibold">
                  <Clock className="w-5 h-5 mr-2" />
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-gray-500">Thời gian còn lại</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">
                  {Object.keys(answers).length}/{exam.totalQuestions}
                </div>
                <div className="text-sm text-gray-500">Đã trả lời</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Questions Navigation */}
          <div className="lg:col-span-1">
            <Card title="Danh sách câu hỏi" className="sticky top-8">
              <div className="grid grid-cols-5 gap-2 mb-4">
                {exam.questions.map((_, index) => (
                  <Button
                    key={index}
                    type={currentQuestion === index ? "primary" : 
                          answers[index] ? "default" : "dashed"}
                    size="small"
                    className={`w-8 h-8 p-0 ${
                      currentQuestion === index ? 'bg-primary-600 border-primary-600' : ''
                    }`}
                    onClick={() => setCurrentQuestion(index)}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
              <Progress percent={calculateProgress()} />
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
                  <span>Đang làm</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-600 rounded mr-2"></div>
                  <span>Đã trả lời</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-300 rounded mr-2"></div>
                  <span>Chưa làm</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card>
                {/* Question Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                  <div>
                    <h2 className="text-xl font-semibold">
                      Câu {currentQuestion + 1}
                    </h2>
                    <p className="text-gray-600">Điểm: {currentQ.points}</p>
                  </div>
                  <Button icon={<Flag />} type="text">
                    Đánh dấu
                  </Button>
                </div>

                {/* Reading Passage */}
                {currentQ.passage && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold mb-2">Đọc đoạn văn sau:</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {currentQ.passage}
                    </p>
                  </div>
                )}

                {/* Question */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">
                    {currentQ.question}
                  </h3>

                  {/* Options */}
                  <div className="space-y-3">
                    {currentQ.options.map((option, index) => (
                      <div
                        key={index}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          answers[currentQ.id] === option
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-primary-300'
                        }`}
                        onClick={() => handleAnswer(currentQ.id, option)}
                      >
                        <Space>
                          <Radio 
                            checked={answers[currentQ.id] === option}
                            onChange={() => handleAnswer(currentQ.id, option)}
                          />
                          <span>{option}</span>
                        </Space>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4 border-t">
                  <Button
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    size="large"
                  >
                    Câu trước
                  </Button>
                  
                  {currentQuestion === exam.questions.length - 1 ? (
                    <Button 
                      type="primary" 
                      size="large"
                      onClick={() => setShowSubmitModal(true)}
                    >
                      Nộp bài
                    </Button>
                  ) : (
                    <Button 
                      type="primary" 
                      size="large"
                      onClick={handleNext}
                    >
                      Câu tiếp theo
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      <Modal
        title="Xác nhận nộp bài"
        open={showSubmitModal}
        onCancel={() => setShowSubmitModal(false)}
        footer={[
          <Button key="back" onClick={() => setShowSubmitModal(false)}>
            Tiếp tục làm bài
          </Button>,
          <Button key="submit" type="primary" danger>
            Xác nhận nộp bài
          </Button>,
        ]}
      >
        <div className="text-center py-4">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Bạn có chắc chắn muốn nộp bài?</h3>
          <p className="text-gray-600">
            Bạn đã trả lời {Object.keys(answers).length} trong tổng số {exam.totalQuestions} câu hỏi.
            Thời gian còn lại: {formatTime(timeLeft)}
          </p>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold">Câu đã trả lời:</div>
                <div className="text-green-600">{Object.keys(answers).length}</div>
              </div>
              <div>
                <div className="font-semibold">Câu chưa trả lời:</div>
                <div className="text-red-600">{exam.totalQuestions - Object.keys(answers).length}</div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Exam;