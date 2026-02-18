import React from 'react';
import { MessageCircle, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ContactPage = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
            <div className="bg-white p-12 rounded-3xl shadow-xl text-center max-w-md w-full">
                <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mx-auto mb-6">
                    <MessageCircle className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-4">ติดต่อผู้ดูแล</h1>
                <p className="text-gray-500 mb-8">หากคุณพบปัญหาในการใช้งานหรือต้องการคำแนะนำเพิ่มเติม สามารถติดต่อเราได้ผ่านช่องทางด้านล่าง</p>
                
                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">support@vegetableproject.com</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">02-123-4567</span>
                    </div>
                </div>

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

export default ContactPage;
