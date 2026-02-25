import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Camera, Upload, Scan, AlertCircle, CheckCircle, Send, MessageSquare, 
  Cpu, TrendingUp, AlertTriangle, Info, Sprout, Maximize2, Activity, Bug, Leaf,
  Shield
} from 'lucide-react';
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
  const [showTelegramWarning, setShowTelegramWarning] = useState(false);

  const [activePlots, setActivePlots] = useState([]);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ตรวจสอบสถานะล็อคอิน
  const isLoggedIn = !!localStorage.getItem('token');
  const userId = user?.user_id || user?._id;

  useEffect(() => {
    const checkTelegramStatus = async () => {
      // Attempt to check telegram using user_id if present
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
      // Backend expects integer user_id for /api/plots
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

  const startAnalysis = async () => {
    // If user wants to send to Telegram but is not connected, show warning
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
    formData.append('confidence_threshold', '0.4');
    
    if (selectedPlot) {
      const pid = selectedPlot.plot_id;
      if (pid) formData.append('plot_id', pid);
      
      const vid = selectedPlot.current_planting?.vegetable_id;
      if (vid) formData.append('vegetable_id', vid);
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
        title: t('detectPage.alerts.analysisFailedTitle'),
        text: error.response?.data?.detail || t('detectPage.alerts.analysisFailedDefault'),
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
    <div className="min-h-screen bg-secondary-50 pb-24">
      {/* Premium Header - Consistent with Dashboard */}
      <div className="relative bg-primary-900 pt-16 pb-32 px-4 overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800/40 via-primary-900 to-primary-950" />
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] animate-pulse" />
        
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/10 mb-6 transition-transform hover:scale-105">
            <Scan className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            {t('nav.detect')}
          </h1>
          <p className="text-primary-100/60 text-lg font-medium max-w-2xl mx-auto">
            {i18n.language === 'th' ? 'อัปโหลดรูปภาพเพื่อตรวจสอบโรคและแมลงศัตรูพืชด้วยระบบ AI อัจฉริยะ' : 'Upload photos to detect plant diseases and pests using our intelligent AI system.'}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-20">
        <div className="max-w-5xl mx-auto">
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
                        <Sprout className="w-4 h-4" /> {i18n.language === 'th' ? 'พืชที่กำลังปลูก' : 'CURRENT VEGETABLE'}
                      </p>
                      <p className="text-lg font-black text-gray-700">
                        {plot.current_planting?.vegetable_name || (i18n.language === 'th' ? 'ไม่ระบุชื่อผัก' : 'Not Specified')}
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
                      {i18n.language === 'th' ? 'ส่งวิเคราะห์ภาพ' : 'START ANALYSIS'}
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
                 {i18n.language === 'th' ? 'ยังไม่ได้เลือกแปลงผัก' : 'NO PLOT SELECTED'}
               </h3>
               <p className="text-slate-500 font-bold text-base mb-10 max-w-sm mx-auto leading-relaxed">
                 {i18n.language === 'th' ? 'คุณสามารถอัปโหลดรูปภาพทั่วไปเพื่อให้ระบบ AI วิเคราะห์ได้ทันที' : 'You can upload any general image to let our AI system analyze it immediately.'}
               </p>
               <button 
                onClick={() => setIsModalOpen(true)}
                className="px-12 py-5 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-500 transition-all flex items-center gap-3 mx-auto shadow-2xl shadow-primary-200 active:scale-95 uppercase tracking-widest text-sm"
               >
                <Camera className="w-6 h-6" />
                {i18n.language === 'th' ? 'เริ่มวิเคราะห์ทันที' : 'START ANALYSIS NOW'}
               </button>
            </div>
          )}

          {/* Analysis Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-primary-950/80 backdrop-blur-md">
              <div className={`bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] w-full ${result ? 'max-w-6xl' : 'max-w-xl'} h-[92vh] md:h-auto md:max-h-[90vh] relative overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-700 flex flex-col border border-white/10`}>
                
                {/* Minimal Close Button */}
                {!isAnalyzing && (
                  <button 
                    onClick={closeModal}
                    className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center bg-white/80 hover:bg-white text-primary-900 rounded-2xl transition-all z-30 shadow-sm border border-gray-100 group active:scale-90"
                  >
                    <span className="text-3xl font-light transform group-hover:rotate-90 transition-transform duration-300">×</span>
                  </button>
                )}

                <div className="p-5 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
                  {/* STEP 1: Telegram Warning (Image 2) */}
                  {!isAnalyzing && !result && showTelegramWarning && (
                    <div className="text-center py-4 flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full border-[3px] border-orange-200 flex items-center justify-center mb-10">
                         <span className="text-6xl text-orange-300 font-light">!</span>
                      </div>
                      
                      <h2 className="text-4xl font-black text-gray-700 mb-8 flex items-center gap-3">
                        <AlertTriangle className="w-10 h-10 text-gray-600" />
                        ยังไม่ได้เชื่อมต่อ Telegram!
                      </h2>

                      <div className="text-left space-y-4 mb-10 w-full px-2">
                        <p className="font-black text-gray-700 text-xl flex items-center gap-2">
                          <Info className="w-6 h-6 text-gray-600" />
                          เพื่อรับผลการวิเคราะห์:
                        </p>
                        <ul className="space-y-3 text-gray-600 text-lg font-medium pl-2">
                          <li className="flex items-start gap-2">
                            <span className="mt-1.5 w-2 h-2 rounded-full bg-gray-600 flex-shrink-0"></span>
                            ผู้ใช้จำเป็นต้องเชื่อมต่อบัญชี Telegram ก่อน
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="mt-1.5 w-2 h-2 rounded-full bg-gray-600 flex-shrink-0"></span>
                            ระบบจะส่งผลการวิเคราะห์ไปยัง Telegram ของคุณ
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="mt-1.5 w-2 h-2 rounded-full bg-gray-600 flex-shrink-0"></span>
                            หากไม่เชื่อมต่อ จะไม่ได้รับการแจ้งเตือน
                          </li>
                        </ul>
                      </div>

                      <div className="flex flex-col w-full gap-4">
                        <button 
                          onClick={() => {
                            setShowTelegramWarning(false);
                            startAnalysis();
                          }}
                          className="w-full py-4 bg-[#28a745] hover:bg-[#218838] text-white font-bold rounded-[10px] flex items-center justify-center gap-2 text-lg shadow-sm"
                        >
                          <Scan className="w-6 h-6" />
                          ดำเนินการต่อ (ไม่มีแจ้งเตือน)
                        </button>
                        <a 
                          href="/telegram"
                          className="w-full py-4 bg-[#0088cc] hover:bg-[#0077b3] text-white font-bold rounded-[10px] flex items-center justify-center gap-2 text-lg shadow-sm"
                        >
                          <Send className="w-6 h-6" />
                          ไปเชื่อมต่อ Telegram
                        </a>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Upload View (Image 3) */}
                  {!isAnalyzing && !result && !showTelegramWarning && (
                    <div className="py-2">
                      <h2 className="text-[22px] font-bold text-green-700 mb-6 font-display">ส่งรูปภาพเพื่อวิเคราะห์</h2>
                      
                      <div className="space-y-6">
                        <div className="text-left">
                          <p className="text-lg font-bold text-gray-800 mb-1">อัปโหลดรูปภาพผักเพื่อตรวจ</p>
                          <p className="text-base text-gray-600">(ระบบจะวิเคราะห์รูปภาพแรกที่ท่านเลือก)</p>
                        </div>

                        <div className="flex flex-col gap-4">
                          <input 
                            type="file" 
                            id="modal-file-input" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageSelect}
                          />
                          <label 
                            htmlFor="modal-file-input"
                            className="w-full py-5 bg-[#528C56] hover:bg-[#467849] text-white font-bold rounded-[10px] flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors text-xl"
                          >
                            <Upload className="w-6 h-6" />
                            เลือกรูปภาพ
                          </label>

                          {selectedImage && (
                            <div className="w-full h-52 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center relative group">
                              <img 
                                src={selectedImage} 
                                alt="Selected Preview" 
                                className="max-w-full max-h-full object-contain"
                              />
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  setSelectedImage(null);
                                  setSelectedFile(null);
                                }}
                                className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                              >
                                ×
                              </button>
                            </div>
                          )}

                          <div className="w-full h-14 bg-[#F8F9FA] rounded-[8px] border border-gray-100 flex items-center px-4 text-gray-500 font-medium overflow-hidden">
                            {selectedFile ? selectedFile.name : 'ยังไม่ได้เลือกไฟล์'}
                          </div>

                          {/* Selection UI for Telegram and DB (Added back per feedback) */}
                          <div className="space-y-3 bg-[#F8F9FA] py-4 px-6 rounded-xl border border-gray-100 mt-2">
                             {/* Save Result Option */}
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id="save-result-check"
                                checked={saveResult}
                                onChange={(e) => setSaveResult(e.target.checked)}
                                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                              />
                              <label htmlFor="save-result-check" className="text-sm font-bold text-gray-700 cursor-pointer">
                                {t('detectPage.saveHistory')}
                              </label>
                            </div>

                            {/* Telegram Option */}
                            {telegramConnected ? (
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  id="send-telegram-check"
                                  checked={sendToTelegram}
                                  onChange={(e) => setSendToTelegram(e.target.checked)}
                                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="send-telegram-check" className="text-sm font-bold text-gray-700 cursor-pointer flex items-center gap-2">
                                  <MessageSquare className="w-4 h-4 text-blue-500" />
                                  {t('detectPage.sendToTelegram')}
                                </label>
                              </div>
                            ) : isLoggedIn && !isCheckingTelegram && (
                              <div className="flex items-center gap-2.5 p-2 bg-orange-50/50 border border-orange-100 rounded-lg">
                                <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                <p className="text-xs text-orange-700 font-medium leading-tight">
                                  {t('detectPage.telegramNotConnected')} 
                                  <a href="/telegram" className="ml-1 text-blue-600 hover:underline font-bold">
                                    {t('detectPage.connectNow')}
                                  </a>
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-3 items-start py-4">
                           <Info className="w-6 h-6 text-black flex-shrink-0 mt-0.5" />
                           <p className="text-lg font-bold text-black leading-tight">
                             หลังจากกด "ส่งวิเคราะห์" กรุณารอสักครู่เพื่อให้ระบบทำการวิเคราะห์ภาพ
                           </p>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex gap-4">
                           <button 
                            onClick={closeModal}
                            className="flex-1 py-4 bg-[#46957F] hover:bg-[#3d836e] text-white font-bold rounded-[10px] text-xl transition-colors"
                           >
                            ยกเลิก
                           </button>
                           <button 
                            onClick={startAnalysis}
                            disabled={!selectedFile}
                            className="flex-1 py-4 bg-[#2ECC71] hover:bg-[#27ae60] text-white font-bold rounded-[10px] text-xl shadow-sm transition-colors disabled:opacity-50"
                           >
                            ส่งวิเคราะห์
                           </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* LOADING STATE */}
                  {isAnalyzing && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                       <div className="w-20 h-20 relative mb-8">
                         <div className="absolute inset-0 border-4 border-green-100 rounded-full"></div>
                         <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
                       </div>
                       <h3 className="text-2xl font-bold text-gray-800 mb-2">กำลังประมวลผล...</h3>
                       <p className="text-gray-500">ระบบ AI กำลังตรวจสอบรูปภาพของคุณ</p>
                    </div>
                  )}

                  {/* STEP 3: Zen-Minimalist Result View (Organic Split) */}
                  {!isAnalyzing && result && (
                    <div className="flex flex-col md:flex-row h-full animate-in fade-in duration-700 overflow-hidden">
                      
                      {/* Left Side: Visual Evidence & Primary Stats */}
                      <div className="w-full md:w-[42%] bg-secondary-50/50 p-8 md:p-12 flex flex-col border-b md:border-b-0 md:border-r border-secondary-100 overflow-y-auto custom-scrollbar">
                        <div className="mb-10">
                          <p className="text-secondary-400 font-black text-[11px] uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                             {i18n.language === 'th' ? 'การวิเคราะห์เสร็จสมบูรณ์' : 'ANALYSIS COMPLETE'}
                          </p>
                          <h2 className="text-4xl font-black text-primary-900 leading-tight mb-2">
                            {i18n.language === 'en' ? result.target_name_en : result.target_name_th}
                          </h2>
                          <div className={`inline-flex items-center gap-2 text-sm font-bold ${result.category === 'pest' ? 'text-orange-600' : 'text-red-500'}`}>
                            {result.category === 'pest' ? <Bug className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                            {result.category === 'pest' ? (i18n.language === 'th' ? 'ตรวจพบศัตรูพืช' : 'Pest Detected') : (i18n.language === 'th' ? 'ตรวจพบโรคพืช' : 'Disease Detected')}
                          </div>
                        </div>

                        <div className="relative mb-10 group">
                           <div className="aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl border-4 border-white transform transition-transform duration-500 group-hover:scale-[1.02]">
                             <img 
                               src={selectedImage} 
                               alt="Analysis Target" 
                               className="w-full h-full object-cover"
                             />
                           </div>
                           <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white rounded-[24px] shadow-2xl border border-secondary-100 flex flex-col items-center justify-center p-4">
                              <span className="text-[10px] font-black text-secondary-300 uppercase tracking-widest mb-1 text-center leading-none italic">Confidence</span>
                              <span className="text-3xl font-black text-primary-600 leading-none">{result.confidence}%</span>
                           </div>
                        </div>

                        <div className="space-y-6 mt-4">
                           <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-50 shadow-sm">
                              <div className="flex items-center gap-3">
                                <Activity className="w-5 h-5 text-red-400" />
                                <span className="text-sm font-bold text-gray-700">{i18n.language === 'th' ? 'ระดับความรุนแรง' : 'Severity'}</span>
                              </div>
                              <span className="px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-black uppercase tracking-wider">
                                {(result.severity === 'Normal' && i18n.language === 'th') ? 'ปกติ' : result.severity || 'Normal'}
                              </span>
                           </div>
                           <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-50 shadow-sm">
                              <div className="flex items-center gap-3">
                                <Cpu className="w-5 h-5 text-blue-400" />
                                <span className="text-sm font-bold text-gray-700">{i18n.language === 'th' ? 'เซ็นเซอร์/โมเดล' : 'AI Engine'}</span>
                              </div>
                              <span className="text-xs font-black text-blue-500 uppercase">MN-V2 Professional</span>
                           </div>
                        </div>
                      </div>

                      {/* Right Side: Detailed Intelligence */}
                      <div className="flex-1 p-8 md:p-16 flex flex-col overflow-y-auto custom-scrollbar">
                        <div className="max-w-2xl mx-auto w-full space-y-12">
                          
                          {/* Section: Diagnostics */}
                          <section>
                            <div className="flex items-center gap-4 mb-6">
                              <div className="w-12 h-12 rounded-2xl bg-primary-900 text-white flex items-center justify-center shadow-lg">
                                <AlertCircle className="w-6 h-6" />
                              </div>
                              <div>
                                <h3 className="text-2xl font-black text-primary-900 tracking-tight">{i18n.language === 'th' ? 'วินิจฉัยอาการ' : 'Clinical Diagnostics'}</h3>
                                <p className="text-xs font-bold text-secondary-400 uppercase tracking-widest">{i18n.language === 'th' ? 'สาเหตุและการปรากฏ' : 'Root Cause & Symptoms'}</p>
                              </div>
                            </div>
                            <div className="text-lg leading-relaxed text-slate-600 font-medium pl-6 border-l-4 border-primary-100">
                               {result.cause || result.symptoms || (i18n.language === 'th' ? 'ไม่พบข้อมูลอาการที่ระบุชัดเจน' : 'No specific clinical symptoms reported.')}
                            </div>
                          </section>

                          {/* Section: Prescriptive Actions */}
                          <section>
                            <div className="flex items-center gap-4 mb-6">
                              <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-glow shadow-primary-200">
                                <Sprout className="w-6 h-6" />
                              </div>
                              <div>
                                <h3 className="text-2xl font-black text-primary-900 tracking-tight">{i18n.language === 'th' ? 'แนวทางแก้ไข' : 'Prescriptive Care'}</h3>
                                <p className="text-xs font-bold text-secondary-400 uppercase tracking-widest">{i18n.language === 'th' ? 'คำแนะนำจากผู้เชี่ยวชาญ' : 'Expert Management Steps'}</p>
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
                                   <p className="text-secondary-400 font-bold italic text-sm">{i18n.language === 'th' ? 'อยู่ระหว่างการปรับปรุงข้อมูล' : 'Treatment protocols are currently under review.'}</p>
                                </div>
                              )}
                            </div>
                          </section>

                          {/* Action Buttons */}
                          <div className="pt-10 flex flex-col sm:flex-row gap-5">
                            <button 
                              onClick={() => {
                                if (result.detected_class_id) {
                                  window.location.href = `/diseases-pest/details/${result.detected_class_id}`;
                                } else {
                                  closeModal();
                                }
                              }}
                              className={`flex-1 py-5 bg-primary-600 hover:bg-primary-500 text-white font-black rounded-2xl text-lg shadow-2xl shadow-primary-200 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm`}
                            >
                              <Info className="w-5 h-5" />
                              {i18n.language === 'th' ? 'ดูข้อมูลเชิงลึก' : 'View Full Details'}
                            </button>
                            <button 
                              onClick={closeModal}
                              className="px-10 py-5 bg-white hover:bg-secondary-50 text-primary-900 font-black rounded-2xl text-lg transition-all active:scale-95 border border-secondary-200 shadow-lg shadow-gray-100 uppercase tracking-widest text-sm"
                            >
                              {i18n.language === 'th' ? 'เสร็จสิ้น' : 'Finish'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );

};

export default Detect;
