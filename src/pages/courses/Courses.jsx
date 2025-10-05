import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Input, Select, Button, Tag, Skeleton, message } from 'antd';
import { Search, Filter, BookOpen, Users, Star, Clock } from 'lucide-react';
import { courseApi } from '../../services/courseApi';

const { Search: AntSearch } = Input;
const { Option } = Select;

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await courseApi.getAllCourses();
        const coursesData = response.data.map(course => ({
          ...course,
          priceFormatted: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price),
          originalPriceFormatted: course.originalPrice ? 
            new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.originalPrice) : null
        }));
        setCourses(coursesData);
        setFilteredCourses(coursesData);
      } catch (error) {
        console.error('Error fetching courses:', error);
        message.error('Không thể tải danh sách khóa học');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const filtered = courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = levelFilter === 'all' || course.level === levelFilter;
      const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
      
      return matchesSearch && matchesLevel && matchesCategory;
    });
    setFilteredCourses(filtered);
  }, [searchTerm, levelFilter, categoryFilter, courses]);

  const getLevelColor = (level) => {
    const colors = {
      beginner: 'green',
      intermediate: 'blue',
      advanced: 'red'
    };
    return colors[level] || 'default';
  };

  const handleAddToCart = (courseId) => {
    message.info('Tính năng thêm vào giỏ hàng sẽ được tích hợp sau');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton.Input active size="large" className="!w-64 !h-12 mx-auto mb-4" />
            <Skeleton.Input active size="default" className="!w-96 !h-6 mx-auto" />
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <Skeleton active paragraph={{ rows: 1 }} />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card key={item} className="shadow-lg">
                <Skeleton.Image active className="!w-full !h-48" />
                <Skeleton active paragraph={{ rows: 4 }} />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Khóa học Tiếng Anh
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Khám phá các khóa học được thiết kế chuyên biệt cho mọi trình độ
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <AntSearch
                placeholder="Tìm kiếm khóa học..."
                prefix={<Search className="text-gray-400" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="large"
              />
            </div>
            
            <Select
              value={levelFilter}
              onChange={setLevelFilter}
              size="large"
              className="w-full lg:w-48"
              placeholder="Trình độ"
            >
              <Option value="all">Tất cả trình độ</Option>
              <Option value="beginner">Beginner</Option>
              <Option value="intermediate">Intermediate</Option>
              <Option value="advanced">Advanced</Option>
            </Select>

            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              size="large"
              className="w-full lg:w-48"
              placeholder="Danh mục"
            >
              <Option value="all">Tất cả danh mục</Option>
              <Option value="communication">Giao tiếp</Option>
              <Option value="exam">Luyện thi</Option>
              <Option value="business">Business</Option>
              <Option value="academic">Học thuật</Option>
            </Select>

            <Button 
              type="default" 
              icon={<Filter size={16} />}
              onClick={() => {
                setSearchTerm('');
                setLevelFilter('all');
                setCategoryFilter('all');
              }}
              size="large"
            >
              Reset
            </Button>
          </div>
        </motion.div>

        {/* Courses Grid */}
        <AnimatePresence>
          <motion.div 
            layout
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card
                  cover={
                    <div className="relative">
                      <img 
                        alt={course.title} 
                        src={course.image} 
                        className="h-48 w-full object-cover"
                      />
                      {course.students > 1000 && (
                        <Tag color="red" className="absolute top-3 left-3">
                          Bestseller
                        </Tag>
                      )}
                    </div>
                  }
                  className="shadow-lg hover:shadow-xl transition-all duration-300 h-full"
                  actions={[
                    <Link to={`/courses/${course.id}`} key="view">
                      <Button type="primary">Xem chi tiết</Button>
                    </Link>,
                    <Button 
                      key="buy" 
                      className="text-primary-600 border-primary-600"
                      onClick={() => handleAddToCart(course.id)}
                    >
                      Mua ngay
                    </Button>
                  ]}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                        {course.title}
                      </h3>
                      <div className="flex items-center text-sm text-yellow-600">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="ml-1">{course.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {course.description}
                    </p>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <BookOpen className="w-4 h-4 mr-1" />
                      <span>Giáo viên: {course.teacherId}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{course.students}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Tag color={getLevelColor(course.level)} className="capitalize">
                        {course.level}
                      </Tag>
                      <div className="text-right">
                        <div className="font-bold text-lg text-primary-600">
                          {course.priceFormatted}
                        </div>
                        {course.originalPriceFormatted && (
                          <div className="text-sm text-gray-500 line-through">
                            {course.originalPriceFormatted}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredCourses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Không tìm thấy khóa học phù hợp
            </h3>
            <p className="text-gray-500">
              Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Courses;