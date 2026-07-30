import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import {
  Plus, Maximize2, ArrowLeft, Sprout, Scissors, History,
  Pencil, Trash2, RotateCcw, Search, X, ChevronLeft,
  Leaf, LayoutGrid, AlertCircle, Loader2, Image as ImageIcon, Upload, Download
} from 'lucide-react';

import { getImageUrl } from '../../utils/urlHelper';

const fmt = (dateStr, isThai = true) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString(isThai ? 'th-TH' : 'en-US', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).replace(/\//g, '/');
};

const fmtNum = (n, isThai = true) =>
  n === undefined || n === null ? '-' : Number(n).toLocaleString(isThai ? 'th-TH' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ─────────────────────────── STATUS BADGE ────────────────────── */
const StatusBadge = ({ status }) => {
  const { i18n } = useTranslation();
  const isThai = i18n.language?.startsWith('th');
  const map = {
    'ว่าง': { bg: '#E8F5E9', color: '#2E7D32', label: isThai ? 'ว่าง' : 'Empty' },
    '0': { bg: '#E8F5E9', color: '#2E7D32', label: isThai ? 'ว่าง' : 'Empty' },
    'กำลังปลูก': { bg: '#FFF3E0', color: '#E65100', label: isThai ? 'กำลังปลูก' : 'Growing' },
    '1': { bg: '#FFF3E0', color: '#E65100', label: isThai ? 'กำลังปลูก' : 'Growing' },
    'เก็บเกี่ยวแล้ว': { bg: '#E3F2FD', color: '#1565C0', label: isThai ? 'เก็บเกี่ยวแล้ว' : 'Harvested' },
    '2': { bg: '#E3F2FD', color: '#1565C0', label: isThai ? 'เก็บเกี่ยวแล้ว' : 'Harvested' },
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
  const { i18n } = useTranslation();
  const isThai = i18n.language?.startsWith('th');

  const planting = plot.current_planting;
  const canHarvest = planting && new Date(planting.harvest_date) <= new Date();
  const isGrowing = plot.status === 'กำลังปลูก' || plot.status === '1' || plot.status === 1;
  const isEmpty = plot.status === 'ว่าง' || plot.status === '0' || plot.status === 0;

  const unitLabel = isThai 
    ? plot.area_unit 
    : (plot.area_unit === 'ไร่' ? 'Rai' : plot.area_unit === 'ตารางวา' ? 'Sq. Wah' : plot.area_unit === 'ตร.ม.' ? 'sq.m.' : plot.area_unit);

  return (
    <div className="myplots-card">
      {/* Cover image */}
      <div className="myplots-card-img-wrap">
        {plot.image_url
          ? <img src={getImageUrl(plot.image_url)} alt={plot.name} className="myplots-card-img" />
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
          <span>{isThai ? 'ขนาดแปลง' : 'Area'}: {plot.area} {unitLabel}</span>
        </div>

        {/* Planting info */}
        {isGrowing && planting ? (
          <div className="myplots-card-planting">
            <div className="myplots-card-planting-title">
              <Leaf size={14} color="#388E3C" />
              <span>{isThai ? 'ผักที่ปลูกอยู่:' : 'Current Crop:'}</span>
            </div>
            <p className="myplots-card-planting-name">{planting.vegetable_name}</p>
            <p className="myplots-card-planting-date">{isThai ? 'ปลูกเมื่อ:' : 'Planted:'} {fmt(planting.plant_date, isThai)}</p>
            <p className="myplots-card-planting-date">{isThai ? 'เก็บเกี่ยว:' : 'Harvest:'} {fmt(planting.harvest_date, isThai)}</p>
          </div>
        ) : isEmpty ? (
          <p className="myplots-card-empty-text">{isThai ? 'ไม่มีผักที่ปลูกอยู่' : 'No crop currently planted'}</p>
        ) : null}

        {/* Action primary button */}
        {isEmpty && (
          <button className="myplots-btn-primary" onClick={() => onPlant(plot)}>
            <Sprout size={16} /> {isThai ? 'ปลูกผัก' : 'Plant Crop'}
          </button>
        )}
        {isGrowing && (
          <button
            className={`myplots-btn-harvest ${canHarvest ? '' : 'myplots-btn-harvest--disabled'}`}
            onClick={() => onHarvest(plot, planting)}
          >
            <Scissors size={16} /> {isThai ? 'เก็บเกี่ยว' : 'Harvest'}
          </button>
        )}

        {/* Bottom action buttons */}
        <div className="myplots-card-actions">
          <button className="myplots-btn-action myplots-btn-history" onClick={() => onHistory(plot)}>
            <History size={14} /> {isThai ? 'ประวัติ' : 'History'}
          </button>
          <button className="myplots-btn-action myplots-btn-edit" onClick={() => onEdit(plot)}>
            <Pencil size={14} /> {isThai ? 'แก้ไข' : 'Edit'}
          </button>
          <button className="myplots-btn-action myplots-btn-delete" onClick={() => onDelete(plot)}>
            <Trash2 size={14} /> {isThai ? 'ลบ' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── ADD/EDIT PLOT MODAL ─────────────── */
const PlotModal = ({ plot, onClose, onSaved }) => {
  const { i18n } = useTranslation();
  const isThai = i18n.language?.startsWith('th');

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
      Swal.fire({ icon: 'error', title: isThai ? 'ไฟล์มีขนาดใหญ่เกินไป' : 'File too large', text: isThai ? 'สูงสุด 5MB' : 'Max 5MB', confirmButtonColor: '#2E7D32' });
      return;
    }

    const formData = new FormData();
    formData.append('upload', file);

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`/api/upload-image`, formData, {
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
      Swal.fire({ icon: 'error', title: isThai ? 'อัปโหลดรูปภาพไม่สำเร็จ' : 'Image upload failed', text: err?.response?.data?.detail || (isThai ? 'เกิดข้อผิดพลาด' : 'Error occurred'), confirmButtonColor: '#2E7D32' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.area) {
      Swal.fire({ icon: 'warning', title: isThai ? 'กรุณากรอกชื่อแปลงและขนาด' : 'Please fill plot name and size', confirmButtonColor: '#2E7D32' });
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
        await axios.put(`/api/plots/${plot.id || plot._id}`, payload);
      } else {
        await axios.post(`/api/plots`, payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      Swal.fire({ icon: 'error', title: isThai ? 'เกิดข้อผิดพลาด' : 'Error occurred', text: err.response?.data?.detail || (isThai ? 'ไม่สามารถบันทึกได้' : 'Could not save'), confirmButtonColor: '#2E7D32' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="myplots-overlay" onClick={onClose}>
      <div className="myplots-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-xs">
              <Sprout className="w-4 h-4" />
            </div>
            <h2 className="text-base font-black text-slate-900">{isEdit ? (isThai ? 'แก้ไขข้อมูลแปลงผัก' : 'Edit Vegetable Plot') : (isThai ? 'เพิ่มข้อมูลแปลงผัก' : 'Add Vegetable Plot')}</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-xl transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 bg-white">
          {/* Plot Name */}
          <div>
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 block">
              {isThai ? 'ชื่อแปลงผัก' : 'Plot Name'} <span className="text-rose-500">*</span>
            </label>
            <input 
              value={form.name} 
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} 
              placeholder={isThai ? 'เช่น แปลง A1, แปลงผักสวนครัวหน้าบ้าน' : 'e.g. Plot A1, Front Yard Plot'} 
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
            />
          </div>

          {/* Area & Unit */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-7">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 block">
                {isThai ? 'ขนาดพื้นที่' : 'Area Size'} <span className="text-rose-500">*</span>
              </label>
              <input 
                type="number" 
                min="0" 
                step="0.1" 
                value={form.area}
                onChange={e => setForm(p => ({ ...p, area: e.target.value }))} 
                placeholder="0.0" 
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
              />
            </div>
            <div className="col-span-5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 block">
                {isThai ? 'หน่วย' : 'Unit'}
              </label>
              <select 
                value={form.area_unit} 
                onChange={e => setForm(p => ({ ...p, area_unit: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none cursor-pointer"
              >
                <option value="ไร่">{isThai ? 'ไร่' : 'Rai'}</option>
                <option value="ตารางเมตร">{isThai ? 'ตารางเมตร' : 'sq.m.'}</option>
                <option value="งาน">{isThai ? 'งาน' : 'Ngan'}</option>
                <option value="ตารางวา">{isThai ? 'ตารางวา' : 'Sq. Wah'}</option>
              </select>
            </div>
          </div>

          {/* Image Upload Dropzone */}
          <div>
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 block">
              {isThai ? 'รูปภาพแปลงผัก' : 'Plot Image'} <span className="text-slate-400 font-normal">({isThai ? 'ไม่บังคับ' : 'Optional'})</span>
            </label>
            <input type="file" accept="image/*" onChange={handleImageUpload} id="plot-image-input" className="hidden" />

            {form.image_url ? (
              <div className="relative h-36 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900 group">
                <img 
                  src={getImageUrl(form.image_url)} 
                  alt="Plot Preview" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <label 
                    htmlFor="plot-image-input"
                    className="px-3 py-1.5 bg-white/90 hover:bg-white text-slate-800 font-bold text-xs rounded-lg cursor-pointer transition-all shadow-xs"
                  >
                    {isThai ? 'เปลี่ยนรูป' : 'Change Image'}
                  </label>
                  <button 
                    onClick={() => setForm(p => ({ ...p, image_url: '' }))} 
                    className="px-3 py-1.5 bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs rounded-lg transition-all shadow-xs"
                  >
                    {isThai ? 'ลบรูปภาพ' : 'Remove'}
                  </button>
                </div>
              </div>
            ) : (
              <label 
                htmlFor="plot-image-input"
                className="border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50/80 hover:bg-emerald-50/40 rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <Loader2 size={24} className="spin text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-700">{isThai ? 'กำลังอัปโหลดรูปภาพ...' : 'Uploading image...'}</span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Upload size={18} />
                    </div>
                    <p className="text-xs font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">
                      {isThai ? 'คลิกเพื่อเลือกหรืออัปโหลดรูปภาพแปลง' : 'Click to select or upload plot image'}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                      {isThai ? 'รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB' : 'Supports JPG, PNG up to 5MB'}
                    </p>
                  </>
                )}
              </label>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button 
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all"
          >
            {isThai ? 'ยกเลิก' : 'Cancel'}
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={saving}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-200 transition-all flex items-center gap-2 disabled:bg-emerald-300"
          >
            {saving ? <Loader2 size={14} className="spin" /> : null}
            <span>{saving ? (isThai ? 'กำลังบันทึก...' : 'Saving...') : (isThai ? 'บันทึกข้อมูล' : 'Save Plot')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── PLANT MODAL ─────────────────────── */
const PlantModal = ({ plot, onClose, onSaved }) => {
  const { i18n } = useTranslation();
  const isThai = i18n.language?.startsWith('th');

  const [form, setForm] = useState({
    vegetable_name: '',
    plant_date: new Date().toISOString().split('T')[0],
    harvest_date: '',
    quantity: '',
  });
  const [saving, setSaving] = useState(false);
  const [vegetables, setVegetables] = useState([]);
  const [loadingVeg, setLoadingVeg] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const fetchVeg = async () => {
      setLoadingVeg(true);
      try {
        const res = await axios.get(`/api/vegetable`, { params: { limit: 500 } });
        setVegetables(res.data?.data || []);
      } catch (err) {
        console.error('Failed to load vegetables:', err);
      } finally {
        setLoadingVeg(false);
      }
    };
    fetchVeg();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setIsSelectOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const handleSelectVegetable = (vegName) => {
    const newHarvest = calculateHarvestDate(form.plant_date, vegName);
    setForm(p => ({ ...p, vegetable_name: vegName, harvest_date: newHarvest || p.harvest_date }));
    setIsSelectOpen(false);
  };

  const handlePlantDateChange = (e) => {
    const dateStr = e.target.value;
    const newHarvest = calculateHarvestDate(dateStr, form.vegetable_name);
    setForm(p => ({ ...p, plant_date: dateStr, harvest_date: newHarvest || p.harvest_date }));
  };

  const handleSubmit = async () => {
    if (!form.vegetable_name.trim() || !form.plant_date || !form.harvest_date || !form.quantity) {
      Swal.fire({ icon: 'warning', title: isThai ? 'กรุณากรอกข้อมูลให้ครบ' : 'Please fill all required fields', confirmButtonColor: '#2E7D32' });
      return;
    }
    setSaving(true);
    try {
      await axios.post(`/api/plots/${plot.id || plot._id}/plant`, form);
      Swal.fire({ icon: 'success', title: isThai ? 'บันทึกการปลูกสำเร็จ' : 'Planting saved successfully', timer: 1500, showConfirmButton: false });
      onSaved();
      onClose();
    } catch (err) {
      Swal.fire({ icon: 'error', title: isThai ? 'เกิดข้อผิดพลาด' : 'Error occurred', text: err.response?.data?.detail || (isThai ? 'ไม่สามารถบันทึกได้' : 'Could not save'), confirmButtonColor: '#2E7D32' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="myplots-overlay" onClick={onClose}>
      <div className="myplots-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-xs shrink-0">
              <Leaf className="w-4 h-4" />
            </div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 truncate">{isThai ? 'ปลูกผัก' : 'Plant Crop'} — {isThai ? 'แปลง' : 'Plot'} {plot.name}</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-xl transition-all shrink-0 ml-2"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 bg-white max-h-[70vh] overflow-y-auto">
          {/* Custom Vegetable Select */}
          <div className="relative" ref={selectRef}>
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 block">
              {isThai ? 'ชื่อผักที่ต้องการปลูก' : 'Select Vegetable'} <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => !loadingVeg && setIsSelectOpen(!isSelectOpen)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between hover:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all cursor-pointer"
            >
              <span className={form.vegetable_name ? 'text-slate-800 font-bold truncate' : 'text-slate-400 font-medium truncate'}>
                {form.vegetable_name || (loadingVeg ? (isThai ? 'กำลังโหลดข้อมูลผัก...' : 'Loading vegetables...') : (isThai ? '-- เลือกผักที่ต้องการปลูก --' : '-- Select Vegetable --'))}
              </span>
              <ChevronLeft className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isSelectOpen ? '-rotate-90' : 'rotate-180'}`} />
            </button>

            {isSelectOpen && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                {vegetables.length > 0 ? (
                  vegetables.map(v => (
                    <div
                      key={v.id || v._id}
                      onClick={() => handleSelectVegetable(v.thai_name)}
                      className={`px-3.5 py-2.5 text-xs cursor-pointer flex items-center justify-between transition-colors hover:bg-emerald-50 hover:text-emerald-700 ${
                        form.vegetable_name === v.thai_name ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 font-medium'
                      }`}
                    >
                      <span className="truncate">{v.thai_name}</span>
                      {v.growth && <span className="text-[10px] text-slate-400 font-normal shrink-0 ml-2">({v.growth} {isThai ? 'วัน' : 'days'})</span>}
                    </div>
                  ))
                ) : (
                  <div className="px-3.5 py-3 text-xs text-slate-400 text-center font-medium">
                    {loadingVeg ? (isThai ? 'กำลังโหลด...' : 'Loading...') : (isThai ? 'ไม่พบข้อมูลผัก' : 'No vegetables found')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Plant Date & Harvest Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 block">
                {isThai ? 'วันที่ปลูก' : 'Planting Date'} <span className="text-rose-500">*</span>
              </label>
              <input 
                type="date" 
                lang={isThai ? 'th-TH' : 'en-US'}
                value={form.plant_date}
                onChange={handlePlantDateChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 block">
                {isThai ? 'วันที่คาดว่าจะเก็บเกี่ยว' : 'Expected Harvest Date'} <span className="text-rose-500">*</span>
              </label>
              <input 
                type="date" 
                lang={isThai ? 'th-TH' : 'en-US'}
                value={form.harvest_date}
                readOnly
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed outline-none"
              />
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 block">
              {isThai ? 'จำนวนต้นที่ปลูก' : 'Quantity (Plants)'} <span className="text-rose-500">*</span>
            </label>
            <input 
              type="number" 
              min="1" 
              value={form.quantity}
              onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
              placeholder={isThai ? 'ระบุจำนวนต้น เช่น 100' : 'e.g. 100'} 
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button 
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all"
          >
            {isThai ? 'ยกเลิก' : 'Cancel'}
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={saving}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-200 transition-all flex items-center gap-2 disabled:bg-emerald-300"
          >
            {saving ? <Loader2 size={14} className="spin" /> : <Sprout size={14} />}
            <span>{saving ? (isThai ? 'กำลังบันทึก...' : 'Saving...') : (isThai ? 'บันทึกการปลูก' : 'Save Planting')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── HARVEST MODAL ────────────────────── */
const HarvestModal = ({ plot, planting, onClose, onSaved }) => {
  const { i18n } = useTranslation();
  const isThai = i18n.language?.startsWith('th');

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
      Swal.fire({ icon: 'warning', title: isThai ? 'กรุณากรอกข้อมูลให้ครบ' : 'Please fill all required fields', confirmButtonColor: '#2E7D32' });
      return;
    }
    setSaving(true);
    try {
      await axios.post(`/api/plots/${plot.id || plot._id}/harvest`, form);
      Swal.fire({ icon: 'success', title: isThai ? 'บันทึกการเก็บเกี่ยวสำเร็จ' : 'Harvest recorded successfully', timer: 1500, showConfirmButton: false });
      onSaved();
      onClose();
    } catch (err) {
      Swal.fire({ icon: 'error', title: isThai ? 'เกิดข้อผิดพลาด' : 'Error occurred', text: err.response?.data?.detail || (isThai ? 'ไม่สามารถบันทึกได้' : 'Could not save'), confirmButtonColor: '#2E7D32' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="myplots-overlay" onClick={onClose}>
      <div className="myplots-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shadow-xs shrink-0">
              <Scissors className="w-4 h-4" />
            </div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 truncate">{isThai ? 'บันทึกการเก็บเกี่ยว' : 'Record Harvest'} — {plot.name}</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-xl transition-all shrink-0 ml-2"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 bg-white max-h-[70vh] overflow-y-auto">
          {!canHarvest && (
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-center gap-2.5 text-xs text-amber-800 font-semibold">
              <AlertCircle size={16} className="text-amber-600 shrink-0" />
              <span>{isThai ? `ยังไม่ถึงวันเก็บเกี่ยว (${fmt(planting?.harvest_date)}) แต่คุณสามารถบันทึกล่วงหน้าได้` : `Harvest date is ${fmt(planting?.harvest_date)}, but you can record in advance.`}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 block">
              {isThai ? 'วันที่เก็บเกี่ยวจริง' : 'Actual Harvest Date'} <span className="text-rose-500">*</span>
            </label>
            <input 
              type="date" 
              lang={isThai ? 'th-TH' : 'en-US'}
              value={form.actual_harvest_date}
              onChange={e => setForm(p => ({ ...p, actual_harvest_date: e.target.value }))} 
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 block">
              {isThai ? 'ปริมาณผลผลิตที่ได้ (กก.)' : 'Yield Quantity (kg)'} <span className="text-rose-500">*</span>
            </label>
            <input 
              type="number" 
              min="0" 
              step="0.1" 
              value={form.amount_kg}
              onChange={e => setForm(p => ({ ...p, amount_kg: e.target.value }))}
              placeholder="0.0" 
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 block">
                {isThai ? 'รายรับ (บาท)' : 'Income (THB)'} <span className="text-rose-500">*</span>
              </label>
              <input 
                type="number" 
                min="0" 
                value={form.income}
                onChange={e => setForm(p => ({ ...p, income: e.target.value }))}
                placeholder="0" 
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 block">
                {isThai ? 'รายจ่าย (บาท)' : 'Expense (THB)'}
              </label>
              <input 
                type="number" 
                min="0" 
                value={form.expense}
                onChange={e => setForm(p => ({ ...p, expense: e.target.value }))}
                placeholder="0" 
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 block">
              {isThai ? 'หมายเหตุเพิ่มเติม' : 'Note'}
            </label>
            <input 
              value={form.note} 
              onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
              placeholder={isThai ? 'หมายเหตุเพิ่มเติม (ถ้ามี)' : 'Additional note (optional)'} 
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button 
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all"
          >
            {isThai ? 'ยกเลิก' : 'Cancel'}
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={saving}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-200 transition-all flex items-center gap-2 disabled:bg-emerald-300"
          >
            {saving ? <Loader2 size={14} className="spin" /> : <Scissors size={14} />}
            <span>{saving ? (isThai ? 'กำลังบันทึก...' : 'Saving...') : (isThai ? 'บันทึกการเก็บเกี่ยว' : 'Save Harvest')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── HISTORY VIEW ─────────────────────── */
const HistoryView = ({ plot, onBack }) => {
  const { i18n } = useTranslation();
  const isThai = i18n.language?.startsWith('th');

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filtered, setFiltered] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/plots/${plot.id || plot._id}/history`);
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
      data = data.filter(r => r.vegetable_name?.toLowerCase().includes(search.trim().toLowerCase()));
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
    const headers = [
      isThai ? 'วันที่ปลูก' : 'Planting Date',
      isThai ? 'วันที่เก็บเกี่ยว' : 'Harvest Date',
      isThai ? 'ผัก' : 'Crop',
      isThai ? 'จำนวน (ต้น)' : 'Quantity (Plants)',
      isThai ? 'ปริมาณ (กก.)' : 'Yield (kg)',
      isThai ? 'รายรับ (บาท)' : 'Income (THB)',
      isThai ? 'รายจ่าย (บาท)' : 'Expense (THB)',
      isThai ? 'กำไร (บาท)' : 'Profit (THB)'
    ];
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

    const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n');
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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-xs font-bold mb-2">
              <History className="w-3.5 h-3.5 text-emerald-600" />
              {isThai ? 'ประวัติการปลูกพืช' : 'Planting History'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isThai ? 'ประวัติการปลูก' : 'Planting History'} — {isThai ? 'แปลง' : 'Plot'} <span className="text-emerald-600">{plot.name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              {isThai ? 'ติดตามประวัติการปลูก ผลผลิต รายรับ รายจ่าย และสรุปกำไรขาดทุนของแปลงผักนี้' : 'Track planting history, yield, revenue, expenses, and profit summary for this plot.'}
            </p>
          </div>
          <button 
            onClick={onBack}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all shrink-0 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>{isThai ? 'กลับไปหน้าแปลงผัก' : 'Back to Plots'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <h2 className="text-sm font-bold text-slate-800">{isThai ? 'กรองและค้นหาข้อมูลประวัติ' : 'Filter & Search History'}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Search Input */}
          <div>
            <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1 block">
              {isThai ? 'ค้นหาชื่อผัก' : 'Search Crop'}
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={isThai ? 'เช่น กะเพรา, คะน้า...' : 'e.g. Basil, Kale...'}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
              />
            </div>
          </div>

          {/* Date From */}
          <div>
            <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1 block">
              {isThai ? 'เลือกตามวันที่ปลูก (เริ่มต้น)' : 'Planting Date (Start)'}
            </label>
            <input 
              type="date" 
              lang={isThai ? 'th-TH' : 'en-US'}
              value={fromDate} 
              onChange={e => setFromDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1 block">
              {isThai ? 'ถึงวันที่' : 'To Date'}
            </label>
            <input 
              type="date" 
              lang={isThai ? 'th-TH' : 'en-US'}
              value={toDate} 
              onChange={e => setToDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button 
            onClick={handleSearch}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs shadow-emerald-200 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Search size={14} />
            <span>{isThai ? 'ค้นหา' : 'Search'}</span>
          </button>

          <button 
            onClick={handleReset}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <RotateCcw size={14} />
            <span>{isThai ? 'รีเซ็ต' : 'Reset'}</span>
          </button>

          <button 
            onClick={exportToCSV} 
            disabled={filtered.length === 0}
            className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 ml-auto"
          >
            <Download size={14} />
            <span>{isThai ? 'ส่งออก CSV' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Cards (Only when filtered has data) */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">{isThai ? 'รวมรายรับทั้งหมด' : 'Total Revenue'}</p>
              <p className="text-xl font-black text-blue-900 mt-0.5">฿{fmtNum(totalIncome)}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              ฿
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">{isThai ? 'รวมรายจ่ายทั้งหมด' : 'Total Expenses'}</p>
              <p className="text-xl font-black text-amber-900 mt-0.5">฿{fmtNum(totalExpense)}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              ฿
            </div>
          </div>

          <div className={`${totalProfit >= 0 ? 'bg-emerald-50/70 border-emerald-100' : 'bg-rose-50/70 border-rose-100'} border rounded-2xl p-4 flex items-center justify-between`}>
            <div>
              <p className={`text-[11px] font-bold uppercase tracking-wider ${totalProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {totalProfit >= 0 ? (isThai ? 'กำไรสุทธิรวม' : 'Net Profit') : (isThai ? 'ขาดทุนสุทธิรวม' : 'Net Loss')}
              </p>
              <p className={`text-xl font-black mt-0.5 ${totalProfit >= 0 ? 'text-emerald-900' : 'text-rose-900'}`}>
                ฿{fmtNum(totalProfit)}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${totalProfit >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              <Sprout size={20} />
            </div>
          </div>
        </div>
      )}

      {/* Table Data View */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <Loader2 size={28} className="spin mx-auto mb-2 text-emerald-600" />
            <p className="text-xs font-semibold">{isThai ? 'กำลังโหลดข้อมูลประวัติการปลูก...' : 'Loading planting history...'}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Sprout size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-700">{isThai ? 'ไม่พบประวัติการปลูกพืช' : 'No Planting History Found'}</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              {isThai ? 'ยังไม่มีข้อมูลการบันทึกประวัติการปลูกพืชในแปลงนี้ หรือไม่พบข้อมูลตามเงื่อนไขที่ระบุ' : 'No planting history recorded for this plot, or no data matching search criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">{isThai ? 'วันที่ปลูก' : 'Planting Date'}</th>
                  <th className="py-3.5 px-4">{isThai ? 'วันที่เก็บเกี่ยว' : 'Harvest Date'}</th>
                  <th className="py-3.5 px-4">{isThai ? 'ผัก' : 'Crop'}</th>
                  <th className="py-3.5 px-4 text-center">{isThai ? 'จำนวน (ต้น)' : 'Quantity'}</th>
                  <th className="py-3.5 px-4 text-right">{isThai ? 'ปริมาณ (กก.)' : 'Yield (kg)'}</th>
                  <th className="py-3.5 px-4 text-right">{isThai ? 'รายรับ (บาท)' : 'Income (THB)'}</th>
                  <th className="py-3.5 px-4 text-right">{isThai ? 'รายจ่าย (บาท)' : 'Expense (THB)'}</th>
                  <th className="py-3.5 px-4 text-right">{isThai ? 'กำไร (บาท)' : 'Profit (THB)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {filtered.map((r, i) => {
                  const profit = (Number(r.income) || 0) - (Number(r.expense) || 0);
                  return (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{fmt(r.plant_date)}</td>
                      <td className="py-3.5 px-4 text-slate-500">{fmt(r.actual_harvest_date || r.harvesting_date || r.harvest_date || r.created_at)}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                          <Leaf className="w-3 h-3 text-emerald-600" />
                          {r.vegetable_name || '-'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold">{r.quantity != null && r.quantity !== '' ? r.quantity : '-'}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-700">{r.amount_kg != null ? fmtNum(r.amount_kg) : '-'}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-blue-600">{r.income != null ? fmtNum(r.income) : '-'}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-amber-600">{r.expense != null ? fmtNum(r.expense) : '-'}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`inline-block font-bold px-2.5 py-0.5 rounded-md ${profit >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {profit >= 0 ? '+' : ''}{fmtNum(profit)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═════════════════════════ MAIN PAGE ══════════════════════════ */
const MyPlotsPage = () => {
  const { t, i18n } = useTranslation();
  const isThai = i18n.language?.startsWith('th');
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
      const res = await axios.get(`/api/plots`, { params: { user_id: userId } });
      const mappedPlots = (res.data || []).map(p => ({
        ...p,
        name: p.plot_name || p.name,
        area: p.size || p.area,
        area_unit: p.unit || p.area_unit,
        image_url: p.image_path || p.image_url,
      }));
      setPlots(mappedPlots);
    } catch (err) {
      setError(isThai ? 'ไม่สามารถโหลดข้อมูลแปลงผักได้' : 'Could not load plot data');
    } finally {
      setLoading(false);
    }
  }, [userId, isThai]);

  useEffect(() => { fetchPlots(); }, [fetchPlots]);

  // Lock background scroll when modal is open
  useEffect(() => {
    const isAnyModalOpen = !!(plotModal || plantModal || harvestModal);
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [plotModal, plantModal, harvestModal]);

  const navigateToHarvestHistory = () => navigate('/harvest-history');

  const handleDelete = async (plot) => {
    const result = await Swal.fire({
      title: isThai ? 'ยืนยันการลบ?' : 'Confirm Delete?',
      text: isThai ? `ต้องการลบแปลง "${plot.name}" ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้` : `Are you sure you want to delete plot "${plot.name}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C62828',
      cancelButtonColor: '#666',
      confirmButtonText: isThai ? 'ลบ' : 'Delete',
      cancelButtonText: isThai ? 'ยกเลิก' : 'Cancel',
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`/api/plots/${plot.id || plot._id}`);
      Swal.fire({ icon: 'success', title: isThai ? 'ลบแปลงผักสำเร็จ' : 'Plot deleted successfully', timer: 1200, showConfirmButton: false });
      fetchPlots();
    } catch (err) {
      Swal.fire({ icon: 'error', title: isThai ? 'เกิดข้อผิดพลาด' : 'Error occurred', text: isThai ? 'ไม่สามารถลบแปลงผักได้' : 'Could not delete plot', confirmButtonColor: '#2E7D32' });
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full text-xs font-bold mb-2">
              <Sprout className="w-3.5 h-3.5" />
              <span>{isThai ? 'ระบบจัดการแปลงเกษตร' : 'Agricultural Plot Management'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isThai ? 'แปลงผักของคุณ' : 'Your Vegetable Plots'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              {isThai ? 'จัดการแปลงผัก บันทึกการปลูก และติดตามประวัติการเก็บเกี่ยว' : 'Manage plots, track growth, and view harvest records'}
            </p>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button className="myplots-add-btn bg-slate-800 hover:bg-slate-700" onClick={navigateToHarvestHistory}>
              <History size={16} /> {t('harvestHistoryPage.title')}
            </button>
            <button className="myplots-add-btn bg-emerald-600 hover:bg-emerald-500" onClick={() => setPlotModal('new')}>
              <Plus size={16} /> {isThai ? 'เพิ่มข้อมูลแปลงผัก' : 'Add Plot'}
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="myplots-loading">
            <Loader2 size={36} className="spin" color="#2E7D32" />
            <p>{t('common.loading')}</p>
          </div>
        ) : error ? (
          <div className="myplots-error">
            <AlertCircle size={40} color="#C62828" />
            <p>{error}</p>
            <button onClick={fetchPlots} className="myplots-retry-btn">
              <RotateCcw size={14} /> {t('common.retry')}
            </button>
          </div>
        ) : plots.length === 0 ? (
          <div className="myplots-empty">
            <LayoutGrid size={56} color="#ccc" />
            <p>{isThai ? 'ยังไม่มีแปลงผัก' : 'No plots created yet'}</p>
            <button className="myplots-add-btn" onClick={() => setPlotModal('new')}>
              <Plus size={16} /> {isThai ? 'เพิ่มแปลงผักแรก' : 'Add Your First Plot'}
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
      padding: 24px 20px 60px;
      font-family: 'Prompt', 'Inter', sans-serif;
    }
    .myplots-add-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #fff;
      border: none;
      border-radius: 14px;
      padding: 10px 18px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    }
    .myplots-add-btn:hover { transform: translateY(-1px); }
    .myplots-add-btn:active { transform: scale(0.98); }

    /* Grid */
    .myplots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
      gap: 20px;
    }

    /* Card */
    .myplots-card {
      background: #fff;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 16px rgba(0,0,0,0.04);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .myplots-card:hover {
      box-shadow: 0 12px 32px rgba(0,0,0,0.09);
      transform: translateY(-3px);
      border-color: #cbd5e1;
    }
    .myplots-card-img-wrap { width: 100%; height: 160px; overflow: hidden; background: #f1f5f9; position: relative; }
    .myplots-card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
    .myplots-card:hover .myplots-card-img { transform: scale(1.05); }
    .myplots-card-img-placeholder {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      background: #f8fafc; color: #94a3b8;
    }
    .myplots-card-body { padding: 16px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
    .myplots-card-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .myplots-card-name { font-size: 17px; font-weight: 800; color: #0f172a; margin: 0; tracking-tight: -0.02em; }
    .myplots-card-info-row {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; font-weight: 600; color: #64748b;
      background: #f8fafc;
      padding: 6px 10px;
      border-radius: 10px;
      border-left: 3px solid #10b981;
    }
    .myplots-card-planting {
      background: #f0fdf4;
      border: 1px solid #dcfce7;
      border-radius: 14px;
      padding: 10px 12px;
      display: flex; flex-direction: column; gap: 3px;
    }
    .myplots-card-planting-title {
      display: flex; align-items: center; gap: 5px;
      font-size: 12px; font-weight: 700; color: #166534;
    }
    .myplots-card-planting-name { font-size: 14px; font-weight: 800; color: #14532d; margin: 1px 0 0; }
    .myplots-card-planting-date { font-size: 11px; color: #475569; margin: 0; font-weight: 500; }
    .myplots-card-empty-text { text-align: center; color: #94a3b8; font-size: 12px; font-weight: 600; margin: 6px 0; }

    /* Primary action buttons */
    .myplots-btn-primary, .myplots-btn-harvest {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      width: 100%; padding: 10px;
      background: #059669; color: #fff;
      border: none; border-radius: 12px;
      font-size: 14px; font-weight: 700; cursor: pointer;
      transition: all 0.15s ease;
      box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
    }
    .myplots-btn-primary:hover, .myplots-btn-harvest:hover { background: #047857; }
    .myplots-btn-harvest--disabled {
      background: #a7f3d0; color: #065f46; cursor: pointer; box-shadow: none;
    }
    .myplots-btn-harvest--disabled:hover { background: #6ee7b7; }

    /* Bottom action buttons */
    .myplots-card-actions { display: flex; gap: 6px; margin-top: 2px; }
    .myplots-btn-action {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 4px;
      padding: 7px 4px; border: none; border-radius: 10px;
      font-size: 12px; font-weight: 700; cursor: pointer;
      transition: all 0.15s ease;
    }
    .myplots-btn-action:active { transform: scale(0.96); }
    .myplots-btn-history { background: #f3e8ff; color: #7e22ce; }
    .myplots-btn-history:hover { background: #e9d5ff; }
    .myplots-btn-edit { background: #ffedd5; color: #c2410c; }
    .myplots-btn-edit:hover { background: #fed7aa; }
    .myplots-btn-delete { background: #ffe4e6; color: #be123c; }
    .myplots-btn-delete:hover { background: #fecdd3; }

    /* States */
    .myplots-loading, .myplots-error, .myplots-empty {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 260px; gap: 12px; color: #64748b; font-size: 14px; font-weight: 600;
    }
    .myplots-retry-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 18px; background: #059669; color: #fff;
      border: none; border-radius: 10px; font-weight: 700; cursor: pointer;
    }

    /* Modal Overlay & Compact Container */
    .myplots-overlay {
      position: fixed; inset: 0;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 16px;
    }
    .myplots-modal {
      background: #fff; border-radius: 24px;
      width: min(100%, 440px); max-width: calc(100vw - 32px);
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
      overflow: hidden; animation: modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      border: 1px solid rgba(255,255,255,0.2);
      box-sizing: border-box;
    }
    @keyframes modalIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: none; } }
    .myplots-modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #f1f5f9;
    }
    .myplots-modal-header h2 { margin: 0; font-size: 16px; font-weight: 800; color: #0f172a; }
    .myplots-modal-close {
      background: #f1f5f9; border: none; cursor: pointer; color: #64748b; padding: 6px;
      border-radius: 10px; transition: all 0.15s;
    }
    .myplots-modal-close:hover { background: #ffe4e6; color: #e11d48; }
    .myplots-modal-body {
      padding: 18px 20px;
      display: flex; flex-direction: column; gap: 12px;
      max-height: 65vh; overflow-y: auto;
    }
    .myplots-modal-body label {
      font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 2px; display: block;
      text-transform: uppercase; tracking: 0.05em;
    }
    .myplots-modal-body input,
    .myplots-modal-body select {
      width: 100%; padding: 9px 12px;
      border: 1.5px solid #e2e8f0; border-radius: 12px;
      font-size: 13px; outline: none; background: #f8fafc;
      transition: all 0.15s ease; box-sizing: border-box; font-family: inherit;
    }
    .myplots-modal-body input:focus,
    .myplots-modal-body select:focus { border-color: #10b981; background: #fff; box-shadow: 0 0 0 3px rgba(16,185,129,0.15); }
    .myplots-modal-row { display: flex; gap: 12px; }
    .myplots-modal-footer {
      display: flex; justify-content: flex-end; gap: 8px;
      padding: 14px 20px;
      border-top: 1px solid #f1f5f9;
      background: #f8fafc;
    }
    .myplots-modal-cancel {
      padding: 9px 18px; background: #e2e8f0; color: #475569;
      border: none; border-radius: 12px; font-weight: 700; font-size: 13px; cursor: pointer;
    }
    .myplots-modal-cancel:hover { background: #cbd5e1; }
    .myplots-modal-save {
      display: flex; align-items: center; gap: 6px;
      padding: 9px 20px; background: #059669; color: #fff;
      border: none; border-radius: 12px; font-weight: 700; font-size: 13px; cursor: pointer;
      transition: all 0.15s ease; shadow: 0 4px 12px rgba(5,150,105,0.2);
    }
    .myplots-modal-save:hover:not(:disabled) { background: #047857; }
    .myplots-modal-save:disabled { background: #a7f3d0; cursor: not-allowed; }
    .req { color: #e11d48; }

    /* Harvest warning */
    .myplots-harvest-warn {
      display: flex; align-items: center; gap: 8px;
      background: #fffbeb; border: 1px solid #fde68a;
      border-radius: 12px; padding: 10px 12px;
      font-size: 12px; color: #b45309; font-weight: 600;
    }

    /* History View */
    .myplots-history {
      max-width: 1100px;
      margin: 0 auto;
      padding: 24px 20px 60px;
      font-family: 'Prompt', 'Inter', sans-serif;
    }
    .myplots-back-btn {
      display: flex; align-items: center; gap: 5px;
      background: #f1f5f9; border: none; color: #059669;
      font-size: 13px; font-weight: 700; cursor: pointer;
      padding: 8px 14px; border-radius: 12px; transition: all 0.15s ease;
    }
    .myplots-back-btn:hover { background: #dcfce7; }
    .myplots-history-card {
      background: #fff; border-radius: 24px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      padding: 20px; overflow: hidden; border: 1px solid #e2e8f0;
    }
    .myplots-history-tabs { margin-bottom: 16px; }
    .myplots-history-tab {
      display: inline-block; padding: 6px 16px;
      border-bottom: 3px solid transparent;
      font-size: 13px; font-weight: 800; color: #64748b; cursor: pointer;
    }
    .myplots-history-tab.active { color: #059669; border-color: #059669; }
    .myplots-history-filters { margin-bottom: 16px; display: flex; flex-direction: column; gap: 12px; }
    .myplots-filter-group { display: flex; flex-direction: column; gap: 4px; }
    .myplots-filter-group label { font-size: 12px; font-weight: 700; color: #475569; }
    .myplots-filter-group input {
      padding: 8px 12px; border: 1.5px solid #e2e8f0; border-radius: 10px;
      font-size: 13px; outline: none; transition: border 0.15s; background: #f8fafc;
    }
    .myplots-filter-group input:focus { border-color: #10b981; background: #fff; }
    .myplots-history-date-row {
      display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap;
    }
    .myplots-history-date-row .myplots-filter-group { flex: 1; min-width: 150px; }
    .myplots-filter-actions { display: flex; flex-wrap: wrap; gap: 6px; align-items: flex-end; padding-bottom: 2px; }
    .myplots-search-btn {
      display: flex; align-items: center; gap: 5px;
      padding: 8px 16px; background: #059669; color: #fff;
      border: none; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer;
      white-space: nowrap; transition: background 0.15s;
    }
    .myplots-search-btn:hover { background: #047857; }
    .myplots-reset-btn {
      display: flex; align-items: center; gap: 5px;
      padding: 8px 14px; background: #f1f5f9; color: #64748b;
      border: none; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer;
      white-space: nowrap;
    }
    .myplots-reset-btn:hover { background: #e2e8f0; }
    .myplots-export-btn {
      display: flex; align-items: center; gap: 5px;
      padding: 8px 14px; background: #0284c7; color: #fff;
      border: none; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer;
      white-space: nowrap; transition: background 0.15s;
    }
    .myplots-export-btn:hover:not(:disabled) { background: #0369a1; }
    .myplots-export-btn:disabled { background: #bae6fd; cursor: not-allowed; }

    /* Table */
    .myplots-table-wrap { overflow-x: auto; border-radius: 14px; border: 1px solid #e2e8f0; }
    .myplots-table {
      width: 100%; border-collapse: collapse;
      font-size: 13px; min-width: 700px;
    }
    .myplots-table th {
      background: #f8fafc; padding: 10px 12px;
      text-align: left; font-weight: 700; color: #475569;
      border-bottom: 2px solid #e2e8f0; text-transform: uppercase; font-size: 11px; tracking: 0.04em;
    }
    .myplots-table td {
      padding: 10px 12px; border-bottom: 1px solid #f1f5f9;
      color: #334155; font-weight: 500;
    }
    .myplots-table tbody tr:hover { background: #f8fafc; }
    .myplots-table-empty {
      text-align: center; color: #94a3b8; padding: 32px !important; font-size: 14px;
    }
    .myplots-table-summary { background: #f0fdf4; }
    .myplots-table-summary td { font-size: 13px; border-top: 2px solid #bbf7d0; }

    /* Spin animation */
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    @media (max-width: 768px) {
      .myplots-page, .myplots-history { padding: 16px 12px 40px; }
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
        padding: 8px 4px;
        font-size: 12px;
        gap: 4px;
      }
      
      /* Mobile Table as Cards */
      .myplots-table thead { display: none; }
      .myplots-table, .myplots-table tbody, .myplots-table tr, .myplots-table td {
        display: block; width: 100%; box-sizing: border-box;
      }
      .myplots-table { min-width: unset; }
      .myplots-table tr {
        margin-bottom: 12px; border: 1px solid #e5e7eb; border-radius: 14px; padding: 8px 14px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.04); background: #fff;
      }
      .myplots-table td {
        display: flex; justify-content: space-between; align-items: center;
        padding: 8px 0; border-bottom: 1px dashed #f3f4f6; text-align: right; margin: 0;
      }
      .myplots-table td:last-child { border-bottom: none; }
      .myplots-table td::before {
        content: attr(data-label); font-weight: 700; color: #64748b; text-align: left;
        margin-right: 16px; font-size: 12px;
      }
      
      /* Summary Row Mobile */
      .myplots-table-summary { background: #f0fdf4; display: block; border-color: #bbf7d0; }
      .hide-mobile { display: none !important; }
      .myplots-table-summary td { border-bottom: 1px dashed #bbf7d0; }
      .myplots-table-summary td::before { color: #166534; font-weight: 800; }
    }
  `}</style>
);

export default MyPlotsPage;
