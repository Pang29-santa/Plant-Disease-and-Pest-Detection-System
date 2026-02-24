import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import {
  Plus, Maximize2, ArrowLeft, Sprout, Scissors, History,
  Pencil, Trash2, RotateCcw, Search, X, ChevronLeft,
  Leaf, LayoutGrid, AlertCircle, Loader2, Image as ImageIcon, Upload, Download
} from 'lucide-react';

/* ─────────────────────────── helpers ─────────────────────────── */
const API = import.meta.env.VITE_API_URL || 'http://localhost:8888';

const fmt = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('th-TH', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).replace(/\//g, '/');
};

const fmtNum = (n) =>
  n === undefined || n === null ? '-' : Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ─────────────────────────── STATUS BADGE ────────────────────── */
const StatusBadge = ({ status }) => {
  const map = {
    'ว่าง': { bg: '#E8F5E9', color: '#2E7D32', label: 'ว่าง' },
    '0': { bg: '#E8F5E9', color: '#2E7D32', label: 'ว่าง' },
    'กำลังปลูก': { bg: '#FFF3E0', color: '#E65100', label: 'กำลังปลูก' },
    '1': { bg: '#FFF3E0', color: '#E65100', label: 'กำลังปลูก' },
    'เก็บเกี่ยวแล้ว': { bg: '#E3F2FD', color: '#1565C0', label: 'เก็บเกี่ยวแล้ว' },
    '2': { bg: '#E3F2FD', color: '#1565C0', label: 'เก็บเกี่ยวแล้ว' },
  };
  const s = map[String(status)] || { bg: '#F5F5F5', color: '#616161', label: status };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '2px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700
    }}>
      {s.label}
    </span>
  );
};

