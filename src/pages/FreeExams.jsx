import React, { useState, useEffect, useCallback } from "react";
import { Card, message } from "antd";
import { Clock, FileText, PlayCircle, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { examApi } from "../services/examApi";

const FreeExams = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState(null);
  const [filterLevel, setFilterLevel] = useState(null);

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      const response = await examApi.getAllExams({ page: 1, size: 100 });
      const examsData = response.data?.data?.items || [];
      setExams(examsData);
    } catch (error) {
      message.error("Không thể tải được danh sách bài thi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const filteredExams = exams.filter((exam) => {
    const matchSearch = exam.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === null || exam.type === filterType;
    const matchLevel = filterLevel === null || (filterLevel === 7 ? exam.level >= 7 : exam.level === filterLevel);
    return matchSearch && matchType && matchLevel;
  });

  const handleTakeExam = async (examId) => {
    try {
      message.loading({ content: "Đang khởi tạo...", key: "takeExam" });
      const response = await examApi.takeFreeExam(examId);
      const examDoingId = response.data?.data?.id;
      message.success({ content: "Bắt đầu làm bài!", key: "takeExam", duration: 1 });
      navigate(`/exams/${examDoingId}`);
    } catch (error) {
      message.error({ content: "Không thể bắt đầu bài thi", key: "takeExam" });
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return "Chưa xác định";
    const [h, m] = duration.split(":");
    if (h !== "00") return `${parseInt(h)} giờ ${parseInt(m)} phút`;
    if (m !== "00") return `${parseInt(m)} phút`;
    return "Dưới 1 phút";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 py-12">
      <div className="container mx-auto px-4 max-w-7xl">

        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-red-100 rounded-full mb-6">
            <BookOpen className="w-14 h-14 text-red-600" />
          </div>
          <h1 className="text-5xl font-black text-red-900 mb-4">Bài Thi Miễn Phí HSK</h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Luyện tập miễn phí với hàng trăm đề thi chuẩn từ HSK 1 đến HSK 7-9
          </p>
        </div>

       {/* SEARCH & FILTER – PHIÊN BẢN ĐẸP NHẤT 2025 */}
<div className=" mx-auto mb-12">
  <div className="bg-white rounded-3xl shadow-2xl p-8 border border-red-100">
    <h2 className="text-2xl font-black text-red-900 mb-8 flex items-center gap-3">
      <BookOpen className="w-9 h-9 text-red-600" />
      Tìm kiếm bài thi
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
      {/* 1. Tìm kiếm tên */}
      <div className="relative">
        <input
          type="text"
          placeholder="Tìm tên bài thi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-6 py-5 rounded-2xl border-2 border-gray-300 focus:border-red-500 focus:outline-none text-lg font-medium transition-all"
        />
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* 2. Loại bài thi – Dropdown gọn */}
      <select
        value={filterType ?? ""}
        onChange={(e) => setFilterType(e.target.value === "" ? null : Number(e.target.value))}
        className="w-full px-6 py-5 rounded-2xl border-2 border-gray-300 focus:border-red-500 focus:outline-none text-lg font-medium bg-white"
      >
        <option value="">Tất cả loại bài</option>
        <option value="0">Trắc nghiệm</option>
        <option value="1">Tự luận</option>
      </select>

      {/* 3. Cấp độ HSK – Dropdown đẹp */}
      <select
        value={filterLevel ?? ""}
        onChange={(e) => setFilterLevel(e.target.value === "" ? null : Number(e.target.value))}
        className="w-full px-6 py-5 rounded-2xl border-2 border-gray-300 focus:border-red-500 focus:outline-none text-lg font-medium bg-white"
      >
        <option value="">Tất cả cấp độ</option>
        <option value="1">HSK 1</option>
        <option value="2">HSK 2</option>
        <option value="3">HSK 3</option>
        <option value="4">HSK 4</option>
        <option value="5">HSK 5</option>
        <option value="6">HSK 6</option>
        <option value="7">HSK 7-9 (Cao cấp)</option>
      </select>

      {/* 4. Nút Xóa bộ lọc */}
      <button
        onClick={() => {
          setSearchTerm("");
          setFilterType(null);
          setFilterLevel(null);
        }}
        className="px-8 py-5 bg-gray-100 hover:bg-gray-200 rounded-2xl font-bold text-gray-700 transition-all"
      >
        Xóa bộ lọc
      </button>
    </div>

   
  </div>
</div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-lg animate-pulse">
                <div className="h-52 bg-gray-300"></div>
                <div className="p-8"><div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div><div className="h-20 bg-gray-200 rounded"></div></div>
              </div>
            ))}
          </div>
        ) : filteredExams.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredExams.map((exam) => (
             <div key={exam.id} className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 flex flex-col h-full">
  
             {/* Header ảnh + badge */}
             <div className="relative h-52 bg-gradient-to-br from-red-600 via-red-700 to-pink-700 flex-shrink-0">
               <div className="absolute inset-0 bg-black/30"></div>
               <div className="absolute top-6 left-6 flex items-center gap-4">
                 <span className={`px-6 py-3 rounded-2xl text-white font-bold shadow-xl ${exam.type === 0 ? "bg-red-600" : "bg-orange-600"}`}>
                   {exam.type === 0 ? "Trắc nghiệm" : "Tự luận"}
                 </span>
                 {exam.level && (
                   <span className={`px-8 py-4 rounded-3xl text-white font-black text-xl shadow-2xl border-4 border-white/30 backdrop-blur-sm ${
                     exam.level >= 7 ? "bg-gradient-to-r from-purple-600 to-pink-600" :
                     exam.level >= 5 ? "bg-gradient-to-r from-red-600 to-pink-600" :
                     exam.level >= 3 ? "bg-gradient-to-r from-orange-500 to-red-500" :
                     "bg-gradient-to-r from-green-500 to-teal-500"
                   }`}>
                     {exam.level >= 7 ? "HSK 7-9" : `HSK ${exam.level}`}
                   </span>
                 )}
               </div>
               <FileText className="absolute inset-0 m-auto w-24 h-24 text-white/20" />
             </div>
           
             {/* Nội dung chính – cho phép co giãn */}
             <div className="p-8 flex-1 flex flex-col">
               <h3 className="text-2xl font-black text-gray-900 mb-4 line-clamp-2">{exam.name}</h3>
               {exam.description && <p className="text-gray-600 mb-6 line-clamp-3 flex-1">{exam.description}</p>}
           
               <div className="space-y-4 mt-auto mb-8"> {/* mt-auto đẩy xuống dưới */}
                 <div className="flex items-center"><Clock className="w-6 h-6 mr-3 text-red-600" /><span className="font-bold">{formatDuration(exam.duration)}</span></div>
                 <div className="flex items-center"><FileText className="w-6 h-6 mr-3 text-red-500" /><span className="font-bold">{exam.quantity} câu hỏi</span></div>
               </div>
           
               {/* Nút luôn nằm dưới cùng */}
               <button
                 onClick={() => handleTakeExam(exam.id)}
                 className="w-full py-5 bg-gradient-to-r from-red-600 to-pink-600 text-white font-black text-xl rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-4 mt-auto"
               >
                 <PlayCircle className="w-8 h-8" />
                 <span>Làm bài ngay</span>
               </button>
             </div>
           </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-4xl text-gray-400">Không tìm thấy bài thi nào</div>
        )}

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <Card className="text-center p-8 rounded-3xl border-red-100">
            <div className="inline-block p-5 bg-red-100 rounded-full mb-6"><PlayCircle className="w-12 h-12 text-red-600" /></div>
            <h3 className="text-2xl font-black text-red-900 mb-3">Làm bài dễ dàng</h3>
            <p className="text-gray-600 text-lg">Giao diện thân thiện, mượt mà</p>
          </Card>
          <Card className="text-center p-8 rounded-3xl border-red-100">
            <div className="inline-block p-5 bg-red-100 rounded-full mb-6"><FileText className="w-12 h-12 text-red-600" /></div>
            <h3 className="text-2xl font-black text-red-900 mb-3">Đa dạng đề thi</h3>
            <p className="text-gray-600 text-lg">Từ HSK 1 đến cao cấp</p>
          </Card>
          <Card className="text-center p-8 rounded-3xl border-red-100">
            <div className="inline-block p-5 bg-red-100 rounded-full mb-6"><Clock className="w-12 h-12 text-red-600" /></div>
            <h3 className="text-2xl font-black text-red-900 mb-3">Thời gian linh hoạt</h3>
            <p className="text-gray-600 text-lg">Làm bất cứ lúc nào bạn muốn</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FreeExams;