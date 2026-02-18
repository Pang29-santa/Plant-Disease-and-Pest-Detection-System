import React, { useState, useEffect } from 'react';
import { Send, AlertCircle, CheckCircle, Loader2, MessageSquare, Unlink, RefreshCw } from 'lucide-react';
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
        confirmButtonColor: '#3B82F6',
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: t('telegramPage.alerts.sendTestErrorTitle'),
        confirmButtonColor: '#3B82F6',
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
        confirmButtonColor: '#3B82F6',
      });
      setIsConnected(false);
      setConnection(null);
      setConnectionCode('');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: t('telegramPage.alerts.disconnectErrorTitle'),
        confirmButtonColor: '#3B82F6',
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // แสดงหน้าการเชื่อมต่อสำเร็จแล้ว
  if (isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
        <div className="bg-white p-12 rounded-3xl shadow-xl text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('telegramPage.connectedTitle')}</h1>
          <p className="text-gray-500 mb-6">
            {t('telegramPage.connectedSubtitle')}
          </p>
          
          {/* Chat ID hidden as requested */}

          <div className="flex flex-col gap-3">
            <button 
              onClick={handleSendTest}
              disabled={isLoading}
              className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <MessageSquare className="w-5 h-5" />
              )}
              {t('telegramPage.sendTestBtn')}
            </button>
            
            <button 
              onClick={handleDisconnect}
              disabled={isLoading}
              className="w-full py-3 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Unlink className="w-5 h-5" />
              {t('telegramPage.disconnectBtn')}
            </button>
            
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
            >
              {t('telegramPage.backDashboardBtn')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // แสดงหน้ากรอกรหัสยืนยัน
  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
      <div className="bg-white p-12 rounded-3xl shadow-xl text-center max-w-lg w-full">
        <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6">
          <Send className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('telegramPage.title')}</h1>
        <p className="text-gray-500 mb-6">
          {t('telegramPage.subtitle')}
        </p>
        
        <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex items-start gap-3 text-left mb-8">
          <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-orange-900 mb-1">{t('telegramPage.stepsTitle')}</p>
            <ol className="text-xs text-orange-800 list-decimal ml-4 space-y-1">
              <li>
                <Trans i18nKey="telegramPage.step1">
                  ค้นหาบอท <a href="https://t.me/vegetableproject_chatbot" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">@vegetableproject_chatbot</a> ใน Telegram
                </Trans>
              </li>
              <li>{t('telegramPage.step2')}</li>
              <li>{t('telegramPage.step3')}</li>
            </ol>
          </div>
        </div>

        {/* ช่องกรอกรหัสยืนยัน */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
            {t('telegramPage.inputLabel')}
          </label>
          <input
            type="text"
            value={connectionCode}
            onChange={(e) => setConnectionCode(e.target.value)}
            placeholder={t('telegramPage.inputPlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-center text-lg tracking-widest"
            maxLength={10}
          />
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={handleVerifyCode}
            disabled={isLoading || !connectionCode.trim()}
            className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            {t('telegramPage.connectBtn')}
          </button>

          <button 
            onClick={handleRequestNewCode}
            disabled={isLoading}
            className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className="w-5 h-5" />
            {t('telegramPage.requestCodeBtn')}
          </button>
          
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
          >
            {t('telegramPage.cancelBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TelegramPage;
