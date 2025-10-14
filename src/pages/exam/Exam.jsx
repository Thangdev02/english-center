import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Card,
  Button,
  Progress,
  Radio,
  Space,
  Modal,
  message,
  Spin,
} from "antd";
import { Clock, AlertCircle, Flag } from "lucide-react";
import ReactQuill from "react-quill";
import axios from "axios";
import "react-quill/dist/quill.snow.css";

const Exam = () => {
  const { courseId } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [essay, setEssay] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  const exam = {
    title: "Bài kiểm tra giữa kỳ - Tiếng Anh Giao Tiếp",
    duration: 60,
    totalQuestions: 4,
    questions: [
      {
        id: 1,
        type: "multiple_choice",
        question: "Chọn từ có cách phát âm khác với các từ còn lại:",
        options: ["A. cat", "B. hat", "C. late", "D. bat"],
        points: 1,
      },
      {
        id: 2,
        type: "multiple_choice",
        question: "Câu nào sau đây là đúng ngữ pháp?",
        options: [
          "A. She don't like apples",
          "B. She doesn't likes apples",
          "C. She doesn't like apples",
          "D. She don't likes apples",
        ],
        points: 1,
      },
      {
        id: 3,
        type: "reading",
        passage:
          "The quick brown fox jumps over the lazy dog. This sentence contains every letter in the English alphabet. It is often used for typing practice and testing typewriters and computer keyboards.",
        question: "What is the main purpose of this sentence?",
        options: [
          "A. To tell a story about animals",
          "B. To practice typing and test keyboards",
          "C. To teach the alphabet to children",
          "D. To demonstrate grammar rules",
        ],
        points: 2,
      },
      {
        id: 4,
        type: "essay",
        question: "Write an essay about the impact of technology on communication (about 250–300 words).",
        points: 5,
      },
    ],
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
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

  // ⏰ Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
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
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // 🚀 Gửi bài viết lên API Python
  const handleEssaySubmit = async () => {
    if (!essay.trim()) {
      message.warning("Please write your essay before submitting!");
      return;
    }

    setEvaluating(true);
    setEvaluation(null);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/evaluate", {
        essay: essay,
      });

      setEvaluation(response.data);
      message.success("Essay evaluated successfully!");
    } catch (error) {
      console.error(error);
      message.error("Error evaluating essay. Please try again!");
    } finally {
      setEvaluating(false);
    }
  };

  const currentQ = exam.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
              <p className="text-gray-600">
                Tổng số câu: {exam.totalQuestions}
              </p>
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

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card title="Danh sách câu hỏi" className="sticky top-8">
              <div className="grid grid-cols-5 gap-2 mb-4">
                {exam.questions.map((_, index) => (
                  <Button
                    key={index}
                    type={
                      currentQuestion === index
                        ? "primary"
                        : answers[index + 1]
                        ? "default"
                        : "dashed"
                    }
                    size="small"
                    className={`w-8 h-8 p-0 ${
                      currentQuestion === index ? "bg-blue-600" : ""
                    }`}
                    onClick={() => setCurrentQuestion(index)}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
              <Progress percent={calculateProgress()} />
            </Card>
          </div>

          {/* Question Section */}
          <div className="lg:col-span-3">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card>
                <h2 className="text-xl font-semibold mb-4">
                  Câu {currentQuestion + 1}
                </h2>

                {currentQ.type !== "essay" ? (
                  <>
                    {currentQ.passage && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <p>{currentQ.passage}</p>
                      </div>
                    )}
                    <p className="font-medium mb-4">{currentQ.question}</p>
                    {currentQ.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`p-3 border rounded-lg mb-2 cursor-pointer ${
                          answers[currentQ.id] === opt
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300"
                        }`}
                        onClick={() => handleAnswer(currentQ.id, opt)}
                      >
                        <Radio
                          checked={answers[currentQ.id] === opt}
                          onChange={() => handleAnswer(currentQ.id, opt)}
                        >
                          {opt}
                        </Radio>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <p className="font-medium mb-3">{currentQ.question}</p>
                    <ReactQuill
                      theme="snow"
                      value={essay}
                      onChange={setEssay}
                      placeholder="Write your essay here..."
                    />
                    <Button
                      type="primary"
                      className="mt-4"
                      onClick={handleEssaySubmit}
                      disabled={evaluating}
                    >
                      {evaluating ? <Spin /> : "Nộp bài viết để chấm điểm"}
                    </Button>

                    {evaluation && (
                      <Card className="mt-6 bg-gray-50 border-blue-100">
                        <h3 className="text-lg font-semibold text-blue-600 mb-2">
                          Kết quả chấm bài viết:
                        </h3>
                        <p>
                          <strong>Score:</strong> {evaluation.score}
                        </p>
                        <p>
                          <strong>Feedback:</strong> {evaluation.feedback}
                        </p>
                        <p>
                          <strong>Grammar:</strong> {evaluation.grammar}
                        </p>
                        <p>
                          <strong>Vocabulary:</strong> {evaluation.vocabulary}
                        </p>
                        <p>
                          <strong>Coherence:</strong> {evaluation.coherence}
                        </p>
                      </Card>
                    )}
                  </>
                )}

                <div className="flex justify-between pt-6 border-t mt-4">
                  <Button
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                  >
                    Câu trước
                  </Button>
                  {currentQuestion < exam.questions.length - 1 && (
                    <Button type="primary" onClick={handleNext}>
                      Câu tiếp theo
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exam;
