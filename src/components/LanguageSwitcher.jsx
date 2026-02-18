import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'th' ? 'en' : 'th';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all duration-300 group active:scale-95"
      title={t('common.switch')}
    >
      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-primary-600 shadow-sm group-hover:rotate-12 transition-transform">
        <Globe className="w-3.5 h-3.5" />
      </div>
      <span className="text-xs font-black text-gray-600 uppercase tracking-tighter group-hover:text-primary-600 transition-colors">
        {i18n.language === 'th' ? 'TH' : 'EN'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
