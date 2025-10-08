import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, Form, Input, Select, InputNumber, Button, List, Space, message, Spin } from 'antd';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { examApi, examService } from '../../services/examApi';
import { useAuth } from '../../context/AuthContext';

const { Option } = Select;
const { TextArea } = Input;

const ExamEditor = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchExamData();
  }, [id]);

  const fetchExamData = async () => {
    try {
      setLoading(true);
      const examData = await examService.getExamWithDetails(id);
      setExam(examData);
      setQuestions(examData.questions);
      
      form.setFieldsValue({
        title: examData.title,
        description: examData.description,
        type: examData.type,
        duration: examData.duration,
        passingScore: examData.passingScore
      });
    } catch (error) {
      console.error('Error fetching exam:', error);
      message.error('Không thể tải thông tin bài thi');
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (values) => {
    if (questions.length === 0) {
      message.error('Vui lòng thêm ít nhất một câu hỏi!');
      return;
    }

    try {
      setSaving(true);
      
      const examData = {
        ...values,
        totalQuestions: questions.length,
        totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
        updatedAt: new Date().toISOString()
      };

      await examApi.updateExam(id, examData);

      const currentQuestions = await examApi.getExamQuestions(id);
      await Promise.all(
        currentQuestions.data.map(q => examApi.deleteQuestion(q.id))
      );

      await Promise.all(
        questions.map((question, index) => 
          examApi.createQuestion({
            examId: id,
            type: question.type,
            question: question.question,
            options: question.type === 'multiple_choice' ? question.options : undefined,
            correctAnswer: question.correctAnswer,
            points: question.points,
            order: index + 1
          })
        )
      );

      message.success('Cập nhật bài thi thành công!');
      navigate('/teacher/exams');
    } catch (error) {
      console.error('Error updating exam:', error);
      message.error('Cập nhật bài thi thất bại!');
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bài thi không tồn tại</h1>
          <Button type="primary" onClick={() => navigate('/teacher/exams')}>
            Quay lại danh sách
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
        >
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button 
                icon={<ArrowLeft size={16} />}
                onClick={() => navigate('/teacher/exams')}
              >
                Quay lại
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa Bài Thi</h1>
                <p className="text-gray-600">Cập nhật thông tin và câu hỏi bài thi</p>
              </div>
            </div>
          </div>

          
        </motion.div>
      </div>
    </div>
  );
};

export default ExamEditor;