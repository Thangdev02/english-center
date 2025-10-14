import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Card,
  Button,
  Radio,
  Space,
  Modal,
  message,
  Typography,
  Alert,
  Spin,
} from "antd";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { examApi, examService } from "../services/examApi";
import { useAuth } from "../context/AuthContext";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const { Title, Text } = Typography;

const ExamTaking = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // 🔹 Cấu hình Quill
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  // 🔹 Strip HTML tags để gửi sang Gemini
  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // 🔹 Tải đề thi
  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        const data = await examService.getExamWithDetails(id);
        if (!data?.questions?.length) throw new Error("Không tìm thấy câu hỏi.");

        setExam(data);
        setTimeLeft(data.duration * 60);

        const init = {};
        data.questions.forEach((q, i) => {
          init[i] = q.type === "multiple_choice" ? null : "";
        });
        setAnswers(init);
      } catch (err) {
        console.error("❌ Lỗi tải bài thi:", err);
        message.error("Không thể tải bài thi.");
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [id]);

  // 🔹 Đếm ngược thời gian
  useEffect(() => {
    if (!exam || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          setShowConfirm(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [exam, timeLeft]);

  // 🔹 Ghi câu trả lời
  const handleAnswerChange = (v) =>
    setAnswers((p) => ({ ...p, [currentQuestion]: v }));

  const handleEssayChange = (v) =>
    setAnswers((p) => ({ ...p, [currentQuestion]: v }));

  // 🔹 Nộp bài thi
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      let totalScore = 0;
      let aiFeedback = null;

      // ✅ Chấm điểm AI nếu có bài luận
      for (const [index, q] of exam.questions.entries()) {
        if (q.type === "multiple_choice" && answers[index] === q.correctAnswer)
          totalScore += q.points;

        if (q.type === "essay" && answers[index]) {
          const res = await fetch("http://localhost:8000/api/evaluate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ essay: stripHtml(answers[index]) }),
          });

          const json = await res.json();
          setAiResult(json);
          aiFeedback = json;
        }
      }

      // ✅ Gửi bài thi về hệ thống chính
      const safeString = (str) => {
        if (!str) return "";
        return String(str)
          .replace(/\n/g, " ")
          .replace(/\r/g, "")
          .replace(/\t/g, " ")
          .replace(/"/g, "'");
      };
      
      const cleanAi = aiFeedback
        ? {
            score: aiFeedback.score || 0,
            feedback: safeString(aiFeedback.feedback),
            grammar: safeString(aiFeedback.grammar),
            vocabulary: safeString(aiFeedback.vocabulary),
            coherence: safeString(aiFeedback.coherence),
          }
        : {};
      
      const cleanAnswers = Object.fromEntries(
        Object.entries(answers).map(([k, v]) => [k, safeString(v)])
      );
      
      const payload = {
        examId: id,
        userId: user?.id || "anonymous",
        classId: exam.classId || "1",
        score: aiFeedback?.score || totalScore || 0,
        totalPoints: exam.totalPoints || 100,
        timeSpent: exam.duration * 60 - timeLeft,
        answers: cleanAnswers,
        aiResult: cleanAi,
        submittedAt: new Date().toISOString(),
        status: "completed",
      };
      

      console.log("📤 Submitting result:", payload);
      await examApi.submitExam(payload);

      message.success("✅ Nộp bài thành công!");

      // ✅ Hiển thị kết quả AI
     // ✅ Show AI result with modern English layout
Modal.success({
  title: "✨ Essay Evaluation Result",
  width: 650,
  okText: "Return to Class",
  content: (
    <div style={{ maxHeight: 400, overflowY: "auto", padding: "8px" }}>
      {aiFeedback ? (
        <>
          <Card  bordered={false} style={{ marginBottom: 16, background: "#f9fafb" }}>
            <Title level={4} style={{ marginBottom: 8 }}>
              Overall Score:{" "}
              <span style={{ color: "#52c41a" }}>{aiFeedback.score} / 9</span>
            </Title>
            <p style={{ fontSize: 15 }}>
              <Text type="secondary">
                The following evaluation was generated automatically by AI.
              </Text>
            </p>
          </Card>

          <Card bordered style={{ marginBottom: 12 }}>
            <Title level={5}>🧠 General Feedback</Title>
            <Text>{aiFeedback.feedback}</Text>
          </Card>

          <Card bordered style={{ marginBottom: 12 }}>
            <Title level={5}>✍️ Grammar</Title>
            <Text>{aiFeedback.grammar}</Text>
          </Card>

          <Card bordered style={{ marginBottom: 12 }}>
            <Title level={5}>📚 Vocabulary</Title>
            <Text>{aiFeedback.vocabulary}</Text>
          </Card>

          <Card bordered style={{ marginBottom: 12 }}>
            <Title level={5}>🔗 Coherence & Cohesion</Title>
            <Text>{aiFeedback.coherence}</Text>
          </Card>
        </>
      ) : (
        <Alert
          message="No Essay Found"
          description="You did not submit any essay for AI evaluation."
          type="info"
          showIcon
        />
      )}
    </div>
  ),
  onOk: () => navigate("/student/classes"),
});

    } catch (err) {
      console.error("❌ Error submitting exam:", err);
      message.error("Nộp bài thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // 🔹 Loading
  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Spin size="large" />
      </div>
    );

  if (!exam)
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <h1>Không thể tải bài thi</h1>
        <Button onClick={() => navigate("/student/classes")}>Quay lại</Button>
      </div>
    );

  const q = exam.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="mb-6">
            <div className="flex justify-between items-center">
              <Button icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
                Quay lại
              </Button>
              <div>
                <Title level={3}>{exam.title}</Title>
                <Text type="secondary">{exam.description}</Text>
              </div>
              <div className="text-right">
                <Text type="secondary">Thời gian còn lại</Text>
                <div className="text-2xl font-bold text-red-600">
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
          </Card>

          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <Card title="Danh sách câu hỏi">
                <div className="grid grid-cols-5 gap-2">
                  {exam.questions.map((_, i) => (
                    <Button
                      key={i}
                      type={
                        currentQuestion === i
                          ? "primary"
                          : answers[i]
                          ? "default"
                          : "dashed"
                      }
                      onClick={() => setCurrentQuestion(i)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
              </Card>
            </div>

            <div className="lg:col-span-3">
              <Card title={`Câu ${currentQuestion + 1} (${q.points} điểm)`}>
                <Text strong>{q.question}</Text>

                {q.type === "multiple_choice" ? (
                  <Radio.Group
                    value={answers[currentQuestion]}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="mt-4"
                  >
                    <Space direction="vertical">
                      {q.options.map((opt, i) => (
                        <Radio key={i} value={i}>
                          {opt}
                        </Radio>
                      ))}
                    </Space>
                  </Radio.Group>
                ) : (
                  <div className="border rounded mt-4">
                    <ReactQuill
                      value={answers[currentQuestion] || ""}
                      onChange={handleEssayChange}
                      modules={quillModules}
                      placeholder="Nhập bài luận của bạn..."
                      style={{ height: "300px", marginBottom: "50px" }}
                    />
                  </div>
                )}

                <div className="flex justify-between mt-8">
                  <Button
                    icon={<ArrowLeft size={16} />}
                    onClick={() => setCurrentQuestion((p) => p - 1)}
                    disabled={currentQuestion === 0}
                  >
                    Câu trước
                  </Button>

                  {currentQuestion === exam.questions.length - 1 ? (
                    <Button
                      type="primary"
                      icon={<Send size={16} />}
                      onClick={() => setShowConfirm(true)}
                      loading={submitting}
                    >
                      Nộp bài
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      icon={<ArrowRight size={16} />}
                      onClick={() => setCurrentQuestion((p) => p + 1)}
                    >
                      Câu tiếp
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>

      <Modal
        title="Xác nhận nộp bài"
        open={showConfirm}
        onCancel={() => setShowConfirm(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowConfirm(false)}>
            Tiếp tục làm bài
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitting}
            onClick={handleSubmit}
            icon={<Send size={16} />}
          >
            Xác nhận nộp bài
          </Button>,
        ]}
      >
        <Alert
          message="Bạn có chắc chắn muốn nộp bài?"
          description="Sau khi nộp, bạn sẽ không thể thay đổi câu trả lời."
          type="warning"
          showIcon
        />
      </Modal>
    </div>
  );
};

export default ExamTaking;