/* ─────────────────────────── PLOT CARD ───────────────────────── */
const PlotCard = ({ plot, onPlant, onHarvest, onHistory, onEdit, onDelete }) => {
  const planting = plot.current_planting;
  const canHarvest = planting && new Date(planting.harvest_date) <= new Date();
  const isGrowing = plot.status === 'กำลังปลูก' || plot.status === '1' || plot.status === 1;
  const isEmpty = plot.status === 'ว่าง' || plot.status === '0' || plot.status === 0;

  return (
    <div className="myplots-card">
      {/* Cover image */}
      <div className="myplots-card-img-wrap">
        {plot.image_url
          ? <img src={plot.image_url} alt={plot.name} className="myplots-card-img" />
          : (
            <div className="myplots-card-img-placeholder">
              <LayoutGrid size={36} color="#aaa" />
            </div>
          )}
      </div>

      <div className="myplots-card-body">
        {/* Header */}
        <div className="myplots-card-header">
          <h3 className="myplots-card-name">{plot.name}</h3>
          <StatusBadge status={plot.status} />
        </div>

        {/* Size */}
        <div className="myplots-card-info-row">
          <Maximize2 size={14} color="#888" />
          <span>ขนาดแปลง: {plot.area} {plot.area_unit}</span>
        </div>

        {/* Planting info */}
        {isGrowing && planting ? (
          <div className="myplots-card-planting">
            <div className="myplots-card-planting-title">
              <Leaf size={14} color="#388E3C" />
              <span>ผักที่ปลูกอยู่:</span>
            </div>
            <p className="myplots-card-planting-name">{planting.vegetable_name}</p>
            <p className="myplots-card-planting-date">ปลูกเมื่อ: {fmt(planting.plant_date)}</p>
            <p className="myplots-card-planting-date">เก็บเกี่ยว: {fmt(planting.harvest_date)}</p>
          </div>
        ) : isEmpty ? (
          <p className="myplots-card-empty-text">ไม่มีผักที่ปลูกอยู่</p>
        ) : null}

        {/* Action primary button */}
        {isEmpty && (
          <button className="myplots-btn-primary" onClick={() => onPlant(plot)}>
            <Sprout size={16} /> ปลูกผัก
          </button>
        )}
        {isGrowing && (
          <button
            className={`myplots-btn-harvest ${canHarvest ? '' : 'myplots-btn-harvest--disabled'}`}
            onClick={() => onHarvest(plot, planting)}
          >
            <Scissors size={16} /> เก็บเกี่ยว
          </button>
        )}

        {/* Bottom action buttons */}
        <div className="myplots-card-actions">
          <button className="myplots-btn-action myplots-btn-history" onClick={() => onHistory(plot)}>
            <History size={14} /> ประวัติ
          </button>
          <button className="myplots-btn-action myplots-btn-edit" onClick={() => onEdit(plot)}>
            <Pencil size={14} /> แก้ไข
          </button>
          <button className="myplots-btn-action myplots-btn-delete" onClick={() => onDelete(plot)}>
            <Trash2 size={14} /> ลบ
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── ADD/EDIT PLOT MODAL ─────────────── */
const PlotModal = ({ plot, onClose, onSaved }) => {
  const isEdit = !!(plot?.id || plot?._id);
  const [form, setForm] = useState({
    name: plot?.name || '',
    area: plot?.area || '',
    area_unit: plot?.area_unit || 'ไร่',
    image_url: plot?.image_url || '',
  });
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: 'error', title: 'ไฟล์มีขนาดใหญ่เกินไป', text: 'สูงสุด 5MB', confirmButtonColor: '#2E7D32' });
      return;
    }

    const formData = new FormData();
    formData.append('upload', file);

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/api/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      if (res.data.uploaded) {
        setForm(p => ({ ...p, image_url: res.data.url }));
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'อัพโหลดรูปภาพไม่สำเร็จ', text: err?.response?.data?.detail || 'เกิดข้อผิดพลาด', confirmButtonColor: '#2E7D32' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.area) {
      Swal.fire({ icon: 'warning', title: 'กรุณากรอกชื่อแปลงและขนาด', confirmButtonColor: '#2E7D32' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        plot_name: form.name,
        size: parseFloat(form.area) || 0,
        unit: form.area_unit,
        image_path: form.image_url,
        user_id: user?.user_id || user?.id 
      };

      if (isEdit) {
        await axios.put(`${API}/api/plots/${plot.id || plot._id}`, payload);
      } else {
        await axios.post(`${API}/api/plots`, payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: err.response?.data?.detail || 'ไม่สามารถบันทึกได้', confirmButtonColor: '#2E7D32' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="myplots-overlay" onClick={onClose}>
      <div className="myplots-modal" onClick={e => e.stopPropagation()}>
        <div className="myplots-modal-header">
          <h2>{isEdit ? 'แก้ไขแปลงผัก' : 'เพิ่มข้อมูลแปลงผัก'}</h2>
          <button className="myplots-modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="myplots-modal-body">
          <label>ชื่อแปลง <span className="req">*</span></label>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="เช่น A1, แปลงหน้าบ้าน" />

          <div className="myplots-modal-row">
            <div style={{ flex: 1 }}>
              <label>ขนาด <span className="req">*</span></label>
              <input type="number" min="0" step="0.1" value={form.area}
                onChange={e => setForm(p => ({ ...p, area: e.target.value }))} placeholder="0.0" />
            </div>
            <div style={{ width: 120 }}>
              <label>หน่วย</label>
              <select value={form.area_unit} onChange={e => setForm(p => ({ ...p, area_unit: e.target.value }))}>
                <option value="ไร่">ไร่</option>
                <option value="ตารางเมตร">ตารางเมตร</option>
                <option value="งาน">งาน</option>
              </select>
            </div>
          </div>

          <label>รูปภาพแปลง (ไม่บังคับ)</label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            {form.image_url ? (
              <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <img 
                  src={form.image_url.startsWith('http') ? form.image_url : `${API}${form.image_url}`} 
                  alt="Plot" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <button 
                  onClick={() => setForm(p => ({ ...p, image_url: '' }))} 
                  style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', border: 'none', cursor: 'pointer' }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
                <div style={{ width: '80px', height: '80px', borderRadius: '8px', border: '2px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', backgroundColor: '#f9fafb' }}>
                  <ImageIcon size={24} style={{ opacity: 0.5 }} />
                </div>
            )}
            
            <div style={{ flex: 1 }}>
              <input type="file" accept="image/*" onChange={handleImageUpload} id="plot-image" style={{ display: 'none' }} />
              <label 
                htmlFor="plot-image" 
                style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', 
                  backgroundColor: uploading ? '#9ca3af' : '#16a34a', color: 'white', 
                  borderRadius: '8px', cursor: uploading ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '500' 
                }}
              >
                {uploading ? <Loader2 size={16} className="spin" /> : <Upload size={16} />}
                {uploading ? 'กำลังอัปโหลด...' : 'เลือกรูปภาพ'}
              </label>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', marginBottom: 0 }}>รูปภาพขนาดไม่เกิน 5MB</p>
            </div>
          </div>
        </div>
        <div className="myplots-modal-footer">
          <button className="myplots-modal-cancel" onClick={onClose}>ยกเลิก</button>
          <button className="myplots-modal-save" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 size={16} className="spin" /> : null}
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── PLANT MODAL ─────────────────────── */
const PlantModal = ({ plot, onClose, onSaved }) => {
  const [form, setForm] = useState({
    vegetable_name: '',
    plant_date: new Date().toISOString().split('T')[0],
    harvest_date: '',
    quantity: '',
  });
  const [saving, setSaving] = useState(false);
  const [vegetables, setVegetables] = useState([]);
  const [loadingVeg, setLoadingVeg] = useState(false);

  useEffect(() => {
    const fetchVeg = async () => {
      setLoadingVeg(true);
      try {
        const res = await axios.get(`${API}/api/vegetable`, { params: { limit: 500 } });
        setVegetables(res.data?.data || []);
      } catch (err) {
        console.error('Failed to load vegetables:', err);
      } finally {
        setLoadingVeg(false);
      }
    };
    fetchVeg();
  }, []);

  const calculateHarvestDate = (plantDateStr, vegName) => {
    const selected = vegetables.find(v => v.thai_name === vegName);
    if (selected && selected.growth && plantDateStr) {
      const pDate = new Date(plantDateStr);
      pDate.setDate(pDate.getDate() + Number(selected.growth));
      return pDate.toISOString().split('T')[0];
    }
    return '';
  };

  const handleVegetableChange = (e) => {
    const name = e.target.value;
    const newHarvest = calculateHarvestDate(form.plant_date, name);
    setForm(p => ({ ...p, vegetable_name: name, harvest_date: newHarvest || p.harvest_date }));
  };

  const handlePlantDateChange = (e) => {
    const dateStr = e.target.value;
    const newHarvest = calculateHarvestDate(dateStr, form.vegetable_name);
    setForm(p => ({ ...p, plant_date: dateStr, harvest_date: newHarvest || p.harvest_date }));
  };

  const handleSubmit = async () => {
    if (!form.vegetable_name.trim() || !form.plant_date || !form.harvest_date || !form.quantity) {
      Swal.fire({ icon: 'warning', title: 'กรุณากรอกข้อมูลให้ครบ', confirmButtonColor: '#2E7D32' });
      return;
    }
    setSaving(true);
    try {
      await axios.post(`${API}/api/plots/${plot.id || plot._id}/plant`, form);
      Swal.fire({ icon: 'success', title: 'บันทึกการปลูกสำเร็จ', timer: 1500, showConfirmButton: false });
      onSaved();
      onClose();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: err.response?.data?.detail || 'ไม่สามารถบันทึกได้', confirmButtonColor: '#2E7D32' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="myplots-overlay" onClick={onClose}>
      <div className="myplots-modal" onClick={e => e.stopPropagation()}>
        <div className="myplots-modal-header">
          <h2>ปลูกผัก — แปลง {plot.name}</h2>
          <button className="myplots-modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="myplots-modal-body">
          <label>ชื่อผัก <span className="req">*</span></label>
          <select 
            value={form.vegetable_name} 
            onChange={handleVegetableChange}
            disabled={loadingVeg}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e5e7eb', marginBottom: '16px' }}
          >
            <option value="">{loadingVeg ? 'กำลังโหลดข้อมูลผัก...' : '-- เลือกผัก --'}</option>
            {vegetables.map(v => (
              <option key={v.id || v._id} value={v.thai_name}>{v.thai_name} {v.growth ? `(${v.growth} วัน)` : ''}</option>
            ))}
          </select>

          <div className="myplots-modal-row">
            <div style={{ flex: 1 }}>
              <label>วันที่ปลูก <span className="req">*</span></label>
              <input type="date" value={form.plant_date}
                onChange={handlePlantDateChange} />
            </div>
            <div style={{ flex: 1 }}>
              <label>วันที่เก็บเกี่ยว <span className="req">*</span></label>
              <input type="date" value={form.harvest_date}
                readOnly
                style={{ backgroundColor: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed' }} 
              />
            </div>
          </div>

          <label>จำนวน (ต้น) <span className="req">*</span></label>
          <input type="number" min="1" value={form.quantity}
            onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
            placeholder="จำนวนต้น" />
        </div>
        <div className="myplots-modal-footer">
          <button className="myplots-modal-cancel" onClick={onClose}>ยกเลิก</button>
          <button className="myplots-modal-save" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 size={16} className="spin" /> : <Sprout size={15} />}
            {saving ? 'กำลังบันทึก...' : 'บันทึกการปลูก'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── HARVEST MODAL ────────────────────── */
const HarvestModal = ({ plot, planting, onClose, onSaved }) => {
  const [form, setForm] = useState({
    actual_harvest_date: new Date().toISOString().split('T')[0],
    amount_kg: '',
    income: '',
    expense: '',
    note: '',
  });
  const [saving, setSaving] = useState(false);
  const canHarvest = planting && new Date(planting.harvest_date) <= new Date();

  const handleSubmit = async () => {
    if (!form.amount_kg || !form.income) {
      Swal.fire({ icon: 'warning', title: 'กรุณากรอกข้อมูลให้ครบ', confirmButtonColor: '#2E7D32' });
      return;
    }
    setSaving(true);
    try {
      await axios.post(`${API}/api/plots/${plot.id || plot._id}/harvest`, form);
      Swal.fire({ icon: 'success', title: 'บันทึกการเก็บเกี่ยวสำเร็จ', timer: 1500, showConfirmButton: false });
      onSaved();
      onClose();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: err.response?.data?.detail || 'ไม่สามารถบันทึกได้', confirmButtonColor: '#2E7D32' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="myplots-overlay" onClick={onClose}>
      <div className="myplots-modal" onClick={e => e.stopPropagation()}>
        <div className="myplots-modal-header">
          <h2>บันทึกการเก็บเกี่ยว — {plot.name}</h2>
          <button className="myplots-modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="myplots-modal-body">
          {!canHarvest && (
            <div className="myplots-harvest-warn">
              <AlertCircle size={16} />
              ยังไม่ถึงวันเก็บเกี่ยว ({fmt(planting?.harvest_date)}) แต่คุณสามารถบันทึกล่วงหน้าได้
            </div>
          )}

          <label>วันที่เก็บเกี่ยวจริง</label>
          <input type="date" value={form.actual_harvest_date}
            onChange={e => setForm(p => ({ ...p, actual_harvest_date: e.target.value }))} />

          <div className="myplots-modal-row">
            <div style={{ flex: 1 }}>
              <label>ปริมาณที่ได้ (กก.) <span className="req">*</span></label>
              <input type="number" min="0" step="0.1" value={form.amount_kg}
                onChange={e => setForm(p => ({ ...p, amount_kg: e.target.value }))}
                placeholder="0.0" />
            </div>
          </div>

          <div className="myplots-modal-row">
            <div style={{ flex: 1 }}>
              <label>รายรับ (บาท) <span className="req">*</span></label>
              <input type="number" min="0" value={form.income}
                onChange={e => setForm(p => ({ ...p, income: e.target.value }))}
                placeholder="0" />
            </div>
            <div style={{ flex: 1 }}>
              <label>รายจ่าย (บาท)</label>
              <input type="number" min="0" value={form.expense}
                onChange={e => setForm(p => ({ ...p, expense: e.target.value }))}
                placeholder="0" />
            </div>
          </div>

          <label>หมายเหตุ</label>
          <input value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
            placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)" />
        </div>
        <div className="myplots-modal-footer">
          <button className="myplots-modal-cancel" onClick={onClose}>ยกเลิก</button>
          <button className="myplots-modal-save" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 size={16} className="spin" /> : <Scissors size={15} />}
            {saving ? 'กำลังบันทึก...' : 'บันทึกการเก็บเกี่ยว'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── HISTORY VIEW ─────────────────────── */
const HistoryView = ({ plot, onBack }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filtered, setFiltered] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/plots/${plot.id || plot._id}/history`);
      setRecords(res.data || []);
      setFiltered(res.data || []);
    } catch {
      setRecords([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  }, [plot.id, plot._id]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = () => {
    let data = [...records];
    if (search.trim()) {
      data = data.filter(r => r.vegetable_name?.includes(search.trim()));
    }
    if (fromDate) data = data.filter(r => new Date(r.plant_date) >= new Date(fromDate));
    if (toDate) data = data.filter(r => new Date(r.plant_date) <= new Date(toDate));
    setFiltered(data);
  };

  const handleReset = () => {
    setSearch('');
    setFromDate('');
    setToDate('');
    setFiltered(records);
  };

  const exportToCSV = () => {
    const headers = ['วันที่ปลูก', 'วันที่เก็บเกี่ยว', 'ผัก', 'จำนวน (ต้น)', 'ปริมาณ (กก.)', 'รายรับ (บาท)', 'รายจ่าย (บาท)', 'กำไร (บาท)'];
    const escapeCsv = (val) => `"${String(val || '-').replace(/"/g, '""')}"`;

    const rows = filtered.map(r => {
      const profit = (Number(r.income) || 0) - (Number(r.expense) || 0);
      return [
        fmt(r.plant_date),
        fmt(r.actual_harvest_date || r.harvesting_date || r.harvest_date || r.created_at),
        r.vegetable_name,
        r.quantity != null && r.quantity !== '' ? r.quantity : '-',
        r.amount_kg != null ? r.amount_kg : '-',
        r.income != null ? r.income : '-',
        r.expense != null ? r.expense : '-',
        profit
      ].map(escapeCsv).join(',');
    });

    const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n'); // Add BOM for UTF-8 Excel support
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `history_plot_${plot.name}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalIncome = filtered.reduce((s, r) => s + (Number(r.income) || 0), 0);
  const totalExpense = filtered.reduce((s, r) => s + (Number(r.expense) || 0), 0);
  const totalProfit = totalIncome - totalExpense;

  return (
    <div className="myplots-history">
            {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            ประวัติการปลูก – แปลง <span className="text-green-700">{plot.name}</span>
          </h1>
          <button className="myplots-back-btn" onClick={onBack}>
            <ChevronLeft size={16} /> กลับไปหน้าแปลงผัก
          </button>
        </div>
      </div>

      {/* Filter card */}
      <div className="myplots-history-card">
        <div className="myplots-history-tabs">
          <span className="myplots-history-tab active">ประวัติทั้งหมด</span>
        </div>

        <div className="myplots-history-filters">
          <div className="myplots-filter-group">
            <label>ค้นหาชื่อผัก</label>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="เช่น กะเพรา"
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div className="myplots-history-date-row">
            <div className="myplots-filter-group">
              <label>เลือกตามวันที่ปลูก</label>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>
            <div className="myplots-filter-group">
              <label>ถึงวันที่</label>
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
            <div className="myplots-filter-actions">
              <button className="myplots-search-btn" onClick={handleSearch}>
                <Search size={15} /> ค้นหา
              </button>
              <button className="myplots-reset-btn" onClick={handleReset}>
                <RotateCcw size={15} /> รีเซ็ต
              </button>
              <button className="myplots-export-btn" onClick={exportToCSV} disabled={filtered.length === 0}>
                <Download size={15} /> ส่งออก CSV
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="myplots-loading">
            <Loader2 size={28} className="spin" color="#2E7D32" />
            <p>กำลังโหลด...</p>
          </div>
        ) : (
          <div className="myplots-table-wrap">
            <table className="myplots-table">
              <thead>
                <tr>
                  <th>วันที่ปลูก</th>
                  <th>วันที่เก็บเกี่ยว</th>
                  <th>ผัก</th>
                  <th>จำนวน (ต้น)</th>
                  <th>ปริมาณ (กก.)</th>
                  <th>รายรับ (บาท)</th>
                  <th>รายจ่าย (บาท)</th>
                  <th>กำไร (บาท)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="myplots-table-empty">ไม่พบข้อมูล</td>
                  </tr>
                ) : (
                  filtered.map((r, i) => {
                    const profit = (Number(r.income) || 0) - (Number(r.expense) || 0);
                    return (
                      <tr key={i}>
                        <td data-label="วันที่ปลูก">{fmt(r.plant_date)}</td>
                        <td data-label="วันที่เก็บเกี่ยว">{fmt(r.actual_harvest_date || r.harvesting_date || r.harvest_date || r.created_at)}</td>
                        <td data-label="ผัก">{r.vegetable_name || '-'}</td>
                        <td data-label="จำนวน (ต้น)">{r.quantity != null && r.quantity !== '' ? r.quantity : '-'}</td>
                        <td data-label="ปริมาณ (กก.)">{r.amount_kg != null ? fmtNum(r.amount_kg) : '-'}</td>
                        <td data-label="รายรับ (บาท)">{r.income != null ? fmtNum(r.income) : '-'}</td>
                        <td data-label="รายจ่าย (บาท)">{r.expense != null ? fmtNum(r.expense) : '-'}</td>
                        <td data-label="กำไร (บาท)" style={{ color: profit >= 0 ? '#2E7D32' : '#C62828', fontWeight: 700 }}>
                          {fmtNum(profit)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {filtered.length > 0 && (
                <tfoot>
                  <tr className="myplots-table-summary">
                    <td colSpan={5} style={{ fontWeight: 700 }} className="hide-mobile">รวมจากข้อมูลที่แสดง:</td>
                    <td data-label="รวมรายรับ" style={{ fontWeight: 700, color: '#1565C0' }}>{fmtNum(totalIncome)}</td>
                    <td data-label="รวมรายจ่าย" style={{ fontWeight: 700, color: '#E65100' }}>{fmtNum(totalExpense)}</td>
                    <td data-label="กำไรรวม" style={{ fontWeight: 700, color: totalProfit >= 0 ? '#2E7D32' : '#C62828' }}>
                      {fmtNum(totalProfit)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═════════════════════════ MAIN PAGE ══════════════════════════ */
const MyPlotsPage = () => {
  const navigate = useNavigate();
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Modal states
  const [plotModal, setPlotModal] = useState(null);   // null | plot (edit) | 'new'
  const [plantModal, setPlantModal] = useState(null);  // null | plot
  const [harvestModal, setHarvestModal] = useState(null); // null | { plot, planting }
  const [historyPlot, setHistoryPlot] = useState(null);   // null | plot

  const userId = user?.user_id || user?.id;

  const fetchPlots = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API}/api/plots`, { params: { user_id: userId } });
      const mappedPlots = (res.data || []).map(p => ({
        ...p,
        name: p.plot_name || p.name,
        area: p.size || p.area,
        area_unit: p.unit || p.area_unit,
        image_url: p.image_path || p.image_url,
      }));
      setPlots(mappedPlots);
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลแปลงผักได้');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchPlots(); }, [fetchPlots]);

  const handleDelete = async (plot) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ?',
      text: `ต้องการลบแปลง "${plot.name}" ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C62828',
      cancelButtonColor: '#666',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`${API}/api/plots/${plot.id || plot._id}`);
      Swal.fire({ icon: 'success', title: 'ลบแปลงผักสำเร็จ', timer: 1200, showConfirmButton: false });
      fetchPlots();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถลบแปลงผักได้', confirmButtonColor: '#2E7D32' });
    }
  };

  /* ── HISTORY VIEW ── */
  if (historyPlot) {
    return (
      <>
        <MyPlotsStyles />
        <HistoryView plot={historyPlot} onBack={() => setHistoryPlot(null)} />
      </>
    );
  }

  /* ── MAIN VIEW ── */
  return (
    <>
      <MyPlotsStyles />
      <div className="myplots-page">
              {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
            แปลงผักของคุณ
          </h1>
        </div>
        <div className="flex justify-end mb-6">
          <button className="myplots-add-btn" onClick={() => setPlotModal('new')}>
            <Plus size={16} /> เพิ่มข้อมูลแปลงผัก
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="myplots-loading">
            <Loader2 size={36} className="spin" color="#2E7D32" />
            <p>กำลังโหลดข้อมูล...</p>
          </div>
        ) : error ? (
          <div className="myplots-error">
            <AlertCircle size={40} color="#C62828" />
            <p>{error}</p>
            <button onClick={fetchPlots} className="myplots-retry-btn">
              <RotateCcw size={14} /> ลองใหม่
            </button>
          </div>
        ) : plots.length === 0 ? (
          <div className="myplots-empty">
            <LayoutGrid size={56} color="#ccc" />
            <p>ยังไม่มีแปลงผัก</p>
            <button className="myplots-add-btn" onClick={() => setPlotModal('new')}>
              <Plus size={16} /> เพิ่มแปลงผักแรก
            </button>
          </div>
        ) : (
          <div className="myplots-grid">
            {plots.map((plot, index) => (
              <PlotCard
                key={plot.id || plot._id || index}
                plot={plot}
                onPlant={p => setPlantModal(p)}
                onHarvest={(p, planting) => setHarvestModal({ plot: p, planting })}
                onHistory={p => setHistoryPlot(p)}
                onEdit={p => setPlotModal(p)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        {plotModal && (
          <PlotModal
            plot={plotModal === 'new' ? null : plotModal}
            onClose={() => setPlotModal(null)}
            onSaved={fetchPlots}
          />
        )}
        {plantModal && (
          <PlantModal
            plot={plantModal}
            onClose={() => setPlantModal(null)}
            onSaved={fetchPlots}
          />
        )}
        {harvestModal && (
          <HarvestModal
            plot={harvestModal.plot}
            planting={harvestModal.planting}
            onClose={() => setHarvestModal(null)}
            onSaved={fetchPlots}
          />
        )}
      </div>
    </>
  );
};

/* ─────────────────────────── STYLES (injected) ─────────────────── */
const MyPlotsStyles = () => (
  <style>{`
    /* Page layout */
    .myplots-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 32px 24px 60px;
      font-family: 'Prompt', 'Inter', sans-serif;
    }
    .myplots-page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 28px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .myplots-page-title {
      font-size: 28px;
      font-weight: 800;
      color: #2E7D32;
      margin: 0;
    }
    .myplots-add-btn {
      display: flex;
      align-items: center;
      gap: 7px;
      background: #2E7D32;
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.18s, transform 0.1s;
    }
    .myplots-add-btn:hover { background: #1B5E20; transform: translateY(-1px); }
    .myplots-add-btn:active { transform: scale(0.97); }

    /* Grid */
    .myplots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    /* Card */
    .myplots-card {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.09);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .myplots-card:hover { box-shadow: 0 6px 28px rgba(0,0,0,0.13); transform: translateY(-2px); }
    .myplots-card-img-wrap { width: 100%; height: 180px; overflow: hidden; background: #f0f0f0; }
    .myplots-card-img { width: 100%; height: 100%; object-fit: cover; }
    .myplots-card-img-placeholder {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      background: #F5F5F5;
    }
    .myplots-card-body { padding: 16px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
    .myplots-card-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .myplots-card-name { font-size: 18px; font-weight: 800; color: #222; margin: 0; }
    .myplots-card-info-row {
      display: flex; align-items: center; gap: 6px;
      font-size: 13px; color: #666;
      border-left: 3px solid #4CAF50;
      padding-left: 8px;
    }
    .myplots-card-planting {
      background: #F1F8E9;
      border-radius: 10px;
      padding: 10px 12px;
      display: flex; flex-direction: column; gap: 4px;
    }
    .myplots-card-planting-title {
      display: flex; align-items: center; gap: 5px;
      font-size: 13px; font-weight: 700; color: #388E3C;
    }
    .myplots-card-planting-name { font-size: 15px; font-weight: 700; color: #1B5E20; margin: 2px 0 0; }
    .myplots-card-planting-date { font-size: 12px; color: #555; margin: 0; }
    .myplots-card-empty-text { text-align: center; color: #aaa; font-size: 13px; margin: 4px 0; }

    /* Primary action buttons */
    .myplots-btn-primary {
      display: flex; align-items: center; justify-content: center; gap: 7px;
      width: 100%; padding: 11px;
      background: #2E7D32; color: #fff;
      border: none; border-radius: 10px;
      font-size: 15px; font-weight: 700; cursor: pointer;
      transition: background 0.15s, transform 0.1s;
      margin-top: 4px;
    }
    .myplots-btn-primary:hover { background: #1B5E20; }
    .myplots-btn-harvest {
      display: flex; align-items: center; justify-content: center; gap: 7px;
      width: 100%; padding: 11px;
      background: #2E7D32; color: #fff;
      border: none; border-radius: 10px;
      font-size: 15px; font-weight: 700; cursor: pointer;
      transition: background 0.15s;
      margin-top: 4px;
    }
    .myplots-btn-harvest:hover { background: #1B5E20; }
    .myplots-btn-harvest--disabled {
      background: #A5D6A7; cursor: pointer;
    }
    .myplots-btn-harvest--disabled:hover { background: #81C784; }

    /* Bottom action buttons */
    .myplots-card-actions { display: flex; gap: 8px; margin-top: 4px; }
    .myplots-btn-action {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 5px;
      padding: 7px 4px; border: none; border-radius: 8px;
      font-size: 13px; font-weight: 700; cursor: pointer;
      transition: opacity 0.15s, transform 0.1s;
    }
    .myplots-btn-action:active { transform: scale(0.95); }
    .myplots-btn-history { background: #7B1FA2; color: #fff; }
    .myplots-btn-history:hover { background: #6A1B9A; }
    .myplots-btn-edit { background: #F57C00; color: #fff; }
    .myplots-btn-edit:hover { background: #E65100; }
    .myplots-btn-delete { background: #C62828; color: #fff; }
    .myplots-btn-delete:hover { background: #B71C1C; }

    /* States */
    .myplots-loading {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 280px; gap: 12px; color: #666; font-size: 15px;
    }
    .myplots-error {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 280px; gap: 12px; color: #C62828; font-size: 15px;
    }
    .myplots-retry-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 9px 20px; background: #2E7D32; color: #fff;
      border: none; border-radius: 8px; font-weight: 700; cursor: pointer;
    }
    .myplots-empty {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 280px; gap: 14px; color: #aaa;
    }
    .myplots-empty p { font-size: 16px; margin: 0; }

    /* Modal Overlay */
    .myplots-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.45);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 16px;
    }
    .myplots-modal {
      background: #fff; border-radius: 18px;
      width: 100%; max-width: 480px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.2);
      overflow: hidden; animation: modalIn 0.2s ease;
    }
    @keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: none; } }
    .myplots-modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 20px 14px;
      border-bottom: 1px solid #eee;
    }
    .myplots-modal-header h2 { margin: 0; font-size: 17px; font-weight: 800; color: #2E7D32; }
    .myplots-modal-close {
      background: none; border: none; cursor: pointer; color: #888; padding: 4px;
      border-radius: 6px; transition: background 0.15s;
    }
    .myplots-modal-close:hover { background: #f5f5f5; color: #333; }
    .myplots-modal-body {
      padding: 18px 20px;
      display: flex; flex-direction: column; gap: 12px;
      max-height: 60vh; overflow-y: auto;
    }
    .myplots-modal-body label {
      font-size: 13px; font-weight: 700; color: #555; margin-bottom: 4px; display: block;
    }
    .myplots-modal-body input,
    .myplots-modal-body select {
      width: 100%; padding: 9px 12px;
      border: 1.5px solid #ddd; border-radius: 9px;
      font-size: 14px; outline: none;
      transition: border 0.15s; box-sizing: border-box;
    }
    .myplots-modal-body input:focus,
    .myplots-modal-body select:focus { border-color: #2E7D32; }
    .myplots-modal-row { display: flex; gap: 12px; }
    .myplots-modal-footer {
      display: flex; justify-content: flex-end; gap: 10px;
      padding: 14px 20px;
      border-top: 1px solid #eee;
    }
    .myplots-modal-cancel {
      padding: 9px 20px; background: #f5f5f5; color: #666;
      border: none; border-radius: 9px; font-weight: 700; cursor: pointer;
    }
    .myplots-modal-cancel:hover { background: #e0e0e0; }
    .myplots-modal-save {
      display: flex; align-items: center; gap: 7px;
      padding: 9px 20px; background: #2E7D32; color: #fff;
      border: none; border-radius: 9px; font-weight: 700; cursor: pointer;
      transition: background 0.15s;
    }
    .myplots-modal-save:hover:not(:disabled) { background: #1B5E20; }
    .myplots-modal-save:disabled { background: #A5D6A7; cursor: not-allowed; }
    .req { color: #C62828; }

    /* Harvest warning */
    .myplots-harvest-warn {
      display: flex; align-items: center; gap: 8px;
      background: #FFF8E1; border: 1px solid #FFE082;
      border-radius: 9px; padding: 10px 12px;
      font-size: 13px; color: #F57F17;
    }

    /* History View */
    .myplots-history {
      max-width: 1100px;
      margin: 0 auto;
      padding: 32px 24px 60px;
      font-family: 'Prompt', 'Inter', sans-serif;
    }
    .myplots-history-header {
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 12px; margin-bottom: 24px;
    }
    .myplots-history-title { font-size: 24px; font-weight: 800; color: #222; margin: 0; }
    .myplots-back-btn {
      display: flex; align-items: center; gap: 5px;
      background: none; border: none; color: #2E7D32;
      font-size: 14px; font-weight: 700; cursor: pointer;
      padding: 6px 12px; border-radius: 8px; transition: background 0.15s;
    }
    .myplots-back-btn:hover { background: #E8F5E9; }
    .myplots-history-card {
      background: #fff; border-radius: 16px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.08);
      padding: 24px; overflow: hidden;
    }
    .myplots-history-tabs { margin-bottom: 20px; }
    .myplots-history-tab {
      display: inline-block; padding: 8px 18px;
      border-bottom: 3px solid transparent;
      font-size: 14px; font-weight: 700; color: #888; cursor: pointer;
    }
    .myplots-history-tab.active { color: #2E7D32; border-color: #2E7D32; }
    .myplots-history-filters { margin-bottom: 20px; display: flex; flex-direction: column; gap: 14px; }
    .myplots-filter-group { display: flex; flex-direction: column; gap: 5px; }
    .myplots-filter-group label { font-size: 13px; font-weight: 700; color: #555; }
    .myplots-filter-group input {
      padding: 9px 12px; border: 1.5px solid #ddd; border-radius: 9px;
      font-size: 14px; outline: none; transition: border 0.15s;
    }
    .myplots-filter-group input:focus { border-color: #2E7D32; }
    .myplots-history-date-row {
      display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap;
    }
    .myplots-history-date-row .myplots-filter-group { flex: 1; min-width: 160px; }
    .myplots-filter-actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: flex-end; padding-bottom: 2px; }
    .myplots-search-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 9px 18px; background: #2E7D32; color: #fff;
      border: none; border-radius: 9px; font-weight: 700; cursor: pointer;
      white-space: nowrap; transition: background 0.15s;
    }
    .myplots-search-btn:hover { background: #1B5E20; }
    .myplots-reset-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 9px 14px; background: #f5f5f5; color: #666;
      border: none; border-radius: 9px; font-weight: 700; cursor: pointer;
      white-space: nowrap;
    }
    .myplots-reset-btn:hover { background: #e0e0e0; }
    .myplots-export-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 9px 14px; background: #0277BF; color: #fff;
      border: none; border-radius: 9px; font-weight: 700; cursor: pointer;
      white-space: nowrap; transition: background 0.15s;
    }
    .myplots-export-btn:hover:not(:disabled) { background: #01579B; }
    .myplots-export-btn:disabled { background: #81D4FA; cursor: not-allowed; }

    /* Table */
    .myplots-table-wrap { overflow-x: auto; }
    .myplots-table {
      width: 100%; border-collapse: collapse;
      font-size: 14px; min-width: 700px;
    }
    .myplots-table th {
      background: #F5F5F5; padding: 11px 12px;
      text-align: left; font-weight: 700; color: #555;
      border-bottom: 2px solid #e0e0e0;
    }
    .myplots-table td {
      padding: 11px 12px; border-bottom: 1px solid #F0F0F0;
      color: #333;
    }
    .myplots-table tbody tr:hover { background: #FAFAFA; }
    .myplots-table-empty {
      text-align: center; color: #aaa; padding: 32px !important; font-size: 15px;
    }
    .myplots-table-summary { background: #F1F8E9; }
    .myplots-table-summary td { font-size: 14px; border-top: 2px solid #C8E6C9; }

    /* Spin animation */
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    @media (max-width: 768px) {
      .myplots-page, .myplots-history { padding: 16px 12px 40px; }
      .myplots-page-title, .myplots-history-title { font-size: 22px; }
      .myplots-grid { grid-template-columns: 1fr; }
      .myplots-history-date-row { flex-direction: column; align-items: stretch; }
      .myplots-filter-actions { 
        justify-content: space-between; 
        margin-top: 8px; 
        flex-wrap: nowrap; 
        width: 100%;
      }
      .myplots-filter-actions button {
        flex: 1;
        justify-content: center;
        padding: 9px 4px;
        font-size: 13px;
        gap: 4px;
      }
      
      /* Mobile Table as Cards */
      .myplots-table thead { display: none; }
      .myplots-table, .myplots-table tbody, .myplots-table tr, .myplots-table td {
        display: block; width: 100%; box-sizing: border-box;
      }
      .myplots-table { min-width: unset; }
      .myplots-table tr {
        margin-bottom: 16px; border: 1px solid #e5e7eb; border-radius: 12px; padding: 8px 16px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.05); background: #fff;
      }
      .myplots-table td {
        display: flex; justify-content: space-between; align-items: center;
        padding: 10px 0; border-bottom: 1px dashed #f3f4f6; text-align: right; margin: 0;
      }
      .myplots-table td:last-child { border-bottom: none; }
      .myplots-table td::before {
        content: attr(data-label); font-weight: 700; color: #6b7280; text-align: left;
        margin-right: 16px; font-size: 13px;
      }
      
      /* Summary Row Mobile */
      .myplots-table-summary { background: #F1F8E9; display: block; border-color: #C8E6C9; }
      .hide-mobile { display: none !important; }
      .myplots-table-summary td { border-bottom: 1px dashed #C8E6C9; }
      .myplots-table-summary td::before { color: #2E7D32; font-weight: 800; }
    }
  `}</style>
);

export default MyPlotsPage;
