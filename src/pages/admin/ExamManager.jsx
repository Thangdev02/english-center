import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Radio,
  Select,
  Space,
  Tabs,
  Tag,
} from "antd";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Edit,
  Plus,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PaginatedTable from "../../components/PaginatedTable";
import { useAuth } from "../../context/AuthContext";
import { examApi } from "../../services/examApi";
import { forumApi } from "../../services/forumApi";

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const ExamManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [questionModalVisible, setQuestionModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("exams");
  const [searchName, setSearchName] = useState("");
  const [searchQuestionName, setSearchQuestionName] = useState("");
  const [searchQuestionType, setSearchQuestionType] = useState("");
  const [tableKey, setTableKey] = useState(0);
  const [questionTableKey, setQuestionTableKey] = useState(0);
  const [questionType, setQuestionType] = useState(null);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [answers, setAnswers] = useState([
    { content: "", isCorrect: false },
    { content: "", isCorrect: false },
  ]);
  const [assignForm] = Form.useForm();
  const [questionForm] = Form.useForm();

  useEffect(() => {
    if (user?.id) {
      fetchClasses();
    }
  }, [user]);

  // Fetcher function for PaginatedTable
  const fetchExamsPage = useCallback(
    async ({ page, size }) => {
      try {
        const params = {
          page,
          size,
          ...(searchName && { name: searchName }),
        };

        const response = await examApi.getAllExams(params);
        const data = response?.data?.data ?? {};

        return {
          items: data.items ?? [],
          total: data.total ?? 0,
          page: data.page ?? page,
          size: data.size ?? size,
        };
      } catch (error) {
        console.error("Error fetching exams:", error);
        message.error("Không thể tải danh sách bài thi");
        return { items: [], total: 0, page, size };
      }
    },
    [searchName]
  );

  // Fetcher function for Questions PaginatedTable
  const fetchQuestionsPage = useCallback(
    async ({ page, size }) => {
      try {
        const params = {
          page,
          size,
          ...(searchQuestionName && { name: searchQuestionName }),
          ...(searchQuestionType && { type: searchQuestionType }),
        };

        const response = await examApi.getAllQuestions(params);
        const data = response?.data?.data ?? {};

        return {
          items: data.items ?? [],
          total: data.total ?? 0,
          page: data.page ?? page,
          size: data.size ?? size,
        };
      } catch (error) {
        console.error("Error fetching questions:", error);
        message.error("Không thể tải danh sách câu hỏi");
        return { items: [], total: 0, page, size };
      }
    },
    [searchQuestionName, searchQuestionType]
  );

  const fetchClasses = async () => {
    try {
      const response = await forumApi.getClasses({ page: 1, size: 1000 });
      const classes = response?.data?.data?.items || [];
      setClasses(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      message.error("Không thể tải danh sách lớp học");
    }
  };

  const handleSearch = () => {
    setTableKey((prev) => prev + 1);
  };

  const handleReset = () => {
    setSearchName("");
    setTableKey((prev) => prev + 1);
  };

  const handleQuestionSearch = () => {
    setQuestionTableKey((prev) => prev + 1);
  };

  const handleQuestionReset = () => {
    setSearchQuestionName("");
    setSearchQuestionType("");
    setQuestionTableKey((prev) => prev + 1);
  };

  const handleCreateQuestion = async (values) => {
    try {
      setQuestionLoading(true);
      // Validate for MultipleChoice type
      if (values.type === 0) {
        // Check if at least 2 answers
        if (answers.length < 2) {
          message.error("Câu hỏi trắc nghiệm phải có ít nhất 2 đáp án!");
          return;
        }

        // Check if all answers have content
        const emptyAnswers = answers.filter((ans) => !ans.content.trim());
        if (emptyAnswers.length > 0) {
          message.error("Vui lòng nhập nội dung cho tất cả các đáp án!");
          return;
        }

        // Check if exactly one answer is correct
        const correctAnswers = answers.filter((ans) => ans.isCorrect);
        if (correctAnswers.length === 0) {
          message.error("Vui lòng chọn ít nhất một đáp án đúng!");
          return;
        }
        if (correctAnswers.length > 1) {
          message.error("Chỉ được chọn một đáp án đúng!");
          return;
        }
      }

      // Create FormData for both create and update
      const formData = new FormData();
      formData.append("content", values.content);

      if (!isEditMode) {
        formData.append("type", values.type);
      }

      if (values.type === 0) {
        answers.forEach((answer, index) => {
          formData.append(`answers[${index}].content`, answer.content);
          formData.append(`answers[${index}].isCorrect`, answer.isCorrect);
        });
      }

      if (isEditMode && selectedQuestion) {
        // Update existing question
        await examApi.updateQuestion(selectedQuestion.id, formData);
        message.success("Cập nhật câu hỏi thành công!");
      } else {
        // Create new question
        await examApi.createQuestion(formData);
        message.success("Tạo câu hỏi thành công!");
      }

      setQuestionModalVisible(false);
      questionForm.resetFields();
      setQuestionType(null);
      setIsEditMode(false);
      setSelectedQuestion(null);
      setAnswers([
        { content: "", isCorrect: false },
        { content: "", isCorrect: false },
      ]);
      setQuestionTableKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error saving question:", error);
      message.error(
        isEditMode ? "Cập nhật câu hỏi thất bại!" : "Tạo câu hỏi thất bại!"
      );
    } finally {
      setQuestionLoading(false);
    }
  };

  const handleDeleteQuestion = (record) => {
    Modal.confirm({
      title: "Xác nhận xóa câu hỏi",
      content: `Bạn có chắc chắn muốn xóa câu hỏi "${record.content}"?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await examApi.deleteQuestion(record.id);
          message.success("Xóa câu hỏi thành công");
          setQuestionTableKey((prev) => prev + 1);
        } catch (error) {
          console.error("Error deleting question:", error);
          message.error("Không thể xóa câu hỏi");
        }
      },
    });
  };

  const handleEditQuestion = async (record) => {
    try {
      // Fetch full question details including answers
      const response = await examApi.getQuestion(record.id);
      const questionData = response?.data?.data;

      if (!questionData) {
        message.error("Không thể tải thông tin câu hỏi");
        return;
      }

      setSelectedQuestion(questionData);
      setIsEditMode(true);
      setQuestionType(questionData.type);

      // Prefill form with question data
      questionForm.setFieldsValue({
        type: questionData.type,
        content: questionData.content,
      });

      // Set answers if it's a multiple choice question
      if (questionData.type === 0 && questionData.answers?.length > 0) {
        setAnswers(
          questionData.answers.map((ans) => ({
            content: ans.content,
            isCorrect: ans.isCorrect,
          }))
        );
      } else {
        setAnswers([
          { content: "", isCorrect: false },
          { content: "", isCorrect: false },
        ]);
      }

      setQuestionModalVisible(true);
    } catch (error) {
      console.error("Error fetching question details:", error);
      message.error("Không thể tải thông tin câu hỏi");
    }
  };

  const handleQuestionTypeChange = (value) => {
    setQuestionType(value);
    if (value === 0) {
      // MultipleChoice - reset to 2 empty answers
      setAnswers([
        { content: "", isCorrect: false },
        { content: "", isCorrect: false },
      ]);
    } else {
      // Essay - clear answers
      setAnswers([]);
    }
  };

  const addAnswer = () => {
    setAnswers([...answers, { content: "", isCorrect: false }]);
  };

  const removeAnswer = (index) => {
    if (answers.length <= 2) {
      message.warning("Phải có ít nhất 2 đáp án!");
      return;
    }
    setAnswers(answers.filter((_, i) => i !== index));
  };

  const updateAnswer = (index, field, value) => {
    const newAnswers = [...answers];
    if (field === "isCorrect" && value) {
      // Uncheck all other answers
      newAnswers.forEach((ans, i) => {
        ans.isCorrect = i === index;
      });
    } else {
      newAnswers[index][field] = value;
    }
    setAnswers(newAnswers);
  };

  const handleAssignExam = async (values) => {
    try {
      const { classId, examId } = values;

      // Request body structure as per API requirement
      const examData = {
        examId: examId,
      };

      await examApi.assignExamToClass(classId, examData);
      message.success("Giao bài thi thành công!");
      setAssignModalVisible(false);
      assignForm.resetFields();
    } catch (error) {
      console.error("Error assigning exam:", error);
      message.error(error.response?.data?.message || "Giao bài thi thất bại!");
    }
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Xác nhận xóa bài thi",
      content: `Bạn có chắc chắn muốn xóa bài thi "${record.name}"?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await examApi.deleteExam(record.id);
          message.success("Xóa bài thi thành công");
          setTableKey((prev) => prev + 1);
        } catch (error) {
          console.error("Error deleting exam:", error);
          message.error("Không thể xóa bài thi");
        }
      },
    });
  };

  const getExamTypeColor = (type) => {
    return type === 0 ? "blue" : "green";
  };

  const getExamTypeText = (type) => {
    return type === 0 ? "Trắc nghiệm" : "Tự luận";
  };

  const formatDuration = (duration) => {
    // duration format: "00:15:00" (HH:mm:ss)
    if (!duration) return "N/A";
    const parts = duration.split(":");
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} phút`;
  };

  const columns = [
    {
      title: "Tên bài thi",
      dataIndex: "name",
      key: "name",
      width: 300,
      fixed: "left",
      render: (text, record) => (
        <div>
          <div className="font-semibold">{text}</div>
          <div className="text-sm text-gray-500">
            {record.description || "Chưa có mô tả"}
          </div>
        </div>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 130,
      render: (type) => (
        <Tag color={getExamTypeColor(type)}>{getExamTypeText(type)}</Tag>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "duration",
      key: "duration",
      width: 120,
      render: (duration) => (
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-gray-400" />
          <span className="text-sm">{formatDuration(duration)}</span>
        </div>
      ),
    },
    {
      title: "Số câu hỏi",
      dataIndex: "quantity",
      key: "quantity",
      width: 120,
      render: (quantity) => `${quantity} câu`,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Link to={`/admin/exams/${record.id}/edit`}>
            <Button
              type="text"
              size="small"
              icon={<Edit size={14} />}
              className="text-yellow-600"
            >
              Sửa
            </Button>
          </Link>
          <Button
            type="text"
            size="small"
            danger
            icon={<Trash2 size={14} />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  const questionColumns = [
    {
      title: "Nội dung câu hỏi",
      dataIndex: "content",
      key: "content",
      width: 400,
      render: (text) => <div className="font-medium">{text}</div>,
    },
    {
      title: "Loại câu hỏi",
      dataIndex: "type",
      key: "type",
      width: 150,
      render: (type) => (
        <Tag color={getExamTypeColor(type)}>{getExamTypeText(type)}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<Edit size={14} />}
            className="text-yellow-600"
            onClick={() => handleEditQuestion(record)}
          >
            Sửa
          </Button>
          <Button
            type="text"
            size="small"
            danger
            icon={<Trash2 size={14} />}
            onClick={() => handleDeleteQuestion(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate("/admin")}
            className="mb-4"
          >
            Quay lại Dashboard
          </Button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quản Lý Bài Thi
              </h1>
              <p className="text-gray-600">
                Tạo và quản lý các bài thi, câu hỏi, giao bài cho lớp học
              </p>
            </div>
            <Space>
              {activeTab === "exams" && (
                <Link to="/admin/exams/create">
                  <Button
                    type="primary"
                    icon={<Plus size={16} />}
                    // onClick={() => setModalVisible(true)}
                  >
                    Tạo Bài Thi
                  </Button>
                </Link>
              )}
              {activeTab === "questions" && (
                <Button
                  type="primary"
                  icon={<Plus size={16} />}
                  onClick={() => setQuestionModalVisible(true)}
                >
                  Tạo Câu Hỏi
                </Button>
              )}
            </Space>
          </div>

          {/* Search Card */}
          {activeTab === "exams" && (
            <Card className="mb-6" title="Tìm kiếm bài thi">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên bài thi
                  </label>
                  <Input
                    placeholder="Nhập tên bài thi..."
                    prefix={<Search size={16} />}
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    onPressEnter={handleSearch}
                    allowClear
                  />
                </div>
                <Button type="primary" onClick={handleSearch}>
                  Tìm kiếm
                </Button>
                <Button onClick={handleReset}>Đặt lại</Button>
              </div>
            </Card>
          )}

          {/* Questions Search Card */}
          {activeTab === "questions" && (
            <Card className="mb-6" title="Tìm kiếm câu hỏi">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung câu hỏi
                  </label>
                  <Input
                    placeholder="Nhập nội dung câu hỏi..."
                    prefix={<Search size={16} />}
                    value={searchQuestionName}
                    onChange={(e) => setSearchQuestionName(e.target.value)}
                    onPressEnter={handleQuestionSearch}
                    allowClear
                  />
                </div>
                <div className="w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại câu hỏi
                  </label>
                  <Select
                    placeholder="Chọn loại"
                    value={searchQuestionType || undefined}
                    onChange={setSearchQuestionType}
                    allowClear
                    className="w-full"
                  >
                    <Option value="MultipleChoice">MultipleChoice</Option>
                    <Option value="Essay">Essay</Option>
                  </Select>
                </div>
                <Button type="primary" onClick={handleQuestionSearch}>
                  Tìm kiếm
                </Button>
                <Button onClick={handleQuestionReset}>Đặt lại</Button>
              </div>
            </Card>
          )}

          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="Danh sách bài thi" key="exams">
                <PaginatedTable
                  key={tableKey}
                  columns={columns}
                  fetchData={fetchExamsPage}
                  rowKey="id"
                  initialPage={1}
                  initialSize={10}
                  scroll={{ x: 1200 }}
                />
              </TabPane>

              <TabPane tab="Ngân hàng câu hỏi" key="questions">
                <PaginatedTable
                  key={questionTableKey}
                  columns={questionColumns}
                  fetchData={fetchQuestionsPage}
                  rowKey="id"
                  initialPage={1}
                  initialSize={10}
                  scroll={{ x: 800 }}
                />
              </TabPane>
            </Tabs>
          </Card>
        </motion.div>
      </div>

      {/* Assign Exam Modal */}
      <Modal
        title="Giao Bài Thi Cho Lớp"
        open={assignModalVisible}
        onCancel={() => {
          setAssignModalVisible(false);
          assignForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={assignForm}
          layout="vertical"
          onFinish={handleAssignExam}
          className="mt-6"
        >
          <Form.Item
            name="classId"
            label="Chọn lớp học"
            rules={[{ required: true, message: "Vui lòng chọn lớp học!" }]}
          >
            <Select placeholder="Chọn lớp học">
              {classes.map((classItem) => (
                <Option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="examId"
            label="Bài thi"
            initialValue={selectedExam?.id}
          >
            <Input value={selectedExam?.name} disabled />
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex justify-end space-x-4">
              <Button
                onClick={() => {
                  setAssignModalVisible(false);
                  assignForm.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Giao Bài Thi
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create/Edit Question Modal */}
      <Modal
        title={isEditMode ? "Chỉnh Sửa Câu Hỏi" : "Tạo Câu Hỏi Mới"}
        open={questionModalVisible}
        onCancel={() => {
          setQuestionModalVisible(false);
          questionForm.resetFields();
          setQuestionType(null);
          setIsEditMode(false);
          setSelectedQuestion(null);
          setAnswers([
            { content: "", isCorrect: false },
            { content: "", isCorrect: false },
          ]);
        }}
        footer={null}
        width={700}
      >
        <Form
          form={questionForm}
          layout="vertical"
          onFinish={handleCreateQuestion}
          className="mt-6"
        >
          <Form.Item
            name="type"
            label="Loại câu hỏi"
            rules={[{ required: true, message: "Vui lòng chọn loại câu hỏi!" }]}
          >
            <Select
              placeholder="Chọn loại câu hỏi"
              onChange={handleQuestionTypeChange}
              disabled={isEditMode}
            >
              <Option value={0}>MultipleChoice (Trắc nghiệm)</Option>
              <Option value={1}>Essay (Tự luận)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung câu hỏi"
            rules={[
              { required: true, message: "Vui lòng nhập nội dung câu hỏi!" },
            ]}
          >
            <Input.TextArea rows={4} placeholder="Nhập nội dung câu hỏi..." />
          </Form.Item>

          {/* Answers section for MultipleChoice */}
          {questionType === 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Đáp án (chọn đáp án đúng)
                </label>
                <Button
                  type="dashed"
                  icon={<Plus size={14} />}
                  onClick={addAnswer}
                  size="small"
                >
                  Thêm đáp án
                </Button>
              </div>

              <div
                className="space-y-3 overflow-y-auto pr-2"
                style={{ maxHeight: "150px" }}
              >
                {answers.map((answer, index) => (
                  <Card
                    key={index}
                    size="small"
                    className="border-2"
                    style={{
                      borderColor: answer.isCorrect ? "#52c41a" : "#d9d9d9",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Radio
                        checked={answer.isCorrect}
                        onChange={(e) =>
                          updateAnswer(index, "isCorrect", e.target.checked)
                        }
                        className="mt-2"
                      />
                      <div className="flex-1">
                        <Input.TextArea
                          rows={2}
                          placeholder={`Đáp án ${index + 1}`}
                          value={answer.content}
                          onChange={(e) =>
                            updateAnswer(index, "content", e.target.value)
                          }
                        />
                      </div>
                      {answers.length > 2 && (
                        <Button
                          type="text"
                          danger
                          icon={<X size={16} />}
                          onClick={() => removeAnswer(index)}
                        />
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              <div className="text-xs text-gray-500">
                * Phải có ít nhất 2 đáp án và chỉ được chọn 1 đáp án đúng
              </div>
            </div>
          )}

          <Form.Item className="mb-0 mt-6">
            <div className="flex justify-end space-x-4">
              <Button
                onClick={() => {
                  setQuestionModalVisible(false);
                  questionForm.resetFields();
                  setQuestionType(null);
                  setIsEditMode(false);
                  setSelectedQuestion(null);
                  setAnswers([
                    { content: "", isCorrect: false },
                    { content: "", isCorrect: false },
                  ]);
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={questionLoading}
              >
                {isEditMode ? "Cập Nhật" : "Tạo Câu Hỏi"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExamManager;
