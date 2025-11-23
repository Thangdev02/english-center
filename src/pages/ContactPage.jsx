import React from "react";
import { Mail, Phone, MapPin, Facebook, Send } from "lucide-react";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 py-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black text-red-900 mb-6 tracking-tight">
            Liên Hệ <span className="text-red-600">Super Panda</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ ngay hôm nay!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* Bên trái: Form + ảnh */}
          <div className="space-y-10">
            

            {/* Form liên hệ */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-red-200">
              <h2 className="text-3xl font-black text-red-900 mb-8">Gửi tin nhắn cho chúng tôi</h2>
              <form className="space-y-6">
                <input type="text" placeholder="Họ và tên" className="w-full px-6 py-5 rounded-2xl border-2 border-gray-300 focus:border-red-600 outline-none text-lg transition" />
                <input type="email" placeholder="Email của bạn" className="w-full px-6 py-5 rounded-2xl border-2 border-gray-300 focus:border-red-600 outline-none text-lg transition" />
                <textarea rows={6} placeholder="Nội dung tin nhắn..." className="w-full px-6 py-5 rounded-2xl border-2 border-gray-300 focus:border-red-600 outline-none text-lg resize-none transition"></textarea>
                <button type="submit" className="w-full py-6 bg-gradient-to-r from-red-600 to-pink-600 text-white font-black text-xl rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 group">
                  <Send className="w-7 h-7 group-hover:translate-x-1 transition" />
                  Gửi Tin Nhắn Ngay
                </button>
              </form>
            </div>
          </div>

          {/* Bên phải: Thông tin liên hệ */}
          <div className="space-y-8">
            <h2 className="text-4xl font-black text-red-900 mb-10">Thông Tin Liên Hệ</h2>

            <div className="space-y-6">
              <div className="flex items-start gap-6 bg-red-50 rounded-2xl p-6 border-2 border-red-200 hover:border-red-500 transition-all hover:shadow-lg">
                <Mail className="w-12 h-12 text-red-600 mt-1" />
                <div>
                  <p className="text-gray-600 font-medium">Email</p>
                  <p className="text-2xl font-black text-red-900">superpanda@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-6 bg-red-50 rounded-2xl p-6 border-2 border-red-200 hover:border-red-500 transition-all hover:shadow-lg">
                <Phone className="w-12 h-12 text-red-600 mt-1" />
                <div>
                  <p className="text-gray-600 font-medium">Hotline</p>
                  <p className="text-2xl font-black text-red-900">036 996 0429</p>
                </div>
              </div>

              <div className="flex items-start gap-6 bg-red-50 rounded-2xl p-6 border-2 border-red-200 hover:border-red-500 transition-all hover:shadow-lg">
                <MapPin className="w-12 h-12 text-red-600 mt-1" />
                <div>
                  <p className="text-gray-600 font-medium">Địa chỉ</p>
                  <p className="text-2xl font-black text-red-900 leading-relaxed">
                    Mặt hồ Tân Xã<br />Thạch Thất, Hà Nội
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6 bg-red-50 rounded-2xl p-6 border-2 border-red-200 hover:border-red-500 transition-all hover:shadow-lg">
                <Facebook className="w-12 h-12 text-red-600 mt-1" />
                <div>
                  <p className="text-gray-600 font-medium">Facebook</p>
                  <a href="https://www.facebook.com/profile.php?id=61551807950988&locale=vi_VN" target="_blank" rel="noreferrer" className="text-2xl font-black text-red-900 hover:text-red-600 transition">
                    facebook.com/superpanda
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;