// import {
//   CheckCircleOutlined,
//   ClockCircleOutlined,
//   FileTextOutlined,
//   WarningOutlined,
// } from "@ant-design/icons";
// import {
//   Button,
//   Card,
//   Input,
//   message,
//   Modal,
//   Pagination,
//   Progress,
//   Radio,
//   Space,
//   Spin,
//   Tag,
//   Typography,
// } from "antd";
// import { useCallback, useEffect, useRef, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { examApi } from "../services/examApi";

// const { Title, Text, Paragraph } = Typography;
// const { TextArea } = Input;

// const FreeExamTaking = () => {
//   const { id } = useParams(); // exam doing id
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(true);
//   const [examData, setExamData] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [answers, setAnswers] = useState({}); // {questionHistoryId: answerId}
//   const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const autoSaveIntervalRef = useRef(null);
//   const countdownIntervalRef = useRef(null);
//   const lastSavedAnswersRef = useRef({});
//   const pendingAnswersRef = useRef({});
//   const timeRemainingRef = useRef(0);

//   const QUESTIONS_PER_PAGE = 10;

//   // Fetch exam doing data
//   const fetchExamDoing = useCallback(async () => {
//     try {
//       setLoading(true);
//       const response = await examApi.getFreeExamDoings(id);
//       const data = response?.data?.data;

//       if (!data) {
//         message.error("Không tìm thấy bài kiểm tra");
//         navigate(-1);
//         return;
//       }

//       setExamData(data);

//       // Parse duration (TimeOnly format "HH:mm:ss") to seconds
//       if (data.duration) {
//         const [hours, minutes, seconds] = data.duration.split(":").map(Number);
//         setTimeRemaining(hours * 3600 + minutes * 60 + seconds);
//       }

//       // Initialize answers from existing data
//       const initialAnswers = {};
//       data.questionHistories.forEach((qh) => {
//         if (qh.yourAnswer) {
//           // For multiple choice, find the answer ID by matching content
//           if (qh.questionType === 0 && qh.answers) {
//             const matchedAnswer = qh.answers.find(
//               (ans) => ans.content === qh.yourAnswer
//             );
//             if (matchedAnswer) {
//               initialAnswers[qh.id] = matchedAnswer.id;
//             }
//           } else {
//             // For essay questions, store the text directly
//             initialAnswers[qh.id] = qh.yourAnswer;
//           }
//         }
//       });
//       setAnswers(initialAnswers);
//     } catch (err) {
//       console.error("Error fetching exam doing:", err);
//       message.error("Không thể tải bài kiểm tra");
//       navigate(-1);
//     } finally {
//       setLoading(false);
//     }
//   }, [id, navigate]);

//   useEffect(() => {
//     if (id) {
//       fetchExamDoing();
//     }
//   }, [id, fetchExamDoing]);

//   // Format time remaining
//   const formatTime = (seconds) => {
//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
//     const secs = seconds % 60;
//     return `${hours.toString().padStart(2, "0")}:${minutes
//       .toString()
//       .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
//   };

//   // Auto-save progress
//   const handleAutoSave = useCallback(async () => {
//     if (!examData || examData.status !== 0) return;

//     try {
//       const currentTime = timeRemainingRef.current;
//       console.log(
//         "Running auto-save at:",
//         new Date().toLocaleTimeString(),
//         "Time remaining:",
//         formatTime(currentTime)
//       );

//       // For essay exams (type 1), save the answer with questionHistoryId
//       if (examData.examType === 1) {
//         const essayQuestion = examData.questionHistories?.[0];
//         if (essayQuestion) {
//           const currentAnswer =
//             pendingAnswersRef.current[essayQuestion.id] ??
//             answers[essayQuestion.id];
//           const lastSavedAnswer = lastSavedAnswersRef.current[essayQuestion.id];

//           if (
//             currentAnswer !== undefined &&
//             currentAnswer !== lastSavedAnswer
//           ) {
//             console.log(`Saving essay answer for question ${essayQuestion.id}`);
//             await examApi.updateFreeExamDoing(id, {
//               questionHistoryId: essayQuestion.id,
//               yourAnswer: currentAnswer,
//               duration: formatTime(currentTime),
//               status: 0,
//             });
//             lastSavedAnswersRef.current[essayQuestion.id] = currentAnswer;
//           } else {
//             // Update duration only (avoid sending yourAnswer which may overwrite with empty)
//             await examApi.updateFreeExamDoing(id, {
//               duration: formatTime(currentTime),
//               status: 0,
//             });
//           }
//         }
//       } else {
//         // For multiple choice exams, save essay answers that have been modified
//         const essayQuestions =
//           examData.questionHistories?.filter((qh) => qh.questionType === 1) ||
//           [];

//         for (const qh of essayQuestions) {
//           const currentAnswer =
//             pendingAnswersRef.current[qh.id] ?? answers[qh.id];
//           const lastSavedAnswer = lastSavedAnswersRef.current[qh.id];

//           if (
//             currentAnswer !== undefined &&
//             currentAnswer !== lastSavedAnswer
//           ) {
//             console.log(`Saving essay answer for question ${qh.id}`);
//             await examApi.updateFreeExamDoing(id, {
//               questionHistoryId: qh.id,
//               yourAnswer: currentAnswer,
//               duration: formatTime(currentTime),
//               status: 0,
//             });
//             lastSavedAnswersRef.current[qh.id] = currentAnswer;
//           }
//         }

//         // Update duration
//         await examApi.updateFreeExamDoing(id, {
//           duration: formatTime(currentTime),
//           status: 0,
//         });
//       }

