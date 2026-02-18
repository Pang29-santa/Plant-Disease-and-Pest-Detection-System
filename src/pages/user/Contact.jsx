import React from 'react';
import { MessageCircle, Mail, Phone, ChevronLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ContactPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50" />

            <div className="max-w-xl w-full relative z-10">
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-gray-400 hover:text-purple-600 transition-colors font-bold text-sm mb-8 group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    {t('detailPage.back')}
                </button>

                <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-gray-200/50 text-center border border-gray-100 flex flex-col items-center relative">
                    <div className="w-24 h-24 bg-purple-50 rounded-[2rem] flex items-center justify-center text-purple-600 mb-8 shadow-inner relative group">
                        <MessageCircle className="w-10 h-10 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    
                    <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
                        {t('contactPage.title')}
                    </h1>
                    <p className="text-gray-500 mb-10 font-medium leading-relaxed max-w-sm">
                        {t('contactPage.subtitle')}
                    </p>
                    
                    <div className="w-full space-y-4 mb-10">
                        <a 
                            href="mailto:support@vegetableproject.com"
                            className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 group hover:border-purple-200 hover:bg-purple-50 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-purple-600 shadow-sm transition-colors">
                                  <Mail className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-purple-400 transition-colors">Email Support</p>
                                  <p className="text-gray-700 font-bold">support@vegetableproject.com</p>
                                </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-purple-600" />
                        </a>
                        <a 
                            href="tel:02-123-4567"
                            className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 group hover:border-indigo-200 hover:bg-indigo-50 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-indigo-600 shadow-sm transition-colors">
                                  <Phone className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">Call Center</p>
                                  <p className="text-gray-700 font-bold">02-123-4567</p>
                                </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-indigo-600" />
                        </a>
                    </div>

                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-purple-600 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-2 group active:scale-95"
                    >
                        {t('profile.backHome')}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
