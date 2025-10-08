import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  Tag
} from 'antd';
import { 
  UploadOutlined, 
  PlusOutlined, 
  DeleteOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  BookOutlined,
  DollarOutlined,
  UserOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { courseApi } from '../../services/courseApi';

const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;

const AddCourse = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [chapters, setChapters] = useState([]);

  const steps = [
    {
      title: 'Thông tin cơ bản',
      icon: <BookOutlined />
    },
    {
      title: 'Nội dung khóa học',
      icon: <PlusOutlined />
    },
    {
      title: 'Giá và cài đặt',
      icon: <DollarOutlined />
    },
    {
      title: 'Xác nhận',
      icon: <SettingOutlined />
    }
  ];

  const levelOptions = [
    { value: 'beginner', label: 'Beginner', color: 'green' },
    { value: 'intermediate', label: 'Intermediate', color: 'blue' },
    { value: 'advanced', label: 'Advanced', color: 'red' }
  ];

  const categoryOptions = [
    { value: 'communication', label: 'Giao tiếp' },
    { value: 'exam', label: 'Luyện thi' },
    { value: 'business', label: 'Business' },
    { value: 'academic', label: 'Học thuật' }
  ];

  const addChapter = () => {
    const newChapter = {
      id: `chapter-${Date.now()}`,
      title: '',
      description: '',
      order: chapters.length + 1,
      lessons: []
    };
    setChapters([...chapters, newChapter]);
  };

  const removeChapter = (id) => {
    const updatedChapters = chapters
      .filter(chapter => chapter.id !== id)
      .map((chapter, index) => ({
        ...chapter,
        order: index + 1
      }));
    setChapters(updatedChapters);
  };

  const updateChapter = (id, field, value) => {
    setChapters(chapters.map(chapter => 
      chapter.id === id ? { ...chapter, [field]: value } : chapter
    ));
  };

  const addLesson = (chapterId) => {
    const chapter = chapters.find(ch => ch.id === chapterId);
    const newLesson = {
      id: `lesson-${Date.now()}`,
      title: '',
      duration: '',
      type: 'video',
      content: '',
      videoUrl: '',
      order: chapter.lessons.length + 1,
      isFree: false
    };
    
    setChapters(chapters.map(chapter => 
      chapter.id === chapterId 
        ? { ...chapter, lessons: [...chapter.lessons, newLesson] }
        : chapter
    ));
  };

  const removeLesson = (chapterId, lessonId) => {
    setChapters(chapters.map(chapter => 
      chapter.id === chapterId 
        ? { 
            ...chapter, 
            lessons: chapter.lessons
              .filter(lesson => lesson.id !== lessonId)
              .map((lesson, index) => ({
                ...lesson,
                order: index + 1
              }))
          }
        : chapter
    ));
  };

  const updateLesson = (chapterId, lessonId, field, value) => {
    setChapters(chapters.map(chapter => 
      chapter.id === chapterId 
        ? { 
            ...chapter, 
            lessons: chapter.lessons.map(lesson => 
              lesson.id === lessonId ? { ...lesson, [field]: value } : lesson
            )
          }
        : chapter
    ));
  };

  const validateStep = async () => {
    try {
      if (currentStep === 0) {
        await form.validateFields([
          'title', 'description', 'longDescription', 'level', 
          'category', 'duration', 'teacherId', 'price'
        ]);
      } else if (currentStep === 1) {
        if (chapters.length === 0) {
          message.error('Vui lòng thêm ít nhất một chương học!');
          return false;
        }
        
        for (const chapter of chapters) {
          if (!chapter.title || chapter.title.trim() === '') {
            message.error(`Vui lòng nhập tiêu đề cho chương ${chapter.order}!`);
            return false;
          }
          if (chapter.lessons.length === 0) {
            message.error(`Vui lòng thêm ít nhất một bài học cho chương "${chapter.title}"!`);
            return false;
          }
          for (const lesson of chapter.lessons) {
            if (!lesson.title || lesson.title.trim() === '') {
              message.error(`Vui lòng nhập tiêu đề cho bài học trong chương "${chapter.title}"!`);
              return false;
            }
            if (!lesson.duration || lesson.duration.trim() === '') {
              message.error(`Vui lòng nhập thời lượng cho bài học "${lesson.title}"!`);
              return false;
            }
          }
        }
      } else if (currentStep === 2) {
        if (!imageUrl) {
          message.error('Vui lòng upload hình ảnh khóa học!');
          return false;
        }
      }
      return true;
    } catch (error) {
      message.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return false;
    }
  };

  const nextStep = async () => {
    const isValid = await validateStep();
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const onFinish = async () => {
    setLoading(true);
    try {
      const formValues = await form.validateFields();
      
      const courseData = {
        title: formValues.title,
        description: formValues.description,
        longDescription: formValues.longDescription,
        level: formValues.level,
        category: formValues.category,
        duration: formValues.duration,
        price: formValues.price,
        originalPrice: formValues.originalPrice || formValues.price,
        image: imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
        teacherId: formValues.teacherId,
        students: 0,
        rating: 0,
        totalLessons: chapters.reduce((total, chapter) => total + chapter.lessons.length, 0),
        isActive: formValues.isActive !== undefined ? formValues.isActive : true,
        createdAt: new Date().toISOString()
      };
      
      console.log('🔄 Creating course with data:', courseData);
      
      const courseResponse = await courseApi.createCourse(courseData);
      const createdCourse = courseResponse.data;
      
      console.log('✅ Course created:', createdCourse);
      
      for (const chapter of chapters) {
        const chapterData = {
          courseId: createdCourse.id,
          title: chapter.title,
          description: chapter.description,
          order: chapter.order
        };
        
        console.log('🔄 Creating chapter:', chapterData);
        const chapterResponse = await courseApi.createChapter(chapterData);
        const createdChapter = chapterResponse.data;
        
        console.log('✅ Chapter created:', createdChapter);
        
        for (const lesson of chapter.lessons) {
          const lessonData = {
            chapterId: createdChapter.id,
            title: lesson.title,
            content: lesson.content || `Nội dung bài học: ${lesson.title}`,
            videoUrl: lesson.videoUrl || '',
            duration: lesson.duration,
            order: lesson.order,
            isFree: lesson.isFree,
            type: lesson.type
          };
          
          console.log('🔄 Creating lesson:', lessonData);
          await courseApi.createLesson(lessonData);
          console.log('✅ Lesson created:', lesson.title);
        }
      }
      
      message.success('Khóa học đã được tạo thành công!');
      navigate('/admin/courses');
    } catch (error) {
      console.error('❌ Error creating course:', error);
      message.error('Có lỗi xảy ra khi tạo khóa học. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    name: 'image',
    listType: 'picture',
    showUploadList: false,
    beforeUpload: (file) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('Chỉ chấp nhận file JPG/PNG!');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Kích thước ảnh phải nhỏ hơn 2MB!');
        return false;
      }
      
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      message.success('Upload hình ảnh thành công!');
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thông tin Khóa Học</h2>
          <p className="text-gray-600">Nhập thông tin cơ bản về khóa học của bạn</p>
        </div>

        <Form form={form} layout="vertical">
          <Row gutter={[24, 16]}>
            <Col span={24}>
              <Form.Item
                name="title"
                label="Tên khóa học"
                rules={[{ required: true, message: 'Vui lòng nhập tên khóa học!' }]}
              >
                <Input 
                  size="large" 
                  placeholder="Ví dụ: Tiếng Anh Giao Tiếp Cơ Bản" 
                  className="rounded-lg"
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="description"
                label="Mô tả ngắn"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
              >
                <TextArea 
                  rows={3} 
                  placeholder="Mô tả ngắn gọn về khóa học..."
                  className="rounded-lg"
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="longDescription"
                label="Mô tả chi tiết"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả chi tiết!' }]}
              >
                <TextArea 
                  rows={6} 
                  placeholder="Mô tả chi tiết về nội dung, mục tiêu và lợi ích của khóa học..."
                  className="rounded-lg"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="level"
                label="Trình độ"
                rules={[{ required: true, message: 'Vui lòng chọn trình độ!' }]}
              >
                <Select size="large" className="rounded-lg" placeholder="Chọn trình độ">
                  {levelOptions.map(level => (
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
                name="category"
                label="Danh mục"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
              >
                <Select size="large" className="rounded-lg" placeholder="Chọn danh mục">
                  {categoryOptions.map(category => (
                    <Option key={category.value} value={category.value}>
                      {category.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="duration"
                label="Thời lượng khóa học"
                rules={[{ required: true, message: 'Vui lòng nhập thời lượng!' }]}
              >
                <Input 
                  size="large" 
                  placeholder="Ví dụ: 30 giờ" 
                  className="rounded-lg"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="teacherId"
                label="Giáo viên phụ trách"
                rules={[{ required: true, message: 'Vui lòng chọn giáo viên!' }]}
              >
                <Select size="large" className="rounded-lg" suffixIcon={<UserOutlined />} placeholder="Chọn giáo viên">
                  <Option value={1}>Nguyễn Văn A</Option>
                  <Option value={2}>Trần Thị B</Option>
                  <Option value={3}>John Smith</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="price"
                label="Giá bán (VNĐ)"
                rules={[{ required: true, message: 'Vui lòng nhập giá bán!' }]}
              >
                <InputNumber
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  size="large"
                  className="w-full rounded-lg"
                  placeholder="799000"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="originalPrice"
                label="Giá gốc (VNĐ)"
              >
                <InputNumber
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  size="large"
                  className="w-full rounded-lg"
                  placeholder="1200000"
                />
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
            <h3 className="text-xl font-bold text-gray-900">Nội dung Khóa Học</h3>
            <p className="text-gray-600">Thêm các chương và bài học vào khóa học</p>
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
          {chapters.map((chapter, chapterIndex) => (
            <Card 
              key={chapter.id} 
              className="border-2 border-dashed border-gray-200 hover:border-primary-300 transition-colors"
              title={
                <div className="flex items-center justify-between">
                  <span>Chương {chapter.order}: {chapter.title || 'Chưa có tiêu đề'}</span>
                  <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />}
                    onClick={() => removeChapter(chapter.id)}
                  />
                </div>
              }
              extra={
                <Button 
                  type="dashed" 
                  icon={<PlusOutlined />}
                  onClick={() => addLesson(chapter.id)}
                >
                  Thêm bài học
                </Button>
              }
            >
              <Row gutter={[16, 16]} className="mb-4">
                <Col span={24}>
                  <Input
                    placeholder="Tiêu đề chương"
                    value={chapter.title}
                    onChange={(e) => updateChapter(chapter.id, 'title', e.target.value)}
                    className="rounded-lg mb-2"
                  />
                </Col>
                <Col span={24}>
                  <Input
                    placeholder="Mô tả chương"
                    value={chapter.description}
                    onChange={(e) => updateChapter(chapter.id, 'description', e.target.value)}
                    className="rounded-lg"
                  />
                </Col>
              </Row>

              <div className="space-y-3">
                {chapter.lessons.map((lesson, lessonIndex) => (
                  <Card 
                    key={lesson.id}
                    size="small"
                    className="border border-gray-100"
                    title={`Bài ${lesson.order}: ${lesson.title || 'Chưa có tiêu đề'}`}
                    extra={
                      <Button 
                        type="text" 
                        danger 
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => removeLesson(chapter.id, lesson.id)}
                      />
                    }
                  >
                    <Row gutter={[12, 12]}>
                      <Col span={24}>
                        <Input
                          placeholder="Tiêu đề bài học *"
                          value={lesson.title}
                          onChange={(e) => updateLesson(chapter.id, lesson.id, 'title', e.target.value)}
                          size="small"
                        />
                      </Col>
                      <Col span={8}>
                        <Input
                          placeholder="Thời lượng *"
                          value={lesson.duration}
                          onChange={(e) => updateLesson(chapter.id, lesson.id, 'duration', e.target.value)}
                          size="small"
                        />
                      </Col>
                      <Col span={8}>
                        <Select
                          value={lesson.type}
                          onChange={(value) => updateLesson(chapter.id, lesson.id, 'type', value)}
                          size="small"
                          className="w-full"
                          placeholder="Loại bài học"
                        >
                          <Option value="video">Video</Option>
                          <Option value="quiz">Quiz</Option>
                          <Option value="reading">Bài đọc</Option>
                          <Option value="practice">Thực hành</Option>
                        </Select>
                      </Col>
                      <Col span={8}>
                        <Select
                          value={lesson.isFree}
                          onChange={(value) => updateLesson(chapter.id, lesson.id, 'isFree', value)}
                          size="small"
                          className="w-full"
                          placeholder="Trạng thái"
                        >
                          <Option value={true}>Miễn phí</Option>
                          <Option value={false}>Trả phí</Option>
                        </Select>
                      </Col>
                      <Col span={24}>
                        <Input
                          placeholder="URL video hoặc tài liệu"
                          value={lesson.videoUrl}
                          onChange={(e) => updateLesson(chapter.id, lesson.id, 'videoUrl', e.target.value)}
                          size="small"
                        />
                      </Col>
                      <Col span={24}>
                        <Input.TextArea
                          placeholder="Nội dung bài học"
                          value={lesson.content}
                          onChange={(e) => updateLesson(chapter.id, lesson.id, 'content', e.target.value)}
                          rows={2}
                          size="small"
                        />
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>

              {chapter.lessons.length === 0 && (
                <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500">Chưa có bài học nào trong chương này</p>
                </div>
              )}
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

  const renderPricing = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <Card className="shadow-lg border-0">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hình Ảnh Khóa Học</h2>
          <p className="text-gray-600">Upload hình ảnh đại diện cho khóa học</p>
        </div>

        <Form form={form} layout="vertical">
          <Row gutter={[24, 16]}>
            <Col span={24}>
              <Form.Item
                label="Hình ảnh khóa học"
                rules={[{ required: true, message: 'Vui lòng upload hình ảnh!' }]}
              >
                <Upload
                  {...uploadProps}
                  className="w-full"
                >
                  <Button 
                    icon={<UploadOutlined />} 
                    size="large"
                    className="w-full rounded-lg h-32 border-dashed"
                  >
                    Click để upload hình ảnh
                  </Button>
                </Upload>
                {imageUrl && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <img src={imageUrl} alt="Course preview" className="w-64 h-36 object-cover rounded-lg shadow-md" />
                  </div>
                )}
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="isActive"
                label="Trạng thái"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch 
                  checkedChildren="Hiển thị" 
                  unCheckedChildren="Ẩn" 
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Xác Nhận Thông Tin</h2>
          <p className="text-gray-600">Kiểm tra lại thông tin trước khi tạo khóa học</p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900">Thông tin cơ bản</h3>
              {form.getFieldValue('title') && (
                <div>
                  <strong>Tên khóa học:</strong> {form.getFieldValue('title')}
                </div>
              )}
              {form.getFieldValue('description') && (
                <div>
                  <strong>Mô tả:</strong> {form.getFieldValue('description')}
                </div>
              )}
              {form.getFieldValue('level') && (
                <div>
                  <strong>Trình độ:</strong> 
                  <Tag color={levelOptions.find(l => l.value === form.getFieldValue('level'))?.color} className="ml-2 capitalize">
                    {levelOptions.find(l => l.value === form.getFieldValue('level'))?.label}
                  </Tag>
                </div>
              )}
              {form.getFieldValue('duration') && (
                <div>
                  <strong>Thời lượng:</strong> {form.getFieldValue('duration')}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900">Giá và hình ảnh</h3>
              {form.getFieldValue('price') && (
                <div>
                  <strong>Giá bán:</strong> {new Intl.NumberFormat('vi-VN').format(form.getFieldValue('price'))} VNĐ
                </div>
              )}
              {form.getFieldValue('originalPrice') && (
                <div>
                  <strong>Giá gốc:</strong> {new Intl.NumberFormat('vi-VN').format(form.getFieldValue('originalPrice'))} VNĐ
                </div>
              )}
              {imageUrl && (
                <div>
                  <strong>Hình ảnh:</strong>
                  <img src={imageUrl} alt="Preview" className="w-32 h-20 object-cover rounded mt-2" />
                </div>
              )}
            </div>
          </div>

          <Divider />

          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-4">Nội dung khóa học</h3>
            {chapters.length > 0 ? (
              <div className="space-y-4">
                {chapters.map((chapter, chapterIndex) => (
                  <div key={chapter.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-primary-600 mb-2">
                      Chương {chapter.order}: {chapter.title}
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">{chapter.description}</p>
                    <div className="space-y-2">
                      {chapter.lessons.map((lesson, lessonIndex) => (
                        <div key={lesson.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium">Bài {lesson.order}: {lesson.title}</span>
                            <span className="text-sm text-gray-500 ml-2">({lesson.duration})</span>
                          </div>
                          <div className="flex gap-2">
                            <Tag color="blue">{lesson.type}</Tag>
                            <Tag color={lesson.isFree ? "green" : "orange"}>
                              {lesson.isFree ? "Miễn phí" : "Trả phí"}
                            </Tag>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="text-center text-sm text-gray-500">
                  Tổng cộng: {chapters.reduce((total, chapter) => total + chapter.lessons.length, 0)} bài học
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
    renderPricing(),
    renderConfirmation()
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
                onClick={() => navigate('/admin/courses')}
                className="mb-4 rounded-lg"
              >
                Quay lại
              </Button>
              <h1 className="text-4xl font-bold text-gray-900">Tạo Khóa Học Mới</h1>
              <p className="text-gray-600 mt-2">Thiết kế và xuất bản khóa học mới của bạn</p>
            </div>
          </div>

          {/* Steps */}
          <Card className="shadow-xl border-0 mb-8">
            <Steps current={currentStep} className="custom-steps">
              {steps.map((step, index) => (
                <Step 
                  key={index} 
                  title={step.title} 
                  icon={step.icon}
                />
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