//       console.log(
//         "Auto-save completed successfully with duration:",
//         formatTime(currentTime)
//       );
//     } catch (err) {
//       console.error("Auto-save error:", err);
//     }
//   }, [id, examData, answers]);

//   // Submit exam
//   const submitExam = useCallback(async () => {
//     try {
//       setIsSubmitting(true);

//       const currentTime = timeRemainingRef.current;

//       // For essay exams (type 1), submit with questionHistoryId and yourAnswer
//       if (examData.examType === 1) {
//         const essayQuestion = examData.questionHistories?.[0];
//         if (essayQuestion) {
//           const answerToSubmit =
//             pendingAnswersRef.current[essayQuestion.id] ??
//             answers[essayQuestion.id] ??
//             "";

//           await examApi.updateFreeExamDoing(id, {
//             questionHistoryId: essayQuestion.id,
//             yourAnswer: answerToSubmit,
//             duration: formatTime(currentTime),
//             status: 1, // Đã nộp
//           });
//         }
//       } else {
//         // For multiple choice exams, save all essay answers before submitting
//         const essayQuestions = examData.questionHistories.filter(
//           (qh) => qh.questionType === 1
//         );

//         for (const qh of essayQuestions) {
//           const answerToSave =
//             pendingAnswersRef.current[qh.id] ?? answers[qh.id];
//           if (answerToSave !== undefined && answerToSave !== "") {
//             await examApi.updateFreeExamDoing(id, {
//               questionHistoryId: qh.id,
//               yourAnswer: answerToSave,
//               duration: formatTime(currentTime),
//               status: 0,
//             });
//           }
//         }

//         // Submit the exam
//         await examApi.updateFreeExamDoing(id, {
//           duration: formatTime(currentTime),
//           status: 1, // Đã nộp
//         });
//       }

//       // Clear intervals
//       if (autoSaveIntervalRef.current) {
//         clearInterval(autoSaveIntervalRef.current);
//       }
//       if (countdownIntervalRef.current) {
//         clearInterval(countdownIntervalRef.current);
//       }

//       message.success("Nộp bài thành công!");

//       // Reload the page to show results
//       await fetchExamDoing();
//     } catch (err) {
//       console.error("Error submitting exam:", err);
//       message.error("Không thể nộp bài. Vui lòng thử lại.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   }, [id, examData, answers, fetchExamDoing]);

//   const handleSubmitExam = useCallback(
//     async (isAutoSubmit = false) => {
//       if (isSubmitting) return;

//       const unansweredCount =
//         examData.questionHistories.length - Object.keys(answers).length;

//       if (!isAutoSubmit && unansweredCount > 0) {
//         Modal.confirm({
//           title: "Xác nhận nộp bài",
//           content: `Bạn còn ${unansweredCount} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài?`,
//           okText: "Nộp bài",
//           cancelText: "Tiếp tục làm",
//           onOk: async () => {
//             await submitExam();
//           },
//         });
//       } else {
//         await submitExam();
//       }
//     },
//     [isSubmitting, examData, answers, submitExam]
//   );

//   // Update timeRemainingRef whenever timeRemaining changes
//   useEffect(() => {
//     timeRemainingRef.current = timeRemaining;
//   }, [timeRemaining]);

//   // Countdown timer (only for in-progress exams)
//   useEffect(() => {
//     if (timeRemaining > 0 && examData?.status === 0) {
//       countdownIntervalRef.current = setInterval(() => {
//         setTimeRemaining((prev) => {
//           const newTime = prev - 1;
//           timeRemainingRef.current = newTime;
//           if (newTime <= 0) {
//             handleSubmitExam(true); // Auto submit when time's up
//             return 0;
//           }
//           return newTime;
//         });
//       }, 1000);

//       return () => {
//         if (countdownIntervalRef.current) {
//           clearInterval(countdownIntervalRef.current);
//         }
//       };
//     }
//   }, [timeRemaining, examData?.status, handleSubmitExam]);

//   // Auto-save every 10 seconds (only for in-progress exams)
//   useEffect(() => {
//     console.log(
//       "Setting up auto-save interval, exam status:",
//       examData?.status
//     );

//     if (examData?.status === 0) {
//       // Set up new interval
//       autoSaveIntervalRef.current = setInterval(() => {
//         console.log("Auto-save interval triggered");
//         handleAutoSave();
//       }, 10000);

//       console.log(
//         "Auto-save interval created with ID:",
//         autoSaveIntervalRef.current
//       );

//       return () => {
//         console.log("Cleaning up auto-save interval");
//         if (autoSaveIntervalRef.current) {
//           clearInterval(autoSaveIntervalRef.current);
//           autoSaveIntervalRef.current = null;
//         }
//       };
//     } else {
//       console.log("Exam status is not 0, not setting up auto-save");
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [examData?.status]); // Only re-run when exam status changes

//   // Handle answer selection
//   const handleAnswerChange = async (
//     questionHistoryId,
//     answerId,
//     answerContent,
//     questionType
//   ) => {
//     // Keep pending ref in sync (store the content for saving)
//     pendingAnswersRef.current = {
//       ...pendingAnswersRef.current,
//       [questionHistoryId]: answerContent,
//     };

//     setAnswers((prev) => ({
//       ...prev,
//       [questionHistoryId]: answerId,
//     }));

//     // For multiple choice, immediately save the answer
//     if (questionType === 0) {
//       try {
//         await examApi.updateFreeExamDoing(id, {
//           questionHistoryId,
//           yourAnswer: answerContent, // Send answer content, not ID
//           duration: formatTime(timeRemainingRef.current),
//           status: 0,
//         });
//       } catch (err) {
//         console.error("Error saving answer:", err);
//       }
//     }
//   };

