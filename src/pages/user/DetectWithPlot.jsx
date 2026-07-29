import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  Camera, Upload, Scan, AlertCircle, CheckCircle, Send, MessageSquare,
  Cpu, TrendingUp, AlertTriangle, Info, Sprout, Maximize2, Activity, Bug, Leaf,
  Shield, CheckCircle2, Sparkles, RefreshCw, X, ArrowRight, Layers, MapPin
} from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { useDetection } from '../../context/DetectionContext';
import { getTelegramConnection } from '../../services/telegramApi';
import { getImageUrl } from '../../utils/urlHelper';

const DetectWithPlot = () => {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading } = useAuth();

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
  const [loadingPlots, setLoadingPlots] = useState(true);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  const userId = user?.user_id || user?.id || user?._id;
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

  // จำลองขั้นตอนการวิเคราะห์เมื่อกำลังทำงาน
  useEffect(() => {
    let interval;
    if (isAnalyzing) {
      setAnalysisStep(1);
      interval = setInterval(() => {
        setAnalysisStep(prev => (prev < 3 ? prev + 1 : prev));
      }, 1100);
    } else {
      setAnalysisStep(0);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  useEffect(() => {
    if (authLoading) return;

    const checkTelegramStatus = async () => {
      if (!userId) {
        setIsCheckingTelegram(false);
        return;
      }
      try {
        const connections = await getTelegramConnection(userId);
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
      if (!userId) {
        setLoadingPlots(false);
        return;
      }

      try {
        setLoadingPlots(true);
        const res = await axios.get('/api/plots', { params: { user_id: userId } });
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
      } finally {
        setLoadingPlots(false);
      }
    };

    checkTelegramStatus();
    fetchActivePlots();
  }, [userId, authLoading]);

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
    <>
      <div className="bg-[#F8FAFC] pb-24 flex-grow">
        {/* Page Header */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-xs font-bold mb-2">
                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                {isThai ? 'ระบบวิเคราะห์ตามแปลงเกษตร' : 'Plot-Based Detection System'}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                {isThai ? 'วิเคราะห์ตามแปลง' : 'Plot Analysis'}
              </h1>
              <p className="text-base sm:text-lg text-gray-500 mt-1 font-medium">
                {isThai
                  ? 'เลือกแปลงผักของคุณเพื่อวิเคราะห์และบันทึกประวัติสุขภาพพืชอัตโนมัติ'
                  : 'Select a plot to analyze with automatic health history tracking.'}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedPlot(null);
                setIsModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-200/80 active:scale-95 shrink-0"
            >
              <Upload className="w-4 h-4" />
              {isThai ? 'อัปโหลดทั่วไป (ไม่ระบุแปลง)' : 'General Upload'}
            </button>
          </div>
        </div>

        {/* Plots List Grid */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {loadingPlots ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(n => (
                <div key={n} className="bg-white rounded-[2rem] h-96 animate-pulse border border-slate-100 shadow-sm" />
              ))}
            </div>
          ) : activePlots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {activePlots.map(plot => (
                <div key={plot.id || plot._id} className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 hover:border-emerald-200 flex flex-col group cursor-pointer active:scale-[0.99]">
                  <div className="h-52 overflow-hidden relative bg-slate-100">
                    <img
                      src={getImageUrl(plot.image_url) || 'https://via.placeholder.com/300x150?text=No+Image'}
                      alt={plot.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                    <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md backdrop-blur-md border border-white/20 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      {isThai ? 'กำลังเพาะปลูก' : 'Active Plot'}
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="font-black text-white text-xl uppercase tracking-tight drop-shadow-md">{plot.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold text-white border border-white/20">
                          <Maximize2 className="w-3 h-3" />
                          {plot.area} {plot.area_unit || 'm²'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <div className="bg-emerald-50/60 rounded-2xl p-4 mb-6 flex-1 border border-emerald-100/60">
                      <p className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
                        <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                        {isThai ? 'พืชที่กำลังปลูก' : 'CURRENT CROP'}
                      </p>
                      <p className="text-lg font-black text-slate-800">
                        {plot.current_planting?.vegetable_name || (isThai ? 'ไม่ระบุชื่อผัก' : 'Not Specified')}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedPlot(plot);
                        setIsModalOpen(true);
                      }}
                      className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm rounded-2xl transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_30px_-5px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 flex items-center justify-center gap-2.5 active:scale-95 group/btn relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <Camera className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                      {isThai ? 'ส่งวิเคราะห์ภาพแปลงนี้' : 'ANALYZE THIS PLOT'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] p-12 md:p-16 border border-slate-100 text-center shadow-xl shadow-slate-200/50 max-w-2xl mx-auto overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-100 transition-colors" />
              <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 relative z-10 transform group-hover:rotate-6 transition-transform border border-emerald-100">
                <Upload className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight uppercase">
                {isThai ? 'ยังไม่มีแปลงที่ใช้งาน' : 'NO ACTIVE PLOTS'}
              </h3>
              <p className="text-slate-500 font-medium text-base mb-8 max-w-sm mx-auto leading-relaxed">
                {isThai
                  ? 'คุณสามารถอัปโหลดรูปภาพใบหรือต้นผักทั่วไป เพื่อให้ระบบ AI ช่วยวิเคราะห์ได้ทันที'
                  : 'You can upload a general plant image for instant AI analysis.'}
              </p>
              <button
                onClick={() => {
                  setSelectedPlot(null);
                  setIsModalOpen(true);
                }}
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold rounded-2xl transition-all duration-300 flex items-center gap-2.5 mx-auto shadow-[0_12px_25px_-5px_rgba(16,185,129,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 active:scale-95 uppercase tracking-widest text-xs relative overflow-hidden group/btn"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Camera className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                {isThai ? 'เริ่มวิเคราะห์รูปภาพทันที' : 'START ANALYSIS NOW'}
              </button>
            </div>
          )}

          {/* Analysis Modal */}
          {isModalOpen && createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md transition-all duration-300">
              <div className={`bg-white rounded-[32px] md:rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] w-full ${
                result ? 'max-w-5xl' : isAnalyzing ? 'max-w-3xl' : 'max-w-xl'
              } max-h-[92vh] relative overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col border border-white/20 transition-all duration-500`}>

                {/* Close Modal Button (Hidden during active analysis) */}
                {!isAnalyzing && (
                  <button
                    onClick={closeModal}
                    className="absolute top-5 right-5 md:top-6 md:right-6 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-2xl transition-all z-30 shadow-sm group active:scale-90"
                    title={isThai ? 'ปิด' : 'Close'}
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6 transform group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                )}

                <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">

                  {/* Modal Context Header (Plot info or general) */}
                  {!isAnalyzing && !result && (
                    <div className="flex items-center gap-3.5 mb-6 pb-5 border-b border-slate-100 pr-12">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-200 shrink-0">
                        {selectedPlot ? <Sprout className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                            {selectedPlot ? (isThai ? 'วิเคราะห์ตามแปลง' : 'PLOT DETECTION') : (isThai ? 'อัปโหลดทั่วไป' : 'GENERAL DETECTION')}
                          </span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                          {selectedPlot ? selectedPlot.name : (isThai ? 'วิเคราะห์โรคและศัตรูพืช' : 'Plant Disease & Pest Detection')}
                        </h2>
                        {selectedPlot?.current_planting?.vegetable_name && (
                          <p className="text-xs font-semibold text-slate-500 mt-0.5">
                            {isThai ? 'พืชที่ปลูก:' : 'Crop:'} <span className="text-emerald-700 font-bold">{selectedPlot.current_planting.vegetable_name}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Telegram Warning */}
                  {!isAnalyzing && !result && showTelegramWarning && (
                    <div className="text-center py-4 flex flex-col items-center">
                      <div className="w-20 h-20 rounded-3xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center mb-6 text-amber-500 shadow-lg shadow-amber-100">
                        <AlertTriangle className="w-10 h-10" />
                      </div>

                      <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-2">
                        {isThai ? 'ยังไม่ได้เชื่อมต่อ Telegram' : 'Telegram Not Connected'}
                      </h2>

                      <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-5 text-left mb-8 w-full">
                        <p className="font-bold text-amber-900 text-sm flex items-center gap-2 mb-2">
                          <Info className="w-4 h-4 text-amber-600" />
                          {isThai ? 'ข้อแนะนำสำหรับการแจ้งเตือน:' : 'Notification note:'}
                        </p>
                        <ul className="space-y-2 text-slate-700 text-xs font-medium pl-6 list-disc">
                          <li>{isThai ? 'หากเปิดใช้งาน "ส่งผลไป Telegram" กรุณาเชื่อมต่อบัญชี Telegram ก่อน' : 'Please connect your Telegram account first to receive alerts'}</li>
                          <li>{isThai ? 'คุณสามารถกด "ดำเนินการต่อ" เพื่อวิเคราะห์เฉพาะในเว็บไซต์ได้ทันที' : 'Or click "Continue" to proceed with web-only analysis'}</li>
                        </ul>
                      </div>

                      <div className="flex flex-col sm:flex-row w-full gap-3">
                        <button
                          onClick={() => {
                            setShowTelegramWarning(false);
                            startAnalysis();
                          }}
                          className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest text-xs shadow-md shadow-emerald-200 transition-all active:scale-95"
                        >
                          <Scan className="w-4 h-4" />
                          {isThai ? 'ดำเนินการต่อ (ไม่ส่ง Telegram)' : 'Continue (No Alert)'}
                        </button>
                        <a
                          href="/telegram"
                          className="flex-1 py-3.5 bg-sky-500 hover:bg-sky-400 text-white font-black rounded-2xl flex items-center justify-center gap-2 uppercase tracking-widest text-xs shadow-md shadow-sky-200 transition-all active:scale-95"
                        >
                          <Send className="w-4 h-4" />
                          {isThai ? 'ไปเชื่อมต่อ Telegram' : 'Connect Telegram'}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Upload View */}
                  {!isAnalyzing && !result && !showTelegramWarning && (
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
                          <div className="w-full h-64 bg-slate-900 rounded-3xl overflow-hidden border-2 border-emerald-500/30 flex items-center justify-center relative group shadow-xl">
                            <img
                              src={selectedImage}
                              alt="Selected Preview"
                              className="max-w-full max-h-full object-contain"
                            />
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
                              <label
                                htmlFor="modal-file-input"
                                className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl shadow-lg cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
                              >
                                <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                                {isThai ? 'เปลี่ยนรูปภาพ' : 'Change Image'}
                              </label>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  setSelectedImage(null);
                                  setSelectedFile(null);
                                }}
                                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
                              >
                                <X className="w-3.5 h-3.5" />
                                {isThai ? 'ลบรูปภาพ' : 'Remove'}
                              </button>
                            </div>
                            <div className="absolute bottom-3 left-3 right-3 bg-slate-900/80 backdrop-blur-md rounded-xl px-3.5 py-2 flex items-center gap-2 border border-white/10 text-white shadow-sm">
                              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span className="text-xs font-bold truncate">{selectedFile?.name}</span>
                            </div>
                          </div>
                        ) : (
                          <label
                            htmlFor="modal-file-input"
                            className="w-full h-52 border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all bg-slate-50/80 hover:bg-emerald-50/40 group p-4"
                          >
                            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:border-emerald-300 transition-all">
                              <Upload className="w-7 h-7 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                            </div>
                            <div className="text-center">
                              <p className="font-black text-slate-800 text-sm group-hover:text-emerald-700 transition-colors">{isThai ? 'คลิกหรือลากรูปภาพมาวางที่นี่' : 'Click or drop image here'}</p>
                              <p className="text-xs text-slate-400 font-medium mt-1">{isThai ? 'รองรับไฟล์ JPG, PNG (ขนาดไม่เกิน 10MB)' : 'Supports JPG, PNG (max 10MB)'}</p>
                            </div>
                          </label>
                        )}
                      </div>

                      {/* Options */}
                      <div className="space-y-3 bg-slate-50 py-4 px-5 rounded-2xl border border-slate-200/80">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{isThai ? 'ตัวเลือกการบันทึก' : 'Options'}</p>

                        <div className="flex items-center justify-between">
                          <label htmlFor="save-result-check" className="text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="save-result-check"
                              checked={saveResult}
                              onChange={(e) => setSaveResult(e.target.checked)}
                              className="w-4.5 h-4.5 accent-emerald-600 rounded cursor-pointer"
                            />
                            {t('detectPage.saveHistory') || 'บันทึกประวัติการวิเคราะห์เข้าสู่แปลง'}
                          </label>
                        </div>

                        {telegramConnected ? (
                          <div className="flex items-center justify-between pt-1">
                            <label htmlFor="send-telegram-check" className="text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="send-telegram-check"
                                checked={sendToTelegram}
                                onChange={(e) => setSendToTelegram(e.target.checked)}
                                className="w-4.5 h-4.5 accent-sky-500 rounded cursor-pointer"
                              />
                              <span className="flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
                                {t('detectPage.sendToTelegram') || 'ส่งผลการตรวจไป Telegram'}
                              </span>
                            </label>
                          </div>
                        ) : !isCheckingTelegram && (
                          <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200/60 rounded-xl mt-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                            <p className="text-[11px] text-amber-800 font-medium leading-tight">
                              {t('detectPage.telegramNotConnected') || 'ยังไม่ได้เชื่อมต่อ Telegram'}
                              <a href="/telegram" className="ml-1 text-sky-600 hover:underline font-bold">
                                {t('detectPage.connectNow') || 'เชื่อมต่อเลย'}
                              </a>
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex gap-3">
                        <button
                          onClick={closeModal}
                          className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs uppercase tracking-widest transition-all"
                        >
                          {isThai ? 'ยกเลิก' : 'Cancel'}
                        </button>
                        <button
                          onClick={startAnalysis}
                          disabled={!selectedFile}
                          className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-emerald-200 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group/btn relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                          <Scan className="w-4 h-4 group-hover/btn:animate-pulse" />
                          {isThai ? 'ส่งให้ AI วิเคราะห์' : 'Analyze Now'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* LOADING / SCANNING STATE (HIGH-TECH AI SCANNER) */}
                  {isAnalyzing && (
                    <div className="py-4 md:py-6 px-1 flex flex-col items-center animate-in fade-in duration-300">
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold mb-3 shadow-xs animate-pulse">
                          <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                          <span>{isThai ? 'ระบบ AI Engine กำลังวิเคราะห์ภาพ' : 'AI Engine Scanning Image'}</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                          {isThai ? 'กำลังตรวจจับโรคและศัตรูพืช...' : 'Analyzing Plant Health...'}
                        </h3>
                        <p className="text-xs md:text-sm font-medium text-slate-500 mt-1 max-w-md mx-auto">
                          {selectedPlot
                            ? (isThai ? `วิเคราะห์สุขภาพพืชสำหรับแปลง "${selectedPlot.name}"` : `Scanning plot "${selectedPlot.name}"`)
                            : (isThai ? 'ระบบกำลังประมวลผล AI' : 'Processing AI')}
                        </p>
                      </div>

                      {/* Scanner Container */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center w-full max-w-2xl bg-slate-950 text-white p-5 md:p-6 rounded-[2.5rem] shadow-2xl border border-slate-800 relative overflow-hidden">

                        {/* Background Glow Effects */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

                        {/* Left Column: Image Preview with Scanning Laser */}
                        <div className="md:col-span-6 flex flex-col items-center justify-center">
                          <div className="relative w-full aspect-square max-w-[230px] rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)] bg-slate-900 group">
                            {selectedImage ? (
                              <img
                                src={selectedImage}
                                alt="Analyzing Preview"
                                className="w-full h-full object-cover filter brightness-95"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500">
                                <Scan className="w-12 h-12 animate-pulse" />
                              </div>
                            )}

                            {/* Viewfinder Corners */}
                            <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                            <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                            <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                            <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />

                            {/* Laser Scanning Beam */}
                            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-scanline z-10" />

                            {/* Grid Overlay */}
                            <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:12px_12px] opacity-20 pointer-events-none" />

                            {/* Bottom Status Ribbon */}
                            <div className="absolute bottom-2 left-2 right-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/30 flex items-center justify-between text-[10px] font-mono text-emerald-300">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                VISION SCAN
                              </span>
                              <span className="font-bold text-emerald-400">MODEL OK</span>
                            </div>
                          </div>
                        </div>

                        {/* Right Column: Step Indicators */}
                        <div className="md:col-span-6 space-y-3">
                          <div className="space-y-2.5">
                            <div className={`p-3 rounded-2xl border transition-all duration-500 flex items-center gap-3 ${
                              analysisStep >= 1
                                ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200'
                                : 'bg-slate-900/60 border-slate-800 text-slate-500'
                            }`}>
                              <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                analysisStep >= 1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                              }`}>
                                {analysisStep > 1 ? <CheckCircle2 className="w-4 h-4 text-slate-950" /> : '1'}
                              </div>
                              <div className="flex-1 text-left">
                                <p className="text-xs font-bold leading-none">{isThai ? 'เตรียมและปรับแต่งภาพ' : 'Image Preprocessing'}</p>
                                <p className="text-[10px] text-slate-400 mt-1">{isThai ? 'ปรับความคมชัด & TTA Filter' : 'Enhancing focus & details'}</p>
                              </div>
                            </div>

                            <div className={`p-3 rounded-2xl border transition-all duration-500 flex items-center gap-3 ${
                              analysisStep >= 2
                                ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200'
                                : 'bg-slate-900/60 border-slate-800 text-slate-500'
                            }`}>
                              <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                analysisStep >= 2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                              }`}>
                                {analysisStep > 2 ? <CheckCircle2 className="w-4 h-4 text-slate-950" /> : '2'}
                              </div>
                              <div className="flex-1 text-left">
                                <p className="text-xs font-bold leading-none">{isThai ? 'AI Deep Learning Vision' : 'AI Vision Classification'}</p>
                                <p className="text-[10px] text-slate-400 mt-1">{isThai ? 'TensorFlow + Kimi AI Fallback' : 'Running neural detection'}</p>
                              </div>
                            </div>

                            <div className={`p-3 rounded-2xl border transition-all duration-500 flex items-center gap-3 ${
                              analysisStep >= 3
                                ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200'
                                : 'bg-slate-900/60 border-slate-800 text-slate-500'
                            }`}>
                              <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                analysisStep >= 3 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                              }`}>
                                3
                              </div>
                              <div className="flex-1 text-left">
                                <p className="text-xs font-bold leading-none">{isThai ? 'สรุปคำแนะนำการรักษา' : 'Treatment Protocols'}</p>
                                <p className="text-[10px] text-slate-400 mt-1">{isThai ? 'สังเคราะห์วิธีการดูแลพืช' : 'Synthesizing care steps'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="pt-2">
                            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className="bg-gradient-to-r from-emerald-500 to-teal-300 h-full transition-all duration-500 shadow-[0_0_12px_#10b981]"
                                style={{ width: `${Math.min(analysisStep * 33 + 10, 95)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* RESULT VIEW */}
                  {!isAnalyzing && result && (
                    <div className="flex flex-col h-full animate-in fade-in duration-500">

                      {/* Plot Context Banner in Result View */}
                      {selectedPlot && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3.5 mb-6 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                              <Sprout className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{isThai ? 'บันทึกประวัติไปยังแปลง' : 'SAVED TO PLOT'}</p>
                              <p className="text-sm font-black text-slate-800">{selectedPlot.name}</p>
                            </div>
                          </div>
                          {selectedPlot.current_planting?.vegetable_name && (
                            <span className="px-3 py-1 bg-white border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold shadow-xs">
                              🌱 {selectedPlot.current_planting.vegetable_name}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Header */}
                      <div className="text-center mb-6">
                        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-3 shadow-xs ${
                          result.category === 'pest' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          result.category === 'disease' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                          'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {result.category === 'pest' ? <Bug className="w-4 h-4" /> :
                           result.category === 'disease' ? <Shield className="w-4 h-4" /> :
                           <CheckCircle className="w-4 h-4" />}
                          {result.category === 'pest' ? (isThai ? 'ตรวจพบ: ศัตรูพืช' : 'DETECTED: PEST') :
                           result.category === 'disease' ? (isThai ? 'ตรวจพบ: โรคพืช' : 'DETECTED: DISEASE') :
                           (isThai ? 'ผลตรวจ: สุขภาพดี' : 'HEALTHY PLANT')}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                          {isThai ? result.target_name_th : result.target_name_en}
                        </h2>
                        <p className="text-xs font-bold text-slate-400 mt-1.5 uppercase tracking-widest">
                          {isThai ? 'ความแม่นยำ AI' : 'AI Confidence'}: <span className="text-emerald-600 font-black">{result.confidence}%</span> • Model: {result.fallback_used ? 'Kimi AI Engine' : 'TensorFlow Deep Learning'}
                        </p>
                      </div>

                      {/* Image Preview */}
                      <div className="relative mb-6 mx-auto max-w-xs">
                        <div className="aspect-square rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-slate-900">
                          <img src={selectedImage} alt="Analysis" className="w-full h-full object-cover" />
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="space-y-6 max-w-2xl mx-auto w-full">

                        {/* Diagnostics Section (For Disease/Pest) */}
                        {result.category !== 'healthy' && (
                          <>
                            <section className="bg-slate-50/80 rounded-3xl p-6 border border-slate-200/80">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-200">
                                  <AlertCircle className="w-5 h-5" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-black text-slate-900 tracking-tight">{isThai ? 'วินิจฉัยอาการและสาเหตุ' : 'Clinical Diagnostics'}</h3>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isThai ? 'ลักษณะที่ปรากฏ' : 'Symptoms & Root Cause'}</p>
                                </div>
                              </div>
                              <div
                                className="text-sm leading-relaxed text-slate-700 font-medium pl-4 border-l-3 border-amber-400 html-content"
                                dangerouslySetInnerHTML={{ __html: result.cause || result.symptoms || (isThai ? 'ไม่พบข้อมูลอาการระบุไว้' : 'No specific clinical symptoms reported.') }}
                              />
                            </section>

                            <section className="space-y-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-200">
                                  <Sprout className="w-5 h-5" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-black text-slate-900 tracking-tight">{isThai ? 'แนวทางแก้ไขและดูแล' : 'Prescriptive Care'}</h3>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isThai ? 'ขั้นตอนการรักษา' : 'Expert Management Steps'}</p>
                                </div>
                              </div>

                              <div className="space-y-3">
                                {(result.prevention || result.treatment || []).length > 0 ? (
                                  [(result.prevention || []), (result.treatment || [])].flat().slice(0, 4).map((step, i) => (
                                    <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-all shadow-xs">
                                      <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-black shrink-0 border border-emerald-100">
                                        {i + 1}
                                      </div>
                                      <div className="text-slate-700 font-medium text-xs sm:text-sm leading-relaxed html-content" dangerouslySetInnerHTML={{ __html: step }} />
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <Leaf className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-slate-400 font-bold text-xs">{isThai ? 'อยู่ระหว่างการอัปเดตข้อมูลการรักษา' : 'Treatment steps will be updated soon.'}</p>
                                  </div>
                                )}
                              </div>
                            </section>
                          </>
                        )}

                        {/* Healthy state */}
                        {result.category === 'healthy' && (
                          <div className="text-center py-8 bg-emerald-50/50 rounded-3xl border border-emerald-100 p-6">
                            <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
                              <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">
                              {isThai ? 'พืชของคุณแข็งแรงสมบูรณ์ดี! 🎉' : 'Your plant is healthy! 🎉'}
                            </h3>
                            <p className="text-slate-600 font-medium text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                              {isThai
                                ? 'ไม่พบร่องรอยของโรคพืชหรือศัตรูพืชในภาพ ควรให้น้ำ ให้ปุ๋ย และดูแลตามรอบปกติ'
                                : 'No disease or pest detected. Continue normal care and regular monitoring.'}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-4 border-t border-slate-100 max-w-2xl mx-auto w-full">
                        {result.detected_class_id ? (
                          <a
                            href={`/diseases-pest/details/${result.detected_class_id}`}
                            className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-center text-xs uppercase tracking-widest shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                          >
                            <span>{isThai ? 'ดูคู่มือการดูแลแบบละเอียด' : 'View Full Care Guide'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </a>
                        ) : result.category !== 'healthy' && result.target_name_en ? (
                          <a
                            href={`/diseases-pests?search=${encodeURIComponent(result.target_name_th || result.target_name_en)}`}
                            className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-center text-xs uppercase tracking-widest shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                          >
                            <span>{isThai ? `ค้นหา: ${result.target_name_th || result.target_name_en}` : `Search: ${result.target_name_en}`}</span>
                            <ArrowRight className="w-4 h-4" />
                          </a>
                        ) : (
                          <button
                            onClick={() => { setSelectedImage(null); setSelectedFile(null); setResult(null); }}
                            className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs uppercase tracking-widest text-center shadow-md shadow-emerald-200 transition-all"
                          >
                            {isThai ? 'วิเคราะห์รูปใหม่' : 'Analyze New Image'}
                          </button>
                        )}
                        <button
                          onClick={closeModal}
                          className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs uppercase tracking-widest transition-all"
                        >
                          {isThai ? 'ปิดหน้าต่าง' : 'Close'}
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>,
            document.body
          )}

        </div>
      </div>
    </>
  );
};

export default DetectWithPlot;
