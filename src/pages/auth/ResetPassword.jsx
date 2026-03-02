import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { 
  Lock, 
  ArrowLeft, 
  Leaf, 
  Save, 
  Eye, 
  EyeOff, 
  KeyRound,
  CheckCircle,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  // รับ email จาก state ที่ส่งมาจากหน้า forgot-password
  const emailFromState = location.state?.email || '';
  
  const [step, setStep] = useState(1); // Step 1: Verify OTP, Step 2: Reset Password
  const [formData, setFormData] = useState({
    email: emailFromState,
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // ถ้ามี email จาก state ข้ามไป step 1 ได้เลย (ไม่ต้องกรอก email)
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Step 1: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (formData.otp.length !== 6) {
      Swal.fire({
        icon: 'warning',
        title: t('auth.resetPassword.invalidOtpTitle'),
        text: t('auth.resetPassword.invalidOtpLength'),
        confirmButtonText: t('common.confirm'),
        confirmButtonColor: '#16a34a'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email: formData.email,
        otp: formData.otp
      });

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: t('auth.resetPassword.otpVerifiedTitle'),
          text: t('auth.resetPassword.otpVerifiedMessage'),
          confirmButtonText: t('common.next'),
          confirmButtonColor: '#16a34a',
          timer: 1500,
          timerProgressBar: true
        });
        setStep(2); // Go to step 2
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || t('auth.resetPassword.errorMessage');
      Swal.fire({
        icon: 'error',
        title: t('auth.resetPassword.errorTitle'),
        text: errorMsg,
        confirmButtonText: t('common.confirm'),
        confirmButtonColor: '#16a34a'
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: t('auth.resetPassword.errorTitle'),
        text: t('auth.resetPassword.passwordMismatch'),
        confirmButtonText: t('common.confirm'),
        confirmButtonColor: '#16a34a'
      });
      return;
    }

    // Validate password length
    if (formData.newPassword.length < 6) {
      Swal.fire({
        icon: 'error',
        title: t('auth.resetPassword.errorTitle'),
        text: t('auth.resetPassword.passwordTooShort'),
        confirmButtonText: t('common.confirm'),
        confirmButtonColor: '#16a34a'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        email: formData.email,
        otp: formData.otp,
        new_password: formData.newPassword
      });

      if (response.data.success) {
        setResetSuccess(true);
        Swal.fire({
          icon: 'success',
          title: t('auth.resetPassword.successTitle'),
          text: t('auth.resetPassword.successMessage'),
          confirmButtonText: t('common.confirm'),
          confirmButtonColor: '#16a34a'
        }).then(() => {
          navigate('/login');
        });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || t('auth.resetPassword.errorMessage');
      Swal.fire({
        icon: 'error',
        title: t('auth.resetPassword.errorTitle'),
        text: errorMsg,
        confirmButtonText: t('common.confirm'),
        confirmButtonColor: '#16a34a'
      });
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      navigate('/forgot-password');
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

      {/* Right Side - Reset Password Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-12 bg-white relative">
        <div className="absolute top-4 left-4 lg:hidden">
          <button 
            onClick={goBack}
            className="p-2 flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors bg-gray-50 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-bold">
              {step === 1 ? t('auth.resetPassword.backToLogin') : t('common.back')}
            </span>
          </button>
        </div>
        <div className="hidden lg:block absolute top-12 left-12">
           <button 
            onClick={goBack}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
          >
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg group-hover:bg-white/20 border border-white/10 transition-all">
              <ArrowLeft className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-sm">
              {step === 1 ? t('auth.resetPassword.backToLogin') : t('common.back')}
            </span>
          </button>
        </div>
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              {step === 1 ? t('auth.resetPassword.verifyOtpTitle') : t('auth.resetPassword.title')}
            </h2>
            <p className="mt-2 text-gray-600">
              {step === 1 
                ? (emailFromState 
                    ? t('auth.resetPassword.verifyOtpSubtitleWithEmail') 
                    : t('auth.resetPassword.verifyOtpSubtitle'))
                : t('auth.resetPassword.subtitle')
              }
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${step >= 1 ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                1
              </div>
              <span className="text-sm font-medium hidden sm:block">{t('auth.resetPassword.stepVerify')}</span>
            </div>
            <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${step >= 2 ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                2
              </div>
              <span className="text-sm font-medium hidden sm:block">{t('auth.resetPassword.stepReset')}</span>
            </div>
          </div>

          {resetSuccess ? (
            <div className="p-6 bg-green-50 border border-green-200 rounded-2xl text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                {t('auth.resetPassword.successTitle')}
              </h3>
              <p className="text-green-700 mb-4">
                {t('auth.resetPassword.successMessage')}
              </p>
              <Link
                to="/login"
                className="inline-block py-3 px-6 bg-primary-600 text-white font-semibold rounded-xl
                         hover:bg-primary-700 transition-all duration-200"
              >
                {t('auth.resetPassword.goToLogin')}
              </Link>
            </div>
          ) : (
            <>
              {step === 1 ? (
                /* Step 1: Verify OTP Form */
                <form onSubmit={handleVerifyOTP} className="space-y-5">
                  {/* Email Field - Show as readonly if from state, editable if direct access */}
                  {emailFromState ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                      <label className="block text-sm font-medium text-green-700 mb-1">
                        {t('auth.resetPassword.email')}
                      </label>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-800 font-medium">{formData.email}</span>
                      </div>
                      <input type="hidden" value={formData.email} />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {t('auth.resetPassword.email')}
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                                   focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 
                                   focus:bg-white transition-all duration-200"
                          placeholder={t('auth.resetPassword.emailPlaceholder')}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* OTP Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('auth.resetPassword.otp')}
                    </label>
                    <div className="relative group">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                      <input
                        type="text"
                        value={formData.otp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setFormData({ ...formData, otp: value });
                        }}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                                 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 
                                 focus:bg-white transition-all duration-200 text-center font-mono text-lg tracking-[0.5em]"
                        placeholder={t('auth.resetPassword.otpPlaceholder')}
                        maxLength={6}
                        inputMode="numeric"
                        required
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      {t('auth.resetPassword.otpHint')}
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
                        {t('auth.resetPassword.verifying')}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <ShieldCheck className="w-5 h-5" />
                        {t('auth.resetPassword.verifyOtpButton')}
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </button>

                  <p className="text-center text-sm text-gray-600">
                    {t('auth.resetPassword.noOtp')}{' '}
                    <Link 
                      to="/forgot-password" 
                      className="font-semibold text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      {t('auth.resetPassword.requestOtp')}
                    </Link>
                  </p>
                </form>
              ) : (
                /* Step 2: Reset Password Form */
                <form onSubmit={handleResetPassword} className="space-y-5">
                  {/* Email Display (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('auth.resetPassword.email')}
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full pl-4 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl
                                 text-gray-600 cursor-not-allowed"
                      />
                      <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                    </div>
                  </div>

                  {/* New Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('auth.resetPassword.newPassword')}
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl
                                 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 
                                 focus:bg-white transition-all duration-200"
                        placeholder={t('auth.resetPassword.newPasswordPlaceholder')}
                        required
                        minLength={6}
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

                  {/* Confirm Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t('auth.resetPassword.confirmPassword')}
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl
                                 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 
                                 focus:bg-white transition-all duration-200"
                        placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 
                                 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {formData.newPassword && formData.confirmPassword && (
                      <p className={`mt-1 text-sm ${
                        formData.newPassword === formData.confirmPassword 
                          ? 'text-green-600' 
                          : 'text-red-500'
                      }`}>
                        {formData.newPassword === formData.confirmPassword 
                          ? t('auth.resetPassword.passwordsMatch')
                          : t('auth.resetPassword.passwordsNotMatch')
                        }
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || formData.newPassword !== formData.confirmPassword}
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
                        {t('auth.resetPassword.saving')}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Save className="w-5 h-5" />
                        {t('auth.resetPassword.submit')}
                      </span>
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