//   // Handle essay answer change
//   const handleEssayChange = (questionHistoryId, value) => {
//     // Keep a synchronous ref of the latest typed value to avoid races
//     pendingAnswersRef.current = {
//       ...pendingAnswersRef.current,
//       [questionHistoryId]: value,
//     };
//     setAnswers((prev) => ({
//       ...prev,
//       [questionHistoryId]: value,
//     }));
//   };

//   // Get current page questions
//   const getCurrentPageQuestions = () => {
//     if (!examData?.questionHistories) return [];
//     const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
//     const endIndex = startIndex + QUESTIONS_PER_PAGE;
//     return examData.questionHistories.slice(startIndex, endIndex);
//   };

//   // Calculate progress
//   const getProgress = () => {
//     const total = examData?.questionHistories?.length || 0;
//     const answered = Object.keys(answers).length;
//     return total > 0 ? Math.round((answered / total) * 100) : 0;
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <Spin size="large" />
//       </div>
//     );
//   }

//   if (!examData) {
//     return null;
//   }

//   const currentQuestions = getCurrentPageQuestions();
//   const progress = getProgress();
//   const isTimeRunningOut = timeRemaining < 300; // Less than 5 minutes

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="container mx-auto px-4 max-w-6xl">
//         {/* Back */}
//         {examData.status === 1 && (
//           <Button
//             type="link"
//             onClick={() => navigate(-1)}
//             className="mb-4 text-blue-600 hover:text-blue-700"
//             icon={
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="16"
//                 height="16"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <path d="M19 12H5M12 19l-7-7 7-7" />
//               </svg>
//             }
//           >
//             Quay lại
//           </Button>
//         )}

//         {/* Header */}
//         <Card className="mb-6 shadow-md border border-gray-200">
//           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//             <div className="flex-1">
//               <Title level={3} className="!mb-2 text-blue-700">
//                 {examData.examName}
//               </Title>

//               <Space wrap>
//                 <Tag
//                   icon={<FileTextOutlined />}
//                   color={examData.examType === 0 ? "blue" : "purple"}
//                 >
//                   {examData.examType === 0 ? "Trắc nghiệm" : "Tự luận"}
//                 </Tag>

//                 <Tag
//                   icon={<CheckCircleOutlined />}
//                   color={examData.status === 0 ? "orange" : "green"}
//                 >
//                   {examData.status === 0 ? "Đang làm" : "Đã nộp"}
//                 </Tag>

//                 <Text className="text-gray-600">
//                   {examData.quantity} câu hỏi
//                 </Text>
//               </Space>
//             </div>

//             {/* Clock */}
//             <div className="flex flex-col items-end gap-2">
//               {examData.status === 0 ? (
//                 <>
//                   <div
//                     className={`flex items-center gap-2 text-lg font-semibold ${
//                       isTimeRunningOut ? "text-red-500" : "text-blue-600"
//                     }`}
//                   >
//                     <ClockCircleOutlined
//                       className={isTimeRunningOut ? "animate-pulse" : ""}
//                     />
//                     <span>{formatTime(timeRemaining)}</span>
//                   </div>

//                   {isTimeRunningOut && (
//                     <Tag icon={<WarningOutlined />} color="error">
//                       Sắp hết giờ!
//                     </Tag>
//                   )}
//                 </>
//               ) : (
//                 <div className="text-right">
//                   <div className="text-2xl font-bold text-blue-600 mb-1">
//                     {examData.grade || 0} điểm
//                   </div>
//                   {examData.examType !== 1 && (
//                     <div className="text-sm text-gray-600">
//                       {examData.totalCorrectAnswers}/{examData.quantity} câu
//                       đúng
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Progress */}
//           {examData.status === 0 && (
//             <div className="mt-4">
//               <Text className="text-sm text-gray-600 mb-2 block">
//                 Tiến độ: {Object.keys(answers).length}/{examData.quantity} câu
//               </Text>

//               <Progress
//                 percent={progress}
//                 status={progress === 100 ? "success" : "active"}
//                 strokeColor={{
//                   "0%": "#3B82F6",
//                   "100%": "#2563EB",
//                 }}
//               />
//             </div>
//           )}
//         </Card>

//         {/* Questions */}
//         <Card className="mb-6 shadow-md border border-gray-200">
//           <Space direction="vertical" size="large" className="w-full">
//             {currentQuestions.map((question, index) => {
//               const questionNumber =
//                 (currentPage - 1) * QUESTIONS_PER_PAGE + index + 1;
//               const isAnswered = !!answers[question.id];

//               return (
//                 <div
//                   key={question.id}
//                   className={`p-4 rounded-xl border transition-all ${
//                     isAnswered
//                       ? "border-blue-300 bg-blue-50"
//                       : "border-gray-200 bg-white hover:border-blue-300"
//                   }`}
//                 >
//                   <div className="flex items-start gap-3 mb-3">
//                     <Tag
//                       color={isAnswered ? "blue" : "default"}
//                       className="text-base px-3 py-1 rounded"
//                     >
//                       Câu {questionNumber}
//                     </Tag>

//                     <Paragraph className="flex-1 !mb-0 text-base font-medium text-gray-700">
//                       {question.questionContent}
//                     </Paragraph>
//                   </div>

