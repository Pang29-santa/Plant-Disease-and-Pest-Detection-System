import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { Eye, EyeOff, Mail, Lock, Leaf, ArrowLeft } from 'lucide-react';

const Login = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.username, formData.password);
    
    if (result.success) {
      if (from) {
        navigate(from, { replace: true });
      } else if (result.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      const msg = result.message || '';
      const lowerMsg = msg.toLowerCase();
      if (lowerMsg.includes('invalid') && (lowerMsg.includes('password') || lowerMsg.includes('username') || lowerMsg.includes('fullname'))) {
        setError(t('auth.login.login_failed'));
      } else {
        setError(msg);
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary-900 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=2070&auto=format&fit=crop")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 to-primary-800/50 backdrop-blur-sm" />
        
        <div className="relative z-10 w-full flex flex-col justify-between p-12">
          <div>
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <Leaf className="w-5 h-5 text-green-400" />
              <span className="text-white font-medium tracking-wide">{t('app.category')}</span>
            </div>
          </div>
          
          <div className="max-w-md">
            <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
              {t('app.title')}
            </h1>
            <p className="text-lg text-green-100 leading-relaxed">
              {t('app.subtitle')}
            </p>
          </div>
          
          <div className="flex gap-4 text-green-200 text-sm">
            <span>{t('auth.login.copyright')}</span>
            <span>•</span>
            <span>{t('auth.register.privacy')}</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-12 bg-white relative">
        <div className="absolute top-4 left-4 lg:hidden">
          <Link 
            to="/" 
            className="p-2 flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors bg-gray-50 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-bold">{t('nav.home')}</span>
          </Link>
        </div>
        <div className="hidden lg:block absolute top-12 left-12">
           <Link 
            to="/" 
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
          >
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg group-hover:bg-white/20 border border-white/10 transition-all">
              <ArrowLeft className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-sm">{t('nav.home')}</span>
          </Link>
        </div>
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              {t('auth.login.title')}
            </h2>
            <p className="mt-2 text-gray-600">
              {t('auth.login.subtitle')}
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('auth.login.username')}
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 
                             focus:bg-white transition-all duration-200"
                    placeholder={t('auth.login.usernamePlaceholder')}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('auth.login.password')}
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 
                             focus:bg-white transition-all duration-200"
                    placeholder={t('auth.login.passwordPlaceholder')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 
                             hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" 
                />
                <span className="ml-2 text-sm text-gray-600">{t('auth.login.rememberMe')}</span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
              >
                {t('auth.login.forgotPassword')}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 bg-primary-600 text-white font-semibold rounded-xl
                       hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500/20 
                       active:scale-[0.98] transition-all duration-200 disabled:opacity-50 
                       disabled:cursor-not-allowed shadow-lg shadow-primary-600/20 ${loading ? 'cursor-wait' : ''}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('auth.login.loggingIn')}
                </span>
              ) : (
                <span className="text-base">
                  {t('auth.login.submit')}
                </span>
              )}
            </button>

            <p className="text-center text-sm text-gray-600">
              {t('auth.login.noAccount')}{' '}
              <Link 
                to="/register" 
                className="font-semibold text-primary-600 hover:text-primary-700 hover:underline"
              >
                {t('auth.login.register')}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
