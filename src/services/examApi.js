import api from "./api";

// =================== EXAM API ===================
export const examApi = {
  // Exam management
  getAllExams: (params) => api.get(`/exams`, { params }),
  getExam: (id) => api.get(`/exams/${id}`),
  createExam: (examData) => api.post(`/exams`, examData),
  updateExam: (id, examData) => api.patch(`/exams/${id}`, examData),
  addMoreQuestions: (id, questionData) =>
    api.post(`/exams/${id}/exam-questions`, questionData),
  removeExamQuestions: (id) => api.delete(`/exam-questions/${id}`),
  deleteExam: (id) => api.delete(`/exams/${id}`),

  // Exam questions
  getAllQuestions: (params) => api.get(`/questions`, { params }),
  getQuestion: (id) => api.get(`/questions/${id}`),
  getExamQuestions: (examId) => api.get(`/examQuestions?examId=${examId}`),
  createQuestion: (questionData) => api.post(`/questions`, questionData),
  updateQuestion: (id, questionData) =>
    api.patch(`/questions/${id}`, questionData),
  deleteQuestion: (id) => api.delete(`/questions/${id}`),

  // Class exams
  getClassExams: (id) => api.get(`/forums/${id}/forum-exams`),
  assignExamToClass: (forumId, examData) =>
    api.post(`/forums/${forumId}/forum-exams`, examData),
  removeExamFromClass: (id) => api.delete(`/forum-exams/${id}`),

  // Exam results
  getExamResults: (examId) => api.get(`/examResults?examId=${examId}`),
  getMyExamResults: (userId) => api.get(`/examResults?userId=${userId}`),
  submitExam: (resultData) => api.post(`/examResults`, resultData),
  getStudentExamResult: (examId, userId) =>
    api.get(`/examResults?examId=${examId}&userId=${userId}`),

  // Exam doings (history)
  takeExam: (forumExamId) =>
    api.post(`/forum-exams/${forumExamId}/exam-doings`),
  getExamDoings: (examDoingId) => api.get(`/exam-doings/${examDoingId}`),
  updateExamDoing: (examDoingId, doingData) =>
    api.patch(`/exam-doings/${examDoingId}`, doingData),
};

// =================== EXAM SERVICE ===================
export const examService = {
  getExamWithDetails: async (examId) => {
    try {
      const [examResponse, questionsResponse] = await Promise.all([
        examApi.getExam(examId),
        examApi.getExamQuestions(examId),
      ]);

      if (!examResponse.data) throw new Error("Exam not found");

      return {
        ...examResponse.data,
        questions: questionsResponse.data || [],
      };
    } catch (error) {
      console.error("❌ Error fetching exam with details:", error);
      throw error;
    }
  },

  getClassWithExams: async (classId) => {
    const [classExams, classData] = await Promise.all([
      examApi.getClassExams(classId),
      api.get(`/forumClasses/${classId}`),
    ]);

    const examsWithDetails = await Promise.all(
      classExams.data.map(async (classExam) => {
        const examResponse = await examApi.getExam(classExam.examId);
        return {
          ...classExam,
          exam: examResponse.data,
        };
      })
    );

    return {
      ...classData.data,
      exams: examsWithDetails,
    };
  },

  getExamResultWithDetails: async (resultId) => {
    const [result, exam, user] = await Promise.all([
      api.get(`/examResults/${resultId}`),
      api.get(`/exams/${resultId}`),
      api.get(`/users/${resultId}`),
    ]);

    return {
      ...result.data,
      exam: exam.data,
      user: user.data,
    };
  },
};
