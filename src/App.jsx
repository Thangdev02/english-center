import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ConfigProvider } from "antd";
import Home from "./pages/Home";
import Register from "./pages/auth/Register";
import Profile from "./pages/Profile";
import Courses from "./pages/courses/Courses";
import CourseDetail from "./pages/courses/CourseDetail";
import Learning from "./pages/learning/Learning";
import Forum from "./pages/forum/Forum";
import Exam from "./pages/exam/Exam";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import Navbar from "./components/Layout/Navbar";
import { AuthProvider } from "./context/AuthContext";
import Footer from "./components/Layout/Footer";
import Leaderboard from "./pages/gamification/Leaderboard";
import TestTailwind from "./pages/TestTailwind";
import Login from "./pages/auth/Login";
import TeacherSchedule from "./pages/teacher/Schedule";
import ForumManager from "./pages/teacher/ForumManager";
import StudentClasses from "./pages/student/StudentClass";
import StudentClassDetail from "./pages/student/StudentClassDetail";
import TeacherExamManager from "./pages/teacher/ExamManager";
import TeacherExamEditor from "./pages/teacher/ExamEditor";
import TeacherExamCreator from "./pages/teacher/ExamCreator";
import AdminExamManager from "./pages/admin/ExamManager";
import AdminExamEditor from "./pages/admin/ExamEditor";
import AdminExamCreator from "./pages/admin/ExamCreator";
import ExamTaking from "./pages/ExamTaking";
import AddCourse from "./pages/admin/AddCourse";
import ScrollToTop from "./components/ScrollToTop";
import StudentManagement from "./pages/teacher/StudentManagement";
import UserManagement from "./pages/admin/UserManagement";
import CourseManagement from "./pages/admin/CourseManagement";
import StudentExam from "./pages/student/StudentExam";
import EditCourse from "./pages/admin/EditCourse";
import FreeExams from "./pages/FreeExams";
import FreeExamTaking from "./pages/FreeExamTaking";

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#0ea5e9",
        },
      }}
    >
      <AuthProvider>
        <Router>
          <div className="App min-h-screen bg-gradient-to-br from-blue-50 to-white">
            <Navbar />
            <main className="min-h-screen">
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:id" element={<CourseDetail />} />
                <Route path="/student/classes" element={<StudentClasses />} />
                <Route
                  path="/student/classes/:id"
                  element={<StudentClassDetail />}
                />
                <Route path="/student/exams/:id" element={<StudentExam />} />
                <Route path="/learning/:courseId" element={<Learning />} />
                <Route path="/forum/:courseId" element={<Forum />} />
                <Route path="/free-exams" element={<FreeExams />} />
                {/* <Route path="/exam/:courseId" element={<Exam />} /> */}
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/courses/add" element={<AddCourse />} />
                <Route path="/admin/courses/:id" element={<EditCourse />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/courses" element={<CourseManagement />} />
                <Route path="/admin/exams" element={<AdminExamManager />} />
                <Route
                  path="/admin/exams/:id/edit"
                  element={<AdminExamEditor />}
                />
                <Route
                  path="/admin/exams/create"
                  element={<AdminExamCreator />}
                />
                <Route path="/teacher" element={<TeacherDashboard />} />
                <Route path="/teacher/schedule" element={<TeacherSchedule />} />
                <Route path="/teacher/forum" element={<ForumManager />} />
                <Route
                  path="/teacher/students"
                  element={<StudentManagement />}
                />
                <Route path="/teacher/exams" element={<TeacherExamManager />} />
                <Route
                  path="/teacher/exams/create"
                  element={<TeacherExamCreator />}
                />
                <Route
                  path="/teacher/exams/:id/edit"
                  element={<TeacherExamEditor />}
                />
                <Route path="/exam/:id" element={<ExamTaking />} />
                <Route path="/exams" element={<FreeExams />} />
                <Route path="/exams/:id" element={<FreeExamTaking />} />
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
