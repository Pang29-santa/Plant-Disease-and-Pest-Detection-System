import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Camera, Upload, Scan, AlertCircle, CheckCircle, Send, MessageSquare, 
  Cpu, TrendingUp, AlertTriangle, Info, Sprout, Maximize2, Activity, Bug, Leaf,
  Shield, CheckCircle2
} from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { useDetection } from '../../context/DetectionContext';
import { getTelegramConnection } from '../../services/telegramApi';

const DetectWithPlot = () => {
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
  const [showTelegramWarning, setShowTelegramWarning] = useState(false);

  const [activePlots, setActivePlots] = useState([]);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const userId = user?.user_id || user?._id;
  const isThai = i18n.language === 'th';

  // ป้องกันการ scroll ของ body เมื่อ modal เปิด
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  useEffect(() => {
    const checkTelegramStatus = async () => {
      const tid = user?.user_id || user?._id;
      if (!tid) {
        setIsCheckingTelegram(false);
        return;
      }
      try {
        const connections = await getTelegramConnection(tid);
        if (connections && connections.length > 0) {
          const activeConnection = connections.find(c => c.status === 'active');
          if (activeConnection) setTelegramConnected(true);
        }
      } catch (error) {
        console.log('No Telegram connection found');
      } finally {
        setIsCheckingTelegram(false);
      }
    };

    const fetchActivePlots = async () => {
      const numericUserId = user?.user_id;
      if (!numericUserId) return;
      
      try {
        const res = await axios.get('/api/plots', { params: { user_id: numericUserId } });
        const mapped = (res.data || []).map(p => ({
          ...p,
          name: p.plot_name || p.name,
          area: p.size || p.area,
          area_unit: p.unit || p.area_unit,
          image_url: p.image_path || p.image_url,
        }));
        const active = mapped.filter(p => (p.status === 1 || p.status === '1') && p.current_planting);
        setActivePlots(active);
      } catch (err) {
        console.error("Failed to load plots for detection", err);
      }
    };

    checkTelegramStatus();
    fetchActivePlots();
  }, [user]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: t('detectPage.alerts.fileTooLargeTitle') || 'ไฟล์ใหญ่เกินไป',
          text: t('detectPage.alerts.fileTooLargeText') || 'ขนาดไฟล์ต้องไม่เกิน 10MB',
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

  const startAnalysis = async () => {
    if (sendToTelegram && !telegramConnected && !showTelegramWarning) {
      setShowTelegramWarning(true);
      return;
    }
    
    setShowTelegramWarning(false);
    setIsAnalyzing(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('save_result', saveResult ? 'true' : 'false');
    formData.append('send_telegram', sendToTelegram && telegramConnected ? 'true' : 'false');
    formData.append('use_tta', 'true');
    formData.append('enhance', 'true');
    formData.append('confidence_threshold', '0.35');  // 35% threshold
    formData.append('use_ai_fallback', 'true');  // เรียก Kimi AI เมื่อ TensorFlow ไม่แน่ใจ
    
    if (selectedPlot) {
      const pid = selectedPlot.plot_id;
      if (pid) formData.append('plot_id', pid);
    }

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
      } else {
        throw new Error(response.data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      Swal.fire({
        icon: 'error',
        title: t('detectPage.alerts.analysisFailedTitle') || 'วิเคราะห์ไม่สำเร็จ',
        text: error.response?.data?.detail || 'เกิดข้อผิดพลาดในการวิเคราะห์',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setShowTelegramWarning(false);
    setSelectedImage(null);
    setSelectedFile(null);
    setResult(null);
    setSelectedPlot(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Page Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              {isThai ? 'วิเคราะห์ตามแปลง' : 'Plot Analysis'}
            </h1>
            <p className="text-lg text-gray-500 mt-2 font-medium">
              {isThai 
                ? 'เลือกแปลงผักเพื่อวิเคราะห์พร้อมบันทึกประวัติ' 
                : 'Select a plot to analyze with history tracking.'}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="hidden sm:flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-black rounded-2xl text-sm uppercase tracking-widest transition-all shadow-lg shadow-primary-200 active:scale-95"
          >
            <Upload className="w-4 h-4" />
            {isThai ? 'อัปโหลดทั่วไป' : 'General Upload'}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {activePlots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {activePlots.map(plot => (
              <div key={plot.id || plot._id} className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-all duration-300 overflow-hidden border border-transparent hover:border-primary-100 flex flex-col group cursor-pointer active:scale-95">
                <div className="h-52 overflow-hidden relative">
                  <img 
                    src={plot.image_url || 'https://via.placeholder.com/300x150?text=No+Image'} 
                    alt={plot.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="font-black text-gray-900 text-2xl mb-2 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{plot.name}</h3>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary-50 rounded-full">
                      <Maximize2 className="w-3.5 h-3.5 text-secondary-400" /> 
                      <span className="text-[10px] font-black text-secondary-500 uppercase tracking-widest">
                        {plot.area} {plot.area_unit || 'm²'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-secondary-50/50 rounded-2xl p-5 mb-8 flex-1 border border-secondary-100/50">
                    <p className="text-[10px] font-black text-secondary-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                      <Sprout className="w-4 h-4" /> {isThai ? 'พืชที่กำลังปลูก' : 'CURRENT VEGETABLE'}
                    </p>
                    <p className="text-lg font-black text-gray-700">
                      {plot.current_planting?.vegetable_name || (isThai ? 'ไม่ระบุชื่อผัก' : 'Not Specified')}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedPlot(plot);
                      setIsModalOpen(true);
                    }}
                    className="w-full py-4.5 bg-primary-600 hover:bg-primary-500 text-white text-center font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-primary-200 flex items-center justify-center gap-3 active:scale-95 group/btn"
                  >
                    <Camera className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                    {isThai ? 'ส่งวิเคราะห์ภาพ' : 'START ANALYSIS'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-16 border border-gray-100 text-center shadow-xl shadow-gray-200/50 max-w-2xl mx-auto overflow-hidden relative group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary-100 transition-colors" />
             <div className="w-24 h-24 bg-primary-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 relative z-10 transform group-hover:rotate-6 transition-transform">
                <Upload className="w-10 h-10 text-primary-600" />
             </div>
             <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight uppercase">
               {isThai ? 'ยังไม่มีแปลงที่ใช้งาน' : 'NO ACTIVE PLOTS'}
             </h3>
             <p className="text-slate-500 font-bold text-base mb-10 max-w-sm mx-auto leading-relaxed">
               {isThai ? 'คุณสามารถอัปโหลดรูปภาพทั่วไปเพื่อให้ระบบ AI วิเคราะห์ได้' : 'You can upload a general image for AI analysis.'}
             </p>
             <button 
              onClick={() => setIsModalOpen(true)}
              className="px-12 py-5 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-500 transition-all flex items-center gap-3 mx-auto shadow-2xl shadow-primary-200 active:scale-95 uppercase tracking-widest text-sm"
             >
              <Camera className="w-6 h-6" />
              {isThai ? 'เริ่มวิเคราะห์ทันที' : 'START ANALYSIS NOW'}
             </button>
          </div>
        )}

        {/* Analysis Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-primary-950/80 backdrop-blur-md">
            <div className={`bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] w-full ${result ? 'max-w-6xl' : 'max-w-xl'} h-[92vh] md:h-auto md:max-h-[90vh] relative overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-700 flex flex-col border border-white/10`}>
              
              {!isAnalyzing && (
                <button 
                  onClick={closeModal}
                  className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center bg-white/80 hover:bg-white text-primary-900 rounded-2xl transition-all z-30 shadow-sm border border-gray-100 group active:scale-90"
                >
                  <span className="text-3xl font-light transform group-hover:rotate-90 transition-transform duration-300">×</span>
                </button>
              )}

              <div className="p-5 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
                {/* Telegram Warning */}
                {!isAnalyzing && !result && showTelegramWarning && (
                  <div className="text-center py-4 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full border-[3px] border-orange-200 flex items-center justify-center mb-10">
                       <span className="text-6xl text-orange-300 font-light">!</span>
                    </div>
                    
                    <h2 className="text-4xl font-black text-gray-700 mb-8 flex items-center gap-3">
                      <AlertTriangle className="w-10 h-10 text-gray-600" />
                      {isThai ? 'ยังไม่ได้เชื่อมต่อ Telegram!' : 'Telegram Not Connected!'}
                    </h2>

                    <div className="text-left space-y-4 mb-10 w-full px-2">
                      <p className="font-black text-gray-700 text-xl flex items-center gap-2">
                        <Info className="w-6 h-6 text-gray-600" />
                        {isThai ? 'เพื่อรับผลการวิเคราะห์:' : 'To receive analysis results:'}
                      </p>
                      <ul className="space-y-3 text-gray-600 text-lg font-medium pl-2">
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-gray-600 flex-shrink-0"></span>
                          {isThai ? 'ผู้ใช้จำเป็นต้องเชื่อมต่อบัญชี Telegram ก่อน' : 'You need to connect your Telegram account first'}
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-gray-600 flex-shrink-0"></span>
                          {isThai ? 'ระบบจะส่งผลการวิเคราะห์ไปยัง Telegram ของคุณ' : 'The system will send results to your Telegram'}
                        </li>
                      </ul>
                    </div>

                    <div className="flex flex-col w-full gap-4">
                      <button 
                        onClick={() => {
                          setShowTelegramWarning(false);
                          startAnalysis();
                        }}
                        className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest text-sm shadow-lg shadow-primary-200 transition-all active:scale-95"
                      >
                        <Scan className="w-5 h-5" />
                        {isThai ? 'ดำเนินการต่อ (ไม่มีแจ้งเตือน)' : 'Continue (No Notification)'}
                      </button>
                      <a 
                        href="/telegram"
                        className="w-full py-4 bg-sky-500 hover:bg-sky-400 text-white font-black rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest text-sm shadow-lg shadow-sky-200 transition-all active:scale-95"
                      >
                        <Send className="w-5 h-5" />
                        {isThai ? 'ไปเชื่อมต่อ Telegram' : 'Connect Telegram'}
                      </a>
                    </div>
                  </div>
                )}

                {/* Upload View */}
                {!isAnalyzing && !result && !showTelegramWarning && (
                  <div className="py-2">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-primary-900 text-white flex items-center justify-center shadow-lg flex-shrink-0">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-primary-900 tracking-tight">{isThai ? 'ส่งรูปภาพเพื่อวิเคราะห์' : 'Submit Image for Analysis'}</h2>
                        <p className="text-xs font-bold text-secondary-400 uppercase tracking-widest">{isThai ? 'ระบบ AI จะตรวจสอบโรคและแมลงศัตรูพืช' : 'AI will detect diseases & pests'}</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <input 
                          type="file" 
                          id="modal-file-input" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageSelect}
                        />

                        {selectedImage ? (
                          <div className="w-full h-56 bg-secondary-50 rounded-3xl overflow-hidden border-2 border-secondary-100 flex items-center justify-center relative group">
                            <img 
                              src={selectedImage} 
                              alt="Selected Preview" 
                              className="max-w-full max-h-full object-contain"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  setSelectedImage(null);
                                  setSelectedFile(null);
                                }}
                                className="w-10 h-10 bg-red-500 text-white rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg active:scale-90"
                              >
                                ×
                              </button>
                            </div>
                            <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center gap-2 border border-gray-100 shadow-sm">
                              <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0" />
                              <span className="text-xs font-bold text-gray-700 truncate">{selectedFile?.name}</span>
                            </div>
                          </div>
                        ) : (
                          <label 
                            htmlFor="modal-file-input"
                            className="w-full h-40 border-2 border-dashed border-secondary-200 hover:border-primary-400 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all bg-secondary-50 hover:bg-primary-50 group"
                          >
                            <div className="w-14 h-14 rounded-2xl bg-white border border-secondary-100 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:border-primary-200 transition-all">
                              <Upload className="w-7 h-7 text-secondary-400 group-hover:text-primary-500 transition-colors" />
                            </div>
                            <div className="text-center">
                              <p className="font-black text-gray-700 text-sm group-hover:text-primary-700 transition-colors">{isThai ? 'คลิกเพื่อเลือกรูปภาพ' : 'Click to select image'}</p>
                              <p className="text-xs text-secondary-400 font-medium mt-1">{isThai ? 'รองรับ JPG, PNG (ไม่เกิน 10MB)' : 'JPG, PNG supported (max 10MB)'}</p>
                            </div>
                          </label>
                        )}

                        {!selectedImage && (
                          <label
                            htmlFor="modal-file-input"
                            className="mt-4 w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-primary-200 active:scale-95 uppercase tracking-widest text-sm"
                          >
                            <Upload className="w-5 h-5" />
                            {isThai ? 'เลือกรูปภาพ' : 'Select Image'}
                          </label>
                        )}
                      </div>

                      {/* Options */}
                      <div className="space-y-3 bg-secondary-50 py-5 px-6 rounded-2xl border border-secondary-100">
                        <p className="text-[10px] font-black text-secondary-400 uppercase tracking-[0.2em] mb-4">{isThai ? 'ตัวเลือก' : 'Options'}</p>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="save-result-check"
                            checked={saveResult}
                            onChange={(e) => setSaveResult(e.target.checked)}
                            className="w-5 h-5 accent-primary-600 rounded"
                          />
                          <label htmlFor="save-result-check" className="text-sm font-bold text-gray-700 cursor-pointer">
                            {t('detectPage.saveHistory') || 'บันทึกประวัติการวิเคราะห์'}
                          </label>
                        </div>

                        {telegramConnected ? (
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id="send-telegram-check"
                              checked={sendToTelegram}
                              onChange={(e) => setSendToTelegram(e.target.checked)}
                              className="w-5 h-5 accent-sky-500 rounded"
                            />
                            <label htmlFor="send-telegram-check" className="text-sm font-bold text-gray-700 cursor-pointer flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-sky-500" />
                              {t('detectPage.sendToTelegram') || 'ส่งผลไป Telegram'}
                            </label>
                          </div>
                        ) : !isCheckingTelegram && (
                          <div className="flex items-center gap-2.5 p-2.5 bg-orange-50 border border-orange-100 rounded-xl">
                            <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                            <p className="text-xs text-orange-700 font-medium leading-tight">
                              {t('detectPage.telegramNotConnected') || 'ยังไม่ได้เชื่อมต่อ Telegram'} 
                              <a href="/telegram" className="ml-1 text-sky-600 hover:underline font-black">
                                {t('detectPage.connectNow') || 'เชื่อมต่อเลย'}
                              </a>
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 items-start p-4 bg-primary-50 rounded-2xl border border-primary-100">
                        <Info className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-bold text-primary-800 leading-relaxed">
                          {isThai ? 'หลังจากกด "ส่งวิเคราะห์" กรุณารอสักครู่เพื่อให้ระบบ AI ทำการวิเคราะห์ภาพ' : 'After clicking "Analyze", please wait for the AI to process your image.'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-secondary-100 flex gap-4">
                        <button 
                          onClick={closeModal}
                          className="flex-1 py-4 bg-white hover:bg-secondary-50 text-primary-900 font-black rounded-2xl text-sm uppercase tracking-widest transition-all border border-secondary-200 shadow-sm active:scale-95"
                        >
                          {isThai ? 'ยกเลิก' : 'Cancel'}
                        </button>
                        <button 
                          onClick={startAnalysis}
                          disabled={!selectedFile}
                          className="flex-1 py-4 bg-primary-600 hover:bg-primary-500 text-white font-black rounded-2xl text-sm uppercase tracking-widest shadow-lg shadow-primary-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <Scan className="w-5 h-5" />
                          {isThai ? 'ส่งวิเคราะห์' : 'Analyze'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* LOADING STATE */}
                {isAnalyzing && (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="relative mb-10">
                      <div className="w-24 h-24 rounded-full border-4 border-secondary-100"></div>
                      <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Scan className="w-8 h-8 text-primary-400 animate-pulse" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-primary-900 tracking-tight mb-2">{isThai ? 'กำลังประมวลผล...' : 'Processing...'}</h3>
                    <p className="text-secondary-400 font-bold text-sm uppercase tracking-widest">{isThai ? 'ระบบ AI กำลังตรวจสอบรูปภาพของคุณ' : 'AI is analyzing your image'}</p>
                  </div>
                )}

                {/* Result View - Simple */}
                {!isAnalyzing && result && (
                  <div className="flex flex-col h-full animate-in fade-in duration-500 overflow-y-auto custom-scrollbar p-4 md:p-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 ${
                        result.category === 'pest' ? 'bg-orange-100 text-orange-700' : 
                        result.category === 'disease' ? 'bg-red-100 text-red-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {result.category === 'pest' ? <Bug className="w-3 h-3" /> : 
                         result.category === 'disease' ? <Shield className="w-3 h-3" /> :
                         <CheckCircle className="w-3 h-3" />}
                        {result.category === 'pest' ? (isThai ? 'ศัตรูพืช' : 'PEST') : 
                         result.category === 'disease' ? (isThai ? 'โรคพืช' : 'DISEASE') :
                         (isThai ? 'สุขภาพดี' : 'HEALTHY')}
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black text-gray-900">
                        {isThai ? result.target_name_th : result.target_name_en}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {result.fallback_used ? 'Kimi AI' : 'AI'} • {result.confidence}%
                      </p>
                    </div>

                    {/* Image */}
                    <div className="relative mb-6 mx-auto max-w-xs">
                      <div className="aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-white">
                        <img src={selectedImage} alt="Analysis" className="w-full h-full object-cover" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4 max-w-lg mx-auto w-full">

                    {/* Right Side */}
                    <div className="flex-1 p-8 md:p-16 flex flex-col overflow-y-auto custom-scrollbar">
                      <div className="max-w-2xl mx-auto w-full space-y-12">
                        
                        {/* แสดงวินิจฉัยและแนวทางแก้ไขเฉพาะเมื่อตรวจพบโรค/ศัตรูพืช */}
                        {result.category !== 'healthy' && (
                          <>
                            {/* Section: Diagnostics */}
                            <section>
                              <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-primary-900 text-white flex items-center justify-center shadow-lg">
                                  <AlertCircle className="w-6 h-6" />
                                </div>
                                <div>
                                  <h3 className="text-2xl font-black text-primary-900 tracking-tight">{isThai ? 'วินิจฉัยอาการ' : 'Clinical Diagnostics'}</h3>
                                  <p className="text-xs font-bold text-secondary-400 uppercase tracking-widest">{isThai ? 'สาเหตุและการปรากฏ' : 'Root Cause & Symptoms'}</p>
                                </div>
                              </div>
                              <div className="text-lg leading-relaxed text-slate-600 font-medium pl-6 border-l-4 border-primary-100">
                                 {result.cause || result.symptoms || (isThai ? 'ไม่พบข้อมูลอาการที่ระบุชัดเจน' : 'No specific clinical symptoms reported.')}
                              </div>
                            </section>

                            {/* Section: Prescriptive Actions */}
                            <section>
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-glow shadow-primary-200">
                              <Sprout className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-black text-primary-900 tracking-tight">{isThai ? 'แนวทางแก้ไข' : 'Prescriptive Care'}</h3>
                              <p className="text-xs font-bold text-secondary-400 uppercase tracking-widest">{isThai ? 'คำแนะนำจากผู้เชี่ยวชาญ' : 'Expert Management Steps'}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            {(result.prevention || result.treatment || []).length > 0 ? (
                              [(result.prevention || []), (result.treatment || [])].flat().slice(0, 4).map((step, i) => (
                                <div key={i} className="flex gap-5 p-6 bg-secondary-50/50 rounded-[2rem] border border-secondary-100 hover:border-primary-200 transition-all group/item shadow-sm hover:shadow-md">
                                  <div className="w-8 h-8 rounded-xl bg-white text-primary-600 flex items-center justify-center text-xs font-black shadow-sm shrink-0 border border-secondary-100 group-hover/item:scale-110 transition-transform">
                                    {i + 1}
                                  </div>
                                  <p className="text-slate-700 font-bold leading-relaxed">{step}</p>
                                </div>
                              ))
                            ) : (
                              <div className="p-12 text-center bg-secondary-50 rounded-[2rem] border-2 border-dashed border-secondary-200">
                                 <Leaf className="w-12 h-12 text-secondary-300 mx-auto mb-4 opacity-50" />
                                 <p className="text-secondary-400 font-bold italic text-sm">{isThai ? 'อยู่ระหว่างการปรับปรุงข้อมูล' : 'Treatment protocols are currently under review.'}</p>
                              </div>
                            )}
                          </div>
                            </section>
                          </>
                        )}
                        
                        {/* แสดงข้อความสรุปสำหรับพืชสุขภาพดี - Mobile Optimized */}
                        {result.category === 'healthy' && (
                          <div className="text-center py-8 md:py-12">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                              <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-3">
                              {isThai ? 'พืชของคุณแข็งแรงดี! 🎉' : 'Your plant is healthy! 🎉'}
                            </h3>
                            <p className="text-gray-600 font-medium max-w-md mx-auto leading-relaxed px-4">
                              {isThai 
                                ? 'ไม่พบโรคหรือศัตรูพืชในภาพ ควรดูแลรักษาตามปกติและตรวจสอบเป็นประจำ'
                                : 'No disease or pest detected. Continue normal care and regular checkups.'}
                            </p>
                          </div>
                        )}

                  {/* Buttons */}
                  <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100 max-w-lg mx-auto">
                    {result.detected_class_id ? (
                      <a 
                        href={`/diseases-pest/details/${result.detected_class_id}`}
                        className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl text-center"
                      >
                        {isThai ? 'ดูข้อมูลเพิ่มเติม' : 'More Info'}
                      </a>
                    ) : result.category !== 'healthy' && result.target_name_en ? (
                      <a 
                        href={`/diseases-pests?search=${encodeURIComponent(result.target_name_th || result.target_name_en)}`}
                        className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl text-center"
                      >
                        {isThai ? `ค้นหา: ${result.target_name_th || result.target_name_en}` : `Search: ${result.target_name_en}`}
                      </a>
                    ) : (
                      <button 
                        onClick={() => { setSelectedImage(null); setSelectedFile(null); setResult(null); }}
                        className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl"
                      >
                        {isThai ? 'วิเคราะห์ใหม่' : 'Analyze Again'}
                      </button>
                    )}
                    <button 
                      onClick={closeModal}
                      className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl"
                    >
                      {isThai ? 'ปิด' : 'Close'}
                    </button>
                  </div>
                </div>
              )}
              </div>
              </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default DetectWithPlot;
