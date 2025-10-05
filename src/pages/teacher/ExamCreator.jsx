import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, Form, Input, Select, InputNumber, Button, List, Space, message, Divider, Tag } from 'antd';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { examApi } from '../../services/examApi';
import { useAuth } from '../../context/AuthContext';

const { Option } = Select;
const { TextArea } = Input;

const ExamCreator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);

  const addQuestion = (type = 'multiple_choice') => {
    const newQuestion = {
      id: Date.now(),
      type,
      question: '',
      options: type === 'multiple_choice' ? ['', '', '', ''] : [],
      correctAnswer: 0,
      points: 1,
      order: questions.length + 1
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const updateOption = (questionId, optionIndex, value) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSubmit = async (values) => {
    if (questions.length === 0) {
      message.error('Vui lòng thêm ít nhất một câu hỏi!');
      return;
    }

    try {
      setSaving(true);
      
      // Tạo bài thi
      const examData = {
        ...values,
        totalQuestions: questions.length,
        totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
        createdBy: user.id,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const examResponse = await examApi.createExam(examData);
      const examId = examResponse.data.id;

      // Tạo các câu hỏi
      await Promise.all(
        questions.map((question, index) => 
          examApi.createQuestion({
            examId,
            type: question.type,
            question: question.question,
            options: question.type === 'multiple_choice' ? question.options : undefined,
            correctAnswer: question.correctAnswer,
            points: question.points,
            order: index + 1
          })
        )
      );

      message.success('Tạo bài thi thành công!');
      navigate('/teacher/exams');
    } catch (error) {
      console.error('Error creating exam:', error);
      message.error('Tạo bài thi thất bại!');
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
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button 
                icon={<ArrowLeft size={16} />}
                onClick={() => navigate('/teacher/exams')}
              >
                Quay lại
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tạo Bài Thi Mới</h1>
                <p className="text-gray-600">Thiết kế bài thi với các câu hỏi trắc nghiệm và tự luận</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Exam Info */}
            <div className="lg:col-span-1">
              <Card title="Thông tin bài thi">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                >
                  <Form.Item
                    name="title"
                    label="Tên bài thi"
                    rules={[{ required: true, message: 'Vui lòng nhập tên bài thi!' }]}
                  >
                    <Input placeholder="Bài kiểm tra giữa kỳ" />
                  </Form.Item>

                  <Form.Item
                    name="description"
                    label="Mô tả"
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                  >
                    <TextArea rows={3} placeholder="Mô tả về bài thi..." />
                  </Form.Item>

                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                      name="type"
                      label="Loại bài thi"
                      rules={[{ required: true, message: 'Vui lòng chọn loại bài thi!' }]}
                    >
                      <Select>
                        <Option value="multiple_choice">Trắc nghiệm</Option>
                        <Option value="essay">Tự luận</Option>
                        <Option value="mixed">Hỗn hợp</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="duration"
                      label="Thời gian (phút)"
                      rules={[{ required: true, message: 'Vui lòng nhập thời gian!' }]}
                    >
                      <InputNumber min={1} className="w-full" />
                    </Form.Item>
                  </div>

                  <Form.Item
                    name="passingScore"
                    label="Điểm đạt (%)"
                    rules={[{ required: true, message: 'Vui lòng nhập điểm đạt!' }]}
                  >
                    <InputNumber min={1} max={100} className="w-full" />
                  </Form.Item>

                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={saving}
                      icon={<Save size={16} />}
                      className="w-full"
                    >
                      Lưu Bài Thi
                    </Button>
                  </Form.Item>
                </Form>
              </Card>

              {/* Quick Stats */}
              <Card className="mt-6" title="Thống kê">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Tổng câu hỏi:</span>
                    <span className="font-semibold">{questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tổng điểm:</span>
                    <span className="font-semibold">
                      {questions.reduce((sum, q) => sum + q.points, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Loại câu hỏi:</span>
                    <div>
                      {questions.filter(q => q.type === 'multiple_choice').length > 0 && (
                        <Tag color="blue" className="mr-1">Trắc nghiệm</Tag>
                      )}
                      {questions.filter(q => q.type === 'essay').length > 0 && (
                        <Tag color="green">Tự luận</Tag>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Questions */}
            <div className="lg:col-span-2">
              <Card 
                title="Câu hỏi"
                extra={
                  <Space>
                    <Button 
                      icon={<Plus size={16} />}
                      onClick={() => addQuestion('multiple_choice')}
                    >
                      Thêm trắc nghiệm
                    </Button>
                    <Button 
                      icon={<Plus size={16} />}
                      onClick={() => addQuestion('essay')}
                    >
                      Thêm tự luận
                    </Button>
                  </Space>
                }
              >
                {questions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">📝</div>
                    <p className="text-lg mb-2">Chưa có câu hỏi nào</p>
                    <p>Thêm câu hỏi trắc nghiệm hoặc tự luận để bắt đầu</p>
                  </div>
                ) : (
                  <List
                    dataSource={questions}
                    renderItem={(question, index) => (
                      <List.Item>
                        <Card 
                          className="w-full"
                          title={
                            <div className="flex items-center justify-between">
                              <span>Câu {index + 1} - {question.type === 'multiple_choice' ? 'Trắc nghiệm' : 'Tự luận'}</span>
                              <Space>
                                <InputNumber 
                                  size="small" 
                                  min={1} 
                                  value={question.points}
                                  onChange={(value) => updateQuestion(question.id, 'points', value)}
                                  placeholder="Điểm"
                                />
                                <Button 
                                  size="small" 
                                  danger 
                                  icon={<Trash2 size={14} />}
                                  onClick={() => removeQuestion(question.id)}
                                />
                              </Space>
                            </div>
                          }
                        >
                          {/* Question Text */}
                          <div className="mb-4">
                            <Input.TextArea
                              placeholder="Nhập câu hỏi..."
                              value={question.question}
                              onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                              rows={2}
                            />
                          </div>

                          {/* Options for multiple choice */}
                          {question.type === 'multiple_choice' && (
                            <div className="space-y-2">
                              {question.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    checked={question.correctAnswer === optIndex}
                                    onChange={() => updateQuestion(question.id, 'correctAnswer', optIndex)}
                                  />
                                  <Input
                                    placeholder={`Lựa chọn ${optIndex + 1}`}
                                    value={option}
                                    onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Essay question */}
                          {question.type === 'essay' && (
                            <div className="bg-gray-50 p-4 rounded">
                              <p className="text-sm text-gray-600">
                                Câu hỏi tự luận - học sinh sẽ viết bài luận để trả lời
                              </p>
                            </div>
                          )}
                        </Card>
                      </List.Item>
                    )}
                  />
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