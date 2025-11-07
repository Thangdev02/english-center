import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Button,
  Upload,
  message,
  Row,
  Col,
  Divider,
  Steps,
  Tag,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  BookOutlined,
  DollarOutlined,
  UserOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { courseApi } from "../../services/courseApi";
import { userApi } from "../../services/userApi";

const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;

const AddCourse = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const response = await userApi.getAllUsers({
        page: 1,
        size: 1000,
        role: "Teacher",
      });
      console.log("👨‍🏫 Fetched teachers:", response.data);
      setTeachers(response.data.data?.items || []);
    } catch (error) {
      console.error("❌ Error fetching teachers:", error);
      message.error("Không thể tải danh sách giáo viên!");
    } finally {
      setLoadingTeachers(false);
    }
  };

  const steps = [
    {
      title: "Thông tin cơ bản",
      icon: <BookOutlined />,
    },
    {
      title: "Nội dung khóa học",
      icon: <PlusOutlined />,
    },
    {
      title: "Xác nhận",
      icon: <SettingOutlined />,
    },
  ];

  const levelOptions = [
    { value: 0, label: "Beginner", color: "green" },
    { value: 1, label: "Intermediate", color: "blue" },
    { value: 2, label: "Advanced", color: "red" },
  ];

  const addChapter = () => {
    const newChapter = {
      id: `chapter-${Date.now()}`,
      name: "",
      description: "",
      number: chapters.length + 1,
    };
    setChapters([...chapters, newChapter]);
  };

  const removeChapter = (id) => {
    const updatedChapters = chapters
      .filter((chapter) => chapter.id !== id)
      .map((chapter, index) => ({
        ...chapter,
        number: index + 1,
      }));
    setChapters(updatedChapters);
  };

  const updateChapter = (id, field, value) => {
    setChapters(
      chapters.map((chapter) =>
        chapter.id === id ? { ...chapter, [field]: value } : chapter
      )
    );
  };

  const validateStep = async () => {
    try {
      console.log("cc", form.getFieldsValue());
      if (currentStep === 0) {
        await form.validateFields([
          "name",
          "description",
          "level",
          "duration",
          "teacherAccountId",
        ]);
      } else if (currentStep === 1) {
        if (chapters.length === 0) {
          message.error("Vui lòng thêm ít nhất một chương học!");
          return false;
        }

        for (const chapter of chapters) {
          if (!chapter.name || chapter.name.trim() === "") {
            message.error(`Vui lòng nhập tên cho chương ${chapter.number}!`);
            return false;
          }
        }
      } else if (currentStep === 2) {
        if (!imageFile) {
          message.error("Vui lòng upload hình ảnh khóa học!");
          return false;
        }
      }
      return true;
    } catch {
      message.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return false;
    }
  };

  const nextStep = async () => {
    const isValid = await validateStep();
    if (isValid) {
      // Save current form values before moving to next step
      if (currentStep === 0) {
        const values = form.getFieldsValue();
        setFormData(values);
        console.log("💾 Saved form values:", values);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const onFinish = async () => {
    setLoading(true);
    try {
      // Use saved form values from state
      const formValues = formData;

      console.log("📋 Form values:", formValues);

      // Validate required fields
      if (
        !formValues.name ||
        formValues.level === undefined ||
        formValues.level === null ||
        !formValues.duration ||
        !formValues.teacherAccountId
      ) {
        message.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
        setLoading(false);
        return;
      }

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("Name", formValues.name);
      formDataToSend.append("Description", formValues.description || "");
      formDataToSend.append(
        "Level",
        formValues.level !== undefined ? formValues.level : 0
      );
      formDataToSend.append("Duration", formValues.duration);
      formDataToSend.append("TeacherAccountId", formValues.teacherAccountId);

      // Add image file
      if (imageFile) {
        formDataToSend.append("Image", imageFile);
      }

      // Add chapters
      chapters.forEach((chapter, index) => {
        formDataToSend.append(`Chapters[${index}].Name`, chapter.name);
        formDataToSend.append(`Chapters[${index}].Number`, chapter.number);
        if (chapter.description) {
          formDataToSend.append(
            `Chapters[${index}].Description`,
            chapter.description
          );
        }
      });

      console.log("🔄 Creating course with FormData");
      // Log FormData entries
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      const response = await courseApi.createCourse(formDataToSend);

      console.log("✅ Course created:", response.data);

      message.success("Khóa học đã được tạo thành công!");
      navigate("/admin/courses");
    } catch (error) {
      console.error("❌ Error creating course:", error);
      message.error(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi tạo khóa học. Vui lòng thử lại!"
      );
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    name: "image",
    listType: "picture",
    showUploadList: false,
    beforeUpload: (file) => {
      const isJpgOrPng =
        file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        message.error("Chỉ chấp nhận file JPG/PNG!");
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("Kích thước ảnh phải nhỏ hơn 2MB!");
        return false;
      }

      setImageFile(file);
      message.success("Upload hình ảnh thành công!");
      return false;
    },
  };

  const renderBasicInfo = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <Card className="shadow-lg border-0">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Thông tin Khóa Học
          </h2>
          <p className="text-gray-600">
            Nhập thông tin cơ bản về khóa học của bạn
          </p>
        </div>

        <Form form={form} layout="vertical">
          <Row gutter={[24, 16]}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Tên khóa học"
                rules={[
                  { required: true, message: "Vui lòng nhập tên khóa học!" },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Ví dụ: Tiếng Anh Giao Tiếp Cơ Bản"
                  className="rounded-lg"
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="description" label="Mô tả khóa học">
                <TextArea
                  rows={4}
                  placeholder="Mô tả về nội dung, mục tiêu và lợi ích của khóa học..."
                  className="rounded-lg"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="level"
                label="Trình độ"
                rules={[{ required: true, message: "Vui lòng chọn trình độ!" }]}
              >
                <Select
                  size="large"
                  className="rounded-lg"
                  placeholder="Chọn trình độ"
                >
                  {levelOptions.map((level) => (
                    <Option key={level.value} value={level.value}>
                      <Tag color={level.color} className="capitalize">
                        {level.label}
                      </Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="duration"
                label="Thời lượng khóa học"
                rules={[
                  { required: true, message: "Vui lòng nhập thời lượng!" },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Ví dụ: 30 giờ"
                  className="rounded-lg"
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="teacherAccountId"
                label="Giáo viên phụ trách"
                rules={[
                  { required: true, message: "Vui lòng chọn giáo viên!" },
                ]}
              >
                <Select
                  size="large"
                  placeholder="Chọn giáo viên"
                  className="rounded-lg"
                  loading={loadingTeachers}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={teachers.map((teacher) => ({
                    value: teacher.id,
                    label: `${teacher.firstName} ${teacher.lastName} (${teacher.email})`,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Hình ảnh khóa học">
                <Upload {...uploadProps} className="w-full">
                  <Button
                    icon={<UploadOutlined />}
                    size="large"
                    className="w-full rounded-lg h-32 border-dashed"
                  >
                    {imageFile
                      ? `Đã chọn: ${imageFile.name}`
                      : "Click để upload hình ảnh"}
                  </Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </motion.div>
  );

  const renderContent = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <Card className="shadow-lg border-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Chương học</h3>
            <p className="text-gray-600">
              Thêm các chương vào khóa học (không bắt buộc)
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={addChapter}
            className="rounded-lg"
          >
            Thêm chương
          </Button>
        </div>

        <div className="space-y-6">
          {chapters.map((chapter) => (
            <Card
              key={chapter.id}
              className="border-2 border-dashed border-gray-200 hover:border-primary-300 transition-colors"
              title={
                <div className="flex items-center justify-between">
                  <span>
                    Chương {chapter.number}: {chapter.name || "Chưa có tên"}
                  </span>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeChapter(chapter.id)}
                  />
                </div>
              }
            >
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Input
                    placeholder="Tên chương *"
                    value={chapter.name}
                    onChange={(e) =>
                      updateChapter(chapter.id, "name", e.target.value)
                    }
                    className="rounded-lg"
                    size="large"
                  />
                </Col>
                <Col span={24}>
                  <TextArea
                    placeholder="Mô tả chương"
                    value={chapter.description}
                    onChange={(e) =>
                      updateChapter(chapter.id, "description", e.target.value)
                    }
                    className="rounded-lg"
                    rows={2}
                  />
                </Col>
              </Row>
            </Card>
          ))}

          {chapters.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <BookOutlined className="text-4xl text-gray-400 mb-4" />
              <p className="text-gray-500">Chưa có chương học nào</p>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={addChapter}
                className="mt-4"
              >
                Thêm chương đầu tiên
              </Button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );

  const renderConfirmation = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <Card className="shadow-lg border-0">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Xác Nhận Thông Tin
          </h2>
          <p className="text-gray-600">
            Kiểm tra lại thông tin trước khi tạo khóa học
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900">
                Thông tin cơ bản
              </h3>
              {formData.name && (
                <div>
                  <strong>Tên khóa học:</strong> {formData.name}
                </div>
              )}
              {formData.description && (
                <div>
                  <strong>Mô tả:</strong> {formData.description}
                </div>
              )}
              {formData.level !== undefined && (
                <div>
                  <strong>Trình độ:</strong>
                  <Tag
                    color={
                      levelOptions.find((l) => l.value === formData.level)
                        ?.color
                    }
                    className="ml-2 capitalize"
                  >
                    {
                      levelOptions.find((l) => l.value === formData.level)
                        ?.label
                    }
                  </Tag>
                </div>
              )}
              {formData.duration && (
                <div>
                  <strong>Thời lượng:</strong> {formData.duration}
                </div>
              )}
              {formData.teacherAccountId && (
                <div>
                  <strong>Giáo viên:</strong>{" "}
                  {
                    teachers.find((t) => t.id === formData.teacherAccountId)
                      ?.firstName
                  }{" "}
                  {
                    teachers.find((t) => t.id === formData.teacherAccountId)
                      ?.lastName
                  }
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900">Hình ảnh</h3>
              {imageFile && (
                <div>
                  <strong>Hình ảnh:</strong> {imageFile.name}
                </div>
              )}
            </div>
          </div>

          <Divider />

          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-4">
              Nội dung khóa học
            </h3>
            {chapters.length > 0 ? (
              <div className="space-y-4">
                {chapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h4 className="font-semibold text-primary-600 mb-2">
                      Chương {chapter.number}: {chapter.name}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {chapter.description}
                    </p>
                  </div>
                ))}
                <div className="text-center text-sm text-gray-500">
                  Tổng cộng: {chapters.length} chương
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Chưa có chương học nào</p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const stepContent = [
    renderBasicInfo(),
    renderContent(),
    renderConfirmation(),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/admin/courses")}
                className="mb-4 rounded-lg"
              >
                Quay lại
              </Button>
              <h1 className="text-4xl font-bold text-gray-900">
                Tạo Khóa Học Mới
              </h1>
              <p className="text-gray-600 mt-2">
                Thiết kế và xuất bản khóa học mới của bạn
              </p>
            </div>
          </div>

          {/* Steps */}
          <Card className="shadow-xl border-0 mb-8">
            <Steps current={currentStep} className="custom-steps">
              {steps.map((step, index) => (
                <Step key={index} title={step.title} icon={step.icon} />
              ))}
            </Steps>
          </Card>

          <div className="space-y-6">
            {stepContent[currentStep]}

            <div className="flex justify-between pt-6">
              <Button
                size="large"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="rounded-lg"
              >
                Quay lại
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  type="primary"
                  size="large"
                  onClick={nextStep}
                  className="rounded-lg"
                >
                  Tiếp theo
                </Button>
              ) : (
                <Button
                  type="primary"
                  size="large"
                  onClick={onFinish}
                  loading={loading}
                  icon={<SaveOutlined />}
                  className="rounded-lg bg-gradient-to-r from-primary-600 to-primary-800 border-0"
                >
                  Tạo Khóa Học
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AddCourse;
