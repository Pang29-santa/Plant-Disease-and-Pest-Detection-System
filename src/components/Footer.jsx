import React from 'react';
import { useTranslation } from 'react-i18next';
import { Leaf, Mail, Phone } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = 2025;

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-600 text-white rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="font-semibold text-white text-base sm:text-lg">
                {t('app.title')}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              {t('app.subtitle')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-3 sm:mb-4">
              {t('nav.home')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/detect" className="hover:text-primary-400 transition-colors">
                  {t('nav.detect')}
                </a>
              </li>
              <li>
                <a href="/vegetables" className="hover:text-primary-400 transition-colors">
                  {t('nav.vegetables')}
                </a>
              </li>
              <li>
                <a href="/diseases" className="hover:text-primary-400 transition-colors">
                  {t('nav.diseases')}
                </a>
              </li>
              <li>
                <a href="/pests" className="hover:text-primary-400 transition-colors">
                  {t('nav.pests')}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-3 sm:mb-4">
              {t('common.contactUs')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>651413010@crru.ac.th</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>0889686118</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 pt-6 sm:mt-8 sm:pt-8 text-center text-xs sm:text-sm text-gray-500">
          <p>&copy; {currentYear} {t('app.title')}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
