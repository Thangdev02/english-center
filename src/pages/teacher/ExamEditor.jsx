import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Spin,
  Tag,
  TimePicker,
  Transfer,
} from "antd";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { examApi } from "../../services/examApi";

const { TextArea } = Input;

const ExamEditor = () => {
  const { id } = useParams();
  useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [exam, setExam] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchExamData();
    fetchAllQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchExamData = async () => {
    try {
      setLoading(true);
      const response = await examApi.getExam(id);
      const examData = response?.data?.data;

      if (!examData) {
        throw new Error("Exam not found");
      }

      setExam(examData);
      setExamQuestions(examData.questions || []);

      form.setFieldsValue({
        name: examData.name,
        description: examData.description,
        duration: examData.duration
          ? dayjs(examData.duration, "HH:mm:ss")
          : null,
        quantity: examData.quantity,
      });
    } catch (error) {
      console.error("Error fetching exam:", error);
      message.error("Không thể tải thông tin bài thi");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const response = await examApi.getAllQuestions({ page: 1, size: 1000 });
      const questions = response?.data?.data?.items || [];
      setAllQuestions(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      message.error("Không thể tải danh sách câu hỏi");
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (exam && allQuestions.length > 0) {
      // Filter available questions by exam type
      const filtered = allQuestions.filter((q) => q.type === exam.type);
      setAvailableQuestions(filtered);
    }
  }, [exam, allQuestions]);

  const handleRemoveQuestion = async (questionId) => {
    try {
      await examApi.removeExamQuestions(questionId);
      message.success("Xóa câu hỏi thành công!");
      fetchExamData(); // Refresh exam data
    } catch (error) {
      console.error("Error removing question:", error);
      message.error("Xóa câu hỏi thất bại!");
    }
  };

  const handleAddQuestions = async () => {
    if (selectedQuestionIds.length === 0) {
      message.error("Vui lòng chọn ít nhất một câu hỏi!");
      return;
    }

    try {
      setSaving(true);

      const questionData = {
        questionIds: selectedQuestionIds,
      };

      await examApi.addMoreQuestions(id, questionData);
      message.success("Thêm câu hỏi thành công!");
      setSelectedQuestionIds([]);
      fetchExamData(); // Refresh exam data
    } catch (error) {
      console.error("Error adding questions:", error);
      message.error(error.response?.data?.message || "Thêm câu hỏi thất bại!");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSaving(true);

      // Convert time to TimeOnly format (HH:mm:ss)
      const duration = values.duration
        ? values.duration.format("HH:mm:ss")
        : null;

      const examData = {
        name: values.name || null,
        duration: duration,
        description: values.description || null,
        quantity: values.quantity || null,
      };

      await examApi.updateExam(id, examData);
      message.success("Cập nhật bài thi thành công!");
      fetchExamData(); // Refresh exam data
    } catch (error) {
      console.error("Error updating exam:", error);
      message.error(
        error.response?.data?.message || "Cập nhật bài thi thất bại!"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <Spin size="large" />
          </div>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Bài thi không tồn tại
          </h1>
          <Button type="primary" onClick={() => navigate("/teacher/exams")}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const getExamQuestionIds = () => {
    return examQuestions.map((q) => q.id);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                icon={<ArrowLeft size={16} />}
                onClick={() => navigate("/teacher/exams")}
              >
                Quay lại
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Chỉnh sửa Bài Thi
                </h1>
                <p className="text-gray-600">
                  Cập nhật thông tin và câu hỏi bài thi
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Panel - Exam Info Form */}
            <div className="lg:col-span-1">
              <Card title="Thông tin bài thi">
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                  <Form.Item name="name" label="Tên bài thi">
                    <Input placeholder="Bài kiểm tra giữa kỳ" />
                  </Form.Item>

                  <Form.Item name="description" label="Mô tả">
                    <TextArea rows={3} placeholder="Mô tả về bài thi..." />
                  </Form.Item>

                  <Form.Item name="duration" label="Thời gian">
                    <TimePicker
                      format="HH:mm:ss"
                      className="w-full"
                      placeholder="Chọn thời gian"
                    />
                  </Form.Item>

                  <Form.Item name="quantity" label="Số câu hỏi">
                    <InputNumber
                      min={1}
                      max={100}
                      className="w-full"
                      placeholder="Số câu hỏi"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={saving}
                      icon={<Save size={16} />}
                      className="w-full"
                    >
                      Cập Nhật Thông Tin
                    </Button>
                  </Form.Item>
                </Form>
              </Card>

              <Card className="mt-6" title="Thống kê">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Loại bài thi:</span>
                    <div>
                      {exam?.type === 0 && <Tag color="blue">Trắc nghiệm</Tag>}
                      {exam?.type === 1 && <Tag color="green">Tự luận</Tag>}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Câu hỏi hiện tại:</span>
                    <span className="font-semibold">
                      {examQuestions.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Câu hỏi sẽ thêm:</span>
                    <span className="font-semibold text-green-600">
                      +{selectedQuestionIds.length}
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Panel - Questions Management */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Questions */}
              <Card title={`Câu hỏi hiện tại (${examQuestions.length})`}>
                {examQuestions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📝</div>
                    <p>Chưa có câu hỏi nào</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {examQuestions.map((question, index) => (
                      <Card
                        key={question.id}
                        size="small"
                        title={
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Câu {index + 1}</span>
                            <div className="flex items-center space-x-2">
                              <Tag
                                color={question.type === 0 ? "blue" : "green"}
                              >
                                {question.type === 0
                                  ? "Trắc nghiệm"
                                  : "Tự luận"}
                              </Tag>
                              <Popconfirm
                                title="Xóa câu hỏi"
                                description="Bạn có chắc chắn muốn xóa câu hỏi này?"
                                onConfirm={() =>
                                  handleRemoveQuestion(question.id)
                                }
                                okText="Xóa"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                              >
                                <Button
                                  size="small"
                                  danger
                                  icon={<Trash2 size={14} />}
                                />
                              </Popconfirm>
                            </div>
                          </div>
                        }
                      >
                        <div className="mb-2 font-medium">
                          {question.content}
                        </div>
                        {question.answers && question.answers.length > 0 && (
                          <div className="space-y-1">
                            {question.answers.map((answer, idx) => (
                              <div
                                key={answer.id}
                                className={`text-sm px-2 py-1 rounded ${
                                  answer.isCorrect
                                    ? "bg-green-50 text-green-700 font-medium"
                                    : "bg-gray-50 text-gray-600"
                                }`}
                              >
                                {String.fromCharCode(65 + idx)}.{" "}
                                {answer.content}
                                {answer.isCorrect && " ✓"}
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </Card>

              {/* Add More Questions */}
              <Card
                title="Thêm câu hỏi từ ngân hàng"
                extra={
                  <Button
                    type="primary"
                    onClick={handleAddQuestions}
                    loading={saving}
                    disabled={selectedQuestionIds.length === 0}
                  >
                    Thêm {selectedQuestionIds.length} câu hỏi
                  </Button>
                }
              >
                <Transfer
                  dataSource={availableQuestions
                    .filter((q) => !getExamQuestionIds().includes(q.id))
                    .map((q) => ({
                      key: q.id,
                      title: q.content,
                      description: q.type === 0 ? "Trắc nghiệm" : "Tự luận",
                    }))}
                  titles={["Câu hỏi có sẵn", "Sẽ thêm vào bài thi"]}
                  targetKeys={selectedQuestionIds}
                  onChange={setSelectedQuestionIds}
                  render={(item) => (
                    <div className="py-2">
                      <div className="font-medium text-sm mb-1">
                        {item.title}
                      </div>
                      <Tag
                        color={exam?.type === 0 ? "blue" : "green"}
                        size="small"
                      >
                        {item.description}
                      </Tag>
                    </div>
                  )}
                  listStyle={{
                    width: "100%",
                    height: 400,
                  }}
                  showSearch
                  filterOption={(input, item) =>
                    item.title.toLowerCase().includes(input.toLowerCase())
                  }
                  locale={{
                    itemUnit: "câu hỏi",
                    itemsUnit: "câu hỏi",
                    searchPlaceholder: "Tìm kiếm câu hỏi...",
                    notFoundContent: "Không tìm thấy",
                  }}
                  loading={loadingQuestions}
                />
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ExamEditor;
