import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  MessageSquare, 
  Tag, 
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  User,
  HelpCircle,
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useAuth } from '../../context/AuthContext';

const ContactPage = () => {
  const { t, i18n } = useTranslation();
  const isThai = i18n.language?.startsWith('th');
  const { user } = useAuth();
  
  // Form State
  const [formData, setFormData] = useState({
    type: '',
    message: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const requestTypes = [
    { key: 'addVegetable', label: isThai ? 'ขอเพิ่มข้อมูลผัก' : 'Request New Vegetable' },
    { key: 'addDisease', label: isThai ? 'ขอเพิ่มข้อมูลโรค' : 'Request New Disease' },
    { key: 'addPest', label: isThai ? 'ขอเพิ่มข้อมูลแมลงศัตรูพืช' : 'Request New Pest' },
    { key: 'other', label: isThai ? 'อื่นๆ' : 'Other Inquiries' }
  ];

  // Close custom dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedTypeObj = requestTypes.find(t => t.key === formData.type);

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: isThai ? 'กรุณาเข้าสู่ระบบ' : 'Please Login',
        text: isThai ? 'คุณต้องเข้าสู่ระบบก่อนส่งข้อความ' : 'You must log in before sending a message.',
        confirmButtonColor: '#10b981'
      });
      return;
    }
    
    const plainText = formData.message.replace(/<[^>]*>/g, '').trim();
    if (!formData.type || !plainText) {
      Swal.fire({
        icon: 'warning',
        title: isThai ? 'คำเตือน' : 'Warning',
        text: isThai ? 'กรุณาเลือกประเภทคำขอและกรอกรายละเอียด' : 'Please select request type and enter message details.',
        confirmButtonColor: '#10b981'
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: user.fullname || user.username || 'User',
        email: user.email,
        subject: selectedTypeObj?.label || formData.type,
        message: formData.message,
        phone: user.phone || ''
      };
      
      await axios.post(`/api/contact/send`, payload);

      Swal.fire({
        icon: 'success',
        title: isThai ? 'สำเร็จ' : 'Success',
        text: isThai ? 'ส่งข้อความถึงทีมงานสำเร็จ เราจะติดต่อกลับทางอีเมลโดยเร็วที่สุด' : 'Message sent successfully! We will get back to you via email soon.',
        confirmButtonColor: '#10b981'
      });
      
      setFormData({ type: '', message: '' });
      
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error.response?.data?.detail || (isThai ? 'เกิดข้อผิดพลาดในการส่งข้อความ' : 'Error sending message');
      Swal.fire({
        icon: 'error',
        title: isThai ? 'ผิดพลาด' : 'Error',
        text: errorMessage,
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      {/* Page Header */}
      <div className="max-w-3xl w-full mb-6 sm:mb-8 text-center sm:text-left">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0 shadow-xs">
              <Mail className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-xs font-bold mb-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>{isThai ? 'ติดต่อผู้ดูแลระบบ' : 'Support & Contact'}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {isThai ? 'ติดต่อผู้ดูแลระบบ' : 'Contact System Administrator'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 sm:p-10 relative">
        <div className="relative z-10 space-y-6">
          <div className="text-center pb-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
              {isThai ? 'ส่งข้อความถึงผู้ดูแล' : 'Send Message to Administrator'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
              {isThai ? 'แจ้งขอเพิ่มข้อมูลผัก โรค หรือแมลงศัตรูพืช และสอบถามปัญหาการใช้งาน' : 'Request new vegetable, disease, pest entries or report system issues'}
            </p>
            <div className="w-12 h-1 bg-emerald-500 rounded-full mx-auto mt-3" />
          </div>

          {/* User Info Card */}
          {user && (
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100/80 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center shrink-0 font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">{user.fullname || user.username}</p>
                  <p className="text-xs text-slate-500 font-medium truncate">{user.email}</p>
                </div>
              </div>
              <div className="pt-2.5 border-t border-emerald-200/60 text-xs text-emerald-800 space-y-1 font-medium">
                <p className="flex items-center gap-1.5">
                  <span>📧 {isThai ? 'ข้อความจะส่งจาก:' : 'Sender Email:'}</span>
                  <strong className="text-emerald-900 font-bold">{user.email}</strong>
                </p>
                <p className="flex items-center gap-1.5">
                  <span>📨 {isThai ? 'ไปยัง:' : 'Recipient:'}</span>
                  <strong className="text-emerald-900 font-bold">651413010@crru.ac.th ({isThai ? 'ทีมงานผู้ดูแล' : 'Admin Team'})</strong>
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Custom Request Type Select */}
            <div className="space-y-2 relative" ref={dropdownRef}>
              <label className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-wider">
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>{isThai ? 'ประเภทคำขอ' : 'Request Type'}</span>
                <span className="text-rose-500">*</span>
              </label>

              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 flex items-center justify-between hover:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all cursor-pointer"
              >
                <span className={formData.type ? 'text-slate-800 font-bold truncate' : 'text-slate-400 font-medium truncate'}>
                  {selectedTypeObj ? selectedTypeObj.label : (isThai ? '-- เลือกประเภทคำขอ --' : '-- Select Request Type --')}
                </span>
                <ChevronLeft className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isDropdownOpen ? '-rotate-90' : 'rotate-180'}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                  {requestTypes.map((type) => (
                    <div
                      key={type.key}
                      onClick={() => {
                        setFormData(p => ({ ...p, type: type.key }));
                        setIsDropdownOpen(false);
                      }}
                      className={`px-4 py-3 text-xs cursor-pointer flex items-center justify-between transition-colors hover:bg-emerald-50 hover:text-emerald-700 ${
                        formData.type === type.key ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 font-medium'
                      }`}
                    >
                      <span>{type.label}</span>
                      {formData.type === type.key && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rich Text Message Editor */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-wider">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>{isThai ? 'รายละเอียดข้อความ' : 'Message Details'}</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-200 transition-all">
                <ReactQuill
                  theme="snow"
                  value={formData.message}
                  onChange={(content) => setFormData({ ...formData, message: content })}
                  placeholder={isThai ? 'อธิบายรายละเอียดที่ต้องการ เช่น เพิ่มข้อมูลผักชนิดใหม่ หรือแจ้งปัญหาการใช้งาน...' : 'Describe your request or issue in detail...'}
                  className="contact-editor"
                />
              </div>
              <style>{`
                .contact-editor .ql-toolbar {
                  border: none;
                  border-bottom: 1px solid #f1f5f9;
                  background: #f8fafc;
                  padding: 8px 12px;
                }
                .contact-editor .ql-container {
                  border: none;
                  min-height: 180px;
                  font-family: inherit;
                  font-size: 0.8125rem;
                }
                .contact-editor .ql-editor.ql-blank::before {
                  color: #94a3b8;
                  font-style: normal;
                  font-weight: 500;
                }
              `}</style>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{loading ? (isThai ? 'กำลังส่งข้อความ...' : 'Sending...') : (isThai ? 'ส่งข้อความ' : 'Send Message')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