//                   {/* MP3 Audio Player */}
//                   {question.questionMp3 && (
//                     <div className="mb-4">
//                       <audio controls className="w-full">
//                         <source src={question.questionMp3} type="audio/mpeg" />
//                         Trình duyệt không hỗ trợ phát audio.
//                       </audio>
//                     </div>
//                   )}

//                   {/* Multiple Choice */}
//                   {question.questionType === 0 ? (
//                     <Radio.Group
//                       value={answers[question.id]}
//                       disabled={examData.status === 1}
//                       onChange={(e) => {
//                         const selectedAnswer = question.answers.find(
//                           (ans) => ans.id === e.target.value
//                         );
//                         handleAnswerChange(
//                           question.id,
//                           e.target.value,
//                           selectedAnswer?.content,
//                           0
//                         );
//                       }}
//                       className="w-full"
//                     >
//                       <Space direction="vertical" className="w-full">
//                         {question.answers?.map((answer) => {
//                           const isCorrect = answer.isCorrect === true;
//                           const isWrong = answer.isCorrect === false;
//                           const isSelected = answers[question.id] === answer.id;

//                           return (
//                             <Radio
//                               key={answer.id}
//                               value={answer.id}
//                               className={`text-base p-3 rounded-lg w-full transition ${
//                                 examData.status === 1
//                                   ? isCorrect
//                                     ? "!bg-green-100 !border-green-500"
//                                     : isWrong && isSelected
//                                     ? "!bg-red-100 !border-red-500"
//                                     : ""
//                                   : "hover:bg-blue-50"
//                               }`}
//                             >
//                               <div className="flex items-center justify-between w-full">
//                                 <span>{answer.content}</span>

//                                 {examData.status === 1 && isCorrect && (
//                                   <Tag color="success">Đúng</Tag>
//                                 )}
//                                 {examData.status === 1 &&
//                                   isWrong &&
//                                   isSelected && <Tag color="error">Sai</Tag>}
//                               </div>
//                             </Radio>
//                           );
//                         })}
//                       </Space>
//                     </Radio.Group>
//                   ) : (
//                     <TextArea
//                       rows={5}
//                       className="text-base"
//                       disabled={examData.status === 1}
//                       placeholder="Nhập câu trả lời..."
//                       value={answers[question.id] || ""}
//                       onChange={(e) =>
//                         handleEssayChange(question.id, e.target.value)
//                       }
//                     />
//                   )}
//                 </div>
//               );
//             })}
//           </Space>

//           {/* Pagination */}
//           <div className="mt-6 flex justify-center">
//             <Pagination
//               current={currentPage}
//               total={examData.questionHistories.length}
//               pageSize={QUESTIONS_PER_PAGE}
//               showSizeChanger={false}
//               onChange={setCurrentPage}
//             />
//           </div>
//         </Card>

//         {/* Navigator */}
//         <Card
//           className="mb-6 shadow-md border border-gray-200"
//           title={<span className="text-blue-700 font-semibold">Câu hỏi</span>}
//         >
//           <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
//             {examData.questionHistories.map((q, index) => {
//               const num = index + 1;
//               const isAnswered = !!answers[q.id];
//               const isCurrent =
//                 Math.ceil(num / QUESTIONS_PER_PAGE) === currentPage;

//               return (
//                 <Button
//                   key={q.id}
//                   type={isCurrent ? "primary" : "default"}
//                   className={`rounded-lg ${
//                     isAnswered
//                       ? "!bg-blue-500 !border-blue-500 hover:!bg-blue-600"
//                       : ""
//                   }`}
//                   onClick={() =>
//                     setCurrentPage(Math.ceil(num / QUESTIONS_PER_PAGE))
//                   }
//                 >
//                   {num}
//                 </Button>
//               );
//             })}
//           </div>

//           <div className="flex gap-4 mt-4 text-sm">
//             <Space>
//               <div className="w-4 h-4 bg-blue-500 rounded"></div>
//               <Text>Đã trả lời</Text>
//             </Space>
//             <Space>
//               <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
//               <Text>Chưa trả lời</Text>
//             </Space>
//           </div>
//         </Card>

//         {/* Submit */}
//         {examData.status === 0 && (
//           <Card className="shadow-md border border-gray-200">
//             <div className="flex justify-between items-center">
//               <Text type="secondary">
//                 Đã trả lời: {Object.keys(answers).length}/{examData.quantity}{" "}
//                 câu
//               </Text>

//               <Button
//                 type="primary"
//                 danger
//                 size="large"
//                 loading={isSubmitting}
//                 className="bg-red-600 hover:bg-red-700"
//                 onClick={() => handleSubmitExam(false)}
//               >
//                 Nộp bài
//               </Button>
//             </div>
//           </Card>
//         )}

//         {/* Summary */}
//         {examData.status === 1 && (
//           <Card className="shadow-md border border-gray-200">
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               <div className="text-center">
//                 <div className="text-gray-500 text-sm">Điểm</div>
//                 <div className="text-2xl font-bold text-blue-600">
//                   {examData.grade || 0}
//                 </div>
//               </div>

//               {examData.examType !== 1 && (
//                 <div className="text-center">
//                   <div className="text-gray-500 text-sm">Câu đúng</div>
//                   <div className="text-2xl font-bold text-green-600">
//                     {examData.totalCorrectAnswers}/{examData.quantity}
//                   </div>
//                 </div>
//               )}

//               <div className="text-center">
//                 <div className="text-gray-500 text-sm">Đã trả lời</div>
//                 <div className="text-2xl font-bold text-blue-500">
//                   {examData.answeredQuestions}
//                 </div>
//               </div>

