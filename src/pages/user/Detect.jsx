import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Upload, Scan, AlertCircle, CheckCircle, Send, MessageSquare, Cpu, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { useDetection } from '../../context/DetectionContext';
import { getTelegramConnection } from '../../services/telegramApi';

const Detect = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  
  const {
    selectedImage, setSelectedImage,
    selectedFile, setSelectedFile,
    isAnalyzing, setIsAnalyzing,
    result, setResult,
    saveResult, setSaveResult,
    sendToTelegram, setSendToTelegram,
  } = useDetection();

  const [telegramConnected, setTelegramConnected] = useState(false);
  const [isCheckingTelegram, setIsCheckingTelegram] = useState(true);

  // ตรวจสอบสถานะล็อคอิน (สมมติว่าใช้ localStorage เก็บ token)
  const isLoggedIn = !!localStorage.getItem('token');

  // Use user_id if available, otherwise fallback to _id
  const userId = user?.user_id || user?._id;

  // ตรวจสอบสถานะการเชื่อมต่อ Telegram
  useEffect(() => {
    const checkTelegramStatus = async () => {
      if (!userId) {
        setIsCheckingTelegram(false);
        return;
      }

      try {
        const connections = await getTelegramConnection(userId);
        if (connections && connections.length > 0) {
          const activeConnection = connections.find(c => c.status === 'active');
          if (activeConnection) {
            setTelegramConnected(true);
          }
        }
      } catch (error) {
        console.log('No Telegram connection found');
      } finally {
        setIsCheckingTelegram(false);
      }
    };

    checkTelegramStatus();
  }, [userId]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: t('detectPage.alerts.fileTooLargeTitle'),
          text: t('detectPage.alerts.fileTooLargeText'),
        });
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    
    setIsAnalyzing(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('save_result', saveResult ? 'true' : 'false');
    formData.append('send_telegram', sendToTelegram ? 'true' : 'false');
    // TensorFlow model parameters
    formData.append('use_tta', 'true');
    formData.append('enhance', 'true');
    formData.append('confidence_threshold', '0.5');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/ai/detect/tf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
      });

      if (response.data.success) {
        setResult(response.data.analysis);
        
        if (response.data.notice) {
          Swal.fire({
            icon: 'info',
            title: t('detectPage.alerts.loginNoticeTitle'),
            text: t('detectPage.alerts.loginNoticeText'),
            confirmButtonText: t('detectPage.alerts.acknowledge'),
            confirmButtonColor: '#10b981'
          });
        }
      } else {
        throw new Error(response.data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      Swal.fire({
        icon: 'error',
        title: t('detectPage.alerts.analysisFailedTitle'),
        text: error.response?.data?.detail || t('detectPage.alerts.analysisFailedDefault'),
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
            {t('nav.detect')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('detectPage.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Upload */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl shadow-green-900/5 p-8 border border-green-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Upload className="w-6 h-6 text-green-600" />
                {t('detectPage.uploadHeader')}
              </h2>
              
              <div className="relative group">
                <div className={`border-3 border-dashed rounded-2xl p-4 transition-all duration-300 ${
                  selectedImage ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-400'
                }`}>
                  {selectedImage ? (
                    <div className="relative aspect-square overflow-hidden rounded-xl shadow-inner">
                      <img
                        src={selectedImage}
                        alt="Selected"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          setSelectedImage(null);
                          setSelectedFile(null);
                          setResult(null);
                        }}
                        className="absolute top-3 right-3 w-10 h-10 bg-red-500/90 text-white rounded-full 
                                 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg backdrop-blur-sm"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-10 h-10 text-green-600" />
                      </div>
                      <p className="text-gray-600 font-medium mb-1">{t('detectPage.dropzoneText')}</p>
                      <p className="text-sm text-gray-400 mb-6">{t('detectPage.fileLimitText')}</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-green-600 text-white 
                                 font-bold rounded-xl cursor-pointer hover:bg-green-700 transition-all shadow-lg shadow-green-200"
                      >
                        <Camera className="w-5 h-5" />
                        {t('detectPage.selectImageBtn')}
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {/* บันทึกประวัติ */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="save-history"
                    checked={saveResult}
                    onChange={(e) => setSaveResult(e.target.checked)}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <label htmlFor="save-history" className="text-sm font-medium text-gray-700 cursor-pointer">
                    {t('detectPage.saveHistory')}
                  </label>
                </div>

                {/* ส่งไป Telegram - แสดงเฉพาะเมื่อเชื่อมต่อ Telegram อยู่ */}
                {telegramConnected && (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <input
                      type="checkbox"
                      id="send-telegram"
                      checked={sendToTelegram}
                      onChange={(e) => setSendToTelegram(e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="send-telegram" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      {t('detectPage.sendToTelegram')}
                    </label>
                  </div>
                )}

                {/* แจ้งเตือนถ้ายังไม่ได้เชื่อมต่อ Telegram */}
                {isLoggedIn && !isCheckingTelegram && !telegramConnected && (
                  <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                    <MessageSquare className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    <p className="text-sm text-yellow-700">
                      {t('detectPage.telegramNotConnected')} 
                      <a href="/telegram" className="ml-1 text-blue-600 hover:underline font-medium">
                        {t('detectPage.connectNow')}
                      </a>
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!selectedImage || isAnalyzing}
                className="w-full mt-6 py-4 px-6 bg-gray-900 text-white font-black text-lg rounded-2xl 
                         hover:bg-green-600 transition-all focus:outline-none focus:ring-4 focus:ring-green-200 
                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl"
              >
                {isAnalyzing ? (
                  <>
                    <Scan className="w-6 h-6 animate-spin" />
                    {t('detectPage.processing')}
                  </>
                ) : (
                  <>
                    <Cpu className="w-6 h-6" />
                    {t('detectPage.analyzeNow')} (AI)
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Result */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl shadow-xl shadow-green-900/5 p-8 border border-green-100 min-h-[500px]">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                {t('detectPage.resultHeader')}
              </h2>

              {!result && !isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Scan className="w-12 h-12 text-gray-300" />
                  </div>
                  <p className="text-xl font-medium mb-2">{t('detectPage.noDataTitle')}</p>
                  <p className="text-center max-w-sm">{t('detectPage.noDataText')}</p>
                </div>
              )}

              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-green-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-xl font-bold text-gray-900 mb-2">{t('detectPage.workingTitle')}</p>
                  <p className="text-gray-500 text-center animate-pulse">{t('detectPage.workingText')}</p>
                </div>
              )}

              {result && (
                <div className="animate-fade-in space-y-8">
                  {/* Status Banner */}
                  <div className={`p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 ${
                    result.is_detected ? 'bg-red-50 border border-red-100' : 'bg-green-50 border border-green-100'
                  }`}>
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      result.is_detected ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {result.is_detected ? <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" /> : <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10" />}
                    </div>
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase whitespace-nowrap ${
                          result.category === 'disease' ? 'bg-orange-100 text-orange-700' : 
                          result.category === 'pest' ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {result.category === 'disease' 
                            ? t('detectPage.categories.disease') 
                            : result.category === 'pest' 
                              ? t('detectPage.categories.pest') 
                              : t('detectPage.categories.healthy')}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight truncate whitespace-normal break-words">
                        {i18n.language === 'en' ? result.target_name_en : result.target_name_th}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-500 italic font-medium break-words">
                        {i18n.language === 'en' ? result.target_name_th : result.target_name_en}
                      </p>
                      {result.model && (
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-[10px] sm:text-xs font-medium rounded-lg whitespace-nowrap">
                            <Cpu className="w-3 h-3" />
                            {result.model}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Severity Level */}
                    <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 w-full">
                      <p className="text-sm font-black text-gray-400 uppercase mb-2">{t('detectPage.severityLevel')}</p>
                      <p className={`text-2xl font-black ${
                        result.severity_level === 'สูง' ? 'text-red-600' : 
                        result.severity_level === 'ปานกลาง' ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {result.severity_level === 'สูง' ? t('detectPage.severity.high') :
                         result.severity_level === 'ปานกลาง' ? t('detectPage.severity.medium') :
                         result.severity_level === 'ต่ำ' ? t('detectPage.severity.low') :
                         t('detectPage.severity.normal')}
                      </p>
                    </div>

                    {/* Confidence */}
                    <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 w-full flex flex-col justify-center">
                      <p className="text-sm font-black text-gray-400 uppercase mb-2">{t('detectPage.confidence')}</p>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                        <span className="text-2xl font-black text-gray-900">{result.confidence}%</span>
                        {result.confidence_level && (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] sm:text-xs font-medium rounded-lg whitespace-nowrap ${
                            result.confidence_level === 'high' ? 'bg-green-100 text-green-700' :
                            result.confidence_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            <TrendingUp className="w-3 h-3" />
                            {result.confidence_level === 'high' ? t('detectPage.confidenceHigh') :
                             result.confidence_level === 'medium' ? t('detectPage.confidenceMedium') : t('detectPage.confidenceLow')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Uncertainty Warning */}
                  {result.uncertainty && (result.uncertainty.is_uncertain || result.validation?.has_conflict) && (
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-orange-800 mb-1">{t('detectPage.uncertainResult')}</h4>
                        <p className="text-orange-700 text-sm">
                          {result.validation?.has_conflict 
                            ? `${result.validation.suggested_category} / ${result.validation.detected_category}`
                            : `${result.uncertainty.top_1_confidence}% / ${result.uncertainty.top_2_confidence}%`
                          }
                        </p>
                        <p className="text-orange-600 text-xs mt-1">{t('detectPage.uncertainAdvice')}</p>
                      </div>
                    </div>
                  )}

                  {/* Steps & Additional Info */}
                  <div className="space-y-6">
                    {result.symptoms && (
                      <div>
                        <h4 className="flex items-center gap-2 text-lg font-black text-gray-900 mb-4">
                          <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                            <Info className="w-5 h-5" />
                          </div>
                          {t('detectPage.symptoms')}
                        </h4>
                        <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 w-full overflow-hidden">
                          {result.symptoms.includes('<') ? (
                            <div 
                              className="html-content text-gray-700 font-medium leading-relaxed break-words flex-1 min-w-0"
                              dangerouslySetInnerHTML={{ __html: result.symptoms }} 
                            />
                          ) : (
                            <p className="text-gray-700 font-medium leading-relaxed break-words">{result.symptoms}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {result.treatment && result.treatment.length > 0 && (
                      <div>
                        <h4 className="flex items-center gap-2 text-lg font-black text-gray-900 mb-4">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          {t('detectPage.treatment')}
                        </h4>
                        <div className="space-y-3">
                          {result.treatment.map((step, i) => (
                            <div key={i} className="flex gap-3 sm:gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 w-full overflow-hidden">
                              {/* ตรวจสอบว่ามี HTML หรือไม่ */}
                              {step.includes('<') ? (
                                <div 
                                  className="html-content text-gray-700 font-medium flex-1 min-w-0 break-words"
                                  dangerouslySetInnerHTML={{ __html: step }} 
                                />
                              ) : (
                                <>
                                  <span className="font-black text-blue-600 flex-shrink-0">{i + 1}.</span>
                                  <p className="text-gray-700 font-medium flex-1 min-w-0 break-words">{step}</p>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.prevention && result.prevention.length > 0 && (
                      <div>
                        <h4 className="flex items-center gap-2 text-lg font-black text-gray-900 mb-4">
                          <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          {t('detectPage.prevention')}
                        </h4>
                        <div className="space-y-3">
                          {result.prevention.map((step, i) => (
                            <div key={i} className="flex gap-3 sm:gap-4 p-4 bg-green-50/50 rounded-2xl border border-green-100 w-full overflow-hidden">
                              {step.includes('<') ? (
                                <div 
                                  className="html-content text-gray-700 font-medium flex-1 min-w-0 break-words"
                                  dangerouslySetInnerHTML={{ __html: step }} 
                                />
                              ) : (
                                <>
                                  <span className="font-black text-green-600 flex-shrink-0">•</span>
                                  <p className="text-gray-700 font-medium flex-1 min-w-0 break-words">{step}</p>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detect;
