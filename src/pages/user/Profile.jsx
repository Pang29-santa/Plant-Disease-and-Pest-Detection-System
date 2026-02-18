import React from 'react';
import { User, Send, Layout, ChevronLeft, ArrowRight, ShieldCheck, Mail, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

const ProfilePage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Action Bar */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 py-4 mb-8">
              <div className="max-w-3xl mx-auto flex items-center justify-between">
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-bold text-sm group"
                >
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </div>
                    {t('detailPage.back')}
                </button>
              </div>
            </div>

            <div className="max-w-3xl mx-auto px-4">
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100">
                    {/* Header with Circle/Gradient */}
                    <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-12 text-center text-white overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                        
                        <div className="relative z-10">
                          <div className="w-28 h-28 rounded-[2.5rem] border-4 border-white/20 overflow-hidden bg-white/10 backdrop-blur-md mx-auto mb-6 shadow-2xl transform hover:rotate-3 transition-transform">
                              {user?.image_path ? (
                                  <img src={`${import.meta.env.VITE_API_URL}/${user.image_path}`} alt={t('nav.profile')} className="w-full h-full object-cover" />
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                      <User className="w-14 h-14 text-white/50" />
                                  </div>
                              )}
                          </div>
                          <h1 className="text-3xl font-black tracking-tight">{user?.fullname}</h1>
                          <div className="flex items-center justify-center gap-2 text-white/60 font-medium mt-1">
                            <Mail className="w-4 h-4" />
                            <p className="text-sm">{user?.email}</p>
                          </div>
                        </div>
                    </div>
                    
                    <div className="p-10 md:p-12">
                        <div className="space-y-6">
                            {/* Telegram Block */}
                            <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100 gap-6 group hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-500">
                                 <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-blue-50 rounded-[1.2rem] flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                        <Send className="w-7 h-7" />
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('profile.telegramConnection')}</p>
                                        <p className={`font-black text-lg ${user?.telegram_chat_id ? 'text-green-600' : 'text-gray-400'}`}>
                                            {user?.telegram_chat_id ? t('telegramPage.status.connected') : t('telegramPage.status.not_connected')}
                                        </p>
                                    </div>
                                 </div>
                                 <button 
                                    onClick={() => navigate('/telegram')}
                                    className="w-full sm:w-auto px-8 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-black hover:bg-gray-100 transition-all active:scale-95 shadow-sm"
                                 >
                                     {t('profile.manage')}
                                 </button>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="flex items-center gap-5 p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100 group">
                                  <div className="w-14 h-14 bg-green-50 rounded-[1.2rem] flex items-center justify-center text-green-500 group-hover:rotate-12 transition-transform">
                                      <ShieldCheck className="w-7 h-7" />
                                  </div>
                                  <div>
                                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('profile.userRole')}</p>
                                      <p className="font-black text-lg text-gray-800 capitalize">
                                          {user?.role === 'admin' ? t('admin.roles.admin') : t('admin.roles.user')}
                                      </p>
                                  </div>
                              </div>
                              
                              <div className="flex items-center gap-5 p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100 group">
                                  <div className="w-14 h-14 bg-orange-50 rounded-[1.2rem] flex items-center justify-center text-orange-500 group-hover:-rotate-12 transition-transform">
                                      <Calendar className="w-7 h-7" />
                                  </div>
                                  <div>
                                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Account Type</p>
                                      <p className="font-black text-lg text-gray-800">
                                          Smart Farmer
                                      </p>
                                  </div>
                              </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="w-full mt-12 py-5 bg-gray-900 text-white rounded-[2rem] font-black hover:bg-black transition-all shadow-2xl shadow-gray-200 flex items-center justify-center gap-3 group active:scale-95"
                        >
                            {t('profile.backHome')}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
