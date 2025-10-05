import api from './api';

export const courseApi = {
  // Course management
  getAllCourses: () => api.get('/courses'),
  getCourse: (id) => api.get(`/courses/${id}`),
  createCourse: (courseData) => api.post('/courses', courseData),
  updateCourse: (id, courseData) => api.patch(`/courses/${id}`, courseData),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  
  enrollCourse: (courseId, userId) => {
    const enrollmentData = {
      userId: userId,
      courseId: courseId,
      progress: 0,
      completedLessons: [],
      enrolledAt: new Date().toISOString(),
      status: 'active'
    };
    console.log('🔄 Creating enrollment:', enrollmentData);
    return api.post('/enrollments', enrollmentData);
  },
  
  getMyEnrollments: (userId) => {
    console.log('🔄 Getting enrollments for user:', userId);
    return api.get(`/enrollments?userId=${userId}`);
  },
  
  getEnrollmentByCourse: (userId, courseId) => {
    return api.get(`/enrollments?userId=${userId}&courseId=${courseId}`);
  },
  
  getEnrollmentProgress: (courseId, userId) => api.get(`/enrollments?userId=${userId}&courseId=${courseId}`),
  updateProgress: (enrollmentId, progress) => api.patch(`/enrollments/${enrollmentId}`, progress),
  
  // Course content
  getChapters: (courseId) => api.get(`/chapters?courseId=${courseId}`),
  getLessons: (chapterId) => api.get(`/lessons?chapterId=${chapterId}`),
  getLesson: (id) => api.get(`/lessons/${id}`),
  
  // Teacher courses
  getTeacherCourses: (teacherId) => api.get(`/courses?teacherId=${teacherId}`),
};

// Mock functions for JSON Server relationships
export const courseService = {
  getCourseWithDetails: async (courseId) => {
    const [course, chapters, teacher] = await Promise.all([
      api.get(`/courses/${courseId}`),
      api.get(`/chapters?courseId=${courseId}`),
      api.get(`/users/${courseId}`) // Mock teacher
    ]);
    
    return {
      ...course.data,
      chapters: chapters.data,
      teacher: teacher.data
    };
  },
  
  getChapterWithLessons: async (chapterId) => {
    const [chapter, lessons] = await Promise.all([
      api.get(`/chapters/${chapterId}`),
      api.get(`/lessons?chapterId=${chapterId}`)
    ]);
    
    return {
      ...chapter.data,
      lessons: lessons.data
    };
  }
};