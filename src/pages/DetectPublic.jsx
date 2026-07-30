import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Camera, Upload, Scan, CheckCircle, Info,
  AlertCircle, Sprout, Bug, Shield, X,
  ImagePlus, Sparkles, ArrowRight, RotateCcw,
  Leaf, Zap, FlaskConical, UserPlus,
  Activity, ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

const DetectPublic = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const changeInputRef = useRef(null);

  useEffect(() => {
    if (user) navigate('/detect/plots', { replace: true });
  }, [user, navigate]);

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const isThai = i18n.language?.startsWith('th');

  const loadingSteps = isThai
    ? ['กำลังโหลดภาพ...', 'วิเคราะห์ด้วย AI Model...', 'ตรวจสอบโรคและแมลง...', 'สรุปผลลัพธ์...']
    : ['Loading image...', 'Running AI model...', 'Detecting diseases & pests...', 'Summarizing results...'];

  useEffect(() => {
    let interval;
    if (isAnalyzing) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 1400);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const resetState = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setResult(null);
    setLoadingStep(0);
  };

  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'error',
        title: isThai ? 'ไฟล์ไม่รองรับ' : 'Unsupported file',
        text: isThai ? 'กรุณาเลือกไฟล์รูปภาพเท่านั้น' : 'Please select an image file only.'
      });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: isThai ? 'ไฟล์ใหญ่เกินไป' : 'File too large',
        text: isThai ? 'ขนาดไฟล์ต้องไม่เกิน 10MB' : 'Max 10MB.'
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
  };

  const handleImageSelect = (e) => {
    processFile(e.target.files[0]);
    e.target.value = '';
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setResult(null);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('save_result', 'false');
    formData.append('send_telegram', 'false');
    formData.append('use_tta', 'true');
    formData.append('enhance', 'true');
    formData.append('confidence_threshold', '0.35');
    formData.append('use_ai_fallback', 'true');
    try {
      const response = await axios.post('/api/ai/detect/tf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        setResult(response.data.analysis);
      } else throw new Error(response.data.error || 'Analysis failed');
    } catch (error) {
      console.error('Analysis failed:', error);
      Swal.fire({
        icon: 'error',
        title: isThai ? 'วิเคราะห์ไม่สำเร็จ' : 'Analysis Failed',
        text: error.response?.data?.detail || (isThai ? 'เกิดข้อผิดพลาด กรุณาลองใหม่' : 'An error occurred, please try again.'),
        confirmButtonColor: '#239e4e'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const confidence = result?.confidence
    ? Math.round(result.confidence >= 1 ? result.confidence : result.confidence * 100)
    : null;

  const catStyle = (cat) => {
    if (cat === 'pest')    return { badge: 'bg-amber-500 text-white', light: 'bg-amber-50 border-amber-200 text-amber-900', text: 'text-amber-600', bar: 'bg-amber-500' };
    if (cat === 'disease') return { badge: 'bg-rose-500 text-white',  light: 'bg-rose-50 border-rose-200 text-rose-900',   text: 'text-rose-600',  bar: 'bg-rose-500'  };
    return                        { badge: 'bg-primary-600 text-white', light: 'bg-primary-50 border-primary-200 text-primary-900', text: 'text-primary-600', bar: 'bg-primary-500' };
  };

  return (
    <div className="bg-gradient-to-br from-primary-950 via-primary-900 to-slate-950 py-8 px-4 sm:px-6 lg:px-8 font-sans text-white min-h-[calc(100vh-4rem)] flex flex-col justify-center relative overflow-hidden">
      
      {/* Decorative Ambient Blur Lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full lg:grid lg:grid-cols-12 gap-6 items-stretch relative z-10 flex flex-col">
        
        {/* ── LEFT PANEL: HERO & TIPS (4 COLS ON DESKTOP) ── */}
        <div className="lg:col-span-4 bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden shrink-0">
          <div className="space-y-5">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-primary-300 animate-pulse" />
              <span>{isThai ? 'ระบบ AI วิเคราะห์โรคพืช' : 'AI Plant Diagnostics'}</span>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-3xl font-black text-white tracking-tight leading-tight">
                {isThai ? 'วิเคราะห์โรคและ' : 'Detect Diseases'}
                <span className="block bg-gradient-to-r from-primary-300 via-green-300 to-emerald-200 bg-clip-text text-transparent">
                  {isThai ? 'ศัตรูพืชด้วย AI' : '& Pests with AI'}
                </span>
              </h1>
              <p className="text-primary-100/80 text-xs sm:text-sm mt-2 leading-relaxed font-medium">
                {isThai
                  ? 'อัปโหลดรูปภาพพืชของคุณ AI จะวิเคราะห์โรค แมลงศัตรูพืช พร้อมระบุแนวทางรักษาให้อัตโนมัติ'
                  : 'Upload a plant photo. AI instantly identifies diseases and pests with complete care guides.'}
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { icon: Zap,          label: isThai ? 'วิเคราะห์ทันที'   : 'Instant'   },
                { icon: FlaskConical, label: isThai ? 'แม่นยำสูง'        : 'High Precision' },
                { icon: Leaf,         label: isThai ? 'ฟรี ไม่ต้องสมัคร' : 'Free'      },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 border border-white/10 text-white/90 text-xs font-semibold backdrop-blur-md">
                  <Icon className="w-3.5 h-3.5 text-primary-300" />
                  {label}
                </span>
              ))}
            </div>

            {/* Photo Tip Card */}
            <div className="bg-primary-950/60 rounded-2xl p-4 border border-primary-500/20 text-xs space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-primary-300">
                <Info className="w-4 h-4 text-primary-400 shrink-0" />
                <span>{isThai ? 'เคล็ดลับการถ่ายภาพที่แม่นยำ' : 'Tips for Best Accuracy'}</span>
              </div>
              <ul className="space-y-1.5 text-primary-100/70 font-medium pl-1">
                {(isThai
                  ? ['ถ่ายรูปในที่มีแสงสว่างเพียงพอ', 'เน้นถ่ายบริเวณใบหรือส่วนที่มีอาการ', 'รูปภาพคมชัด ชัดเจน ไม่เบลอ']
                  : ['Ensure good daylight', 'Focus on affected leaf/area', 'Keep photo crisp and focused']
                ).map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-primary-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Guest Register Box */}
          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
            <div className="text-[11px] leading-snug">
              <p className="font-bold text-white">{isThai ? 'ต้องการบันทึกประวัติการวิเคราะห์?' : 'Save analysis history?'}</p>
              <p className="text-primary-200/70 text-[10px]">{isThai ? 'เข้าสู่ระบบหรือสมัครสมาชิกฟรี' : 'Sign in or register for free'}</p>
            </div>
            <Link
              to="/register"
              className="px-3.5 py-2 bg-primary-500 hover:bg-primary-400 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1 shadow-lg shadow-primary-900/50 shrink-0 active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isThai ? 'สมัครสมาชิก' : 'Sign Up'}</span>
            </Link>
          </div>
        </div>

        {/* ── RIGHT PANEL: MAIN WORKSPACE (8 COLS ON DESKTOP) ── */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-2xl p-5 sm:p-6 text-gray-900 flex flex-col justify-between relative">

          {/* ── STATE 1: UPLOAD DROPZONE ── */}
          {!selectedImage && !isAnalyzing && !result && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`min-h-[380px] flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 transition-all duration-300 cursor-pointer text-center relative overflow-hidden group ${
                isDragging
                  ? 'border-primary-500 bg-primary-50/80 scale-[0.99]'
                  : 'border-primary-200 hover:border-primary-500 bg-gradient-to-b from-primary-50/30 to-white hover:bg-primary-50/50'
              }`}
            >
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />

              <div className="relative z-10 flex flex-col items-center justify-center max-w-md mx-auto my-auto">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-5 transition-all duration-500 shadow-lg ${
                  isDragging
                    ? 'bg-primary-600 text-white scale-110 rotate-6 shadow-primary-600/30'
                    : 'bg-primary-100 text-primary-600 group-hover:bg-primary-600 group-hover:text-white group-hover:scale-105 group-hover:-rotate-3 shadow-primary-100'
                }`}>
                  <ImagePlus className="w-10 h-10 transition-colors" />
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2 tracking-tight">
                  {isDragging
                    ? (isThai ? 'วางรูปภาพที่นี่' : 'Drop Image Here')
                    : (isThai ? 'เลือกรูปภาพพืชเพื่อวิเคราะห์' : 'Upload Plant Image')}
                </h3>
                <p className="text-gray-500 font-medium text-xs sm:text-sm mb-6 leading-relaxed">
                  {isThai
                    ? 'ลากวางรูปภาพใบหรือต้นผักที่ต้องการตรวจ หรือกดปุ่มด้านล่าง'
                    : 'Drag & drop your plant image or click to select from device'}
                </p>

                <div className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-primary-600 to-emerald-500 hover:from-primary-500 hover:to-emerald-400 text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-primary-600/30 transition-all hover:scale-105 active:scale-95">
                  <Camera className="w-4 h-4" />
                  <span>{isThai ? 'เลือกรูปภาพวิเคราะห์' : 'SELECT PLANT PHOTO'}</span>
                </div>

                <p className="text-[11px] text-gray-400 font-medium mt-4">
                  {isThai ? 'รองรับ JPG, PNG, WEBP · ขนาดไม่เกิน 10MB' : 'Supports JPG, PNG, WEBP · Max 10MB'}
                </p>
              </div>
            </div>
          )}

          {/* ── STATE 2: PREVIEW STATE ── */}
          {selectedImage && !isAnalyzing && !result && (
            <div className="flex flex-col justify-between space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-ping" />
                  <h3 className="text-base font-black text-gray-900">{isThai ? 'รูปภาพที่เลือกวิเคราะห์' : 'Selected Photo'}</h3>
                </div>
                <button
                  onClick={resetState}
                  className="p-1.5 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                  title={isThai ? 'ยกเลิก' : 'Cancel'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid sm:grid-cols-12 gap-6 items-center">
                <div className="sm:col-span-6 flex flex-col items-center">
                  <div className="relative aspect-[4/3] w-full max-w-sm rounded-2xl overflow-hidden border-2 border-primary-200 shadow-xl bg-slate-900 group">
                    <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                    {selectedFile && (
                      <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] text-white font-medium flex items-center justify-between border border-white/10 truncate">
                        <span className="truncate max-w-[180px]">{selectedFile.name}</span>
                        <span className="text-primary-300 font-bold shrink-0">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-6 space-y-4 text-left">
                  <div className="bg-primary-50 rounded-2xl p-4 border border-primary-100 text-xs space-y-2">
                    <p className="font-bold text-primary-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-primary-600" />
                      <span>{isThai ? 'พร้อมส่งให้ AI ตรวจสอบ' : 'Ready for AI Diagnostic'}</span>
                    </p>
                    <p className="text-primary-800/80 leading-relaxed font-medium">
                      {isThai
                        ? 'หากรูปภาพมีความชัดเจน กด "ส่งให้ AI วิเคราะห์" เพื่อเริ่มกระบวนการทันที'
                        : 'If photo is clear, click "Start AI Analysis" below.'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={startAnalysis}
                      className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-emerald-500 hover:from-primary-500 hover:to-emerald-400 text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-primary-600/30 hover:shadow-primary-600/40 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Scan className="w-4 h-4" />
                      <span>{isThai ? 'ส่งให้ AI วิเคราะห์ทันที' : 'START AI ANALYSIS'}</span>
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => changeInputRef.current?.click()}
                        className="flex-1 py-2.5 border border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-gray-600 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{isThai ? 'เปลี่ยนรูป' : 'Change'}</span>
                      </button>
                      <button
                        onClick={resetState}
                        className="py-2.5 px-4 border border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-500 hover:text-red-600 font-bold rounded-xl text-xs transition-all"
                      >
                        {isThai ? 'ยกเลิก' : 'Cancel'}
                      </button>
                    </div>
                    <input ref={changeInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STATE 3: LOADING STATE ── */}
          {isAnalyzing && (
            <div className="py-8 flex flex-col items-center justify-center text-center my-auto animate-in fade-in duration-300">
              <div className="w-full max-w-md bg-slate-950 text-white p-6 rounded-3xl shadow-2xl border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl pointer-events-none" />

                <div className="relative w-44 h-44 mx-auto mb-4 rounded-2xl overflow-hidden border-2 border-primary-500/50 shadow-[0_0_20px_rgba(50,194,98,0.3)] bg-slate-900">
                  {selectedImage ? (
                    <img src={selectedImage} alt="Scanning" className="w-full h-full object-cover brightness-90" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary-400">
                      <Scan className="w-10 h-10 animate-pulse" />
                    </div>
                  )}
                  <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-400 to-transparent shadow-[0_0_12px_#32c262] animate-scanline z-10" />
                  <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-primary-400" />
                  <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-primary-400" />
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-primary-400" />
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-primary-400" />
                </div>

                <h4 className="text-lg font-black text-white tracking-tight mb-1">{isThai ? 'กำลังประมวลผลด้วย AI' : 'AI Analyzing...'}</h4>
                <p className="text-primary-300 text-xs font-semibold mb-4">{loadingSteps[loadingStep]}</p>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-emerald-300 h-full transition-all duration-500 shadow-[0_0_10px_#32c262]"
                    style={{ width: `${(loadingStep + 1) * 25}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── STATE 4: RESULT STATE (PROPORTIONED PERFECT FIT) ── */}
          {!isAnalyzing && result && (() => {
            const c = catStyle(result.category);
            return (
              <div className="flex flex-col justify-between animate-in zoom-in-95 duration-300 space-y-4">
                {/* Result Header Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5 ${c.badge}`}>
                      {result.category === 'pest'    ? <Bug className="w-3.5 h-3.5" /> :
                       result.category === 'disease' ? <Shield className="w-3.5 h-3.5" /> :
                                                       <CheckCircle className="w-3.5 h-3.5" />}
                      <span>
                        {result.category === 'pest'    ? (isThai ? 'ศัตรูพืช' : 'PEST')    :
                         result.category === 'disease' ? (isThai ? 'โรคพืช'   : 'DISEASE') :
                                                         (isThai ? 'สุขภาพดี' : 'HEALTHY')}
                      </span>
                    </div>
                    {confidence !== null && (
                      <span className="text-xs font-bold text-gray-500">
                        {isThai ? 'ความมั่นใจ' : 'Confidence'}: <strong className="text-gray-900 font-black">{confidence}%</strong>
                      </span>
                    )}
                  </div>
                  <button
                    onClick={resetState}
                    className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all"
                    title={isThai ? 'วิเคราะห์ใหม่' : 'Reset'}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Result Content Grid */}
                <div className="grid sm:grid-cols-12 gap-5 items-start">
                  
                  {/* Left Column: Image & AI Metric Card */}
                  <div className="sm:col-span-5 space-y-3">
                    <div className="relative aspect-[4/3] sm:aspect-square w-full rounded-2xl overflow-hidden border border-gray-200 shadow-md bg-slate-900">
                      <img src={selectedImage} alt="Result" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <p className="text-base font-black leading-tight drop-shadow-md">
                          {isThai ? result.target_name_th : result.target_name_en}
                        </p>
                        {result.target_name_th && result.target_name_en && (
                          <p className="text-xs text-white/70 font-medium mt-0.5">
                            {isThai ? result.target_name_en : result.target_name_th}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* AI Metric Box attached directly under Image */}
                    <div className={`rounded-2xl p-4 ${c.light} text-xs space-y-2 border shadow-xs`}>
                      <div className="flex justify-between items-center font-bold">
                        <span className="flex items-center gap-1.5">
                          <Activity className={`w-4 h-4 ${c.text}`} />
                          <span>{isThai ? 'ความแม่นยำ AI Engine' : 'AI Diagnostic Score'}</span>
                        </span>
                        <span className={`font-black text-sm ${c.text}`}>{confidence}%</span>
                      </div>
                      <div className="h-2 bg-white rounded-full overflow-hidden p-0.5 border border-black/5">
                        <div className={`h-full rounded-full transition-all duration-700 ${c.bar}`} style={{ width: `${confidence}%` }} />
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium pt-0.5">
                        {isThai ? 'ประมวลผลด้วย TensorFlow Deep Learning + AI Fallback' : 'Powered by TensorFlow Deep Learning'}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Symptoms & Treatment Guide */}
                  <div className="sm:col-span-7 space-y-3">
                    {result.category !== 'healthy' ? (
                      <>
                        {/* Symptoms Card */}
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-xs space-y-1.5">
                          <div className="flex items-center gap-1.5 font-bold text-red-600">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{isThai ? 'อาการที่พบ' : 'Symptoms'}</span>
                          </div>
                          <p className="text-gray-700 leading-relaxed font-medium">
                            {(result.cause || result.symptoms || (isThai ? 'ไม่มีข้อมูลอาการเพิ่มเติม' : 'No symptoms data'))
                              .replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')}
                          </p>
                        </div>

                        {/* Treatment Card */}
                        {(result.treatment || result.prevention) && (
                          <div className="bg-primary-50/80 rounded-2xl p-4 border border-primary-100 text-xs space-y-2">
                            <div className="flex items-center gap-1.5 font-bold text-primary-900">
                              <Sprout className="w-4 h-4 text-primary-600 shrink-0" />
                              <span>{isThai ? 'แนวทางรักษาและดูแล' : 'Treatment Guide'}</span>
                            </div>
                            <ul className="space-y-1.5 text-primary-900/90 font-medium">
                              {[(result.treatment || []), (result.prevention || [])].flat().slice(0, 3).map((step, i) => (
                                <li key={i} className="flex gap-2.5 items-start">
                                  <span className="shrink-0 w-4 h-4 rounded-full bg-white flex items-center justify-center font-bold text-primary-700 text-[10px] shadow-xs mt-0.5">{i + 1}</span>
                                  <span className="leading-snug">{step.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Additional Prevention & Protection Card */}
                        <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200/80 text-xs space-y-1.5">
                          <div className="flex items-center gap-1.5 font-bold text-amber-900">
                            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>{isThai ? 'แนวทางการป้องกันและการดูแลเพิ่มเติม' : 'Prevention & Care Note'}</span>
                          </div>
                          <p className="text-amber-950/80 leading-relaxed font-medium">
                            {isThai
                              ? 'หมั่นตรวจสอบและทำความสะอาดวัชพืชรอบแปลงเกษตรอย่างสม่ำเสมอ เพื่อลดการสะสมของแมลงศัตรูพืชและเชื้อรา'
                              : 'Regularly inspect and clean weeds around plots to reduce pest and fungal accumulation.'}
                          </p>
                        </div>
                      </>
                    ) : (
                      /* Healthy Card */
                      <div className="bg-primary-50 rounded-2xl p-8 border border-primary-100 text-center space-y-3">
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto shadow-md">
                          <CheckCircle className="w-8 h-8 text-primary-600" />
                        </div>
                        <h4 className="text-xl font-black text-primary-900">{isThai ? 'พืชของคุณสุขภาพดีมาก!' : 'Plant is Healthy!'}</h4>
                        <p className="text-primary-800/80 text-xs font-medium max-w-xs mx-auto leading-relaxed">
                          {isThai
                            ? 'จากการวิเคราะห์ด้วย AI ไม่พบร่องรอยของโรคพืชหรือแมลงศัตรูพืช'
                            : 'No traces of diseases or pests were detected.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                  {result.detected_class_id ? (
                    <a
                      href={`/diseases-pest/details/${result.detected_class_id}`}
                      className="flex-1 py-3.5 bg-slate-900 hover:bg-black text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                    >
                      <Info className="w-4 h-4" />
                      <span>{isThai ? 'ดูข้อมูลรายละเอียดโรค/แมลง' : 'View Full Guide'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  ) : result.category !== 'healthy' && result.target_name_en ? (
                    <a
                      href={`/diseases-pests?search=${encodeURIComponent(result.target_name_th || result.target_name_en)}`}
                      className="flex-1 py-3.5 bg-slate-900 hover:bg-black text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                    >
                      <Info className="w-4 h-4" />
                      <span>{isThai ? `ค้นหา: ${result.target_name_th || result.target_name_en}` : `Search: ${result.target_name_en}`}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  ) : null}

                  <button
                    onClick={resetState}
                    className="py-3.5 px-6 border border-gray-300 hover:border-primary-500 hover:bg-primary-50 text-gray-700 hover:text-primary-700 font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Scan className="w-4 h-4" />
                    <span>{isThai ? 'วิเคราะห์ใหม่' : 'Analyze New'}</span>
                  </button>
                </div>
              </div>
            );
          })()}

        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes scanline {
          0% { top: 0%; }
          50% { top: 92%; }
          100% { top: 0%; }
        }
        .animate-scanline {
          animation: scanline 2.2s ease-in-out infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default DetectPublic;
