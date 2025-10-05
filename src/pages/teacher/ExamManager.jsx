import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, Table, Button, Modal, Form, Input, Select, Tag, List, message, Tabs, InputNumber, DatePicker, Space } from 'antd';
import { Plus, Edit, Trash2, Eye, Users, Clock, FileText, Send } from 'lucide-react';
import { examApi } from '../../services/examApi';
import { forumApi } from '../../services/forumApi';
import { useAuth } from '../../context/AuthContext';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const ExamManager = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('exams');
  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();

  useEffect(() => {
    if (user?.id) {
      fetchExams();
      fetchClasses();
    }
  }, [user]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await examApi.getAllExams(user.id);
      setExams(response.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
      message.error('Không thể tải danh sách bài thi');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await forumApi.getClasses(user.id);
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      message.error('Không thể tải danh sách lớp học');
    }
  };

  const handleCreateExam = async (values) => {
    try {
      const examData = {
        ...values,
        createdBy: user.id,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await examApi.createExam(examData);
      message.success('Tạo bài thi thành công!');
      setModalVisible(false);
      form.resetFields();
      fetchExams();
    } catch (error) {
      console.error('Error creating exam:', error);
      message.error('Tạo bài thi thất bại!');
    }
  };

  const handleAssignExam = async (values) => {
    try {
      const { classId, examId, dueDate } = values;
      
      await examApi.assignExamToClass(classId, examId, user.id, dueDate);
      message.success('Giao bài thi thành công!');
      setAssignModalVisible(false);
      assignForm.resetFields();
    } catch (error) {
      console.error('Error assigning exam:', error);
      message.error('Giao bài thi thất bại!');
    }
  };

  const getExamTypeColor = (type) => {
    const colors = {
      multiple_choice: 'blue',
      essay: 'green',
      mixed: 'orange'
    };
    return colors[type] || 'default';
  };

  const getExamTypeText = (type) => {
    const texts = {
      multiple_choice: 'Trắc nghiệm',
      essay: 'Tự luận',
      mixed: 'Hỗn hợp'
    };
    return texts[type] || type;
  };

  const columns = [
    {
      title: 'Tên bài thi',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div className="font-semibold">{text}</div>
          <div className="text-sm text-gray-500">{record.description}</div>
        </div>
      )
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={getExamTypeColor(type)}>
          {getExamTypeText(type)}
        </Tag>
      )
    },
    {
      title: 'Thời gian',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => `${duration} phút`
    },
    {
      title: 'Điểm tối đa',
      dataIndex: 'totalPoints',
      key: 'totalPoints',
      render: (points) => `${points} điểm`
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Link to={`/teacher/exams/${record.id}/edit`}>
            <Button size="small" icon={<Edit size={14} />}>
              Sửa
            </Button>
          </Link>
          <Button 
            size="small" 
            icon={<Send size={14} />}
            onClick={() => {
              setSelectedExam(record);
              setAssignModalVisible(true);
            }}
          >
            Giao bài
          </Button>
          <Button 
            size="small" 
            danger 
            icon={<Trash2 size={14} />}
          >
            Xóa
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản Lý Bài Thi</h1>
              <p className="text-gray-600">Tạo và quản lý các bài thi, giao bài cho lớp học</p>
            </div>
            <Button 
              type="primary" 
              icon={<Plus size={16} />}
              onClick={() => setModalVisible(true)}
            >
              Tạo Bài Thi
            </Button>
          </div>

          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="Danh sách bài thi" key="exams">
                <Table
                  columns={columns}
                  dataSource={exams}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                />
              </TabPane>
              
              <TabPane tab="Bài thi đã giao" key="assigned">
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>Chức năng đang được phát triển</p>
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </motion.div>
      </div>

      {/* Create Exam Modal */}
      <Modal
        title="Tạo Bài Thi Mới"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateExam}
          className="mt-6"
        >
          <Form.Item
            name="title"
            label="Tên bài thi"
            rules={[{ required: true, message: 'Vui lòng nhập tên bài thi!' }]}
          >
            <Input placeholder="VD: Bài kiểm tra giữa kỳ - Tiếng Anh Giao Tiếp" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả bài thi"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="Mô tả về bài thi, nội dung kiểm tra..."
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="type"
              label="Loại bài thi"
              rules={[{ required: true, message: 'Vui lòng chọn loại bài thi!' }]}
            >
              <Select placeholder="Chọn loại bài thi">
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
              <InputNumber 
                min={1} 
                max={300} 
                className="w-full"
                placeholder="60"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="totalQuestions"
              label="Số câu hỏi"
              rules={[{ required: true, message: 'Vui lòng nhập số câu hỏi!' }]}
            >
              <InputNumber 
                min={1} 
                max={100} 
                className="w-full"
                placeholder="20"
              />
            </Form.Item>

            <Form.Item
              name="totalPoints"
              label="Tổng điểm"
              rules={[{ required: true, message: 'Vui lòng nhập tổng điểm!' }]}
            >
              <InputNumber 
                min={1} 
                max={1000} 
                className="w-full"
                placeholder="100"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="passingScore"
            label="Điểm đạt"
            rules={[{ required: true, message: 'Vui lòng nhập điểm đạt!' }]}
          >
            <InputNumber 
              min={1} 
              max={100} 
              className="w-full"
              placeholder="70"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex justify-end space-x-4">
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Tạo Bài Thi
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

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
            rules={[{ required: true, message: 'Vui lòng chọn lớp học!' }]}
          >
            <Select placeholder="Chọn lớp học">
              {classes.map(classItem => (
                <Option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="examId"
            label="Chọn bài thi"
            rules={[{ required: true, message: 'Vui lòng chọn bài thi!' }]}
          >
            <Select placeholder="Chọn bài thi">
              {exams.map(exam => (
                <Option key={exam.id} value={exam.id}>
                  {exam.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="Hạn nộp bài"
            rules={[{ required: true, message: 'Vui lòng chọn hạn nộp bài!' }]}
          >
            <DatePicker 
              showTime 
              format="YYYY-MM-DD HH:mm:ss"
              className="w-full"
              placeholder="Chọn hạn nộp bài"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex justify-end space-x-4">
              <Button onClick={() => {
                setAssignModalVisible(false);
                assignForm.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Giao Bài Thi
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExamManager;