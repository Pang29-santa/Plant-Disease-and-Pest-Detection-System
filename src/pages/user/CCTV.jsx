import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  Camera, ChevronLeft, Plus, X, Loader2, Video, 
  Settings, Trash2, Sprout, Network, Play
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8888';

const CCTVPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || user?.user_id || 'unknown';

  const [cctvs, setCctvs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Data for the modal dropdown
  const [plots, setPlots] = useState([]);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    camera_name: '',
    ip_address: '',
    rtsp_username: '',
    rtsp_password: '',
    device_ip: '',
    plot_id: ''
  });

  const fetchCctvs = useCallback(async () => {
    if (!userId || userId === 'unknown') return;
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/cctv`, { params: { user_id: userId } });
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
      const res = await axios.get(`${API}/api/plots`, { params: { user_id: userId } });
      setPlots(res.data || []);
    } catch (err) {
      console.error('Failed to load plots:', err);
    }
  }, [userId]);

  useEffect(() => {
    fetchCctvs();
  }, [fetchCctvs]);

  // Open modal and fetch plots
  const handleOpenModal = () => {
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.camera_name || !form.ip_address || !form.plot_id) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบ',
        text: 'กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบถ้วน',
        confirmButtonColor: '#2E7D32'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = { ...form, user_id: userId };
      
      await axios.post(`${API}/api/cctv`, payload);
      
      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ!',
        text: 'เพิ่มกล้องวงจรปิดเรียบร้อยแล้ว',
        timer: 1500,
        showConfirmButton: false
      });
      setIsModalOpen(false);
      fetchCctvs();
    } catch (err) {
      console.error('Error adding CCTV:', err);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเพิ่มกล้องระบบวงจรปิดได้ โปรดลองอีกครั้ง',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'ต้องการลบกล้องวงจรปิด?',
      text: "หากลบแล้วจะไม่สามารถเรียกคืนการตั้งค่ากลับมาได้!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C62828',
      cancelButtonColor: '#9e9e9e',
      confirmButtonText: 'ลบข้อมูล',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API}/api/cctv/${id}`);
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
        });
      }
    }
  };

  return (
    <div className="cctv-page">
      {/* Background Ambience */}
      <div className="cctv-bg-blur top-right" />
      <div className="cctv-bg-blur bottom-left" />

      <div className="cctv-container">
        {/* Header Section */}
        <div className="cctv-header">
          <div>
            <h1 className="cctv-title">จัดการกล้องวงจรปิด (CCTV)</h1>
            <p className="cctv-subtitle">ควบคุมและตรวจดูความเรียบร้อยของแปลงผักแบบเรียลไทม์</p>
          </div>
          <button className="cctv-add-btn" onClick={handleOpenModal}>
            <Plus size={18} strokeWidth={2.5} /> เพิ่มกล้องวงจรปิด
          </button>
        </div>

        {/* CCTVs List */}
        {loading ? (
          <div className="cctv-loading">
            <Loader2 className="spin" size={32} color="#2E7D32" />
            <p>กำลังโหลดข้อมูลกล้อง...</p>
          </div>
        ) : cctvs.length === 0 ? (
          <div className="cctv-empty">
            <div className="cctv-empty-icon">
              <Camera size={48} />
            </div>
            <h2>ยังไม่มีกล้องในระบบ</h2>
            <p>เพิ่มกล้องวงจรปิดเพื่อเริ่มต้นดูแลแปลงผักของคุณตลอด 24 ชั่วโมง</p>
            <button className="cctv-empty-btn" onClick={handleOpenModal}>
              <Plus size={16} /> เริ่มเพิ่มกล้องตัวแรก
            </button>
          </div>
        ) : (
          <div className="cctv-grid">
            {cctvs.map(cam => (
              <div key={cam.id || cam._id} className="cctv-card">
                <div className="cctv-card-header">
                  <div className="cctv-card-title">
                    <Video size={18} color="#2E7D32" />
                    <h3>{cam.camera_name || 'ไม่ระบุชื่อกล้อง'}</h3>
                  </div>
                  <button className="cctv-delete-btn" onClick={() => handleDelete(cam.id || cam._id)} title="ลบกล้อง">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="cctv-card-body">
                  <div className="cctv-info-item">
                    <Network size={14} className="icon" />
                    <span><strong>IP/URL:</strong> {cam.ip_address || '-'}</span>
                  </div>
                  <div className="cctv-info-item">
                    <Settings size={14} className="icon" />
                    <span><strong>RTSP User:</strong> {cam.rtsp_username ? '********' : 'ไม่มี'}</span>
                  </div>
                  <div className="cctv-info-item">
                    <Sprout size={14} className="icon" />
                    <span><strong>IP พ่นน้ำ:</strong> {cam.device_ip || 'ไม่ได้ตั้งต่า'}</span>
                  </div>
                </div>

                <div className="cctv-card-footer">
                  <button className="cctv-play-btn" onClick={() => {
                    Swal.fire({
                       icon: 'info',
                       title: 'Coming Soon!',
                       text: 'ระบบหน้าจอ Live Streaming กำลังอยู่ในช่วงพัฒนาครับ'
                    });
                  }}>
                    <Play size={15} fill="currentColor" /> เปิดดูกล้อง
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add CCTV Modal */}
      {isModalOpen && (
        <div className="cctv-modal-overlay" onMouseDown={handleCloseModal}>
          <div className="cctv-modal" onMouseDown={e => e.stopPropagation()}>
            <div className="cctv-modal-header">
              <h2>เพิ่มกล้องวงจรปิดใหม่</h2>
              <button className="cctv-modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="cctv-modal-body">
              <div className="cctv-form-group">
                <label>ชื่อกล้องวงจรปิด <span className="req">*</span></label>
                <input 
                  type="text" 
                  name="camera_name" 
                  value={form.camera_name} 
                  onChange={handleChange} 
                  placeholder="เช่น กล้องแปลงกะเพรา 1" 
                  required 
                />
              </div>

              <div className="cctv-form-group">
                <label>IP หรือ URL ของกล้องวงจรปิด <span className="req">*</span></label>
                <input 
                  type="text" 
                  name="ip_address" 
                  value={form.ip_address} 
                  onChange={handleChange} 
                  placeholder="เช่น 192.168.1.100 หรือ rtsp://..." 
                  required 
                />
              </div>

              <div className="cctv-form-row">
                <div className="cctv-form-group">
                  <label>ชื่อผู้ใช้ RTSP (Username)</label>
                  <input 
                    type="text" 
                    name="rtsp_username" 
                    value={form.rtsp_username} 
                    onChange={handleChange} 
                    placeholder="admin" 
                  />
                </div>
                <div className="cctv-form-group">
                  <label>รหัสผ่าน RTSP (Password)</label>
                  <input 
                    type="text" 
                    name="rtsp_password" 
                    value={form.rtsp_password} 
                    onChange={handleChange} 
                    placeholder="123456" 
                  />
                </div>
              </div>

              <div className="cctv-form-group">
                <label>IP ของเครื่องพ่นน้ำ (Relay ESP)</label>
                <input 
                  type="text" 
                  name="device_ip" 
                  value={form.device_ip} 
                  onChange={handleChange} 
                  placeholder="เช่น 192.168.1.105" 
                />
              </div>

              <div className="cctv-form-group">
                <label>แปลงที่ติดตั้ง (Plot) <span className="req">*</span></label>
                <select name="plot_id" value={form.plot_id} onChange={handleChange} required>
                  <option value="" disabled>-- กรุณาเลือกแปลงที่ติดตั้ง --</option>
                  {plots.map(p => (
                    <option key={p.id || p._id} value={p.id || p._id}>
                      {p.name || p.plot_name || 'ไม่ระบุชื่อ'} {p.size ? `(${p.size} ${p.unit || p.area_unit || 'ตร.ม.'})` : ''}
                    </option>
                  ))}
                </select>
                {plots.length === 0 && (
                  <p className="cctv-form-hint">
                    คุณยังไม่มีแปลงผัก <a href="/my-plots" style={{color: '#0284c7', textDecoration: 'underline'}}>คลิกที่นี่เพื่อไปสร้างแปลงก่อน</a>
                  </p>
                )}
              </div>

              <div className="cctv-modal-footer">
                <button type="button" className="cctv-cancel" onClick={handleCloseModal}>
                  ยกเลิก
                </button>
                <button type="submit" className="cctv-save" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 size={16} className="spin" /> : 'สร้างและบันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STYLES */}
      <style>{`
        .cctv-page {
          min-height: 100vh;
          background: #f8fafc;
          padding: 30px 20px 80px;
          position: relative;
          overflow: hidden;
          font-family: 'Prompt', 'Inter', sans-serif;
        }
        
        /* Blur Backgrounds */
        .cctv-bg-blur {
          position: fixed;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.5;
          z-index: 0;
          pointer-events: none;
        }
        .cctv-bg-blur.top-right {
          width: 50vw; height: 50vw;
          max-width: 600px; max-height: 600px;
          background: #E8F5E9; /* light green */
          top: -10vw; right: -10vw;
        }
        .cctv-bg-blur.bottom-left {
          width: 40vw; height: 40vw;
          max-width: 500px; max-height: 500px;
          background: #C8E6C9; /* light green */
          bottom: -10vw; left: -10vw;
        }

        .cctv-container {
          max-width: 1000px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        /* Header */
        .cctv-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 30px;
        }
        .cctv-back-btn {
          display: inline-flex; align-items: center; gap: 4px;
          background: transparent; border: none;
          color: #64748b; font-size: 14px; font-weight: 700;
          cursor: pointer; padding: 4px 0 12px; transition: color 0.15s;
        }
        .cctv-back-btn:hover { color: #2E7D32; }
        .cctv-title {
          font-size: 32px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0;
          letter-spacing: -0.02em;
        }
        .cctv-subtitle {
          font-size: 15px; color: #64748b; margin: 0;
        }
        .cctv-add-btn {
          display: flex; align-items: center; gap: 6px;
          background: #2E7D32; color: #fff;
          border: none; border-radius: 12px;
          padding: 12px 20px; font-size: 15px; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(46, 125, 50, 0.25);
        }
        .cctv-add-btn:hover { background: #1B5E20; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(27, 94, 32, 0.3); }
        .cctv-add-btn:active { transform: translateY(0); }

        /* Loading & Empty state */
        .cctv-loading {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 60px 20px; color: #64748b; gap: 16px; font-weight: 600;
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        .cctv-empty {
          background: rgba(255, 255, 255, 0.6);
          border: 1px dashed #cbd5e1;
          border-radius: 20px;
          padding: 60px 20px;
          text-align: center;
          display: flex; flex-direction: column; align-items: center;
          backdrop-filter: blur(10px);
        }
        .cctv-empty-icon {
          width: 80px; height: 80px; background: #F1F8E9; color: #C5E1A5;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
        }
        .cctv-empty h2 { margin: 0 0 8px; font-size: 20px; font-weight: 800; color: #334155; }
        .cctv-empty p { margin: 0 0 24px; color: #64748b; font-size: 15px; }
        .cctv-empty-btn {
          display: flex; align-items: center; gap: 8px;
          background: #fff; border: 1.5px solid #e2e8f0; color: #0f172a;
          padding: 10px 18px; border-radius: 10px; font-weight: 700; cursor: pointer;
          transition: all 0.15s;
        }
        .cctv-empty-btn:hover { border-color: #cbd5e1; background: #f8fafc; }

        /* Grid */
        .cctv-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        .cctv-card {
          background: #fff; border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.03);
          overflow: hidden; transition: transform 0.2s, box-shadow 0.2s;
          display: flex; flex-direction: column;
        }
        .cctv-card:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 8px 30px rgba(0,0,0,0.08); 
        }
        .cctv-card-header {
          padding: 18px 20px; border-bottom: 1px solid #f1f5f9;
          display: flex; justify-content: space-between; align-items: center;
        }
        .cctv-card-title {
          display: flex; align-items: center; gap: 10px;
        }
        .cctv-card-title h3 {
          margin: 0; font-size: 16px; font-weight: 800; color: #1e293b;
        }
        .cctv-delete-btn {
          background: none; border: none; color: #cbd5e1; cursor: pointer;
          padding: 6px; border-radius: 8px; transition: all 0.15s;
        }
        .cctv-delete-btn:hover { background: #fee2e2; color: #ef4444; }
        
        .cctv-card-body {
          padding: 20px; display: flex; flex-direction: column; gap: 12px;
          flex: 1; background: #fafafa;
        }
        .cctv-info-item {
          display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: #475569;
        }
        .cctv-info-item .icon {
          color: #94a3b8; flex-shrink: 0; margin-top: 2px;
        }
        .cctv-info-item strong { color: #334155; }
        
        .cctv-card-footer {
          padding: 14px 20px; background: #fff; border-top: 1px solid #f1f5f9;
        }
        .cctv-play-btn {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 10px; background: #F1F8E9; color: #2E7D32;
          border: none; border-radius: 10px; font-weight: 700; font-size: 14px;
          cursor: pointer; transition: all 0.15s;
        }
        .cctv-play-btn:hover { background: #E8F5E9; color: #1B5E20; }

        /* Modal */
        .cctv-modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 20px;
        }
        .cctv-modal {
          background: #fff; width: 100%; max-width: 520px;
          border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          overflow: hidden; display: flex; flex-direction: column;
          animation: modalIn 0.2s ease-out;
        }
        @keyframes modalIn {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .cctv-modal-header {
          padding: 24px 24px 20px; border-bottom: 1px solid #f1f5f9;
          display: flex; justify-content: space-between; align-items: center;
        }
        .cctv-modal-header h2 { margin: 0; font-size: 20px; font-weight: 800; color: #0f172a; }
        .cctv-modal-close {
          background: #f1f5f9; border: none; width: 32px; height: 32px;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          color: #64748b; cursor: pointer; transition: background 0.15s;
        }
        .cctv-modal-close:hover { background: #e2e8f0; color: #0f172a; }
        
        .cctv-modal-body {
          padding: 24px; display: flex; flex-direction: column; gap: 16px;
          overflow-y: auto; max-height: calc(100vh - 120px);
        }
        .cctv-form-group { display: flex; flex-direction: column; gap: 6px; }
        .cctv-form-row { display: flex; gap: 16px; }
        .cctv-form-row > * { flex: 1; }
        
        .cctv-form-group label { font-size: 13px; font-weight: 700; color: #334155; }
        .req { color: #ef4444; }
        .cctv-form-group input, .cctv-form-group select {
          padding: 11px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px;
          font-size: 14px; outline: none; transition: border-color 0.15s; font-family: 'Prompt', sans-serif;
        }
        .cctv-form-group input:focus, .cctv-form-group select:focus {
          border-color: #2E7D32;
        }
        .cctv-form-hint { font-size: 12px; color: #64748b; margin-top: 4px; }
        
        .cctv-modal-footer {
          padding-top: 8px; display: flex; justify-content: flex-end; gap: 10px;
        }
        .cctv-cancel {
          padding: 10px 20px; background: #f1f5f9; color: #475569;
          border: none; border-radius: 10px; font-weight: 700; cursor: pointer; transition: background 0.15s;
        }
        .cctv-cancel:hover { background: #e2e8f0; }
        .cctv-save {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 24px; background: #2E7D32; color: #fff;
          border: none; border-radius: 10px; font-weight: 700; cursor: pointer; transition: background 0.15s;
        }
        .cctv-save:hover:not(:disabled) { background: #1B5E20; }
        .cctv-save:disabled { background: #A5D6A7; cursor: not-allowed; }

        @media (max-width: 600px) {
          .cctv-header { flex-direction: column; align-items: stretch; gap: 20px; }
          .cctv-title { font-size: 24px; }
          .cctv-form-row { flex-direction: column; gap: 16px; }
        }
      `}</style>
    </div>
  );
};

export default CCTVPage;
