import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import Home from './pages/Home';
import Register from './pages/auth/Register';
import Profile from './pages/Profile';
import Courses from './pages/courses/Courses';
import CourseDetail from './pages/courses/CourseDetail';
import Learning from './pages/learning/Learning';
import Forum from './pages/forum/Forum';
import Exam from './pages/exam/Exam';
import AdminDashboard from './pages/admin/AdminDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import Navbar from './components/Layout/Navbar';
import { AuthProvider } from './context/AuthContext';
import Footer from './components/Layout/Footer';
import Leaderboard from './pages/gamification/Leaderboard';
import TestTailwind from './pages/TestTailwind';
import Login from './pages/auth/Login';
import TeacherSchedule from './pages/teacher/Schedule';
import ForumManager from './pages/teacher/ForumManager';
import StudentClasses from './pages/student/StudentClass';
import StudentClassDetail from './pages/student/StudentClassDetail';
import ExamManager from './pages/teacher/ExamManager';
import ExamEditor from './pages/teacher/ExamEditor';
import ExamCreator from './pages/teacher/ExamCreator';
import ExamTaking from './pages/ExamTaking';
import AddCourse from './pages/admin/AddCourse';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0ea5e9',
        },
      }}
    >
      <AuthProvider>
        <Router>
          <div className="App min-h-screen bg-gradient-to-br from-blue-50 to-white">
            <Navbar />
            <main className="min-h-screen">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:id" element={<CourseDetail />} />
                <Route path="/student/classes" element={<StudentClasses />} />
                <Route path="/student/classes/:id" element={<StudentClassDetail />} />
                <Route path="/learning/:courseId" element={<Learning />} />
                <Route path="/forum/:courseId" element={<Forum />} />
                {/* <Route path="/exam/:courseId" element={<Exam />} /> */}
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/addCourses" element={<AddCourse />} />
                <Route path="/teacher" element={<TeacherDashboard />} />
                <Route path="/teacher/schedule" element={<TeacherSchedule />} />
                <Route path="/teacher/forum" element={<ForumManager />} />
                <Route path="/teacher/exams" element={<ExamManager />} />
                <Route path="/teacher/exams/create" element={<ExamCreator />} />
                <Route path="/teacher/exams/:id/edit" element={<ExamEditor />} />
                <Route path="/exam/:id" element={<ExamTaking />} />
                <Route path="/test-tailwind" element={<TestTailwind />} />
                
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;