//               <div className="text-center">
//                 <div className="text-gray-500 text-sm">Thời gian</div>
//                 <div className="text-2xl font-semibold text-purple-600">
//                   {formatTime(timeRemaining)}
//                 </div>
//               </div>
//             </div>
//           </Card>
//         )}

//         {/* Teacher feedback for essay exams (Tự luận) */}
//         {examData.status === 1 && examData.examType === 1 && (
//           <Card
//             className="shadow-md border border-gray-200 mt-6"
//             title="Phản hồi từ giáo viên"
//           >
//             <div className="prose max-w-none text-gray-700">
//               {examData.feedback ? (
//                 typeof examData.feedback === "string" ? (
//                   <p>{examData.feedback}</p>
//                 ) : Array.isArray(examData.feedback) ? (
//                   examData.feedback.map((fb, idx) => (
//                     <div key={idx} className="mb-4">
//                       {fb.title && (
//                         <h4 className="font-semibold">{fb.title}</h4>
//                       )}
//                       <p>{fb.content ?? fb}</p>
//                     </div>
//                   ))
//                 ) : (
//                   <>
//                     {examData.feedback.title && (
//                       <h4 className="font-semibold">
//                         {examData.feedback.title}
//                       </h4>
//                     )}
//                     <p>
//                       {examData.feedback.content ??
//                         JSON.stringify(examData.feedback)}
//                     </p>
//                   </>
//                 )
//               ) : (
//                 <p className="text-gray-500">Chưa có phản hồi.</p>
//               )}
//             </div>
//           </Card>
//         )}
//       </div>
//     </div>
//   );
// };

