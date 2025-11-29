import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Card,
  Tabs,
  Form,
  Input,
  Select,
  Button,
  Upload,
  Switch,
  message,
  Modal,
  Space,
  Tag,
  Spin,
  InputNumber,
} from "antd";
import {
  ArrowLeft,
  Save,
  Upload as UploadIcon,
  Plus,
  Edit,
  Eye,
  Trash2,
} from "lucide-react";
import { courseApi } from "../../services/courseApi";
import { userApi } from "../../services/userApi";
import PaginatedTable from "../../components/PaginatedTable";

const { TextArea } = Input;
const { Option } = Select;

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // States
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [courseData, setCourseData] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [chapters, setChapters] = useState([]);

  // Chapter states
  const [chapterModalVisible, setChapterModalVisible] = useState(false);
  const [chapterDetailModalVisible, setChapterDetailModalVisible] =
    useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [isEditChapter, setIsEditChapter] = useState(false);
  const [chaptersTableKey, setChaptersTableKey] = useState(0);

  // Lesson states
  const [selectedChapterForLessons, setSelectedChapterForLessons] =
    useState(null);
  const [lessonModalVisible, setLessonModalVisible] = useState(false);
  const [lessonDetailModalVisible, setLessonDetailModalVisible] =
    useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isEditLesson, setIsEditLesson] = useState(false);
  const [lessonsTableKey, setLessonsTableKey] = useState(0);
  const [lessonVideoFile, setLessonVideoFile] = useState(null);
  const [lessonDocuments, setLessonDocuments] = useState([]);
  const [lessonLoading, setLessonLoading] = useState(false);

  // Forms
  const [overviewForm] = Form.useForm();
  const [chapterForm] = Form.useForm();
  const [lessonForm] = Form.useForm();

  const levelOptions = [
    { value: 0, label: "Beginner", color: "green" },
    { value: 1, label: "Intermediate", color: "blue" },
    { value: 2, label: "Advanced", color: "red" },
  ];

  useEffect(() => {
    if (id) {
      fetchCourseData();
      fetchTeachers();
      fetchChaptersForSelect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const response = await courseApi.getCourse(id);
      const data = response?.data?.data;

      if (data) {
        setCourseData(data);
        setImagePreview(data.imageUrl);

        // Populate form
        overviewForm.setFieldsValue({
          name: data.name,
          description: data.description,
          level: data.level,
          duration: data.duration,
          teacherAccountId: data.teacherAccountId,
          isActive: data.isActive,
        });
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      message.error("Không thể tải thông tin khóa học");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await userApi.getAllUsers({
        page: 1,
        size: 1000,
        role: "Teacher",
      });
      setTeachers(response.data.data?.items || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const fetchChaptersForSelect = async () => {
    try {
      const response = await courseApi.getChapters({
        page: 1,
        size: 10000,
        courseId: id,
        sortBy: "number",
        isAsc: true,
      });
      setChapters(response.data.data?.items || []);
    } catch (error) {
      console.error("Error fetching chapters:", error);
    }
  };

  // Fetcher for chapters table
  const fetchChaptersPage = useCallback(
    async ({ page, size }) => {
      try {
        const response = await courseApi.getChapters({
          page,
          size,
          courseId: id,
          sortBy: "number",
          isAsc: true,
        });
        const data = response?.data?.data ?? {};
        return {
          items: data.items ?? [],
          total: data.total ?? 0,
          page: data.page ?? page,
          size: data.size ?? size,
        };
      } catch (error) {
        console.error("Error fetching chapters:", error);
        return { items: [], total: 0, page, size };
      }
    },
    [id]
  );

  // Fetcher for lessons table
  const fetchLessonsPage = useCallback(
    async ({ page, size }) => {
      if (!selectedChapterForLessons?.id) {
        return { items: [], total: 0, page: 1, size: 10 };
      }

      try {
        const response = await courseApi.getLessons({
          page,
          size,
          chapterId: selectedChapterForLessons.id,
        });
        const data = response?.data?.data ?? {};
        return {
          items: data.items ?? [],
          total: data.total ?? 0,
          page: data.page ?? page,
          size: data.size ?? size,
        };
      } catch (error) {
        console.error("Error fetching lessons:", error);
        return { items: [], total: 0, page, size };
      }
    },
    [selectedChapterForLessons?.id]
  );

  // Handle overview update
  const handleUpdateOverview = async (values) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description || "");
      formData.append("level", values.level);
      formData.append("duration", values.duration);
      formData.append("teacherAccountId", values.teacherAccountId);
      formData.append("isActive", values.isActive);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await courseApi.updateCourse(id, formData);
      message.success("Cập nhật khóa học thành công!");
      fetchCourseData();
    } catch (error) {
      console.error("Error updating course:", error);
      message.error("Cập nhật khóa học thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ chấp nhận file ảnh!");
      return false;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Kích thước ảnh phải nhỏ hơn 2MB!");
      return false;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);

    return false;
  };

  // Chapter handlers
  const handleAddChapter = () => {
    setIsEditChapter(false);
    setSelectedChapter(null);
    chapterForm.resetFields();
    setChapterModalVisible(true);
  };

  const handleViewChapter = async (chapter) => {
    try {
      const response = await courseApi.getChapterById(chapter.id);
      const data = response?.data?.data;

      if (data) {
        setSelectedChapter(data);
        setIsEditChapter(true);
        chapterForm.setFieldsValue({
          name: data.name,
          description: data.description,
          number: data.number,
        });
        setChapterDetailModalVisible(true);
      }
    } catch (error) {
      console.error("Error fetching chapter:", error);
      message.error("Không thể tải thông tin chương");
    }
  };

  const handleSaveChapter = async (values) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description || "");
      formData.append("number", values.number);

      if (isEditChapter && selectedChapter) {
        await courseApi.updateChapter(selectedChapter.id, formData);
        message.success("Cập nhật chương thành công!");
        setChapterDetailModalVisible(false);
      } else {
        await courseApi.addMoreChapter(id, formData);
        message.success("Thêm chương thành công!");
        setChapterModalVisible(false);
      }

      chapterForm.resetFields();
      setChaptersTableKey((prev) => prev + 1);
      fetchChaptersForSelect(); // Refresh chapters for select dropdown
    } catch (error) {
      console.error("Error saving chapter:", error);
      message.error(
        isEditChapter ? "Cập nhật chương thất bại!" : "Thêm chương thất bại!"
      );
    }
  };

  const handleDeleteChapter = (chapter) => {
    Modal.confirm({
      title: "Xác nhận xóa chương",
      content: `Bạn có chắc chắn muốn xóa chương "${chapter.name}"?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await courseApi.deleteChapter(chapter.id);
          message.success("Xóa chương thành công!");
          setChaptersTableKey((prev) => prev + 1);
          fetchChaptersForSelect(); // Refresh chapters for select dropdown
        } catch (error) {
          console.error("Error deleting chapter:", error);
          message.error("Xóa chương thất bại!");
        }
      },
    });
  };

  // Lesson handlers
  const handleAddLesson = () => {
    if (!selectedChapterForLessons) {
      message.warning("Vui lòng chọn chương trước!");
      return;
    }

    setIsEditLesson(false);
    setSelectedLesson(null);
    lessonForm.resetFields();
    setLessonVideoFile(null);
    setLessonDocuments([]);
    setLessonModalVisible(true);
  };

  const handleViewLesson = async (lesson) => {
    try {
      const response = await courseApi.getLesson(lesson.id);
      const data = response?.data?.data;

      if (data) {
        setSelectedLesson(data);
        setIsEditLesson(true);
        lessonForm.setFieldsValue({
          name: data.name,
          content: data.content,
          duration: data.duration,
        });
        // Reset new documents state when viewing lesson
        setLessonDocuments([]);
        setLessonDetailModalVisible(true);
      }
    } catch (error) {
      console.error("Error fetching lesson:", error);
      message.error("Không thể tải thông tin bài học");
    }
  };

  const handleSaveLesson = async (values) => {
    try {
      setLessonLoading(true);
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("content", values.content || "");
      formData.append("duration", values.duration || "");

      // Add video file if exists
      if (lessonVideoFile) {
        formData.append("video", lessonVideoFile);
      }

      // Add document files if exists (for both create and update)
      if (lessonDocuments && lessonDocuments.length > 0) {
        lessonDocuments.forEach((doc, index) => {
          formData.append(`document[${index}].document`, doc.file);
          formData.append(`document[${index}].name`, doc.name);
        });
      }

      if (isEditLesson && selectedLesson) {
        await courseApi.updateLesson(selectedLesson.id, formData);
        message.success("Cập nhật bài học thành công!");

        // Add new documents separately if editing
        if (lessonDocuments && lessonDocuments.length > 0) {
          for (const doc of lessonDocuments) {
            const docFormData = new FormData();
            docFormData.append("name", doc.name);
            docFormData.append("document", doc.file);
            await courseApi.addLessonDocument(selectedLesson.id, docFormData);
          }
        }

        setLessonDetailModalVisible(false);
      } else {
        await courseApi.addMoreLesson(selectedChapterForLessons.id, formData);
        message.success("Thêm bài học thành công!");
        setLessonModalVisible(false);
      }

      lessonForm.resetFields();
      setLessonVideoFile(null);
      setLessonDocuments([]);
      setLessonsTableKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error saving lesson:", error);
      message.error(
        isEditLesson ? "Cập nhật bài học thất bại!" : "Thêm bài học thất bại!"
      );
    } finally {
      setLessonLoading(false);
    }
  };

  // Handle video upload
  const handleVideoUpload = (file) => {
    const isVideo = file.type.startsWith("video/");
    if (!isVideo) {
      message.error("Chỉ chấp nhận file video!");
      return false;
    }

    const isLt500M = file.size / 1024 / 1024 < 500;
    if (!isLt500M) {
      message.error("Kích thước video không được vượt quá 500MB!");
      return false;
    }

    setLessonVideoFile(file);
    message.success(`${file.name} đã được chọn`);
    return false;
  };

  // Handle document upload
  const handleDocumentUpload = (file) => {
    const isLt100M = file.size / 1024 / 1024 < 100;
    if (!isLt100M) {
      message.error("Kích thước tài liệu không được vượt quá 100MB!");
      return false;
    }

    const newDoc = {
      uid: Date.now().toString(),
      name: file.name,
      file: file,
    };

    setLessonDocuments((prev) => [...prev, newDoc]);
    message.success(`${file.name} đã được thêm`);
    return false;
  };

  // Remove document (for new documents being uploaded)
  const handleRemoveDocument = (uid) => {
    setLessonDocuments((prev) => prev.filter((doc) => doc.uid !== uid));
  };

  // Delete existing lesson document
  const handleDeleteLessonDocument = (doc) => {
    Modal.confirm({
      title: "Xác nhận xóa tài liệu",
      content: `Bạn có chắc chắn muốn xóa tài liệu "${doc.name}"?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await courseApi.deleteLessonDocument(doc.id);
          message.success("Xóa tài liệu thành công!");
          // Reload lesson details to refresh document list
          if (selectedLesson) {
            const response = await courseApi.getLesson(selectedLesson.id);
            const data = response?.data?.data;
            if (data) {
              setSelectedLesson(data);
            }
          }
        } catch (error) {
          console.error("Error deleting document:", error);
          message.error("Xóa tài liệu thất bại!");
        }
      },
    });
  };

  const handleDeleteLesson = (lesson) => {
    Modal.confirm({
      title: "Xác nhận xóa bài học",
      content: `Bạn có chắc chắn muốn xóa bài học "${lesson.name}"?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await courseApi.deleteLesson(lesson.id);
          message.success("Xóa bài học thành công!");
          setLessonsTableKey((prev) => prev + 1);
        } catch (error) {
          console.error("Error deleting lesson:", error);
          message.error("Xóa bài học thất bại!");
        }
      },
    });
  };

  // Columns
  const chapterColumns = [
    {
      title: "Số thứ tự",
      dataIndex: "number",
      key: "number",
      width: 100,
      render: (num) => <Tag color="blue">Chương {num}</Tag>,
    },
    {
      title: "Tên chương",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <div className="font-semibold">{text}</div>
          {record.description && (
            <div className="text-sm text-gray-500">{record.description}</div>
          )}
        </div>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 150,
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<Eye size={14} />}
            onClick={() => handleViewChapter(record)}
          >
            Chi tiết
          </Button>
          <Button
            type="text"
            size="small"
            danger
            icon={<Trash2 size={14} />}
            onClick={() => handleDeleteChapter(record)}
          />
        </Space>
      ),
    },
  ];

  const lessonColumns = [
    {
      title: "Tên bài học",
      dataIndex: "name",
      key: "name",
      render: (text) => <div className="font-semibold">{text}</div>,
    },
    {
      title: "Thời lượng",
      dataIndex: "duration",
      key: "duration",
      width: 150,
      render: (duration) => duration || "Chưa cập nhật",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 150,
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<Eye size={14} />}
            onClick={() => handleViewLesson(record)}
          >
            Chi tiết
          </Button>
          <Button
            type="text"
            size="small"
            danger
            icon={<Trash2 size={14} />}
            onClick={() => handleDeleteLesson(record)}
          />
        </Space>
      ),
    },
  ];

  if (loading && !courseData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            icon={<ArrowLeft size={16} />}
            onClick={() => navigate("/admin/courses")}
            className="mb-4"
          >
            Quay lại
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Chỉnh Sửa Khóa Học
            </h1>
            <p className="text-gray-600">{courseData?.name || "Đang tải..."}</p>
          </div>

          <Card>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: "overview",
                  label: "Thông tin chung",
                  children: (
                    <Form
                      form={overviewForm}
                      layout="vertical"
                      onFinish={handleUpdateOverview}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <Form.Item
                            name="name"
                            label="Tên khóa học"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng nhập tên khóa học!",
                              },
                            ]}
                          >
                            <Input size="large" placeholder="Tên khóa học" />
                          </Form.Item>
                        </div>

                        <div className="md:col-span-2">
                          <Form.Item name="description" label="Mô tả">
                            <TextArea rows={4} placeholder="Mô tả khóa học" />
                          </Form.Item>
                        </div>

                        <Form.Item
                          name="level"
                          label="Trình độ"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn trình độ!",
                            },
                          ]}
                        >
                          <Select size="large" placeholder="Chọn trình độ">
                            {levelOptions.map((level) => (
                              <Option key={level.value} value={level.value}>
                                <Tag color={level.color}>{level.label}</Tag>
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>

                        <Form.Item
                          name="duration"
                          label="Thời lượng"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập thời lượng!",
                            },
                          ]}
                        >
                          <Input size="large" placeholder="VD: 30 giờ" />
                        </Form.Item>

                        <Form.Item
                          name="teacherAccountId"
                          label="Giáo viên"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn giáo viên!",
                            },
                          ]}
                        >
                          <Select
                            size="large"
                            placeholder="Chọn giáo viên"
                            showSearch
                            filterOption={(input, option) =>
                              (option?.label ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                            options={teachers.map((teacher) => ({
                              value: teacher.id,
                              label: `${teacher.firstName} ${teacher.lastName}`,
                            }))}
                          />
                        </Form.Item>

                        <Form.Item
                          name="isActive"
                          label="Trạng thái"
                          valuePropName="checked"
                        >
                          <Switch
                            checkedChildren="Hoạt động"
                            unCheckedChildren="Ngừng"
                          />
                        </Form.Item>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hình ảnh khóa học
                          </label>
                          <Upload
                            listType="picture-card"
                            showUploadList={false}
                            beforeUpload={handleImageUpload}
                          >
                            {imagePreview ? (
                              <img
                                src={imagePreview}
                                alt="course"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div>
                                <UploadIcon
                                  size={32}
                                  className="mx-auto mb-2"
                                />
                                <div>Upload</div>
                              </div>
                            )}
                          </Upload>
                        </div>
                      </div>

                      <div className="flex justify-end mt-6">
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<Save size={16} />}
                          size="large"
                          loading={loading}
                        >
                          Lưu thay đổi
                        </Button>
                      </div>
                    </Form>
                  ),
                },
                {
                  key: "chapters",
                  label: "Danh sách chương",
                  children: (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                          Quản lý chương học
                        </h3>
                        <Button
                          type="primary"
                          icon={<Plus size={16} />}
                          onClick={handleAddChapter}
                        >
                          Thêm chương
                        </Button>
                      </div>

                      <PaginatedTable
                        key={chaptersTableKey}
                        columns={chapterColumns}
                        fetchData={fetchChaptersPage}
                        rowKey="id"
                        initialPage={1}
                        initialSize={10}
                      />
                    </div>
                  ),
                },
                {
                  key: "lessons",
                  label: "Bài học",
                  children: (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                          <h3 className="text-lg font-semibold">
                            Quản lý bài học
                          </h3>
                          <Select
                            placeholder="Chọn chương"
                            style={{ width: 300 }}
                            onChange={(value, option) => {
                              setSelectedChapterForLessons({
                                id: value,
                                name: option.label,
                              });
                              setLessonsTableKey((prev) => prev + 1);
                            }}
                            showSearch
                            optionFilterProp="label"
                            options={chapters.map((chapter) => ({
                              value: chapter.id,
                              label: `Chương ${chapter.number}: ${chapter.name}`,
                            }))}
                          />
                        </div>
                        <Button
                          type="primary"
                          icon={<Plus size={16} />}
                          onClick={handleAddLesson}
                          disabled={!selectedChapterForLessons}
                        >
                          Thêm bài học
                        </Button>
                      </div>

                      {selectedChapterForLessons ? (
                        <PaginatedTable
                          key={lessonsTableKey}
                          columns={lessonColumns}
                          fetchData={fetchLessonsPage}
                          rowKey="id"
                          initialPage={1}
                          initialSize={10}
                        />
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <p>Vui lòng chọn chương để xem danh sách bài học</p>
                        </div>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </motion.div>
      </div>

      {/* Add Chapter Modal */}
      <Modal
        title="Thêm Chương Mới"
        open={chapterModalVisible}
        onCancel={() => {
          setChapterModalVisible(false);
          chapterForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={chapterForm}
          layout="vertical"
          onFinish={handleSaveChapter}
          className="mt-4"
        >
          <Form.Item
            name="number"
            label="Số thứ tự"
            rules={[{ required: true, message: "Vui lòng nhập số thứ tự!" }]}
          >
            <InputNumber min={1} className="w-full" placeholder="1, 2, 3..." />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên chương"
            rules={[{ required: true, message: "Vui lòng nhập tên chương!" }]}
          >
            <Input placeholder="Nhập tên chương" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={3} placeholder="Mô tả chương học" />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setChapterModalVisible(false);
                chapterForm.resetFields();
              }}
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Thêm chương
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Chapter Detail Modal */}
      <Modal
        title="Chi Tiết Chương"
        open={chapterDetailModalVisible}
        onCancel={() => {
          setChapterDetailModalVisible(false);
          chapterForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={chapterForm}
          layout="vertical"
          onFinish={handleSaveChapter}
          className="mt-4"
        >
          <Form.Item
            name="number"
            label="Số thứ tự"
            rules={[{ required: true, message: "Vui lòng nhập số thứ tự!" }]}
          >
            <InputNumber min={1} className="w-full" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên chương"
            rules={[{ required: true, message: "Vui lòng nhập tên chương!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={4} />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setChapterDetailModalVisible(false);
                chapterForm.resetFields();
              }}
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Add Lesson Modal */}
      <Modal
        title="Thêm Bài Học Mới"
        open={lessonModalVisible}
        onCancel={() => {
          setLessonModalVisible(false);
          lessonForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={lessonForm}
          layout="vertical"
          onFinish={handleSaveLesson}
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="Tên bài học"
            rules={[{ required: true, message: "Vui lòng nhập tên bài học!" }]}
          >
            <Input placeholder="Nhập tên bài học" />
          </Form.Item>

          <Form.Item name="duration" label="Thời lượng">
            <Input placeholder="VD: 45 phút" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung"
            rules={[
              { required: true, message: "Vui lòng nhập nội dung bài học!" },
            ]}
          >
            <TextArea rows={4} placeholder="Nội dung bài học" />
          </Form.Item>

          <Form.Item label="Video bài học">
            <Upload
              beforeUpload={handleVideoUpload}
              maxCount={1}
              onRemove={() => setLessonVideoFile(null)}
              fileList={
                lessonVideoFile
                  ? [
                      {
                        uid: "-1",
                        name: lessonVideoFile.name,
                        status: "done",
                      },
                    ]
                  : []
              }
            >
              <Button icon={<UploadIcon size={16} />}>
                Chọn video (Tối đa 500MB)
              </Button>
            </Upload>
            <div className="text-xs text-gray-500 mt-1">
              Kích thước video không được vượt quá 500MB
            </div>
          </Form.Item>

          <Form.Item label="Tài liệu đính kèm">
            <Upload
              beforeUpload={handleDocumentUpload}
              fileList={lessonDocuments.map((doc) => ({
                uid: doc.uid,
                name: doc.name,
                status: "done",
              }))}
              onRemove={(file) => handleRemoveDocument(file.uid)}
              multiple
            >
              <Button icon={<UploadIcon size={16} />}>
                Thêm tài liệu (Tối đa 100MB/file)
              </Button>
            </Upload>
            <div className="text-xs text-gray-500 mt-1">
              Kích thước tài liệu không được vượt quá 100MB
            </div>
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setLessonModalVisible(false);
                lessonForm.resetFields();
                setLessonVideoFile(null);
                setLessonDocuments([]);
              }}
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={lessonLoading}>
              Thêm bài học
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Lesson Detail Modal */}
      <Modal
        title="Chi Tiết Bài Học"
        open={lessonDetailModalVisible}
        onCancel={() => {
          setLessonDetailModalVisible(false);
          lessonForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={lessonForm}
          layout="vertical"
          onFinish={handleSaveLesson}
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="Tên bài học"
            rules={[{ required: true, message: "Vui lòng nhập tên bài học!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="duration" label="Thời lượng">
            <Input placeholder="VD: 45 phút" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung"
            rules={[
              { required: true, message: "Vui lòng nhập nội dung bài học!" },
            ]}
          >
            <TextArea rows={6} />
          </Form.Item>

          {selectedLesson?.videoUrl && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video hiện tại
              </label>
              <a
                href={selectedLesson.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {selectedLesson.videoUrl}
              </a>
            </div>
          )}

          {selectedLesson?.lessonDocuments &&
            selectedLesson.lessonDocuments.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tài liệu hiện tại
                </label>
                <div className="space-y-2">
                  {selectedLesson.lessonDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <a
                        href={doc.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex-1 truncate"
                      >
                        {doc.name}
                      </a>
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<Trash2 size={14} />}
                        onClick={() => handleDeleteLessonDocument(doc)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          <Form.Item label="Cập nhật video">
            <Upload
              beforeUpload={handleVideoUpload}
              maxCount={1}
              onRemove={() => setLessonVideoFile(null)}
              fileList={
                lessonVideoFile
                  ? [
                      {
                        uid: "-1",
                        name: lessonVideoFile.name,
                        status: "done",
                      },
                    ]
                  : []
              }
            >
              <Button icon={<UploadIcon size={16} />}>
                Chọn video mới (Tối đa 500MB)
              </Button>
            </Upload>
            <div className="text-xs text-gray-500 mt-1">
              Kích thước video không được vượt quá 500MB
            </div>
          </Form.Item>

          <Form.Item label="Thêm tài liệu">
            <Upload
              beforeUpload={handleDocumentUpload}
              fileList={lessonDocuments.map((doc) => ({
                uid: doc.uid,
                name: doc.name,
                status: "done",
              }))}
              onRemove={(file) => handleRemoveDocument(file.uid)}
              multiple
            >
              <Button icon={<UploadIcon size={16} />}>
                Thêm tài liệu (Tối đa 100MB/file)
              </Button>
            </Upload>
            <div className="text-xs text-gray-500 mt-1">
              Kích thước tài liệu không được vượt quá 100MB
            </div>
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setLessonDetailModalVisible(false);
                lessonForm.resetFields();
                setLessonVideoFile(null);
                setLessonDocuments([]);
              }}
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={lessonLoading}>
              Cập nhật
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default EditCourse;
