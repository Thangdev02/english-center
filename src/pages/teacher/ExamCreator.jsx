import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Tag,
  Tooltip,
  TimePicker,
  Transfer,
} from "antd";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { examApi } from "../../services/examApi";

const { Option } = Select;
const { TextArea } = Input;

const ExamCreator = () => {
  useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [examType, setExamType] = useState(null);

  useEffect(() => {
    fetchAllQuestions();
  }, []);

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

  const getFilteredQuestions = () => {
    if (examType === null) return allQuestions;
    return allQuestions.filter((q) => q.type === examType);
  };

  const handleTypeChange = (value) => {
    setExamType(value);
    // Clear selected questions when type changes
    setSelectedQuestionIds([]);
    form.setFieldValue("quantity", 0);
  };

  const handleQuestionSelectionChange = (targetKeys) => {
    setSelectedQuestionIds(targetKeys);
    // Auto-update quantity field
    form.setFieldValue("quantity", targetKeys.length);
  };

  const handleSubmit = async (values) => {
    if (selectedQuestionIds.length === 0) {
      message.error("Vui lòng chọn ít nhất một câu hỏi!");
      return;
    }

    if (values.quantity !== selectedQuestionIds.length) {
      message.error(
        `Số câu hỏi (${values.quantity}) phải bằng số câu hỏi đã chọn (${selectedQuestionIds.length})!`
      );
      return;
    }

    try {
      setSaving(true);

      // Convert time to TimeOnly format (HH:mm:ss)
      const duration = values.duration.format("HH:mm:ss");

      const examData = {
        name: values.name,
        duration: duration,
        description: values.description || null,
        quantity: values.quantity,
        type: values.type,
        questionsIds: selectedQuestionIds,
      };

      console.log("Creating exam with data:", examData);

      await examApi.createExam(examData);
      message.success("Tạo bài thi thành công!");
      navigate("/teacher/exams");
    } catch (error) {
      console.error("Error creating exam:", error);
      message.error(error.response?.data?.message || "Tạo bài thi thất bại!");
    } finally {
      setSaving(false);
    }
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
                  Tạo Bài Thi Mới
                </h1>
                <p className="text-gray-600">
                  Thiết kế bài thi với các câu hỏi trắc nghiệm và tự luận
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card title="Thông tin bài thi">
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                  <Form.Item
                    name="name"
                    label="Tên bài thi"
                    rules={[
                      { required: true, message: "Vui lòng nhập tên bài thi!" },
                    ]}
                  >
                    <Input placeholder="Bài kiểm tra giữa kỳ" />
                  </Form.Item>

                  <Form.Item name="description" label="Mô tả">
                    <TextArea rows={3} placeholder="Mô tả về bài thi..." />
                  </Form.Item>

                  <Form.Item
                    name="type"
                    label="Loại bài thi"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn loại bài thi!",
                      },
                    ]}
                  >
                    <Select placeholder="Chọn loại" onChange={handleTypeChange}>
                      <Option value={0}>Trắc nghiệm</Option>
                      <Option value={1}>Tự luận</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="duration"
                    label="Thời gian"
                    rules={[
                      { required: true, message: "Vui lòng chọn thời gian!" },
                    ]}
                  >
                    <TimePicker
                      format="HH:mm:ss"
                      className="w-full"
                      placeholder="Chọn thời gian"
                    />
                  </Form.Item>

                  <Form.Item
                    name="quantity"
                    label="Số câu hỏi"
                    rules={[
                      { required: true, message: "Vui lòng nhập số câu hỏi!" },
                      {
                        validator: (_, value) => {
                          if (
                            value &&
                            selectedQuestionIds.length > 0 &&
                            value !== selectedQuestionIds.length
                          ) {
                            return Promise.reject(
                              `Phải bằng số câu hỏi đã chọn (${selectedQuestionIds.length})`
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
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
                      disabled={selectedQuestionIds.length === 0}
                    >
                      Lưu Bài Thi
                    </Button>
                  </Form.Item>
                </Form>
              </Card>

              <Card className="mt-6" title="Thống kê">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Câu hỏi đã chọn:</span>
                    <span className="font-semibold">
                      {selectedQuestionIds.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Loại bài thi:</span>
                    <div>
                      {examType === 0 && <Tag color="blue">Trắc nghiệm</Tag>}
                      {examType === 1 && <Tag color="green">Tự luận</Tag>}
                      {examType === null && <Tag>Chưa chọn</Tag>}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card title="Chọn câu hỏi">
                <style>{`.exam-transfer .ant-transfer-list{width:100% !important} @media (min-width:1024px){.exam-transfer .ant-transfer-list{width:48% !important}} .exam-transfer .ant-transfer-list-item .ant-transfer-list-item-content{word-break:break-word;white-space:normal}`}</style>
                {examType === null ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">📝</div>
                    <p className="text-lg mb-2">Vui lòng chọn loại bài thi</p>
                    <p>Chọn loại bài thi ở bên trái để bắt đầu chọn câu hỏi</p>
                  </div>
                ) : (
                  <div className="exam-transfer">
                    <Transfer
                      dataSource={getFilteredQuestions().map((q) => ({
                        key: q.id,
                        title: q.content,
                        description: q.type === 0 ? "Trắc nghiệm" : "Tự luận",
                      }))}
                      titles={["Câu hỏi có sẵn", "Câu hỏi đã chọn"]}
                      targetKeys={selectedQuestionIds}
                      onChange={handleQuestionSelectionChange}
                      render={(item) => (
                        <div className="py-2 break-words">
                          <Tooltip
                            placement="topLeft"
                            title={item.title}
                            mouseEnterDelay={0.25}
                          >
                            <div className="font-medium text-sm mb-1 break-words">
                              {item.title}
                            </div>
                          </Tooltip>
                          <Tag
                            color={examType === 0 ? "blue" : "green"}
                            size="small"
                          >
                            {item.description}
                          </Tag>
                        </div>
                      )}
                      listStyle={{
                        width: "100%",
                        height: 500,
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
                  </div>
                )}
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ExamCreator;
