import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  Camera, Upload, Scan, CheckCircle, Info, 
  AlertCircle, Sprout, Activity, Cpu, Bug, Shield,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

const DetectPublic = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect to /detect/plots if user is logged in
  useEffect(() => {
    if (user) {
      navigate('/detect/plots', { replace: true });
    }
  }, [user, navigate]);

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const resetState = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setResult(null);
  };

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
    setIsAnalyzing(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('save_result', 'false');
    formData.append('send_telegram', 'false');
    formData.append('use_tta', 'true');
    formData.append('enhance', 'true');
    formData.append('confidence_threshold', '0.35');  // 35% threshold
    formData.append('use_ai_fallback', 'true');  // เรียก Kimi AI เมื่อ TensorFlow ไม่แน่ใจ

    try {
      const response = await axios.post('/api/ai/detect/tf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
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
        text: error.response?.data?.detail || 'เกิดข้อผิดพลาดในการวิเคราะห์ กรุณาลองใหม่อีกครั้ง',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isThai = i18n.language === 'th';

  return (
    <div className="min-h-screen bg-secondary-50 pb-24">
      {/* Premium Hero Header */}
      <div className="relative bg-primary-900 pt-16 pb-32 px-4 overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800/40 via-primary-900 to-primary-950" />
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] animate-pulse" />
        
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/10 mb-6 transition-transform hover:scale-105">
            <Scan className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            {isThai ? 'วิเคราะห์โรคและศัตรูพืช' : 'Detect Diseases & Pests'}
          </h1>
          <p className="text-primary-100/60 text-lg font-medium max-w-2xl mx-auto">
            {isThai 
              ? 'อัปโหลดรูปภาพเพื่อตรวจสอบโรคและแมลงศัตรูพืชด้วยระบบ AI อัจฉริยะ' 
              : 'Upload photos to detect plant diseases and pests using our intelligent AI system.'}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-20">
        <div className="max-w-4xl mx-auto">
          {/* Main Workspace Card */}
          <div className={`bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden relative transition-all duration-500 ${!selectedImage && !isAnalyzing && !result ? 'p-16 text-center group' : 'p-6 md:p-12'}`}>
            
            {/* INITIAL STATE: Ready to start */}
            {!selectedImage && !isAnalyzing && !result && (
              <div className="animate-in fade-in zoom-in-95 duration-700">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary-100 transition-colors" />
                <div className="w-24 h-24 bg-primary-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 relative z-10 transform group-hover:rotate-6 transition-transform">
                  <Upload className="w-10 h-10 text-primary-600" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight uppercase">
                  {isThai ? 'ตรวจสอบโรคและศัตรูพืช' : 'Detect Diseases & Pests'}
                </h3>
                <p className="text-slate-500 font-bold text-base mb-10 max-w-sm mx-auto leading-relaxed">
                  {isThai 
                    ? 'คุณสามารถอัปโหลดรูปภาพเพื่อให้ระบบ AI วิเคราะห์ได้ทันที' 
                    : 'You can upload any image to let our AI system analyze it immediately.'}
                </p>
                <div className="relative md:max-w-xs mx-auto">
                  <input type="file" id="public-file-input" className="hidden" accept="image/*" onChange={handleImageSelect} />
                  <label 
                    htmlFor="public-file-input"
                    className="cursor-pointer px-12 py-5 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-500 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-primary-200 active:scale-95 uppercase tracking-widest text-sm"
                  >
                    <Camera className="w-6 h-6" />
                    {isThai ? 'เริ่มวิเคราะห์ทันที' : 'START ANALYSIS NOW'}
                  </label>
                </div>
              </div>
            )}

            {/* PROGRESS STATE: Image Selected but not analyzing yet */}
            {selectedImage && !isAnalyzing && !result && (
              <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
                  <h3 className="text-2xl font-black text-gray-900">{isThai ? 'รูปภาพที่เลือก' : 'Selected Image'}</h3>
                  <button onClick={resetState} className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 font-bold text-sm">
                    {isThai ? 'เปลี่ยนรูป' : 'Change Image'}
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-primary-500 blur-2xl opacity-10 rounded-[2rem] group-hover:opacity-20 transition-opacity" />
                    <div className="relative aspect-square md:aspect-[4/3] rounded-[2rem] overflow-hidden border-4 border-white shadow-xl">
                      <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-primary-50 rounded-2xl p-6 border border-primary-100">
                      <div className="flex gap-4 mb-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <Info className="w-5 h-5 text-primary-600" />
                        </div>
                        <h4 className="font-bold text-primary-900">{isThai ? 'คำแนะนำ' : 'Instructions'}</h4>
                      </div>
                      <p className="text-primary-800/70 text-sm leading-relaxed">
                        {isThai 
                          ? 'เพื่อให้ได้ผลลัพธ์ที่แม่นยำที่สุด ควรใช้รูปภาพที่มีความคมชัด และเห็นส่วนที่ผิดปกติของพืชได้อย่างชัดเจน' 
                          : 'For highly accurate results, ensure the photo is sharp and shows clear details of the plant anomaly.'}
                      </p>
                    </div>

                    <button 
                      onClick={startAnalysis} 
                      className="w-full py-5 bg-primary-600 hover:bg-primary-500 text-white font-black rounded-2xl text-base uppercase tracking-widest shadow-xl shadow-primary-200 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      <Scan className="w-6 h-6" />
                      {isThai ? 'ส่งให้ AI วิเคราะห์' : 'SEND TO AI ANALYSIS'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* LOADING STATE */}
            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
                <div className="relative mb-8">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-gray-100"></div>
                  <div className="absolute inset-0 w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Scan className="w-10 h-10 md:w-12 md:h-12 text-primary-500 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">{isThai ? 'กำลังประมวลผลด้วย AI' : 'AI Processing...'}</h3>
                <p className="text-slate-500 font-medium">{isThai ? 'ระบบกำลังวิเคราะห์โรคและศัตรูพืชจากรูปภาพของคุณ' : 'Our system is analyzing diseases and pests from your image.'}</p>
                
                <div className="mt-12 w-full max-w-xs bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-primary-500 h-full w-2/3 animate-[loading_2s_ease-in-out_infinite]" />
                </div>
              </div>
            )}

            {/* RESULT STATE - Integrated Premium Design */}
            {!isAnalyzing && result && (
              <div className="animate-in zoom-in-95 duration-700">
                {/* Header for result screen */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                  <h3 className="text-2xl font-black text-gray-900">{isThai ? 'ผลการวิเคราะห์' : 'Analysis Result'}</h3>
                  <button onClick={resetState} className="text-gray-400 hover:text-primary-600 transition-colors flex items-center gap-2 font-bold text-sm">
                    <Scan className="w-4 h-4" />
                    {isThai ? 'วิเคราะห์ใหม่' : 'Analyze New'}
                  </button>
                </div>

                <div className="flex flex-col">
                  {/* Image with overlay badge */}
                  <div className="relative mb-10 mx-auto w-full max-w-2xl group">
                    <div className={`absolute inset-0 blur-3xl opacity-20 rounded-[3rem] transition-all duration-700 group-hover:opacity-40 ${
                      result.category === 'pest' ? 'bg-orange-500' : 
                      result.category === 'disease' ? 'bg-red-500' :
                      'bg-emerald-500'
                    }`} />
                    <div className="relative aspect-video md:aspect-[21/9] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/80 bg-white">
                      <img src={selectedImage} alt="Analysis" className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000" />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                      
                      <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-center text-center">
                        <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs md:text-sm font-black tracking-widest uppercase mb-4 shadow-lg backdrop-blur-md border border-white/20 ${
                          result.category === 'pest' ? 'bg-orange-500 text-white' : 
                          result.category === 'disease' ? 'bg-red-500 text-white' :
                          'bg-emerald-500 text-white'
                        }`}>
                          {result.category === 'pest' ? <Bug className="w-5 h-5" /> : 
                           result.category === 'disease' ? <Shield className="w-5 h-5" /> :
                           <CheckCircle className="w-5 h-5" />}
                          {result.category === 'pest' ? (isThai ? 'ศัตรูพืช' : 'PEST') : 
                           result.category === 'disease' ? (isThai ? 'โรคพืช' : 'DISEASE') :
                           (isThai ? 'สุขภาพดี' : 'HEALTHY')}
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-2xl">
                          {isThai ? result.target_name_th : result.target_name_en}
                        </h2>
                      </div>
                    </div>
                  </div>

                  {/* Content Sections */}
                  <div className="max-w-4xl mx-auto w-full">
                    {result.category !== 'healthy' ? (
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* อาการ */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
                          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                          </div>
                          <h4 className="text-xl font-black text-gray-900 mb-3">
                            {isThai ? 'อาการที่พบ' : 'Symptoms Identified'}
                          </h4>
                          <p className="text-gray-600 text-base leading-relaxed">
                            {/* กรอง HTML Tags ออกก่อนแสดงผล */}
                            {(result.cause || result.symptoms || (isThai ? 'ไม่มีข้อมูล' : 'No data')).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')}
                          </p>
                        </div>

                        {/* วิธีแก้ไข */}
                        {(result.treatment || result.prevention) && (
                          <div className="bg-primary-50 rounded-[2.5rem] p-8 border border-primary-100 hover:shadow-xl transition-all duration-300 group">
                            <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                              <Sprout className="w-8 h-8 text-primary-600" />
                            </div>
                            <h4 className="text-xl font-black text-primary-900 mb-4">
                              {isThai ? 'แนวทางรักษาและป้องกัน' : 'Treatment & Prevention'}
                            </h4>
                            <ul className="space-y-4">
                              {[(result.treatment || []), (result.prevention || [])].flat().slice(0, 3).map((step, i) => (
                                <li key={i} className="text-base text-primary-900/80 flex gap-4 items-start">
                                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center font-black text-primary-600 text-sm shadow-sm">{i + 1}</span>
                                  <span className="leading-relaxed font-medium">
                                    {step.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-emerald-50 rounded-[3rem] p-12 border border-emerald-100 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200 rounded-full blur-[100px] opacity-30 -mr-32 -mt-32" />
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl relative z-10">
                          <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20" />
                          <CheckCircle className="w-12 h-12 text-emerald-600 relative z-10" />
                        </div>
                        <h4 className="text-3xl font-black text-emerald-900 mb-4">
                          {isThai ? 'พืชของคุณสุขภาพดีมาก!' : 'Your Plant is Perfectly Healthy!'}
                        </h4>
                        <p className="text-emerald-700/80 font-bold text-xl max-w-lg mx-auto leading-relaxed">
                          {isThai 
                            ? 'จากการวิเคราะห์ด้วย AI ไม่พบร่องรอยของโรคหรือศัตรูพืช พืชของคุณเจริญเติบโตได้ตามปกติ'
                            : 'AI analysis shows no trace of diseases or pests. Your plant is growing normally.'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-12 pt-8 border-t border-gray-100 w-full justify-center">
                    {/* กรณีมี detected_class_id - link ไปหน้ารายละเอียด */}
                    {result.detected_class_id ? (
                      <a 
                        href={`/diseases-pest/details/${result.detected_class_id}`}
                        className="px-10 py-5 bg-gray-900 hover:bg-black text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest text-sm flex items-center justify-center gap-3"
                      >
                        <Info className="w-5 h-5" />
                        {isThai ? 'ดูข้อมูลรายละเอียด' : 'Detailed Care Guide'}
                      </a>
                    ) : /* กรณีไม่มี ID แต่ตรวจพบโรค/แมลง - link ไปหน้ารายการพร้อมค้นหาด้วยชื่อ */
                    result.category !== 'healthy' && result.target_name_en ? (
                      <a 
                        href={`/diseases-pests?search=${encodeURIComponent(result.target_name_th || result.target_name_en)}`}
                        className="px-10 py-5 bg-gray-900 hover:bg-black text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest text-sm flex items-center justify-center gap-3"
                      >
                        <Info className="w-5 h-5" />
                        {isThai ? `ค้นหา: ${result.target_name_th || result.target_name_en}` : `Search: ${result.target_name_en}`}
                      </a>
                    ) : (
                      <button 
                        onClick={resetState}
                        className="px-10 py-5 bg-primary-600 hover:bg-primary-500 text-white font-black rounded-2xl shadow-xl shadow-primary-200 transition-all active:scale-95 uppercase tracking-widest text-sm flex items-center justify-center gap-3"
                      >
                        <Scan className="w-5 h-5" />
                        {isThai ? 'วิเคราะห์รูปอื่น' : 'ANALYZE NEW IMAGE'}
                      </button>
                    )}
                  </div>
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

export default DetectPublic;
