import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, Button, Input, List, Avatar, Tag, Divider } from 'antd';
import { MessageCircle, ThumbsUp, Share, BookOpen, Search } from 'lucide-react';

const { TextArea } = Input;
const { Search: AntSearch } = Input;

const Forum = () => {
  const { courseId } = useParams();
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: {
        name: 'Nguyễn Văn A',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        role: 'student'
      },
      content: 'Mọi người ơi, cho mình hỏi về cách phát âm "th" trong tiếng Anh với ạ? Mình hay bị nhầm lẫn giữa âm /θ/ và /ð/.',
      timestamp: '2 giờ trước',
      likes: 15,
      comments: 8,
      tags: ['phát-âm', 'hỏi-đáp'],
      isPinned: true
    },
    {
      id: 2,
      user: {
        name: 'Ms. Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        role: 'teacher'
      },
      content: 'Chào các em! Tuần này chúng ta sẽ có bài kiểm tra ngữ pháp. Các em nhớ ôn tập kỹ các chủ điểm đã học nhé!',
      timestamp: '5 giờ trước',
      likes: 32,
      comments: 12,
      tags: ['thông-báo', 'bài-kiểm-tra'],
      isPinned: true
    }
  ]);

  const handleCreatePost = () => {
    if (newPost.trim()) {
      const post = {
        id: posts.length + 1,
        user: {
          name: 'You',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
          role: 'student'
        },
        content: newPost,
        timestamp: 'Vừa xong',
        likes: 0,
        comments: 0,
        tags: ['mới'],
        isPinned: false
      };
      setPosts([post, ...posts]);
      setNewPost('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Diễn đàn lớp học
              </h1>
              <p className="text-gray-600">
                Nơi thảo luận, trao đổi và hỗ trợ học tập
              </p>
            </div>
            <Button type="primary" icon={<BookOpen size={16} />}>
              Hướng dẫn sử dụng
            </Button>
          </div>

          <Card className="mb-6">
            <AntSearch
              placeholder="Tìm kiếm trong diễn đàn..."
              size="large"
              enterButton={<Search size={16} />}
            />
          </Card>

          <Card className="mb-6" title="Tạo bài viết mới">
            <TextArea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Chia sẻ câu hỏi hoặc suy nghĩ của bạn..."
              rows={4}
              className="mb-4"
            />
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Tag color="blue">Câu hỏi</Tag>
                <Tag color="green">Thảo luận</Tag>
                <Tag color="orange">Hỗ trợ</Tag>
              </div>
              <Button 
                type="primary" 
                onClick={handleCreatePost}
                disabled={!newPost.trim()}
              >
                Đăng bài
              </Button>
            </div>
          </Card>

          <Card>
            <List
              itemLayout="vertical"
              dataSource={posts}
              renderItem={(post) => (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <List.Item
                    className={`p-6 mb-4 bg-white rounded-lg shadow-sm border ${
                      post.isPinned ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'
                    }`}
                    actions={[
                      <Button type="text" icon={<ThumbsUp size={16} />}>
                        {post.likes}
                      </Button>,
                      <Button type="text" icon={<MessageCircle size={16} />}>
                        {post.comments}
                      </Button>,
                      <Button type="text" icon={<Share size={16} />}>
                        Chia sẻ
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar src={post.user.avatar} size="large" />}
                      title={
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{post.user.name}</span>
                          <Tag color={post.user.role === 'teacher' ? 'red' : 'blue'}>
                            {post.user.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                          </Tag>
                          {post.isPinned && (
                            <Tag color="yellow">Đã ghim</Tag>
                          )}
                        </div>
                      }
                      description={
                        <div className="flex items-center space-x-4 text-gray-500">
                          <span>{post.timestamp}</span>
                          <div className="flex space-x-1">
                            {post.tags.map((tag, index) => (
                              <Tag key={index} color="default" className="text-xs">
                                #{tag}
                              </Tag>
                            ))}
                          </div>
                        </div>
                      }
                    />
                    <div className="mt-4 text-gray-800 leading-relaxed">
                      {post.content}
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex space-x-3">
                        <Avatar size="small" src={post.user.avatar} />
                        <div className="flex-1">
                          <Input 
                            placeholder="Viết bình luận..."
                            size="small"
                          />
                        </div>
                      </div>
                    </div>
                  </List.Item>
                </motion.div>
              )}
            />
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Forum;