import api from './api';

export const examApi = {
  // Exam management
  getAllExams: (teacherId) => api.get(`/exams?createdBy=${teacherId}`),
  getExam: (id) => {
    console.log('🔍 Fetching exam with ID:', id);
    return api.get(`/exams/${id}`);
  },
  createExam: (examData) => api.post('/exams', examData),
  updateExam: (id, examData) => api.patch(`/exams/${id}`, examData),
  deleteExam: (id) => api.delete(`/exams/${id}`),
  
  // Exam questions
  getExamQuestions: (examId) => {
    console.log('🔍 Fetching questions for exam:', examId);
    return api.get(`/examQuestions?examId=${examId}`);
  },
  createQuestion: (questionData) => api.post('/examQuestions', questionData),
  updateQuestion: (id, questionData) => api.patch(`/examQuestions/${id}`, questionData),
  deleteQuestion: (id) => api.delete(`/examQuestions/${id}`),
  
  // Class exams
  getClassExams: (classId) => api.get(`/classExams?classId=${classId}`),
  assignExamToClass: (classId, examId, teacherId, dueDate) => api.post('/classExams', {
    classId,
    examId,
    assignedBy: teacherId,
    assignedAt: new Date().toISOString(),
    dueDate,
    isActive: true
  }),
  removeExamFromClass: (id) => api.delete(`/classExams/${id}`),
  
  // Exam results
  getExamResults: (examId) => api.get(`/examResults?examId=${examId}`),
  getMyExamResults: (userId) => api.get(`/examResults?userId=${userId}`),
  submitExam: (resultData) => api.post('/examResults', resultData),
  getStudentExamResult: (examId, userId) => api.get(`/examResults?examId=${examId}&userId=${userId}`)
};

export const examService = {
    getExamWithDetails: async (examId) => {
        try {
          
          const [examResponse, questionsResponse] = await Promise.all([
            examApi.getExam(examId),
            examApi.getExamQuestions(examId)
          ]);
          
          
          if (!examResponse.data) {
            throw new Error('Exam not found');
          }
          
          const result = {
            ...examResponse.data,
            questions: questionsResponse.data || []
          };
          
          
          return result;
          
        } catch (error) {
          throw error;
        }
      },
  
  getClassWithExams: async (classId) => {
    const [classExams, classData] = await Promise.all([
      examApi.getClassExams(classId),
      api.get(`/forumClasses/${classId}`)
    ]);
    
    const examsWithDetails = await Promise.all(
      classExams.data.map(async (classExam) => {
        const examResponse = await examApi.getExam(classExam.examId);
        return {
          ...classExam,
          exam: examResponse.data
        };
      })
    );
    
    return {
      ...classData.data,
      exams: examsWithDetails
    };
  },
  
  getExamResultWithDetails: async (resultId) => {
    const [result, exam, user] = await Promise.all([
      api.get(`/examResults/${resultId}`),
      api.get(`/exams/${resultId}`),
      api.get(`/users/${resultId}`)
    ]);
    
    return {
      ...result.data,
      exam: exam.data,
      user: user.data
    };
  }
};