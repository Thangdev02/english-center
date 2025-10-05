import React from 'react';

const TestTailwind = () => {
  return (
    <div className="p-8">
      {/* Test Background Colors */}
      <div className="mb-4 p-4 bg-blue-500 text-white rounded-lg">
        🔵 bg-blue-500 - Nếu thấy nền xanh là Tailwind hoạt động
      </div>
      
      {/* Test Text Colors */}
      <div className="mb-4 p-4 bg-gray-100">
        <p className="text-red-500 font-bold">🔴 text-red-500 - Chữ đỏ đậm</p>
        <p className="text-green-500">🟢 text-green-500 - Chữ xanh</p>
      </div>
      
      {/* Test Spacing */}
      <div className="flex space-x-4 mb-4">
        <div className="p-2 bg-yellow-200">Padding small</div>
        <div className="p-4 bg-yellow-300">Padding medium</div>
        <div className="p-6 bg-yellow-400">Padding large</div>
      </div>
      
      {/* Test Flexbox */}
      <div className="flex justify-between items-center bg-purple-100 p-4 rounded">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </div>
      
      {/* Test Responsive */}
      <div className="mt-4 p-4 bg-pink-100 md:bg-pink-300 lg:bg-pink-500">
        Responsive test - Màu thay đổi khi resize màn hình
      </div>
      
      {/* Test Custom Colors */}
      <div className="mt-4 p-4 bg-primary-500 text-white rounded">
        🎨 Custom primary color - Nếu thấy nền xanh đậm là config hoạt động
      </div>
    </div>
  );
};

export default TestTailwind;