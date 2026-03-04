import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { Mail, ArrowLeft, Leaf, Send, CheckCircle, RefreshCw, Inbox } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';



const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`/api/auth/forgot-password`, {
        email: email
      });

      if (response.data.success) {
        setEmailSent(true);
        // เริ่มนับถอยหลัง 60 วินาทีสำหรับขอ OTP ใหม่
        setCountdown(60);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || t('auth.forgotPassword.errorMessage');
      Swal.fire({
        icon: 'error',
        title: t('auth.forgotPassword.errorTitle'),
        text: errorMsg,
        confirmButtonText: t('common.confirm'),
        confirmButtonColor: '#16a34a'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    try {
      const response = await axios.post(`/api/auth/forgot-password`, {
        email: email
      });

      if (response.data.success) {
        // รีเซ็ตนับถอยหลัง
        setCountdown(60);
        
        Swal.fire({
          icon: 'success',
          title: t('auth.forgotPassword.resendSuccessTitle') || 'ส่ง OTP ใหม่สำเร็จ',
          text: t('auth.forgotPassword.resendSuccessMessage') || 'รหัส OTP ใหม่ถูกส่งไปยังอีเมลของคุณแล้ว',
          confirmButtonText: t('common.confirm'),
          confirmButtonColor: '#16a34a',
          timer: 2000,
          timerProgressBar: true
        });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || t('auth.forgotPassword.errorMessage');
      Swal.fire({
        icon: 'error',
        title: t('auth.forgotPassword.errorTitle'),
        text: errorMsg,
        confirmButtonText: t('common.confirm'),
        confirmButtonColor: '#16a34a'
      });
    } finally {
      setLoading(false);
    }
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

      {/* Right Side - Forgot Password Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-12 bg-white relative">
        <div className="absolute top-4 left-4 lg:hidden">
          <Link 
            to="/login" 
            className="p-2 flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors bg-gray-50 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-bold">{t('auth.forgotPassword.backToLogin')}</span>
          </Link>
        </div>
        <div className="hidden lg:block absolute top-12 left-12">
           <Link 
            to="/login" 
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
          >
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg group-hover:bg-white/20 border border-white/10 transition-all">
              <ArrowLeft className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-sm">{t('auth.forgotPassword.backToLogin')}</span>
          </Link>
        </div>
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              {emailSent ? t('auth.forgotPassword.checkEmailTitle') || 'ตรวจสอบอีเมลของคุณ' : t('auth.forgotPassword.title')}
            </h2>
            <p className="mt-2 text-gray-600">
              {emailSent 
                ? t('auth.forgotPassword.emailSentSubtitle') || `เราส่งรหัส OTP 6 หลักไปยัง ${email}`
                : t('auth.forgotPassword.subtitle')
              }
            </p>
          </div>

          {emailSent ? (
            <div className="space-y-6">
              {/* Success Icon */}
              <div className="p-6 bg-green-50 border-2 border-green-200 rounded-2xl text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Inbox className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  {t('auth.forgotPassword.emailSentTitle') || 'ส่ง OTP สำเร็จ'}
                </h3>
                <p className="text-green-700 mb-2">
                  {t('auth.forgotPassword.emailSentMessage') || 'รหัส OTP ถูกส่งไปยังอีเมลของคุณแล้ว'}
                </p>
                <p className="text-sm text-green-600 font-medium">
                  {email}
                </p>
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {t('auth.forgotPassword.nextSteps') || 'ขั้นตอนถัดไป'}
                  </h4>
                  <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
                    <li>{t('auth.forgotPassword.step1') || 'เปิดอีเมลของคุณ'}</li>
                    <li>{t('auth.forgotPassword.step2') || 'ค้นหาอีเมลจากระบบของเรา'}</li>
                    <li>{t('auth.forgotPassword.step3') || 'คัดลอกรหัส OTP 6 หลัก'}</li>
                    <li>{t('auth.forgotPassword.step4') || 'กลับมากรอกรหัสในขั้นตอนถัดไป'}</li>
                  </ol>
                </div>

                {/* Tips */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <h4 className="font-medium text-amber-800 mb-2">
                    💡 {t('auth.forgotPassword.notReceive') || 'ไม่ได้รับอีเมล?'}
                  </h4>
                  <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                    <li>{t('auth.forgotPassword.tipSpam') || 'ตรวจสอบในโฟลเดอร์ Spam/Junk'}</li>
                    <li>{t('auth.forgotPassword.tipWait') || 'รอสักครู่ (อาจใช้เวลา 1-2 นาที)'}</li>
                    <li>{t('auth.forgotPassword.tipEmail') || 'ตรวจสอบว่าอีเมลถูกต้อง'}</li>
                  </ul>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/reset-password', { state: { email: email } })}
                  className="w-full py-3.5 px-4 bg-primary-600 text-white font-semibold rounded-xl
                           hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500/20 
                           active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary-600/20"
                >
                  {t('auth.forgotPassword.enterOtpButton')}
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleResendOtp}
                    disabled={loading || countdown > 0}
                    className={`py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2
                      ${countdown > 0 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      }`}
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    {countdown > 0 
                      ? `${t('auth.forgotPassword.resendIn') || 'ส่งอีกครั้งใน'} ${countdown}s` 
                      : t('auth.forgotPassword.resendOtp') || 'ส่ง OTP อีกครั้ง'
                    }
                  </button>
                  
                  <button
                    onClick={() => {
                      setEmailSent(false);
                      setCountdown(0);
                    }}
                    className="py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-xl
                             hover:bg-gray-200 focus:outline-none transition-all duration-200"
                  >
                    {t('auth.forgotPassword.changeEmail') || 'เปลี่ยนอีเมล'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('auth.forgotPassword.email')}
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 
                             focus:bg-white transition-all duration-200"
                    placeholder={t('auth.forgotPassword.emailPlaceholder')}
                    required
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {t('auth.forgotPassword.emailHint')}
                </p>
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
                    {t('auth.forgotPassword.sending')}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" />
                    {t('auth.forgotPassword.sendOtp')}
                  </span>
                )}
              </button>

              <p className="text-center text-sm text-gray-600">
                {t('auth.forgotPassword.rememberPassword')}{' '}
                <Link 
                  to="/login" 
                  className="font-semibold text-primary-600 hover:text-primary-700 hover:underline"
                >
                  {t('auth.forgotPassword.login')}
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
