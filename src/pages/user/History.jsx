import React from 'react';
import { History, ChevronLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const HistoryPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-teal-50 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-50" />

            <div className="max-w-xl w-full relative z-10">
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-gray-400 hover:text-teal-600 transition-colors font-bold text-sm mb-8 group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    {t('detailPage.back')}
                </button>

                <div className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-gray-200/50 text-center border border-gray-100 flex flex-col items-center">
                    <div className="w-24 h-24 bg-teal-50 rounded-[2rem] flex items-center justify-center text-teal-600 mb-8 shadow-inner relative group">
                        <History className="w-10 h-10 group-hover:rotate-12 transition-transform duration-500" />
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
                        </div>
                    </div>
                    
                    <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
                        {t('historyPage.title')}
                    </h1>
                    <p className="text-gray-500 mb-10 font-medium leading-relaxed max-w-xs">
                        {t('historyPage.subtitle')}
                    </p>

                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-teal-600 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-2 group active:scale-95"
                    >
                        {t('profile.backHome')}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
                    Feature Coming Soon
                  </p>
                </div>
            </div>
        </div>
    );
};

export default HistoryPage;
