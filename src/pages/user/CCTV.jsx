import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Pencil, Wifi, WifiOff, RefreshCw, Bug, Cpu, CheckCircle2
} from 'lucide-react';

const CCTVPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || user?.user_id || 'unknown';
  const isThai = i18n.language?.startsWith('th');

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
  
  // Custom dropdown state
  const [isPlotDropdownOpen, setIsPlotDropdownOpen] = useState(false);
  const plotDropdownRef = useRef(null);

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

  // Click outside to close plot dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (plotDropdownRef.current && !plotDropdownRef.current.contains(e.target)) {
        setIsPlotDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setIsPlotDropdownOpen(false);
    fetchPlots();
    setForm({
      camera_name: '',
      ip_address: '',
      rtsp_username: '',
      rtsp_password: '',
      device_ip: '',
      plot_id: plots.length > 0 ? plots[0].id || plots[0]._id : ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (cam) => {
    setEditingCamera(cam);
    setIsPlotDropdownOpen(false);
    fetchPlots();
    setForm({
      camera_name: cam.camera_name || '',
      ip_address: cam.ip_address || '',
      rtsp_username: cam.rtsp_username || '',
      rtsp_password: cam.rtsp_password || '',
      device_ip: cam.device_ip || '',
      plot_id: cam.plot_id || cam.plot_object_id || (plots[0]?.id || plots[0]?._id || '')
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCamera(null);
    setIsPlotDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.camera_name || !form.ip_address || !form.plot_id) {
      Swal.fire({
        icon: 'warning',
        title: isThai ? 'ข้อมูลไม่ครบถ้วน' : 'Incomplete Form',
        text: isThai ? 'กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบถ้วน' : 'Please fill in all required fields marked with *.',
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
          title: isThai ? 'สำเร็จ!' : 'Success!',
          text: isThai ? 'อัปเดตข้อมูลกล้องวงจรปิดเรียบร้อยแล้ว' : 'CCTV camera updated successfully.',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await axios.post(`/api/cctv`, payload);
        Swal.fire({
          icon: 'success',
          title: isThai ? 'สำเร็จ!' : 'Success!',
          text: isThai ? 'เพิ่มกล้องวงจรปิดเรียบร้อยแล้ว' : 'CCTV camera added successfully.',
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
        title: isThai ? 'เกิดข้อผิดพลาด' : 'Error',
        text: editingCamera
          ? (isThai ? 'ไม่สามารถอัปเดตข้อมูลกล้องวงจรปิดได้ โปรดลองอีกครั้ง' : 'Failed to update camera. Please try again.')
          : (isThai ? 'ไม่สามารถเพิ่มกล้องวงจรปิดได้ โปรดลองอีกครั้ง' : 'Failed to add camera. Please try again.'),
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestConnection = async (cam) => {
    const camId = cam._id || cam.id;
    setCheckingStatus(prev => ({ ...prev, [camId]: true }));
    try {
      const res = await axios.post(`/api/cctv/${camId}/test-connection`);
      const isOk = res.data?.status === 'connected';
      Swal.fire({
        icon: isOk ? 'success' : 'warning',
        title: isOk 
          ? (isThai ? 'เชื่อมต่อสำเร็จ' : 'Connection Successful')
          : (isThai ? 'เชื่อมต่อไม่สำเร็จ' : 'Connection Failed'),
        text: res.data?.message || `${isThai ? 'สถานะ:' : 'Status:'} ${res.data?.status}`,
        confirmButtonColor: '#059669'
      });
    } catch (err) {
      console.error('Test connection error:', err);
      Swal.fire({
        icon: 'error',
        title: isThai ? 'เกิดข้อผิดพลาด' : 'Error',
        text: isThai ? 'ไม่สามารถทดสอบการเชื่อมต่อได้' : 'Could not test connection.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setCheckingStatus(prev => ({ ...prev, [camId]: false }));
    }
  };

  const checkCameraStatus = async (cam) => {
    const camId = cam._id || cam.id;
    setCheckingStatus(prev => ({ ...prev, [camId]: true }));
    try {
      const res = await axios.get(`/api/cctv/status/${camId}`);
      setStatuses(prev => ({ ...prev, [camId]: res.data }));
    } catch (err) {
      console.error('Status check error:', err);
      setStatuses(prev => ({ ...prev, [camId]: { status: 'offline', reason: 'error' } }));
    } finally {
      setCheckingStatus(prev => ({ ...prev, [camId]: false }));
    }
  };

  const handleLiveStream = (cam) => {
    navigate('/camera-stream', { state: { selectedCameraId: cam._id || cam.id } });
  };

  const handleDetectPest = async (cam) => {
    const camId = cam._id || cam.id;
    setDetecting(prev => ({ ...prev, [camId]: true }));
    try {
      const snapshotUrl = await cctvStreamApi.captureSnapshot(camId);
      
      const response = await fetch(snapshotUrl);
      const blob = await response.blob();
      const file = new File([blob], `cctv_${camId}_${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('camera_id', camId);
      if (cam.plot_id) formData.append('plot_id', cam.plot_id);
      
      const res = await axios.post('/api/ai/detect-cctv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setDetectionResults(prev => ({ ...prev, [camId]: res.data }));
      
      const isPest = res.data?.analysis?.category === 'pest';
      const targetName = res.data?.analysis?.target_name_th || res.data?.analysis?.target_name_en || (isThai ? 'ไม่ระบุ' : 'Unknown');
      
      Swal.fire({
        icon: isPest ? 'warning' : 'success',
        title: isPest 
          ? `${isThai ? 'พบศัตรูพืช:' : 'Pest Detected:'} ${targetName}` 
          : (isThai ? 'ไม่พบศัตรูพืช' : 'No Pest Detected'),
        html: isPest
          ? `<div class="text-left">
              <p><b>${isThai ? 'ความมั่นใจ:' : 'Confidence:'}</b> ${res.data?.analysis?.confidence ? (res.data.analysis.confidence >= 1 ? Math.round(res.data.analysis.confidence) : Math.round(res.data.analysis.confidence * 100)) : 0}%</p>
              <p><b>${isThai ? 'ระบบพ่นน้ำสั่งงาน:' : 'Sprinkler Triggered:'}</b> ${res.data?.iot_triggered ? 'ใช่ ✅' : 'ไม่ ❌'}</p>
              ${res.data?.iot_device_ip ? `<p><b>${isThai ? 'ไอพีอุปกรณ์:' : 'Device IP:'}</b> ${res.data.iot_device_ip}</p>` : ''}
             </div>`
          : (isThai ? 'ภาพถ่ายจากกล้องเป็นปกติ ไม่พบศัตรูพืช' : 'Camera frame looks clear.'),
        confirmButtonColor: isPest ? '#ef4444' : '#059669'
      });
    } catch (err) {
      console.error('Pest detection error:', err);
      Swal.fire({
        icon: 'error',
        title: isThai ? 'ตรวจจับไม่สำเร็จ' : 'Detection Failed',
        text: err.response?.data?.detail || (isThai ? 'ไม่สามารถวิเคราะห์ภาพจากกล้องได้' : 'Could not analyze frame from camera.'),
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setDetecting(prev => ({ ...prev, [camId]: false }));
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: isThai ? 'ยืนยันการลบกล้อง?' : 'Delete CCTV Camera?',
      text: isThai ? 'หากลบแล้วจะไม่สามารถเรียกคืนการตั้งค่ากลับมาได้!' : 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: isThai ? 'ลบกล้อง' : 'Delete',
      cancelButtonText: isThai ? 'ยกเลิก' : 'Cancel',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/cctv/${id}`);
        Swal.fire({
          icon: 'success',
          title: isThai ? 'ลบสำเร็จ' : 'Deleted Successfully',
          timer: 1500,
          showConfirmButton: false
        });
        fetchCctvs();
      } catch (err) {
        console.error('Error deleting CCTV:', err);
        Swal.fire({
          icon: 'error',
          title: isThai ? 'เกิดข้อผิดพลาด' : 'Error',
          text: isThai ? 'ไม่สามารถลบข้อมูลกล้องได้' : 'Could not delete CCTV camera.',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  const selectedPlotObj = plots.find(p => (p.id || p._id) === form.plot_id);

  return (
    <div className="bg-[#F8FAFC] pb-24 flex-grow">
      {/* Page Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-xs font-bold mb-2">
              <Video className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isThai ? 'กล้องวงจรปิด & ระบบสตรีมมิ่งสด' : 'CCTV & Live Monitoring'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {isThai ? 'จัดการกล้องวงจรปิด (CCTV)' : 'CCTV Management'}
            </h1>
            <p className="text-xs sm:text-base text-slate-500 mt-1 font-medium">
              {isThai 
                ? 'ควบคุมและตรวจดูความเรียบร้อยของแปลงผักแบบเรียลไทม์' 
                : 'Monitor and inspect your vegetable plots in real-time.'}
            </p>
          </div>
          <div>
            <button
              onClick={handleOpenModal}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-200 active:scale-95 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isThai ? 'เพิ่มกล้องวงจรปิด' : 'Add CCTV Camera'}</span>
            </button>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="font-bold text-xs sm:text-sm">{isThai ? 'กำลังโหลดข้อมูลกล้อง...' : 'Loading CCTV data...'}</p>
          </div>
        ) : cctvs.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-14 border border-slate-200/80 text-center shadow-xs max-w-xl mx-auto overflow-hidden relative">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2">
              {isThai ? 'ยังไม่มีกล้องวงจรปิดในระบบ' : 'NO CCTV CAMERAS'}
            </h3>
            <p className="text-slate-500 font-medium text-xs sm:text-sm mb-6 max-w-sm mx-auto leading-relaxed">
              {isThai 
                ? 'เพิ่มกล้องวงจรปิดเพื่อเริ่มต้นดูแลแปลงผักของคุณตลอด 24 ชั่วโมง' 
                : 'Add a CCTV camera to start monitoring your plots 24/7.'}
            </p>
            <button 
              onClick={handleOpenModal}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all flex items-center gap-2 mx-auto shadow-md shadow-emerald-200 active:scale-95 text-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isThai ? 'เริ่มเพิ่มกล้องตัวแรก' : 'ADD FIRST CAMERA'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cctvs.map(cam => (
              <div 
                key={cam.id || cam._id} 
                className="bg-white rounded-3xl shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden border border-slate-200/80 flex flex-col group"
              >
                {/* Card Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                      <Video className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm truncate">{cam.camera_name || (isThai ? 'ไม่ระบุชื่อกล้อง' : 'Unnamed Camera')}</h3>
                      <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        statuses[cam._id || cam.id]?.status === 'online'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : statuses[cam._id || cam.id]?.status === 'offline'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
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
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => checkCameraStatus(cam)}
                      disabled={checkingStatus[cam._id || cam.id]}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-90 disabled:opacity-50 cursor-pointer"
                      title={isThai ? 'ตรวจสอบสถานะ' : 'Check Status'}
                    >
                      {checkingStatus[cam._id || cam.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleEdit(cam)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all active:scale-90 cursor-pointer"
                      title={isThai ? 'แก้ไขกล้อง' : 'Edit Camera'}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(cam.id || cam._id)} 
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-90 cursor-pointer"
                      title={isThai ? 'ลบกล้อง' : 'Delete Camera'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Card Body */}
                <div className="p-4 sm:p-5 flex-1 space-y-2.5 bg-white text-xs">
                  <div className="flex items-start gap-2 text-slate-600">
                    <Network className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="truncate">
                      <span className="font-bold text-slate-700">IP/URL: </span>
                      <span className="font-mono text-slate-600">{cam.ip_address || '-'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-slate-600">
                    <Settings className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-700">RTSP User: </span>
                      <span className="text-slate-600">{cam.rtsp_username ? '********' : (isThai ? 'ไม่มี' : 'None')}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-slate-600">
                    <Sprout className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-700">{isThai ? 'IP พ่นน้ำ:' : 'Sprinkler IP:'} </span>
                      <span className="font-mono text-slate-600">{cam.device_ip || (isThai ? 'ไม่ได้ตั้งค่า' : 'Not set')}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-3 border-t border-slate-100 bg-slate-50/40 grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => handleTestConnection(cam)}
                    disabled={checkingStatus[cam._id || cam.id]}
                    className="py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] rounded-xl transition-all flex items-center justify-center gap-1 active:scale-95 border border-slate-200 disabled:opacity-50 cursor-pointer"
                  >
                    {checkingStatus[cam._id || cam.id] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5 text-blue-600" />}
                    <span>{isThai ? 'ทดสอบ' : 'Test'}</span>
                  </button>
                  <button 
                    onClick={() => handleDetectPest(cam)}
                    disabled={detecting[cam._id || cam.id]}
                    className="py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-[11px] rounded-xl transition-all flex items-center justify-center gap-1 active:scale-95 border border-amber-200/60 disabled:opacity-50 cursor-pointer"
                  >
                    {detecting[cam._id || cam.id] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bug className="w-3.5 h-3.5 text-amber-600" />}
                    <span>{isThai ? 'ตรวจแมลง' : 'Detect'}</span>
                  </button>
                  <button 
                    onClick={() => handleLiveStream(cam)}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-xl transition-all flex items-center justify-center gap-1 active:scale-95 shadow-xs shadow-emerald-200 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isThai ? 'ดูกล้อง' : 'Live'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit CCTV Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md relative overflow-hidden flex flex-col border border-slate-100">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 tracking-tight">
                    {editingCamera ? (isThai ? 'แก้ไขกล้องวงจรปิด' : 'Edit CCTV Camera') : (isThai ? 'เพิ่มกล้องวงจรปิดใหม่' : 'Add New CCTV Camera')}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">{isThai ? 'กรอกรายละเอียด IP และแปลงที่ติดตั้ง' : 'Configure camera connection settings'}</p>
                </div>
              </div>
              <button 
                onClick={handleCloseModal}
                className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>{isThai ? 'ชื่อกล้องวงจรปิด' : 'Camera Name'}</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="camera_name" 
                  value={form.camera_name} 
                  onChange={handleChange} 
                  placeholder={isThai ? 'เช่น กล้องแปลงกะเพรา 1' : 'e.g., Plot #1 Camera'} 
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200 transition-all"
                  required 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>{isThai ? 'IP หรือ Stream URL' : 'CCTV IP or Stream URL'}</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="ip_address" 
                  value={form.ip_address} 
                  onChange={handleChange} 
                  placeholder={isThai ? 'เช่น 192.168.1.100 หรือ rtsp://...' : 'e.g., 192.168.1.100 or rtsp://...'} 
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200 transition-all"
                  required 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {isThai ? 'ชื่อผู้ใช้ RTSP' : 'RTSP Username'}
                  </label>
                  <input 
                    type="text" 
                    name="rtsp_username" 
                    value={form.rtsp_username} 
                    onChange={handleChange} 
                    placeholder="admin" 
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {isThai ? 'รหัสผ่าน RTSP' : 'RTSP Password'}
                  </label>
                  <input 
                    type="password" 
                    name="rtsp_password" 
                    value={form.rtsp_password} 
                    onChange={handleChange} 
                    placeholder="••••••••" 
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200 transition-all"
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200 transition-all"
                />
              </div>

              {/* Custom Interactive Dropdown for Plot Selection (Prevents Mobile Overflow) */}
              <div className="space-y-1.5 relative" ref={plotDropdownRef}>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>{isThai ? 'แปลงที่ติดตั้ง (Plot)' : 'Installed Plot'}</span>
                  <span className="text-rose-500">*</span>
                </label>
                
                <button
                  type="button"
                  onClick={() => setIsPlotDropdownOpen(!isPlotDropdownOpen)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 flex items-center justify-between hover:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all cursor-pointer"
                >
                  <span className={form.plot_id ? 'text-slate-800 font-bold truncate' : 'text-slate-400 font-medium truncate'}>
                    {selectedPlotObj 
                      ? `${selectedPlotObj.name || selectedPlotObj.plot_name || 'ไม่ระบุชื่อ'} ${selectedPlotObj.size ? `(${selectedPlotObj.size} ${selectedPlotObj.unit || selectedPlotObj.area_unit || 'ตร.ม.'})` : ''}`
                      : (isThai ? '-- กรุณาเลือกแปลงที่ติดตั้ง --' : '-- Select Plot --')}
                  </span>
                  <ChevronLeft className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isPlotDropdownOpen ? '-rotate-90' : 'rotate-180'}`} />
                </button>

                {isPlotDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                    {plots.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-slate-400 font-medium text-center">
                        {isThai ? 'ไม่พบแปลงผักในระบบ' : 'No plots found'}
                      </div>
                    ) : (
                      plots.map(p => {
                        const pId = p.id || p._id;
                        const isSelected = form.plot_id === pId;
                        return (
                          <div
                            key={pId}
                            onClick={() => {
                              setForm(prev => ({ ...prev, plot_id: pId }));
                              setIsPlotDropdownOpen(false);
                            }}
                            className={`px-4 py-2.5 text-xs cursor-pointer flex items-center justify-between transition-colors hover:bg-emerald-50 hover:text-emerald-700 ${
                              isSelected ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 font-medium'
                            }`}
                          >
                            <span className="truncate">
                              {p.name || p.plot_name || 'ไม่ระบุชื่อ'} {p.size ? `(${p.size} ${p.unit || p.area_unit || 'ตร.ม.'})` : ''}
                            </span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {plots.length === 0 && (
                  <p className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200/60 p-2 rounded-xl flex items-center gap-1.5 mt-2">
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
              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-all cursor-pointer"
                >
                  {isThai ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs shadow-md shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{editingCamera ? (isThai ? 'บันทึกการแก้ไข' : 'Update Camera') : (isThai ? 'เพิ่มกล้อง' : 'Save Camera')}</span>
                  )}
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