// export default FreeExamTaking;
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Input,
  message,
  Modal,
  Pagination,
  Progress,
  Radio,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { examApi } from "../services/examApi";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const FreeExamTaking = () => {
  const { id } = useParams(); // exam doing id
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [examData, setExamData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState({}); // {questionHistoryId: answerId}
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmittingModal, setShowSubmittingModal] = useState(false); // THÊM MỚI: popup loading khi nộp

  const autoSaveIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const lastSavedAnswersRef = useRef({});
  const pendingAnswersRef = useRef({});
  const timeRemainingRef = useRef(0);

  const QUESTIONS_PER_PAGE = 10;

  // Fetch exam doing data
  const fetchExamDoing = useCallback(async () => {
    try {
      setLoading(true);
      const response = await examApi.getFreeExamDoings(id);
      const data = response?.data?.data;

      if (!data) {
        message.error("Không tìm thấy bài kiểm tra");
        navigate(-1);
        return;
      }

      setExamData(data);

      // Parse duration (TimeOnly format "HH:mm:ss") to seconds
      if (data.duration) {
        const [hours, minutes, seconds] = data.duration.split(":").map(Number);
        setTimeRemaining(hours * 3600 + minutes * 60 + seconds);
      }

      // Initialize answers from existing data
      const initialAnswers = {};
      data.questionHistories.forEach((qh) => {
        if (qh.yourAnswer) {
          // For multiple choice, find the answer ID by matching content
          if (qh.questionType === 0 && qh.answers) {
            const matchedAnswer = qh.answers.find(
              (ans) => ans.content === qh.yourAnswer
            );
            if (matchedAnswer) {
              initialAnswers[qh.id] = matchedAnswer.id;
            }
          } else {
            // For essay questions, store the text directly
            initialAnswers[qh.id] = qh.yourAnswer;
          }
        }
      });
      setAnswers(initialAnswers);
    } catch (err) {
      console.error("Error fetching exam doing:", err);
      message.error("Không thể tải bài kiểm tra");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      fetchExamDoing();
    }
  }, [id, fetchExamDoing]);

  // Format time remaining
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Auto-save progress
  const handleAutoSave = useCallback(async () => {
    if (!examData || examData.status !== 0) return;

    try {
      const currentTime = timeRemainingRef.current;
      console.log(
        "Running auto-save at:",
        new Date().toLocaleTimeString(),
        "Time remaining:",
        formatTime(currentTime)
      );

      // For essay exams (type 1), save the answer with questionHistoryId
      if (examData.examType === 1) {
        const essayQuestion = examData.questionHistories?.[0];
        if (essayQuestion) {
          const currentAnswer =
            pendingAnswersRef.current[essayQuestion.id] ??
            answers[essayQuestion.id];
          const lastSavedAnswer = lastSavedAnswersRef.current[essayQuestion.id];

          if (
            currentAnswer !== undefined &&
            currentAnswer !== lastSavedAnswer
          ) {
            console.log(`Saving essay answer for question ${essayQuestion.id}`);
            await examApi.updateFreeExamDoing(id, {
              questionHistoryId: essayQuestion.id,
              yourAnswer: currentAnswer,
              duration: formatTime(currentTime),
              status: 0,
            });
            lastSavedAnswersRef.current[essayQuestion.id] = currentAnswer;
          } else {
            // Update duration only (avoid sending yourAnswer which may overwrite with empty)
            await examApi.updateFreeExamDoing(id, {
              duration: formatTime(currentTime),
              status: 0,
            });
          }
        }
      } else {
        // For multiple choice exams, save essay answers that have been modified
        const essayQuestions =
          examData.questionHistories?.filter((qh) => qh.questionType === 1) ||
          [];

        for (const qh of essayQuestions) {
          const currentAnswer =
            pendingAnswersRef.current[qh.id] ?? answers[qh.id];
          const lastSavedAnswer = lastSavedAnswersRef.current[qh.id];

          if (
            currentAnswer !== undefined &&
            currentAnswer !== lastSavedAnswer
          ) {
            console.log(`Saving essay answer for question ${qh.id}`);
            await examApi.updateFreeExamDoing(id, {
              questionHistoryId: qh.id,
              yourAnswer: currentAnswer,
              duration: formatTime(currentTime),
              status: 0,
            });
            lastSavedAnswersRef.current[qh.id] = currentAnswer;
          }
        }

        // Update duration
        await examApi.updateFreeExamDoing(id, {
          duration: formatTime(currentTime),
          status: 0,
        });
      }

      console.log(
        "Auto-save completed successfully with duration:",
        formatTime(currentTime)
      );
    } catch (err) {
      console.error("Auto-save error:", err);
    }
  }, [id, examData, answers]);

  // Submit exam
  const submitExam = useCallback(async () => {
    try {
      setIsSubmitting(true);
      setShowSubmittingModal(true); // HIỆN POPUP LOADING NGAY KHI BẮT ĐẦU NỘP

      const currentTime = timeRemainingRef.current;

      // For essay exams (type 1), submit with questionHistoryId and yourAnswer
      if (examData.examType === 1) {
        const essayQuestion = examData.questionHistories?.[0];
        if (essayQuestion) {
          const answerToSubmit =
            pendingAnswersRef.current[essayQuestion.id] ??
            answers[essayQuestion.id] ??
            "";

          await examApi.updateFreeExamDoing(id, {
            questionHistoryId: essayQuestion.id,
            yourAnswer: answerToSubmit,
            duration: formatTime(currentTime),
            status: 1, // Đã nộp
          });
        }
      } else {
        // For multiple choice exams, save all essay answers before submitting
        const essayQuestions = examData.questionHistories.filter(
          (qh) => qh.questionType === 1
        );

        for (const qh of essayQuestions) {
          const answerToSave =
            pendingAnswersRef.current[qh.id] ?? answers[qh.id];
          if (answerToSave !== undefined && answerToSave !== "") {
            await examApi.updateFreeExamDoing(id, {
              questionHistoryId: qh.id,
              yourAnswer: answerToSave,
              duration: formatTime(currentTime),
              status: 0,
            });
          }
        }

        // Submit the exam
        await examApi.updateFreeExamDoing(id, {
          duration: formatTime(currentTime),
          status: 1, // Đã nộp
        });
      }

      // Clear intervals
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }

      message.success("Nộp bài thành công!");

      // Reload the page to show results
      await fetchExamDoing();
    } catch (err) {
      console.error("Error submitting exam:", err);
      message.error("Không thể nộp bài. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
      setShowSubmittingModal(false); // TẮT POPUP SAU KHI XONG
    }
  }, [id, examData, answers, fetchExamDoing]);

  const handleSubmitExam = useCallback(
    async (isAutoSubmit = false) => {
      if (isSubmitting) return;

      const unansweredCount =
        examData.questionHistories.length - Object.keys(answers).length;

      if (!isAutoSubmit && unansweredCount > 0) {
        Modal.confirm({
          title: "Xác nhận nộp bài",
          content: `Bạn còn ${unansweredCount} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài?`,
          okText: "Nộp bài",
          cancelText: "Tiếp tục làm",
          onOk: async () => {
            await submitExam();
          },
        });
      } else {
        await submitExam();
      }
    },
    [isSubmitting, examData, answers, submitExam]
  );

  // Update timeRemainingRef whenever timeRemaining changes
  useEffect(() => {
    timeRemainingRef.current = timeRemaining;
  }, [timeRemaining]);

  // Countdown timer (only for in-progress exams)
  useEffect(() => {
    if (timeRemaining > 0 && examData?.status === 0) {
      countdownIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1;
          timeRemainingRef.current = newTime;
          if (newTime <= 0) {
            handleSubmitExam(true); // Auto submit when time's up
            return 0;
          }
          return newTime;
        });
      }, 1000);

      return () => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
      };
    }
  }, [timeRemaining, examData?.status, handleSubmitExam]);

  // Auto-save every 10 seconds (only for in-progress exams)
  useEffect(() => {
    console.log(
      "Setting up auto-save interval, exam status:",
      examData?.status
    );

    if (examData?.status === 0) {
      // Set up new interval
      autoSaveIntervalRef.current = setInterval(() => {
        console.log("Auto-save interval triggered");
        handleAutoSave();
      }, 10000);

      console.log(
        "Auto-save interval created with ID:",
        autoSaveIntervalRef.current
      );

      return () => {
        console.log("Cleaning up auto-save interval");
        if (autoSaveIntervalRef.current) {
          clearInterval(autoSaveIntervalRef.current);
          autoSaveIntervalRef.current = null;
        }
      };
    } else {
      console.log("Exam status is not 0, not setting up auto-save");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examData?.status]); // Only re-run when exam status changes

  // Handle answer selection
  const handleAnswerChange = async (
    questionHistoryId,
    answerId,
    answerContent,
    questionType
  ) => {
    // Keep pending ref in sync (store the content for saving)
    pendingAnswersRef.current = {
      ...pendingAnswersRef.current,
      [questionHistoryId]: answerContent,
    };

    setAnswers((prev) => ({
      ...prev,
      [questionHistoryId]: answerId,
    }));

    // For multiple choice, immediately save the answer
    if (questionType === 0) {
      try {
        await examApi.updateFreeExamDoing(id, {
          questionHistoryId,
          yourAnswer: answerContent, // Send answer content, not ID
          duration: formatTime(timeRemainingRef.current),
          status: 0,
        });
      } catch (err) {
        console.error("Error saving answer:", err);
      }
    }
  };

  // Handle essay answer change
  const handleEssayChange = (questionHistoryId, value) => {
    // Keep a synchronous ref of the latest typed value to avoid races
    pendingAnswersRef.current = {
      ...pendingAnswersRef.current,
      [questionHistoryId]: value,
    };
    setAnswers((prev) => ({
      ...prev,
      [questionHistoryId]: value,
    }));
  };

  // Get current page questions
  const getCurrentPageQuestions = () => {
    if (!examData?.questionHistories) return [];
    const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
    const endIndex = startIndex + QUESTIONS_PER_PAGE;
    return examData.questionHistories.slice(startIndex, endIndex);
  };

  // Calculate progress
  const getProgress = () => {
    const total = examData?.questionHistories?.length || 0;
    const answered = Object.keys(answers).length;
    return total > 0 ? Math.round((answered / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!examData) {
    return null;
  }

  const currentQuestions = getCurrentPageQuestions();
  const progress = getProgress();
  const isTimeRunningOut = timeRemaining < 300; // Less than 5 minutes

  return (
    <>
      {/* POPUP LOADING KHI NỘP BÀI */}
      <Modal
        open={showSubmittingModal}
        footer={null}
        closable={false}
        centered
        width={400}
        bodyStyle={{ padding: "40px 20px", textAlign: "center" }}
      >
        <div className="flex flex-col items-center gap-6">
          {/* Bạn có thể thay src bằng logo Panda thực tế của bạn */}
          <img
            src="/logoRM.png" // Thay bằng link logo Panda thật
            alt="Panda Logo"
            className="w-28 h-28 rounded-full animate-pulse"
          />
          <div>
            <Spin size="large" />
          </div>
          <div className="text-lg font-medium text-gray-700">
            Panda đã nhận bài rồi ạ,
            <br />
            bạn chờ 1 chút nhé
          </div>
        </div>
      </Modal>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Back */}
          {examData.status === 1 && (
            <Button
              type="link"
              onClick={() => navigate(-1)}
              className="mb-4 text-blue-600 hover:text-blue-700"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              }
            >
              Quay lại
            </Button>
          )}

          {/* Header */}
          <Card className="mb-6 shadow-md border border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <Title level={3} className="!mb-2 text-blue-700">
                  {examData.examName}
                </Title>

                <Space wrap>
                  <Tag
                    icon={<FileTextOutlined />}
                    color={examData.examType === 0 ? "blue" : "purple"}
                  >
                    {examData.examType === 0 ? "Trắc nghiệm" : "Tự luận"}
                  </Tag>

                  <Tag
                    icon={<CheckCircleOutlined />}
                    color={examData.status === 0 ? "orange" : "green"}
                  >
                    {examData.status === 0 ? "Đang làm" : "Đã nộp"}
                  </Tag>

                  <Text className="text-gray-600">
                    {examData.quantity} câu hỏi
                  </Text>
                </Space>
              </div>

              {/* Clock */}
              <div className="flex flex-col items-end gap-2">
                {examData.status === 0 ? (
                  <>
                    <div
                      className={`flex items-center gap-2 text-lg font-semibold ${
                        isTimeRunningOut ? "text-red-500" : "text-blue-600"
                      }`}
                    >
                      <ClockCircleOutlined
                        className={isTimeRunningOut ? "animate-pulse" : ""}
                      />
                      <span>{formatTime(timeRemaining)}</span>
                    </div>

                    {isTimeRunningOut && (
                      <Tag icon={<WarningOutlined />} color="error">
                        Sắp hết giờ!
                      </Tag>
                    )}
                  </>
                ) : (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {examData.grade || 0} điểm
                    </div>
                    {examData.examType !== 1 && (
                      <div className="text-sm text-gray-600">
                        {examData.totalCorrectAnswers}/{examData.quantity} câu
                        đúng
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Progress */}
            {examData.status === 0 && (
              <div className="mt-4">
                <Text className="text-sm text-gray-600 mb-2 block">
                  Tiến độ: {Object.keys(answers).length}/{examData.quantity} câu
                </Text>

                <Progress
                  percent={progress}
                  status={progress === 100 ? "success" : "active"}
                  strokeColor={{
                    "0%": "#3B82F6",
                    "100%": "#2563EB",
                  }}
                />
              </div>
            )}
          </Card>

          {/* Questions */}
          <Card className="mb-6 shadow-md border border-gray-200">
            <Space direction="vertical" size="large" className="w-full">
              {currentQuestions.map((question, index) => {
                const questionNumber =
                  (currentPage - 1) * QUESTIONS_PER_PAGE + index + 1;
                const isAnswered = !!answers[question.id];

                return (
                  <div
                    key={question.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isAnswered
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Tag
                        color={isAnswered ? "blue" : "default"}
                        className="text-base px-3 py-1 rounded"
                      >
                        Câu {questionNumber}
                      </Tag>

                      <Paragraph className="flex-1 !mb-0 text-base font-medium text-gray-700">
                        {question.questionContent}
                      </Paragraph>
                    </div>

                    {/* MP3 Audio Player */}
                    {question.questionMp3 && (
                      <div className="mb-4">
                        <audio controls className="w-full">
                          <source src={question.questionMp3} type="audio/mpeg" />
                          Trình duyệt không hỗ trợ phát audio.
                        </audio>
                      </div>
                    )}

                    {/* Multiple Choice */}
                    {question.questionType === 0 ? (
                      <Radio.Group
                        value={answers[question.id]}
                        disabled={examData.status === 1}
                        onChange={(e) => {
                          const selectedAnswer = question.answers.find(
                            (ans) => ans.id === e.target.value
                          );
                          handleAnswerChange(
                            question.id,
                            e.target.value,
                            selectedAnswer?.content,
                            0
                          );
                        }}
                        className="w-full"
                      >
                        <Space direction="vertical" className="w-full">
                          {question.answers?.map((answer) => {
                            const isCorrect = answer.isCorrect === true;
                            const isWrong = answer.isCorrect === false;
                            const isSelected = answers[question.id] === answer.id;

                            return (
                              <Radio
                                key={answer.id}
                                value={answer.id}
                                className={`text-base p-3 rounded-lg w-full transition ${
                                  examData.status === 1
                                    ? isCorrect
                                      ? "!bg-green-100 !border-green-500"
                                      : isWrong && isSelected
                                      ? "!bg-red-100 !border-red-500"
                                      : ""
                                    : "hover:bg-blue-50"
                                }`}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span>{answer.content}</span>

                                  {examData.status === 1 && isCorrect && (
                                    <Tag color="success">Đúng</Tag>
                                  )}
                                  {examData.status === 1 &&
                                    isWrong &&
                                    isSelected && <Tag color="error">Sai</Tag>}
                                </div>
                              </Radio>
                            );
                          })}
                        </Space>
                      </Radio.Group>
                    ) : (
                      <TextArea
                        rows={5}
                        className="text-base"
                        disabled={examData.status === 1}
                        placeholder="Nhập câu trả lời..."
                        value={answers[question.id] || ""}
                        onChange={(e) =>
                          handleEssayChange(question.id, e.target.value)
                        }
                      />
                    )}
                  </div>
                );
              })}
            </Space>

            {/* Pagination */}
            <div className="mt-6 flex justify-center">
              <Pagination
                current={currentPage}
                total={examData.questionHistories.length}
                pageSize={QUESTIONS_PER_PAGE}
                showSizeChanger={false}
                onChange={setCurrentPage}
              />
            </div>
          </Card>

          {/* Navigator */}
          <Card
            className="mb-6 shadow-md border border-gray-200"
            title={<span className="text-blue-700 font-semibold">Câu hỏi</span>}
          >
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {examData.questionHistories.map((q, index) => {
                const num = index + 1;
                const isAnswered = !!answers[q.id];
                const isCurrent =
                  Math.ceil(num / QUESTIONS_PER_PAGE) === currentPage;

                return (
                  <Button
                    key={q.id}
                    type={isCurrent ? "primary" : "default"}
                    className={`rounded-lg ${
                      isAnswered
                        ? "!bg-blue-500 !border-blue-500 hover:!bg-blue-600"
                        : ""
                    }`}
                    onClick={() =>
                      setCurrentPage(Math.ceil(num / QUESTIONS_PER_PAGE))
                    }
                  >
                    {num}
                  </Button>
                );
              })}
            </div>

            <div className="flex gap-4 mt-4 text-sm">
              <Space>
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <Text>Đã trả lời</Text>
              </Space>
              <Space>
                <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
                <Text>Chưa trả lời</Text>
              </Space>
            </div>
          </Card>

          {/* Submit */}
          {examData.status === 0 && (
            <Card className="shadow-md border border-gray-200">
              <div className="flex justify-between items-center">
                <Text type="secondary">
                  Đã trả lời: {Object.keys(answers).length}/{examData.quantity}{" "}
                  câu
                </Text>

                <Button
                  type="primary"
                  danger
                  size="large"
                  loading={isSubmitting}
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => handleSubmitExam(false)}
                >
                  Nộp bài
                </Button>
              </div>
            </Card>
          )}

          {/* Summary */}
          {examData.status === 1 && (
            <Card className="shadow-md border border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-gray-500 text-sm">Điểm</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {examData.grade || 0}
                  </div>
                </div>

                {examData.examType !== 1 && (
                  <div className="text-center">
                    <div className="text-gray-500 text-sm">Câu đúng</div>
                    <div className="text-2xl font-bold text-green-600">
                      {examData.totalCorrectAnswers}/{examData.quantity}
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <div className="text-gray-500 text-sm">Đã trả lời</div>
                  <div className="text-2xl font-bold text-blue-500">
                    {examData.answeredQuestions}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-gray-500 text-sm">Thời gian</div>
                  <div className="text-2xl font-semibold text-purple-600">
                    {formatTime(timeRemaining)}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Teacher feedback for essay exams (Tự luận) */}
          {examData.status === 1 && examData.examType === 1 && (
            <Card
              className="shadow-md border border-gray-200 mt-6"
              title="Phản hồi từ giáo viên"
            >
              <div className="prose max-w-none text-gray-700">
                {examData.feedback ? (
                  typeof examData.feedback === "string" ? (
                    <p>{examData.feedback}</p>
                  ) : Array.isArray(examData.feedback) ? (
                    examData.feedback.map((fb, idx) => (
                      <div key={idx} className="mb-4">
                        {fb.title && (
                          <h4 className="font-semibold">{fb.title}</h4>
                        )}
                        <p>{fb.content ?? fb}</p>
                      </div>
                    ))
                  ) : (
                    <>
                      {examData.feedback.title && (
                        <h4 className="font-semibold">
                          {examData.feedback.title}
                        </h4>
                      )}
                      <p>
                        {examData.feedback.content ??
                          JSON.stringify(examData.feedback)}
                      </p>
                    </>
                  )
                ) : (
                  <p className="text-gray-500">Chưa có phản hồi.</p>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default FreeExamTaking;