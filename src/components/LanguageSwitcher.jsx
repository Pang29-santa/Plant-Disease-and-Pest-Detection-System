import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { setLanguage } from '../services/languageApi';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleLanguage = async () => {
    const newLang = i18n.language === 'th' ? 'en' : 'th';

    // เปลี่ยนภาษาทันทีฝั่ง client
    i18n.changeLanguage(newLang);

    // อัปเดต ?lang= ใน URL โดยไม่เปลี่ยน path และ query params อื่น
    const params = new URLSearchParams(location.search);
    params.set('lang', newLang);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });

    // บันทึกลง backend (async, ไม่ต้องรอ)
    try {
      await setLanguage(newLang);
    } catch (error) {
      console.error('Failed to sync language with backend:', error);
    }
  };

  const currentLang = i18n.language === 'th' ? 'th' : 'en';

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all duration-300 group active:scale-95"
      title={t('common.switch')}
    >
      <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
        <img
          src={currentLang === 'th' ? "https://flagcdn.com/w40/th.png" : "https://flagcdn.com/w40/gb.png"}
          alt={currentLang === 'th' ? "TH" : "EN"}
          className="w-full h-full object-cover"
        />
      </div>
      <span className="text-xs font-black text-gray-600 uppercase tracking-tighter group-hover:text-primary-600 transition-colors">
        {currentLang === 'th' ? 'TH' : 'EN'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
