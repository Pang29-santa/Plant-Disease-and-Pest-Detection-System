import React from 'react';
import { Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CCTVPage = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
            <div className="bg-white p-12 rounded-3xl shadow-xl text-center max-w-md w-full">
                <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6">
                    <Camera className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-4">จัดการกล้องวงจรปิด</h1>
                <p className="text-gray-500 mb-8">หน้านี้กำลังอยู่ระหว่างการพัฒนา ระบบจะแสดงภาพสดจาก CCTV ของคุณเร็วๆ นี้</p>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors"
                >
                    ย้อนกลับไปหน้าหลัก
                </button>
            </div>
        </div>
    );
};

export default CCTVPage;
