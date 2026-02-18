import React, { useState, useEffect } from 'react';
import { Send, AlertCircle, CheckCircle, Loader2, MessageSquare, Unlink, RefreshCw, ChevronLeft, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { 
  getTelegramConnection, 
  verifyConnectionCode, 
  sendTestMessage,
  deleteTelegramConnection,
  requestNewCode} from '../../services/telegramApi';
import { useTranslation, Trans } from 'react-i18next';

const TelegramPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [connectionCode, setConnectionCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Use user_id if available, otherwise fallback to _id
  const userId = user?.user_id || user?._id;

  // ตรวจสอบสถานะการเชื่อมต่อเมื่อโหลดหน้า
  useEffect(() => {
    checkConnectionStatus();
  }, [userId]);

  const checkConnectionStatus = async () => {
    if (!userId) {
      setIsChecking(false);
      return;
    }

    try {
      const connections = await getTelegramConnection(userId);
      if (connections && connections.length > 0) {
        const activeConnection = connections.find(c => c.status === 'active');
        if (activeConnection) {
          setConnection(activeConnection);
          setIsConnected(true);
        }
      }
    } catch (error) {
      console.log('No connection found');
    } finally {
      setIsChecking(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!connectionCode.trim()) {
      Swal.fire({
        icon: 'warning',
        title: t('telegramPage.alerts.enterCodeTitle'),
        confirmButtonColor: '#3B82F6',
      });
      return;
    }

    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: t('telegramPage.alerts.loginRequiredTitle'),
        confirmButtonColor: '#3B82F6',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyConnectionCode(userId, connectionCode.trim());
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: t('telegramPage.alerts.connectSuccessTitle'),
          confirmButtonColor: '#3B82F6',
        });
        setIsConnected(true);
        setConnection(result.connection);
      } else {
        Swal.fire({
          icon: 'error',
          title: result.message || t('telegramPage.alerts.connectErrorTitle'),
          confirmButtonColor: '#3B82F6',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: error.response?.data?.detail || t('telegramPage.alerts.genericErrorTitle'),
        confirmButtonColor: '#3B82F6',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTest = async () => {
    if (!connection?._id) return;
    
    setIsLoading(true);
    try {
      await sendTestMessage(connection._id);
      Swal.fire({
        icon: 'success',
        title: t('telegramPage.alerts.sendTestSuccessTitle'),
        text: t('telegramPage.alerts.sendTestSuccessText'),
        confirmButtonColor: '#3085d6',
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: t('telegramPage.alerts.sendTestErrorTitle'),
        confirmButtonColor: '#3085d6',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!connection?._id) return;

    const result = await Swal.fire({
      icon: 'warning',
      title: t('telegramPage.alerts.disconnectConfirmTitle'),
      text: t('telegramPage.alerts.disconnectConfirmText'),
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: t('telegramPage.alerts.confirmBtn'),
      cancelButtonText: t('telegramPage.alerts.cancelBtn'),
    });

    if (!result.isConfirmed) return;

    setIsLoading(true);
    try {
      await deleteTelegramConnection(connection._id);
      Swal.fire({
        icon: 'success',
        title: t('telegramPage.alerts.disconnectSuccessTitle'),
        confirmButtonColor: '#3085d6',
      });
      setIsConnected(false);
      setConnection(null);
      setConnectionCode('');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: t('telegramPage.alerts.disconnectErrorTitle'),
        confirmButtonColor: '#3085d6',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestNewCode = async () => {
    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: t('telegramPage.alerts.loginRequiredTitle'),
        confirmButtonColor: '#3B82F6',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await requestNewCode(userId);
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: t('telegramPage.alerts.requestCodeSuccessTitle'),
          confirmButtonColor: '#3B82F6',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: result.message || t('telegramPage.alerts.requestCodeErrorTitle'),
          confirmButtonColor: '#3B82F6',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: t('telegramPage.alerts.requestCodeGenericErrorTitle'),
        confirmButtonColor: '#3B82F6',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
          <p className="text-sm font-black text-gray-400 uppercase tracking-widest">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-sky-50 rounded-full blur-3xl opacity-50" />
        <div className="bg-white p-10 md:p-12 rounded-[3.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden flex flex-col items-center">
          {/* Status Indicator */}
          <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl font-black text-[10px] uppercase tracking-widest ${isConnected ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
            {isConnected ? t('telegramPage.status.connected') : t('telegramPage.status.not_connected')}
          </div>

          <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner group ${isConnected ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
            {isConnected ? <CheckCircle className="w-12 h-12" /> : <Send className="w-12 h-12 group-hover:rotate-12 transition-transform duration-500" />}
          </div>

          <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight text-center">
            {isConnected ? t('telegramPage.connectedTitle') : t('telegramPage.title')}
          </h1>
          <p className="text-gray-500 mb-10 font-medium leading-relaxed max-w-sm text-center">
            {isConnected ? t('telegramPage.connectedSubtitle') : t('telegramPage.subtitle')}
          </p>

          {isConnected ? (
            /* Connected View Actions */
            <div className="w-full flex flex-col gap-4">
              <button 
                onClick={handleSendTest}
                disabled={isLoading}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageSquare className="w-5 h-5" />}
                {t('telegramPage.sendTestBtn')}
              </button>
              
              <button 
                onClick={handleDisconnect}
                disabled={isLoading}
                className="w-full py-4 bg-white border-2 border-red-50 text-red-600 rounded-2xl font-black hover:bg-red-50 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <Unlink className="w-5 h-5" />
                {t('telegramPage.disconnectBtn')}
              </button>
            </div>
          ) : (
            /* Disconnected View Form */
            <div className="w-full space-y-8">
              <div className="bg-orange-50/50 p-6 rounded-[2.5rem] border border-orange-100 relative group overflow-hidden">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-orange-100/50 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-600 shadow-sm shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-orange-900 mb-2 uppercase tracking-tight">{t('telegramPage.stepsTitle')}</p>
                    <ol className="text-xs text-orange-800/80 list-decimal ml-4 space-y-2 font-medium">
                      <li>
                        <Trans i18nKey="telegramPage.step1">
                          Find bot <a href="https://t.me/vegetableproject_chatbot" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:scale-105 inline-flex items-center gap-0.5 font-black">@vegetableproject_chatbot <ExternalLink className="w-3 h-3" /></a>
                        </Trans>
                      </li>
                      <li>{t('telegramPage.step2')}</li>
                      <li>{t('telegramPage.step3')}</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">
                  {t('telegramPage.inputLabel')}
                </label>
                <input
                  type="text"
                  value={connectionCode}
                  onChange={(e) => setConnectionCode(e.target.value)}
                  placeholder={t('telegramPage.inputPlaceholder')}
                  className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[2rem] outline-none transition-all text-center text-2xl font-black tracking-[0.2em] text-gray-800 shadow-inner"
                  maxLength={10}
                />
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={handleVerifyCode}
                  disabled={isLoading || !connectionCode.trim()}
                  className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle className="w-6 h-6" />}
                  {t('telegramPage.connectBtn')}
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={handleRequestNewCode}
                    disabled={isLoading}
                    className="py-4 px-6 bg-white border-2 border-gray-100 text-gray-600 rounded-2xl font-black hover:border-blue-200 hover:text-blue-600 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    {t('telegramPage.requestCodeBtn')}
                  </button>
                  
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="py-4 px-6 bg-white border-2 border-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-50 transition-all active:scale-95"
                  >
                    {t('telegramPage.cancelBtn')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Features / Benefits Section */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full px-4">
          <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 shadow-lg flex flex-col items-center text-center group hover:bg-white hover:scale-105 transition-all duration-300">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-black text-gray-800 mb-2">{t('telegramPage.features.chat.title', 'Real-time Chat')}</h3>
            <p className="text-sm text-gray-500 font-medium">{t('telegramPage.features.chat.desc', 'Get instant updates and chat with our AI assistant directly.')}</p>
          </div>

          <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 shadow-lg flex flex-col items-center text-center group hover:bg-white hover:scale-105 transition-all duration-300">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-black text-gray-800 mb-2">{t('telegramPage.features.alerts.title', 'Instant Alerts')}</h3>
            <p className="text-sm text-gray-500 font-medium">{t('telegramPage.features.alerts.desc', 'Receive immediate notifications about your farm status.')}</p>
          </div>

          <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 shadow-lg flex flex-col items-center text-center group hover:bg-white hover:scale-105 transition-all duration-300">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-black text-gray-800 mb-2">{t('telegramPage.features.secure.title', 'Secure & Private')}</h3>
            <p className="text-sm text-gray-500 font-medium">{t('telegramPage.features.secure.desc', 'Your data is encrypted and securely connected to your account.')}</p>
          </div>
        </div>
    </div>
  );
};

export default TelegramPage;
