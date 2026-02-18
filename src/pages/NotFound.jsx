import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <AlertTriangle className="mx-auto h-24 w-24 text-yellow-500 animate-bounce" />
          <h2 className="mt-6 text-9xl font-extrabold text-gray-900 tracking-tight">
            404
          </h2>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {t('errors.pageNotFound', 'Page Not Found')}
          </p>
          <p className="mt-2 text-base text-gray-500">
            {t('errors.pageNotFoundDesc', 'Sorry, we couldn’t find the page you’re looking for.')}
          </p>
        </div>
        
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 shadow-lg shadow-primary-600/30"
          >
            <Home className="-ml-1 mr-2 h-5 w-5" />
            {t('nav.home', 'Go back home')}
          </Link>
        </div>
        
        <div className="mt-6">
          <img 
            src="https://images.unsplash.com/photo-1594890695666-684d08b3c3c1?q=80&w=2070&auto=format&fit=crop" 
            alt="Farm landscape" 
            className="rounded-2xl shadow-xl w-full h-48 object-cover opacity-80 hover:opacity-100 transition-opacity duration-300"
          />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
