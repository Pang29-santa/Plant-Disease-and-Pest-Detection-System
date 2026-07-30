import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import cctvStreamApi from '../../services/cctvStreamApi';
import {
  Camera, ChevronLeft, Plus, X, Loader2, Video, 
  Settings, Trash2, Sprout, Network, Play, Info,
  Pencil, Wifi, WifiOff, RefreshCw, Bug, Cpu
} from 'lucide-react';

const CCTVPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || user?.user_id || 'unknown';
  const isThai = i18n.language === 'th';

  const [cctvs, setCctvs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Data for the modal dropdown
  const [plots, setPlots] = useState([]);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);
  const [statuses, setStatuses] = useState({});
  const [checkingStatus, setCheckingStatus] = useState({});
  const [detecting, setDetecting] = useState({});
  const [detectionResults, setDetectionResults] = useState({});
  
  const [form, setForm] = useState({
    camera_name: '',
    ip_address: '',
    rtsp_username: '',
    rtsp_password: '',
    device_ip: '',
    plot_id: ''
  });

  // Lock scroll when modal is open
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

  const fetchCctvs = useCallback(async () => {
    if (!userId || userId === 'unknown') return;
    try {
      setLoading(true);
      const res = await axios.get(`/api/cctv`, { params: { user_id: userId } });
      setCctvs(res.data || []);
    } catch (err) {
      console.error('Failed to load CCTVs:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchPlots = useCallback(async () => {
    if (!userId || userId === 'unknown') return;
    try {
      const res = await axios.get(`/api/plots`, { params: { user_id: userId } });
      setPlots(res.data || []);
    } catch (err) {
      console.error('Failed to load plots:', err);
    }
  }, [userId]);

  useEffect(() => {
    fetchCctvs();
  }, [fetchCctvs]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenModal = () => {
    setEditingCamera(null);
    setForm({
      camera_name: '',
      ip_address: '',
      rtsp_username: '',
      rtsp_password: '',
      device_ip: '',
      plot_id: plots.length > 0 ? plots[0].id || plots[0]._id : ''
    });
    fetchPlots();
    setIsModalOpen(true);
  };

  const handleEdit = (cam) => {
    setEditingCamera(cam);
    setForm({
      camera_name: cam.camera_name || '',
      ip_address: cam.ip_address || '',
      rtsp_username: cam.rtsp_username || '',
      rtsp_password: cam.rtsp_password || '',
      device_ip: cam.device_ip || '',
      plot_id: cam.plot_id || cam.plot_object_id || plots[0]?.id || plots[0]?._id || ''
    });
    fetchPlots();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCamera(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.camera_name || !form.ip_address || !form.plot_id) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบ',
        text: 'กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบถ้วน',
        confirmButtonColor: '#059669'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = { ...form, user_id: userId };
      
      if (editingCamera) {
        await axios.put(`/api/cctv/${editingCamera._id || editingCamera.id}`, payload);
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: 'อัปเดตข้อมูลกล้องวงจรปิดเรียบร้อยแล้ว',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await axios.post(`/api/cctv`, payload);
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: 'เพิ่มกล้องวงจรปิดเรียบร้อยแล้ว',
          timer: 1500,
          showConfirmButton: false
        });
      }
      setIsModalOpen(false);
      setEditingCamera(null);
      fetchCctvs();
    } catch (err) {
      console.error('Error saving CCTV:', err);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: editingCamera
          ? 'ไม่สามารถอัปเดตข้อมูลกล้องวงจรปิดได้ โปรดลองอีกครั้ง'
          : 'ไม่สามารถเพิ่มกล้องวงจรปิดได้ โปรดลองอีกครั้ง',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestConnection = async (cam) => {
    setCheckingStatus(prev => ({ ...prev, [cam._id || cam.id]: true }));
    try {
      const res = await axios.post(`/api/cctv/${cam._id || cam.id}/test-connection`);
      Swal.fire({
        icon: res.data?.status === 'connected' ? 'success' : 'warning',
        title: res.data?.status === 'connected' ? 'เชื่อมต่อสำเร็จ' : 'เชื่อมต่อไม่สำเร็จ',
        text: res.data?.message || `สถานะ: ${res.data?.status}`,
        confirmButtonColor: '#059669'
      });
    } catch (err) {
      console.error('Test connection error:', err);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถทดสอบการเชื่อมต่อได้',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setCheckingStatus(prev => ({ ...prev, [cam._id || cam.id]: false }));
    }
  };

  const checkCameraStatus = async (cam) => {
    setCheckingStatus(prev => ({ ...prev, [cam._id || cam.id]: true }));
    try {
      const res = await axios.get(`/api/cctv/status/${cam._id || cam.id}`);
      setStatuses(prev => ({ ...prev, [cam._id || cam.id]: res.data }));
    } catch (err) {
      console.error('Status check error:', err);
      setStatuses(prev => ({ ...prev, [cam._id || cam.id]: { status: 'offline', reason: 'error' } }));
    } finally {
      setCheckingStatus(prev => ({ ...prev, [cam._id || cam.id]: false }));
    }
  };

  const handleLiveStream = (cam) => {
    navigate('/camera-stream', { state: { selectedCameraId: cam._id || cam.id } });
  };

  const handleDetectPest = async (cam) => {
    const camId = cam._id || cam.id;
    setDetecting(prev => ({ ...prev, [camId]: true }));
    try {
      // ดึง snapshot จากสตรีมกล้อง
      const snapshotUrl = await cctvStreamApi.captureSnapshot(camId);
      
      // แปลง data URL เป็น Blob/File
      const response = await fetch(snapshotUrl);
      const blob = await response.blob();
      const file = new File([blob], `cctv_${camId}_${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      // ส่งไปวิเคราะห์
      const formData = new FormData();
      formData.append('file', file);
      formData.append('camera_id', camId);
      if (cam.plot_id) formData.append('plot_id', cam.plot_id);
      
      const res = await axios.post('/api/ai/detect-cctv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setDetectionResults(prev => ({ ...prev, [camId]: res.data }));
      
      const isPest = res.data?.analysis?.category === 'pest';
      const targetName = res.data?.analysis?.target_name_th || res.data?.analysis?.target_name_en || 'ไม่ระบุ';
      
      Swal.fire({
        icon: isPest ? 'warning' : 'success',
        title: isPest ? `พบศัตรูพืช: ${targetName}` : 'ไม่พบศัตรูพืช',
        html: isPest
          ? `<div class="text-left">
              <p><b>ความมั่นใจ:</b> ${res.data?.analysis?.confidence || 0}%</p>
              <p><b>IoT ทำงาน:</b> ${res.data?.iot_triggered ? 'ใช่ ✅' : 'ไม่ ❌'}</p>
              ${res.data?.iot_device_ip ? `<p><b>อุปกรณ์:</b> ${res.data.iot_device_ip}</p>` : ''}
             </div>`
          : 'ภาพจากกล้องดูปกติ',
        confirmButtonColor: isPest ? '#ef4444' : '#059669'
      });
    } catch (err) {
      console.error('Pest detection error:', err);
      Swal.fire({
        icon: 'error',
        title: 'ตรวจจับไม่สำเร็จ',
        text: err.response?.data?.detail || 'ไม่สามารถวิเคราะห์ภาพจากกล้องได้',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setDetecting(prev => ({ ...prev, [camId]: false }));
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'ต้องการลบกล้องวงจรปิด?',
      text: "หากลบแล้วจะไม่สามารถเรียกคืนการตั้งค่ากลับมาได้!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'ลบข้อมูล',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/cctv/${id}`);
        Swal.fire({
          icon: 'success',
          title: 'ลบสำเร็จ',
          timer: 1500,
          showConfirmButton: false
        });
        fetchCctvs();
      } catch (err) {
        console.error('Error deleting CCTV:', err);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถลบข้อมูลได้ เกิดปัญหาบางอย่าง',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  return (
    <div className="bg-[#F8FAFC] pb-24 flex-grow">
      {/* Page Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-xs font-bold mb-2">
              <Video className="w-3.5 h-3.5 text-emerald-600" />
              {isThai ? 'กล้องวงจรปิด & ระบบสตรีมมิ่งสด' : 'CCTV & Live Monitoring'}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {isThai ? 'จัดการกล้องวงจรปิด (CCTV)' : 'CCTV Management'}
            </h1>
            <p className="text-base sm:text-lg text-slate-500 mt-1 font-medium">
              {isThai 
                ? 'ควบคุมและตรวจดูความเรียบร้อยของแปลงผักแบบเรียลไทม์' 
                : 'Monitor and inspect your vegetable plots in real-time.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/worker-status')}
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 font-bold rounded-2xl text-xs uppercase tracking-widest transition-all active:scale-95 shrink-0"
            >
              <Cpu className="w-4 h-4 text-indigo-600" />
              {isThai ? 'สถานะ Worker' : 'Worker Status'}
            </button>
            <button
              onClick={handleOpenModal}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-200/80 active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              {isThai ? 'เพิ่มกล้องวงจรปิด' : 'Add CCTV Camera'}
            </button>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="font-bold text-sm">{isThai ? 'กำลังโหลดข้อมูลกล้อง...' : 'Loading CCTV data...'}</p>
          </div>
        ) : cctvs.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-12 md:p-16 border border-slate-100 text-center shadow-xl shadow-slate-200/50 max-w-2xl mx-auto overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-100 transition-colors" />
            <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 relative z-10 transform group-hover:rotate-6 transition-transform border border-emerald-100">
              <Camera className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight uppercase">
              {isThai ? 'ยังไม่มีกล้องในระบบ' : 'NO CCTV CAMERAS'}
            </h3>
            <p className="text-slate-500 font-medium text-base mb-8 max-w-sm mx-auto leading-relaxed">
              {isThai 
                ? 'เพิ่มกล้องวงจรปิดเพื่อเริ่มต้นดูแลแปลงผักของคุณตลอด 24 ชั่วโมง' 
                : 'Add a CCTV camera to start monitoring your plots 24/7.'}
            </p>
            <button 
              onClick={handleOpenModal}
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold rounded-2xl transition-all duration-300 flex items-center gap-2.5 mx-auto shadow-[0_12px_25px_-5px_rgba(16,185,129,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 active:scale-95 uppercase tracking-widest text-xs relative overflow-hidden group/btn"
            >
              <Plus className="w-5 h-5" />
              {isThai ? 'เริ่มเพิ่มกล้องตัวแรก' : 'ADD FIRST CAMERA'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cctvs.map(cam => (
              <div 
                key={cam.id || cam._id} 
                className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100 hover:border-emerald-200 flex flex-col group"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-xs">
                      <Video className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-base">{cam.camera_name || 'ไม่ระบุชื่อกล้อง'}</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                        statuses[cam._id || cam.id]?.status === 'online'
                          ? 'bg-green-50 text-green-600 border-green-100'
                          : statuses[cam._id || cam.id]?.status === 'offline'
                          ? 'bg-red-50 text-red-600 border-red-100'
                          : 'bg-gray-50 text-gray-500 border-gray-100'
                      }`}>
                        {checkingStatus[cam._id || cam.id]
                          ? (isThai ? 'กำลังตรวจสอบ...' : 'Checking...')
                          : statuses[cam._id || cam.id]?.status === 'online'
                          ? (isThai ? 'ออนไลน์' : 'ONLINE')
                          : statuses[cam._id || cam.id]?.status === 'offline'
                          ? (isThai ? 'ออฟไลน์' : 'OFFLINE')
                          : (isThai ? 'ยังไม่ได้ตรวจสอบ' : 'NOT CHECKED')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => checkCameraStatus(cam)}
                      disabled={checkingStatus[cam._id || cam.id]}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-90 disabled:opacity-50"
                      title={isThai ? 'ตรวจสอบสถานะ' : 'Check Status'}
                    >
                      {checkingStatus[cam._id || cam.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleEdit(cam)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all active:scale-90"
                      title={isThai ? 'แก้ไขกล้อง' : 'Edit Camera'}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(cam.id || cam._id)} 
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all active:scale-90"
                      title={isThai ? 'ลบกล้อง' : 'Delete Camera'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Card Body */}
                <div className="p-5 flex-1 space-y-3 bg-white">
                  <div className="flex items-start gap-2.5 text-xs text-slate-600">
                    <Network className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-700">IP/URL: </span>
                      <span className="font-mono text-slate-600">{cam.ip_address || '-'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-slate-600">
                    <Settings className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-700">RTSP User: </span>
                      <span className="text-slate-600">{cam.rtsp_username ? '********' : (isThai ? 'ไม่มี' : 'None')}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-slate-600">
                    <Sprout className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-700">{isThai ? 'IP พ่นน้ำ:' : 'Sprinkler IP:'} </span>
                      <span className="font-mono text-slate-600">{cam.device_ip || (isThai ? 'ไม่ได้ตั้งค่า' : 'Not set')}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/30 grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => handleTestConnection(cam)}
                    disabled={checkingStatus[cam._id || cam.id]}
                    className="py-3 bg-white hover:bg-slate-50 text-slate-600 font-bold text-[10px] rounded-xl transition-all flex items-center justify-center gap-1 active:scale-95 border border-slate-200 disabled:opacity-50"
                  >
                    {checkingStatus[cam._id || cam.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
                    {isThai ? 'ทดสอบ' : 'Test'}
                  </button>
                  <button 
                    onClick={() => handleDetectPest(cam)}
                    disabled={detecting[cam._id || cam.id]}
                    className="py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-[10px] rounded-xl transition-all flex items-center justify-center gap-1 active:scale-95 border border-amber-100/80 disabled:opacity-50"
                  >
                    {detecting[cam._id || cam.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bug className="w-4 h-4" />}
                    {isThai ? 'ตรวจแมลง' : 'Detect'}
                  </button>
                  <button 
                    onClick={() => handleLiveStream(cam)}
                    className="py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] rounded-xl transition-all flex items-center justify-center gap-1 active:scale-95 border border-emerald-100/80"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    {isThai ? 'ดูกล้อง' : 'Live'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add CCTV Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md transition-all duration-300">
          <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-2xl w-full max-w-lg relative overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col border border-white/20">
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-200">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">{editingCamera ? (isThai ? 'แก้ไขกล้องวงจรปิด' : 'Edit CCTV Camera') : (isThai ? 'เพิ่มกล้องวงจรปิดใหม่' : 'Add New CCTV Camera')}</h2>
                  <p className="text-xs font-medium text-slate-400">{isThai ? 'กรอกรายละเอียด IP และแปลงที่ต้องการติดตั้ง' : 'Fill camera RTSP & plot connection'}</p>
                </div>
              </div>
              <button 
                onClick={handleCloseModal}
                className="w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  {isThai ? 'ชื่อกล้องวงจรปิด' : 'Camera Name'} <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="camera_name" 
                  value={form.camera_name} 
                  onChange={handleChange} 
                  placeholder={isThai ? 'เช่น กล้องแปลงกะเพรา 1' : 'e.g., Plot #1 Camera'} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                  required 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  {isThai ? 'IP หรือ URL ของกล้องวงจรปิด' : 'CCTV IP or Stream URL'} <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="ip_address" 
                  value={form.ip_address} 
                  onChange={handleChange} 
                  placeholder={isThai ? 'เช่น 192.168.1.100 หรือ rtsp://...' : 'e.g., 192.168.1.100 or rtsp://...'} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                  required 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {isThai ? 'ชื่อผู้ใช้ RTSP (Username)' : 'RTSP Username'}
                  </label>
                  <input 
                    type="text" 
                    name="rtsp_username" 
                    value={form.rtsp_username} 
                    onChange={handleChange} 
                    placeholder="admin" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {isThai ? 'รหัสผ่าน RTSP (Password)' : 'RTSP Password'}
                  </label>
                  <input 
                    type="password" 
                    name="rtsp_password" 
                    value={form.rtsp_password} 
                    onChange={handleChange} 
                    placeholder="••••••••" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {isThai ? 'IP ของเครื่องพ่นน้ำ (Relay ESP)' : 'Sprinkler Relay IP (ESP)'}
                </label>
                <input 
                  type="text" 
                  name="device_ip" 
                  value={form.device_ip} 
                  onChange={handleChange} 
                  placeholder={isThai ? 'เช่น 192.168.1.105' : 'e.g., 192.168.1.105'} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  {isThai ? 'แปลงที่ติดตั้ง (Plot)' : 'Installed Plot'} <span className="text-red-500">*</span>
                </label>
                <select 
                  name="plot_id" 
                  value={form.plot_id} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all cursor-pointer"
                  required
                >
                  <option value="" disabled>{isThai ? '-- กรุณาเลือกแปลงที่ติดตั้ง --' : '-- Select Plot --'}</option>
                  {plots.map(p => (
                    <option key={p.id || p._id} value={p.id || p._id}>
                      {p.name || p.plot_name || 'ไม่ระบุชื่อ'} {p.size ? `(${p.size} ${p.unit || p.area_unit || 'ตร.ม.'})` : ''}
                    </option>
                  ))}
                </select>
                {plots.length === 0 && (
                  <p className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200/60 p-2.5 rounded-xl flex items-center gap-1.5 mt-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      {isThai ? 'คุณยังไม่มีแปลงผัก' : 'No active plots.'}{' '}
                      <a href="/plots" className="text-sky-600 underline font-bold">
                        {isThai ? 'คลิกที่นี่เพื่อสร้างแปลง' : 'Create plot'}
                      </a>
                    </span>
                  </p>
                )}
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs uppercase tracking-widest transition-all"
                >
                  {isThai ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-emerald-200 transition-all duration-300 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingCamera ? (isThai ? 'บันทึกการเปลี่ยนแปลง' : 'Update Camera') : (isThai ? 'สร้างและบันทึก' : 'Save Camera'))}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CCTVPage;
