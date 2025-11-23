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
import AboutUs from "./pages/AboutUs";
import GuestGuard from "./guards/GuestGuard";
import AdminGuard from "./guards/AdminGuard";
import TeacherGuard from "./guards/TeacherGuard";
import StudentGuard from "./guards/StudentGuard";
import UserGuard from "./guards/UserGuard";

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
                <Route
                  path="/login"
                  element={<GuestGuard children={<Login />} />}
                />
                <Route
                  path="/register"
                  element={<GuestGuard children={<Register />} />}
                />
                <Route
                  path="/profile"
                  element={<UserGuard children={<Profile />} />}
                />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/courses" element={<Courses />} />
                <Route
                  path="/courses/:id"
                  element={<StudentGuard children={<CourseDetail />} />}
                />
                <Route
                  path="/student/classes"
                  element={<StudentGuard children={<StudentClasses />} />}
                />
                <Route
                  path="/student/classes/:id"
                  element={<StudentGuard children={<StudentClassDetail />} />}
                />
                <Route
                  path="/student/exams/:id"
                  element={<StudentGuard children={<StudentExam />} />}
                />
                <Route
                  path="/learning/:courseId"
                  element={<StudentGuard children={<Learning />} />}
                />
                <Route
                  path="/forum/:courseId"
                  element={<StudentGuard children={<Forum />} />}
                />
                {/* <Route path="/exam/:courseId" element={<Exam />} /> */}
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route
                  path="/admin"
                  element={<AdminGuard children={<AdminDashboard />} />}
                />
                <Route
                  path="/admin/courses/add"
                  element={<AdminGuard children={<AddCourse />} />}
                />
                <Route
                  path="/admin/courses/:id"
                  element={<AdminGuard children={<EditCourse />} />}
                />
                <Route
                  path="/admin/users"
                  element={<AdminGuard children={<UserManagement />} />}
                />
                <Route
                  path="/admin/courses"
                  element={<AdminGuard children={<CourseManagement />} />}
                />
                <Route
                  path="/admin/exams"
                  element={<AdminGuard children={<AdminExamManager />} />}
                />
                <Route
                  path="/admin/exams/:id/edit"
                  element={<AdminGuard children={<AdminExamEditor />} />}
                />
                <Route
                  path="/admin/exams/create"
                  element={<AdminGuard children={<AdminExamCreator />} />}
                />
                <Route
                  path="/teacher"
                  element={<TeacherGuard children={<TeacherDashboard />} />}
                />
                <Route
                  path="/teacher/schedule"
                  element={<TeacherGuard children={<TeacherSchedule />} />}
                />
                <Route
                  path="/teacher/forum"
                  element={<TeacherGuard children={<ForumManager />} />}
                />
                <Route
                  path="/teacher/students"
                  element={<TeacherGuard children={<StudentManagement />} />}
                />
                <Route
                  path="/teacher/exams"
                  element={<TeacherGuard children={<TeacherExamManager />} />}
                />
                <Route
                  path="/teacher/exams/create"
                  element={<TeacherGuard children={<TeacherExamCreator />} />}
                />
                <Route
                  path="/teacher/exams/:id/edit"
                  element={<TeacherGuard children={<TeacherExamEditor />} />}
                />
                {/* <Route path="/exam/:id" element={<ExamTaking />} /> */}
                <Route
                  path="/exams"
                  element={<StudentGuard children={<FreeExams />} />}
                />
                <Route
                  path="/exams/:id"
                  element={<StudentGuard children={<FreeExamTaking />} />}
                />
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
