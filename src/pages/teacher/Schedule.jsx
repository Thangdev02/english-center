import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Calendar, List, Tag, Button, Modal, Form, Input, Select, TimePicker, message } from 'antd';
import { Plus, Clock, Users, MapPin, Video, Building } from 'lucide-react';
import dayjs from 'dayjs';
import { useAuth } from '../../context/AuthContext';

const { Option } = Select;
const { TextArea } = Input;

const TeacherSchedule = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    // Mock data - in real app, this would come from API
    const mockClasses = [
      {
        id: 1,
        title: 'Lớp Giao Tiếp - Buổi 15',
        date: dayjs().add(1, 'day').toISOString(),
        startTime: '14:00',
        endTime: '15:30',
        type: 'online',
        students: 20,
        description: 'Ôn tập chương 5: Giao tiếp trong công việc'
      },
      {
        id: 2,
        title: 'Lớp IELTS Writing',
        date: dayjs().add(2, 'day').toISOString(),
        startTime: '09:00',
        endTime: '11:00',
        type: 'offline',
        students: 15,
        location: 'Phòng 301 - Tòa nhà A',
        description: 'Luyện viết Task 2 - Opinion Essay'
      }
    ];
    setClasses(mockClasses);
  }, []);

  const getClassesForDate = (date) => {
    return classes.filter(classItem => 
      dayjs(classItem.date).isSame(date, 'day')
    );
  };

  const dateCellRender = (value) => {
    const dateClasses = getClassesForDate(value);
    return (
      <div className="min-h-[80px]">
        {dateClasses.map(classItem => (
          <div
            key={classItem.id}
            className={`mb-1 p-1 text-xs rounded cursor-pointer ${
              classItem.type === 'online' 
                ? 'bg-blue-100 border border-blue-200' 
                : 'bg-green-100 border border-green-200'
            }`}
            onClick={() => handleClassClick(classItem)}
          >
            <div className="font-medium truncate">{classItem.title}</div>
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {classItem.startTime} - {classItem.endTime}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleClassClick = (classItem) => {
    Modal.info({
      title: classItem.title,
      content: (
        <div className="space-y-2">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-gray-600" />
            <span>{classItem.startTime} - {classItem.endTime}</span>
          </div>
          <div className="flex items-center">
            {classItem.type === 'online' ? (
              <Video className="w-4 h-4 mr-2 text-blue-600" />
            ) : (
              <Building className="w-4 h-4 mr-2 text-green-600" />
            )}
            <span>{classItem.type === 'online' ? 'Online' : classItem.location}</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 text-gray-600" />
            <span>{classItem.students} học viên</span>
          </div>
          {classItem.description && (
            <div>
              <p className="text-gray-700">{classItem.description}</p>
            </div>
          )}
        </div>
      ),
      okText: 'Đóng'
    });
  };

  const handleAddClass = async (values) => {
    try {
      const newClass = {
        id: Date.now(),
        title: values.title,
        date: values.date.toISOString(),
        startTime: values.timeRange[0].format('HH:mm'),
        endTime: values.timeRange[1].format('HH:mm'),
        type: values.type,
        students: values.students,
        description: values.description,
        ...(values.type === 'offline' && { location: values.location })
      };

      setClasses(prev => [...prev, newClass]);
      message.success('Thêm lịch dạy thành công!');
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Có lỗi xảy ra!');
    }
  };

  const todayClasses = getClassesForDate(selectedDate);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lịch Dạy Học</h1>
              <p className="text-gray-600">Quản lý lịch dạy và lớp học của bạn</p>
            </div>
            <Button 
              type="primary" 
              icon={<Plus size={16} />}
              onClick={() => setModalVisible(true)}
            >
              Thêm Lịch Dạy
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <Card>
                <Calendar
                  value={selectedDate}
                  onChange={setSelectedDate}
                  cellRender={dateCellRender}
                  headerRender={({ value, onChange }) => (
                    <div className="flex justify-between items-center mb-4">
                      <Button onClick={() => onChange(value.subtract(1, 'month'))}>
                        Tháng trước
                      </Button>
                      <span className="text-lg font-semibold">
                        {value.format('MMMM YYYY')}
                      </span>
                      <Button onClick={() => onChange(value.add(1, 'month'))}>
                        Tháng sau
                      </Button>
                    </div>
                  )}
                />
              </Card>
            </div>

            {/* Today's Classes */}
            <div className="lg:col-span-1">
              <Card title={`Lịch dạy - ${selectedDate.format('DD/MM/YYYY')}`}>
                {todayClasses.length > 0 ? (
                  <List
                    dataSource={todayClasses}
                    renderItem={(classItem) => (
                      <List.Item>
                        <div className="w-full">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-semibold">{classItem.title}</div>
                            <Tag color={classItem.type === 'online' ? 'blue' : 'green'}>
                              {classItem.type === 'online' ? 'Online' : 'Offline'}
                            </Tag>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <Clock className="w-4 h-4 mr-1" />
                            {classItem.startTime} - {classItem.endTime}
                          </div>
                          {classItem.type === 'offline' && (
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <MapPin className="w-4 h-4 mr-1" />
                              {classItem.location}
                            </div>
                          )}
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-1" />
                            {classItem.students} học viên
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Không có lịch dạy nào trong ngày</p>
                  </div>
                )}
              </Card>

              {/* Quick Stats */}
              <Card className="mt-6" title="Thống kê tháng">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Số lớp đã dạy:</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Số giờ giảng dạy:</span>
                    <span className="font-semibold">36h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lớp online:</span>
                    <span className="font-semibold">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lớp offline:</span>
                    <span className="font-semibold">4</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add Class Modal */}
      <Modal
        title="Thêm Lịch Dạy Mới"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddClass}
          className="mt-6"
        >
          <Form.Item
            name="title"
            label="Tên lớp học"
            rules={[{ required: true, message: 'Vui lòng nhập tên lớp học!' }]}
          >
            <Input placeholder="VD: Lớp Giao Tiếp - Buổi 15" />
          </Form.Item>

          <Form.Item
            name="date"
            label="Ngày dạy"
            rules={[{ required: true, message: 'Vui lòng chọn ngày dạy!' }]}
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item
            name="timeRange"
            label="Thời gian"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
          >
            <TimePicker.RangePicker 
              format="HH:mm"
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            name="type"
            label="Hình thức"
            rules={[{ required: true, message: 'Vui lòng chọn hình thức!' }]}
          >
            <Select placeholder="Chọn hình thức dạy">
              <Option value="online">Online</Option>
              <Option value="offline">Offline</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
          >
            {({ getFieldValue }) =>
              getFieldValue('type') === 'offline' ? (
                <Form.Item
                  name="location"
                  label="Địa điểm"
                  rules={[{ required: true, message: 'Vui lòng nhập địa điểm!' }]}
                >
                  <Input placeholder="VD: Phòng 301 - Tòa nhà A" />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item
            name="students"
            label="Số học viên"
            rules={[{ required: true, message: 'Vui lòng nhập số học viên!' }]}
          >
            <Input type="number" placeholder="VD: 20" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea 
              rows={4} 
              placeholder="Mô tả về nội dung buổi học..."
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
                Thêm Lịch Dạy
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeacherSchedule;