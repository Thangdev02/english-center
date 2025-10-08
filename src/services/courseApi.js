import api from './api';

export const courseApi = {
  // Course 
  getAllCourses: () => api.get('/courses'),
  getCourse: (id) => api.get(`/courses/${id}`),
  createCourse: (courseData) => api.post('/courses', courseData),
  updateCourse: (id, courseData) => api.patch(`/courses/${id}`, courseData),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  
  // Chapter 
  getChapters: (courseId) => api.get(`/chapters?courseId=${courseId}`),
  createChapter: (chapterData) => api.post('/chapters', chapterData),
  updateChapter: (id, chapterData) => api.patch(`/chapters/${id}`, chapterData),
  deleteChapter: (id) => api.delete(`/chapters/${id}`),
  
  // Lesson 
  getLessons: (chapterId) => api.get(`/lessons?chapterId=${chapterId}`),
  getLesson: (id) => api.get(`/lessons/${id}`),
  createLesson: (lessonData) => api.post('/lessons', lessonData),
  updateLesson: (id, lessonData) => api.patch(`/lessons/${id}`, lessonData),
  deleteLesson: (id) => api.delete(`/lessons/${id}`),
  
  //  join khoa
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
  
  //xem cai khoa cua minh
  getMyEnrollments: (userId) => {
    console.log('🔄 Getting enrollments for user:', userId);
    return api.get(`/enrollments?userId=${userId}`);
  },
  
  getEnrollmentByCourse: (userId, courseId) => {
    return api.get(`/enrollments?userId=${userId}&courseId=${courseId}`);
  },
  
  getEnrollmentProgress: (courseId, userId) => api.get(`/enrollments?userId=${userId}&courseId=${courseId}`),
  updateProgress: (enrollmentId, progress) => api.patch(`/enrollments/${enrollmentId}`, progress),
  
  getTeacherCourses: (teacherId) => api.get(`/courses?teacherId=${teacherId}`),
};

export const courseService = {
  getCourseWithDetails: async (courseId) => {
    const [course, chapters, teacher] = await Promise.all([
      api.get(`/courses/${courseId}`),
      api.get(`/chapters?courseId=${courseId}`),
      api.get(`/users/${courseId}`)
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