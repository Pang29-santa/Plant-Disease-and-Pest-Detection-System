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
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 
                 hover:text-primary-600 transition-colors duration-200"
      title={t('language.switch')}
    >
      <Globe className="w-5 h-5" />
      <span className="uppercase">{i18n.language === 'th' ? 'TH' : 'EN'}</span>
    </button>
  );
};

export default LanguageSwitcher;
