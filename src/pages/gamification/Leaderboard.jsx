import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Table, Tag, Avatar, Progress, Tabs, Select } from 'antd';
import { Trophy, Star, Award, TrendingUp, Crown, BookOpen, Flame } from 'lucide-react';

const { Option } = Select;

const Leaderboard = () => {
  const [timeRange, setTimeRange] = useState('monthly');

  const leaderboardData = [
    { rank: 1, name: 'Nguyễn Văn A', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', points: 2450, level: 'Expert', progress: 95, streak: 15, coursesCompleted: 8 },
    { rank: 2, name: 'Trần Thị B', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', points: 2180, level: 'Advanced', progress: 87, streak: 12, coursesCompleted: 7 },
    { rank: 3, name: 'Lê Văn C', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', points: 1950, level: 'Advanced', progress: 78, streak: 10, coursesCompleted: 6 },
  ];

  const achievements = [
    { name: 'Học viên xuất sắc', icon: '🏆', description: 'Đứng top 1 bảng xếp hạng', points: 500, earned: true },
    { name: 'Chuyên cần', icon: '🔥', description: 'Duy trì streak 30 ngày', points: 300, earned: false },
    { name: 'Master Vocabulary', icon: '📚', description: 'Học 1000 từ vựng', points: 250, earned: true },
  ];

  const columns = [
    {
      title: 'Hạng',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank) => (
        <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white shadow-lg
          ${rank === 1 ? 'bg-gradient-to-br from-red-500 to-red-700 text-lg' : 
            rank === 2 ? 'bg-gradient-to-br from-red-400 to-red-600' : 
            rank === 3 ? 'bg-gradient-to-br from-red-300 to-red-500' : 
            'bg-gray-300'}`}>
          {rank}
        </div>
      ),
    },
    {
      title: 'Học viên',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <Avatar src={record.avatar} size={48} className="ring-4 ring-red-100" />
          <div>
            <div className="font-bold text-gray-800">{record.name}</div>
            <Tag color={record.level === 'Expert' ? 'red' : 'orange'} className="mt-1">
              {record.level}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Điểm số',
      dataIndex: 'points',
      key: 'points',
      render: (points) => (
        <div className="flex items-center font-bold text-red-600">
          <Star className="w-5 h-5 mr-1 fill-red-500" />
          {points.toLocaleString()}
        </div>
      ),
    },
    {
      title: 'Tiến độ',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => (
        <Progress 
          percent={progress} 
          strokeColor="#ef4444" 
          trailColor="#fee2e2"
          size="small"
          className="font-medium"
        />
      ),
    },
    {
      title: 'Streak',
      dataIndex: 'streak',
      key: 'streak',
      render: (streak) => (
        <div className="flex items-center font-semibold text-red-600">
          <Flame className="w-5 h-5 mr-1 fill-current" />
          {streak} ngày
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Trophy className="w-14 h-14 text-red-600 drop-shadow-lg" />
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                BẢNG XẾP HẠNG
              </h1>
            </div>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto font-medium">
              Cùng thi đua, cùng bứt phá – ai sẽ là nhà vô địch tháng này?
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Leaderboard + Stats */}
            <div className="lg:col-span-2 space-y-8">
              {/* Top Leaderboard */}
              <Card 
                className="shadow-xl border-0 rounded-2xl overflow-hidden"
                bodyStyle={{ padding: 0 }}
                title={
                  <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white">
                    <span className="flex items-center text-lg font-bold">
                      <Crown className="w-6 h-6 mr-3" />
                      TOP HỌC VIÊN XUẤT SẮC
                    </span>
                    <Select 
                      value={timeRange} 
                      onChange={setTimeRange}
                      style={{ width: 140 }}
                      className="rounded-lg"
                      dropdownStyle={{ borderRadius: 12 }}
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
                  rowClassName={(record) => record.rank <= 3 ? 'bg-red-50' : ''}
                />
              </Card>

              {/* Your Stats */}
              <Card className="shadow-lg border-0 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <TrendingUp className="w-6 h-6 mr-2" />
                  Thống kê của bạn
                </h3>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                    <div className="text-3xl font-extrabold">15</div>
                    <div className="text-sm opacity-90">Hạng hiện tại</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                    <div className="text-3xl font-extrabold">1,240</div>
                    <div className="text-sm opacity-90">Điểm số</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                    <div className="text-3xl font-extrabold flex items-center justify-center">
                      <Flame className="w-8 h-8" /> 7
                    </div>
                    <div className="text-sm opacity-90">Streak</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                    <div className="text-3xl font-extrabold">3</div>
                    <div className="text-sm opacity-90">Khóa học</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Achievements */}
            <div>
              <Card 
                className="shadow-xl border-0 rounded-2xl overflow-hidden"
                title={
                  <div className="flex items-center px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white text-lg font-bold">
                    <Award className="w-6 h-6 mr-2" />
                    Thành tích nổi bật
                  </div>
                }
              >
                <div className="space-y-4">
                  {achievements.map((a, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                    >
                      <Card 
                        size="small"
                        className={`border-0 shadow-md rounded-xl transition-all ${
                          a.earned 
                            ? 'bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-l-red-600' 
                            : 'bg-gray-50 opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-3xl">{a.icon}</span>
                            <div>
                              <div className="font-bold text-gray-800">{a.name}</div>
                              <div className="text-sm text-gray-600">{a.description}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-red-600">+{a.points}</div>
                            <Tag color={a.earned ? 'red' : 'default'} className="mt-1">
                              {a.earned ? 'ĐÃ ĐẠT' : 'CHƯA ĐẠT'}
                            </Tag>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Level Progress */}
                <div className="mt-8 p-6 bg-gradient-to-r from-red-600 to-rose-700 rounded-2xl text-white">
                  <div className="text-sm font-medium mb-3">Tiến trình đến cấp độ tiếp theo</div>
                  <Progress percent={65} strokeColor="#fff" trailColor="#fecaca" showInfo={false} />
                  <div className="flex justify-between mt-3 text-sm font-medium">
                    <span>Advanced</span>
                    <span className="font-bold">Expert →</span>
                  </div>
                  <div className="text-center mt-4 text-lg font-extrabold">
                    Chỉ còn 350 điểm nữa!
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Weekly Challenges */}
          <Card className="mt-10 shadow-xl border-0 rounded-2xl" title={<h2 className="text-2xl font-bold text-red-700 flex items-center"><Trophy className="w-7 h-7 mr-3" /> THỬ THÁCH TUẦN</h2>}>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: "Hoàn thành 5 bài học", reward: "100 điểm", percent: 60, current: "3/5", icon: BookOpen, color: "red" },
                { title: "Duy trì streak 7 ngày", reward: "150 điểm", percent: 85, current: "6/7 ngày", icon: Flame, color: "red" },
                { title: "Đạt điểm cao bài kiểm tra", reward: "200 điểm", percent: 30, current: "Chưa hoàn thành", icon: Award, color: "rose" },
              ].map((c, i) => (
                <div key={i} className="text-center p-6 bg-gradient-to-br from-red-50 to-white rounded-2xl shadow-md border border-red-100">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <c.icon className="w-9 h-9 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{c.title}</h3>
                  <p className="text-red-600 font-semibold mb-4">{c.reward}</p>
                  <Progress percent={c.percent} strokeColor="#ef4444" trailColor="#fee2e2" />
                  <div className="text-sm text-gray-600 mt-3 font-medium">{c.current}</div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;