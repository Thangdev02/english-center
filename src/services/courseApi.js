import api from "./api";

export const courseApi = {
  // Course
  getAllCourses: (params) => api.get("/courses", { params }),
  getCourse: (id) => api.get(`/courses/${id}`),
  createCourse: (courseData) => {
    // If courseData is FormData, set proper headers
    if (courseData instanceof FormData) {
      return api.post("/courses", courseData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }
    return api.post("/courses", courseData);
  },
  updateCourse: (id, courseData) => {
    // If courseData is FormData, set proper headers
    if (courseData instanceof FormData) {
      return api.patch(`/courses/${id}`, courseData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }
    return api.patch(`/courses/${id}`, courseData);
  },
  deleteCourse: (id) => api.delete(`/courses/${id}`),

  // Chapter
  getChapters: (params) => api.get(`/chapters`, { params }),
  getChapterById: (id) => api.get(`/chapters/${id}`),
  addMoreChapter: (courseId, chapterData) => {
    return api.post(`/courses/${courseId}/chapters`, chapterData);
  },
  updateChapter: (id, chapterData) => {
    if (chapterData instanceof FormData) {
      return api.patch(`/chapters/${id}`, chapterData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }
    return api.patch(`/chapters/${id}`, chapterData);
  },
  deleteChapter: (id) => api.delete(`/chapters/${id}`),

  // Lesson
  getLessons: (params) => api.get(`/lessons`, { params }),
  getLesson: (id) => api.get(`/lessons/${id}`),
  addMoreLesson: (chapterId, lessonData) => {
    if (lessonData instanceof FormData) {
      return api.post(`/chapters/${chapterId}/lessons`, lessonData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }
    return api.post(`/chapters/${chapterId}/lessons`, lessonData);
  },
  updateLesson: (id, lessonData) => {
    if (lessonData instanceof FormData) {
      return api.patch(`/lessons/${id}`, lessonData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }
    return api.patch(`/lessons/${id}`, lessonData);
  },
  deleteLesson: (id) => api.delete(`/lessons/${id}`),
  deleteLessonDocument: (id) => api.delete(`/lesson-documents/${id}`),
  addLessonDocument: (lessonId, documentData) => {
    if (documentData instanceof FormData) {
      return api.post(`/lessons/${lessonId}/lesson-documents`, documentData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }
    return api.post(`/lessons/${lessonId}/lesson-documents`, documentData);
  },

  //  join khoa
  enrollCourse: (courseId) => api.post(`/courses/${courseId}/student-courses`),

  //xem cai khoa cua minh
  getMyCourse: (params) => api.get(`/student-courses`, { params }),

  getEnrollmentByCourse: (userId, courseId) => {
    return api.get(`/enrollments?userId=${userId}&courseId=${courseId}`);
  },

  getEnrollmentProgress: (courseId, userId) =>
    api.get(`/enrollments?userId=${userId}&courseId=${courseId}`),
  updateProgress: (enrollmentId, progress) =>
    api.patch(`/enrollments/${enrollmentId}`, progress),

  getTeacherCourses: () => api.get(`/courses`),

  reviewCourse: (courseId, reviewData) =>
    api.post(`/courses/${courseId}/reviews`, reviewData),
  getCourseReviews: (params) => api.get(`/reviews`, { params }),
};

export const courseService = {
  getCourseWithDetails: async (courseId) => {
    const [course, chapters, teacher] = await Promise.all([
      api.get(`/courses/${courseId}`),
      api.get(`/chapters?courseId=${courseId}`),
      api.get(`/users/${courseId}`),
    ]);

    return {
      ...course.data,
      chapters: chapters.data,
      teacher: teacher.data,
    };
  },

  getChapterWithLessons: async (chapterId) => {
    const [chapter, lessons] = await Promise.all([
      api.get(`/chapters/${chapterId}`),
      api.get(`/lessons?chapterId=${chapterId}`),
    ]);

    return {
      ...chapter.data,
      lessons: lessons.data,
    };
  },
};
