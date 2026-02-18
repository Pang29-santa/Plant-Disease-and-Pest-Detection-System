import React from 'react';
import { User, Send, Layout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

const ProfilePage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="bg-primary-600 p-12 text-center text-white">
                    <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden bg-white/20 mx-auto mb-4">
                        {user?.image_path ? (
                            <img src={`${import.meta.env.VITE_API_URL}/${user.image_path}`} alt={t('nav.profile')} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <User className="w-12 h-12 text-white" />
                            </div>
                        )}
                    </div>
                    <h1 className="text-2xl font-bold">{user?.fullname}</h1>
                    <p className="opacity-80">{user?.email}</p>
                </div>
                
                <div className="p-8">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                    <Send className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">{t('profile.telegramConnection')}</p>
                                    <p className="text-sm text-gray-500">
                                        {user?.telegram_chat_id ? t('telegramPage.status.connected') : t('telegramPage.status.not_connected')}
                                    </p>
                                </div>
                             </div>
                             <button 
                                onClick={() => navigate('/telegram')}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors"
                             >
                                 {t('profile.manage')}
                             </button>
                        </div>

                         <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                                    <Layout className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">{t('profile.userRole')}</p>
                                    <p className="text-sm text-gray-500 capitalize">
                                        {user?.role === 'admin' ? t('admin.roles.admin') : t('admin.roles.user')}
                                    </p>
                                </div>
                             </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="w-full mt-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                    >
                        {t('profile.backHome')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
