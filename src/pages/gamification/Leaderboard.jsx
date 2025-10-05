import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Table, Tag, Avatar, Progress, Tabs, Select } from 'antd';
import { Trophy, Star, Award, TrendingUp, Crown, BookOpen } from 'lucide-react';

const { TabPane } = Tabs;
const { Option } = Select;

const Leaderboard = () => {
  const [timeRange, setTimeRange] = useState('monthly');

  const leaderboardData = [
    {
      rank: 1,
      name: 'Nguyễn Văn A',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      points: 2450,
      level: 'Expert',
      progress: 95,
      streak: 15,
      coursesCompleted: 8
    },
    {
      rank: 2,
      name: 'Trần Thị B',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      points: 2180,
      level: 'Advanced',
      progress: 87,
      streak: 12,
      coursesCompleted: 7
    },
    {
      rank: 3,
      name: 'Lê Văn C',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      points: 1950,
      level: 'Advanced',
      progress: 78,
      streak: 10,
      coursesCompleted: 6
    }
  ];

  const achievements = [
    {
      name: 'Học viên xuất sắc',
      icon: '🏆',
      description: 'Đứng top 1 bảng xếp hạng',
      points: 500,
      earned: true
    },
    {
      name: 'Chuyên cần',
      icon: '🔥',
      description: 'Duy trì streak 30 ngày',
      points: 300,
      earned: false
    },
    {
      name: 'Master Vocabulary',
      icon: '📚',
      description: 'Học 1000 từ vựng',
      points: 250,
      earned: true
    }
  ];

  const columns = [
    {
      title: 'Hạng',
      dataIndex: 'rank',
      key: 'rank',
      render: (rank) => (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold">
          {rank}
        </div>
      )
    },
    {
      title: 'Học viên',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div className="flex items-center space-x-3">
          <Avatar src={record.avatar} size="large" />
          <div>
            <div className="font-semibold">{name}</div>
            <Tag color="blue">{record.level}</Tag>
          </div>
        </div>
      )
    },
    {
      title: 'Điểm số',
      dataIndex: 'points',
      key: 'points',
      render: (points) => (
        <div className="flex items-center text-orange-500 font-semibold">
          <Star className="w-4 h-4 mr-1 fill-current" />
          {points}
        </div>
      )
    },
    {
      title: 'Tiến độ',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => (
        <Progress percent={progress} size="small" />
      )
    },
    {
      title: 'Streak',
      dataIndex: 'streak',
      key: 'streak',
      render: (streak) => (
        <div className="flex items-center text-red-500">
          <TrendingUp className="w-4 h-4 mr-1" />
          {streak} ngày
        </div>
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
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Trophy className="w-12 h-12 text-yellow-500 mr-4" />
              <h1 className="text-4xl font-bold text-gray-900">Bảng Xếp Hạng</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cùng thi đua và chinh phục những đỉnh cao mới trong học tập
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Top Performers */}
            <div className="lg:col-span-2">
              <Card 
                title={
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Crown className="w-5 h-5 text-yellow-500 mr-2" />
                      Top Học Viên
                    </span>
                    <Select 
                      value={timeRange} 
                      onChange={setTimeRange}
                      className="w-32"
                    >
                      <Option value="weekly">Tuần này</Option>
                      <Option value="monthly">Tháng này</Option>
                      <Option value="all">Tất cả</Option>
                    </Select>
                  </div>
                }
              >
                <Table
                  columns={columns}
                  dataSource={leaderboardData}
                  pagination={false}
                  rowKey="rank"
                  className="leaderboard-table"
                />
              </Card>

              {/* Current User Stats */}
              <Card className="mt-6" title="Thống kê của bạn">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">15</div>
                    <div className="text-sm text-gray-600">Hạng hiện tại</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">1,240</div>
                    <div className="text-sm text-gray-600">Điểm số</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">7</div>
                    <div className="text-sm text-gray-600">Streak</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">3</div>
                    <div className="text-sm text-gray-600">Khóa học</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Achievements */}
            <div className="lg:col-span-1">
              <Card 
                title={
                  <span className="flex items-center">
                    <Award className="w-5 h-5 text-purple-500 mr-2" />
                    Thành Tích
                  </span>
                }
              >
                <div className="space-y-4">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card 
                        size="small"
                        className={`border-l-4 ${
                          achievement.earned 
                            ? 'border-l-green-500 bg-green-50' 
                            : 'border-l-gray-300 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{achievement.icon}</span>
                            <div>
                              <div className="font-semibold">{achievement.name}</div>
                              <div className="text-sm text-gray-600">
                                {achievement.description}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-orange-500">
                              +{achievement.points}
                            </div>
                            {achievement.earned ? (
                              <Tag color="green" className="text-xs">
                                Đã đạt
                              </Tag>
                            ) : (
                              <Tag color="default" className="text-xs">
                                Chưa đạt
                              </Tag>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Progress to next level */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
                  <div className="text-sm mb-2">Tiến trình đến cấp độ tiếp theo</div>
                  <Progress 
                    percent={65} 
                    strokeColor="#fff"
                    showInfo={false}
                  />
                  <div className="flex justify-between text-sm mt-2">
                    <span>Advanced</span>
                    <span>Expert</span>
                  </div>
                  <div className="text-center mt-3">
                    <div className="text-lg font-semibold">Cần thêm 350 điểm</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Weekly Challenges */}
          <Card className="mt-8" title="Thử thách tuần">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 border rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Hoàn thành 5 bài học</h3>
                <p className="text-gray-600 text-sm mb-4">Nhận 100 điểm</p>
                <Progress percent={60} />
                <div className="text-sm text-gray-500 mt-2">3/5 bài học</div>
              </div>

              <div className="text-center p-6 border rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Duy trì streak 7 ngày</h3>
                <p className="text-gray-600 text-sm mb-4">Nhận 150 điểm</p>
                <Progress percent={85} />
                <div className="text-sm text-gray-500 mt-2">6/7 ngày</div>
              </div>

              <div className="text-center p-6 border rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Đạt điểm cao trong bài kiểm tra</h3>
                <p className="text-gray-600 text-sm mb-4">Nhận 200 điểm</p>
                <Progress percent={30} />
                <div className="text-sm text-gray-500 mt-2">Chưa hoàn thành</div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;