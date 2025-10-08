import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, Button, Radio, Input, Space, Progress, Modal, message, Typography, Alert, Spin } from 'antd';
import { Clock, ArrowLeft, ArrowRight, Flag, Send } from 'lucide-react';
import { examApi, examService } from '../services/examApi';
import { useAuth } from '../context/AuthContext';
import { Statistic } from 'antd';

// Import React Quill
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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

  // React Quill modules configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link'
  ];

  useEffect(() => {
    fetchExamData();
  }, [id]);

  const fetchExamData = async () => {
    if (!id) {
      console.error('❌ No exam ID provided');
      message.error('Không tìm thấy bài thi');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      
      const examData = await examService.getExamWithDetails(id);
      
      if (!examData) {
        console.error('❌ Exam data is null/undefined');
        throw new Error('Không nhận được dữ liệu bài thi');
      }
      
      
      if (!examData.questions || examData.questions.length === 0) {
        throw new Error('Bài thi không có câu hỏi');
      }
      
      examData.questions.forEach((question, index) => {
        console.log(`--- Câu hỏi ${index + 1} ---`);
        console.log('ID:', question.id);
        console.log('Type:', question.type);
        console.log('Question:', question.question);
        console.log('Options:', question.options);
        console.log('Correct Answer:', question.correctAnswer);
        console.log('Points:', question.points);
        console.log('Order:', question.order);
      });
      
      setExam(examData);
      setTimeLeft(examData.duration * 60);
      
      const initialAnswers = {};
      examData.questions.forEach((q, index) => {
        if (q.type === 'multiple_choice') {
          initialAnswers[index] = null;
        } else {
          initialAnswers[index] = '';
        }
      });
      setAnswers(initialAnswers);
      
      console.log('🎯 Initial answers created:', initialAnswers);
    } catch (error) {
      console.error('❌ Error in fetchExamData:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      message.error(`Không thể tải bài thi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!exam || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowConfirm(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [exam, timeLeft]);

  const handleAnswerChange = useCallback((value) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: value
    }));
  }, [currentQuestion]);

  const handleEssayChange = useCallback((value) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: value
    }));
  }, [currentQuestion]);

  const nextQuestion = () => {
    if (currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      let score = 0;
      exam.questions.forEach((question, index) => {
        if (question.type === 'multiple_choice' && answers[index] === question.correctAnswer) {
          score += question.points;
        }
      });

      const resultData = {
        examId: id,
        userId: user.id,
        classId: exam.classId || '1',
        score: score,
        totalPoints: exam.totalPoints,
        timeSpent: exam.duration * 60 - timeLeft,
        answers: answers,
        submittedAt: new Date().toISOString(),
        status: 'completed'
      };

      console.log(' Submitting exam result:', resultData);
      await examApi.submitExam(resultData);
      message.success('Nộp bài thành công!');
      navigate('/student/classes');
    } catch (error) {
      console.error(' Error submitting exam:', error);
      message.error('Nộp bài thất bại!');
    } finally {
      setSubmitting(false);
    }
  };

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <Spin size="large" />
            <p className="mt-4 text-gray-600">Đang tải bài thi {id}...</p>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không thể tải bài thi</h1>
          <p className="text-gray-600 mb-2">ID: {id}</p>
          <p className="text-gray-500 mb-4">Có thể bài thi không tồn tại hoặc không có câu hỏi</p>
          <Button type="primary" onClick={() => navigate('/student/classes')}>
            Quay lại lớp học
          </Button>
        </div>
      </div>
    );
  }

  const currentQ = exam.questions[currentQuestion];

  if (!currentQ) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="text-6xl mb-4">❓</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Câu hỏi không tồn tại</h1>
          <Button type="primary" onClick={() => setCurrentQuestion(0)}>
            Quay về câu đầu tiên
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={id}
        >
          <Card className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  icon={<ArrowLeft size={16} />}
                  onClick={() => navigate(-1)}
                >
                  Quay lại
                </Button>
                <div>
                  <Title level={3} className="mb-0">{exam.title}</Title>
                  <Text type="secondary">{exam.description}</Text>
                  <div className="text-sm text-gray-500 mt-1">
                    ID: {id} | {exam.questions.length} câu hỏi | Loại: {exam.type}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Thời gian còn lại</div>
                    <div className="text-2xl font-bold text-red-600">
                      {formatTime(timeLeft)}
                    </div>
                  </div>
                  <Progress
                    type="circle"
                    percent={Math.round(((currentQuestion + 1) / exam.questions.length) * 100)}
                    width={60}
                    format={() => `${currentQuestion + 1}/${exam.questions.length}`}
                  />
                </div>
              </div>
            </div>
          </Card>

          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <Card title="Danh sách câu hỏi">
                <div className="grid grid-cols-5 gap-2">
                  {exam.questions.map((question, index) => (
                    <Button
                      key={index}
                      type={currentQuestion === index ? 'primary' : 
                            answers[index] !== null && answers[index] !== '' ? 'default' : 'dashed'}
                      onClick={() => setCurrentQuestion(index)}
                      className="h-10"
                      title={`Câu ${index + 1}: ${question.type === 'multiple_choice' ? 'Trắc nghiệm' : 'Tự luận'}`}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <div className="text-sm text-blue-700 space-y-1">
                    <div>• Đã trả lời: <strong>{Object.values(answers).filter(a => a !== null && a !== '').length}</strong></div>
                    <div>• Chưa trả lời: <strong>{exam.questions.length - Object.values(answers).filter(a => a !== null && a !== '').length}</strong></div>
                    <div>• Trắc nghiệm: <strong>{exam.questions.filter(q => q.type === 'multiple_choice').length}</strong></div>
                    <div>• Tự luận: <strong>{exam.questions.filter(q => q.type === 'essay').length}</strong></div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-3">
              <Card
                title={`Câu ${currentQuestion + 1} (${currentQ.points} điểm) - ${currentQ.type === 'multiple_choice' ? 'Trắc nghiệm' : 'Tự luận'}`}
                extra={
                  <Space>
                    <Button 
                      icon={<Flag size={16} />}
                      type={answers[currentQuestion] !== null && answers[currentQuestion] !== '' ? 'primary' : 'default'}
                    >
                      {answers[currentQuestion] !== null && answers[currentQuestion] !== '' ? 'Đã trả lời' : 'Chưa trả lời'}
                    </Button>
                  </Space>
                }
              >
                <div className="mb-6">
                  <Text strong className="text-lg">{currentQ.question}</Text>
                  {currentQ.type === 'multiple_choice' && (
                    <div className="mt-2 text-sm text-gray-500">
                      Chọn một đáp án đúng
                    </div>
                  )}
                  {currentQ.type === 'essay' && (
                    <div className="mt-2 text-sm text-gray-500">
                      Viết bài luận của bạn bên dưới
                    </div>
                  )}
                </div>

                {currentQ.type === 'multiple_choice' && (
                  <Radio.Group 
                    value={answers[currentQuestion]} 
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="w-full"
                  >
                    <Space direction="vertical" className="w-full">
                      {currentQ.options && currentQ.options.map((option, optIndex) => (
                        <Radio 
                          key={optIndex} 
                          value={optIndex} 
                          className="p-3 border rounded hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-base">{option}</span>
                        </Radio>
                      ))}
                    </Space>
                  </Radio.Group>
                )}

                {currentQ.type === 'essay' && (
                  <div className="border rounded">
                    <ReactQuill
                      value={answers[currentQuestion] || ''}
                      onChange={handleEssayChange}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Nhập bài luận của bạn..."
                      style={{ height: '300px', marginBottom: '50px' }}
                    />
                  </div>
                )}

                <div className="flex justify-between mt-8">
                  <Button 
                    icon={<ArrowLeft size={16} />}
                    onClick={prevQuestion}
                    disabled={currentQuestion === 0}
                    size="large"
                  >
                    Câu trước
                  </Button>
                  
                  {currentQuestion === exam.questions.length - 1 ? (
                    <Button 
                      type="primary" 
                      icon={<Send size={16} />}
                      onClick={() => setShowConfirm(true)}
                      size="large"
                    >
                      Nộp bài
                    </Button>
                  ) : (
                    <Button 
                      type="primary" 
                      icon={<ArrowRight size={16} />}
                      onClick={nextQuestion}
                      size="large"
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
          </Button>
        ]}
      >
        <Alert
          message="Bạn có chắc chắn muốn nộp bài?"
          description="Sau khi nộp bài, bạn sẽ không thể thay đổi câu trả lời."
          type="warning"
          showIcon
        />
        <div className="mt-4">
          <Text strong>Thống kê bài làm:</Text>
          <div className="mt-2 space-y-2">
            <div>• Số câu đã trả lời: <strong>{Object.values(answers).filter(a => a !== null && a !== '').length}/{exam.questions.length}</strong></div>
            <div>• Thời gian làm bài: <strong>{Math.floor((exam.duration * 60 - timeLeft) / 60)} phút {((exam.duration * 60 - timeLeft) % 60)} giây</strong></div>
            <div>• Bài thi: <strong>{exam.title}</strong></div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExamTaking;