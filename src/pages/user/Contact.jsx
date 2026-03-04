import React, { useState } from 'react';
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
  HelpCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useAuth } from '../../context/AuthContext';



const ContactPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Form สำหรับส่งข้อความ (ดึง name, email จาก user โดยอัตโนมัติ)
  const [formData, setFormData] = useState({
    type: '',
    message: ''
  });
  
  const [loading, setLoading] = useState(false);

  const requestTypes = [
    { key: 'addVegetable', value: t('contactPage.types.addVegetable') },
    { key: 'addDisease', value: t('contactPage.types.addDisease') },
    { key: 'addPest', value: t('contactPage.types.addPest') },
    { key: 'other', value: t('contactPage.types.other') }
  ];

  // แปลง type key เป็นชื่อหัวข้อภาษาไทย
  const getSubjectFromType = (typeKey) => {
    const typeMap = {
      'addVegetable': 'ขอเพิ่มข้อมูลผัก',
      'addDisease': 'ขอเพิ่มข้อมูลโรค',
      'addPest': 'ขอเพิ่มข้อมูลแมลงศัตรูพืช',
      'other': 'เรื่องอื่นๆ'
    };
    return typeMap[typeKey] || typeKey;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ตรวจสอบว่า login หรือไม่
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณาเข้าสู่ระบบ',
        text: 'คุณต้องเข้าสู่ระบบก่อนส่งข้อความ',
        confirmButtonColor: '#10b981'
      });
      return;
    }
    
    if (!formData.type || !formData.message || formData.message === '<p><br></p>') {
      Swal.fire({
        icon: 'warning',
        title: t('common.warning') || 'คำเตือน',
        text: t('common.pleaseFillAll') || 'กรุณากรอกข้อมูลให้ครบถ้วน',
        confirmButtonColor: '#10b981'
      });
      return;
    }

    setLoading(true);
    try {
      // เตรียมข้อมูลส่งไป backend (ดึง name, email จาก user ที่ login)
      const payload = {
        name: user.fullname,
        email: user.email,
        subject: getSubjectFromType(formData.type),
        message: formData.message,
        phone: user.phone || '' // ถ้ามีเบอร์โทรใน profile
      };
      
      const response = await axios.post(`/api/contact/send`, payload);

      Swal.fire({
        icon: 'success',
        title: t('common.success') || 'สำเร็จ',
        text: 'ส่งข้อความถึงทีมงานสำเร็จ เราจะติดต่อกลับทางอีเมลโดยเร็วที่สุด',
        confirmButtonColor: '#10b981'
      });
      
      // รีเซ็ตเฉพาะ type และ message ไม่ต้องกรอก name, email ใหม่
      setFormData({ type: '', message: '' });
      
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error.response?.data?.detail || 'เกิดข้อผิดพลาดในการส่งข้อความ';
      Swal.fire({
        icon: 'error',
        title: t('common.error') || 'ผิดพลาด',
        text: errorMessage,
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      {/* Page Header */}
      <div className="max-w-4xl w-full mb-8 flex items-center gap-3 px-4">
        <div className="text-[#1e3a2f] flex items-center gap-3">
           <Mail className="w-8 h-8 text-[#1e3a2f]" />
           <h1 className="text-2xl font-black tracking-tight">
            {t('contactPage.title') || 'ติดต่อเรา'}
          </h1>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-12 relative">
        <div className="relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-[#2c3e50] mb-3">
              {t('contactPage.sendTitle') || 'ส่งข้อความถึงทีมงาน'}
            </h2>
            <p className="text-gray-500">แจ้งขอเพิ่มข้อมูลผัก โรค หรือแมลงศัตรูพืช</p>
            <div className="w-16 h-1.5 bg-[#2ecc71] rounded-full mx-auto mt-4" />
          </div>

          {/* User Info Card - แสดงข้อมูลผู้ส่งจากระบบ */}
          {user && (
            <div className="mb-8 p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{user.fullname}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-green-200 text-xs text-green-700">
                <p>📧 ข้อความจะส่งจาก: <strong>{user.email}</strong></p>
                <p>📨 ไปยัง: <strong>651413010@crru.ac.th</strong> (ทีมงาน)</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Request Type Select */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 ml-1">
                <Tag className="w-4 h-4 text-gray-400" />
                {t('contactPage.requestType') || 'หัวข้อที่ต้องการติดต่อ'}
              </label>
              <div className="relative group">
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full h-12 pl-4 pr-10 bg-white border border-gray-200 rounded-xl text-gray-600 font-medium focus:bg-white focus:border-[#2ecc71] transition-all appearance-none outline-none cursor-pointer"
                >
                  <option value="" disabled>{t('contactPage.selectType') || 'เลือกหัวข้อ'}</option>
                  {requestTypes.map((type) => (
                    <option key={type.key} value={type.key}>{type.value}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Message Editor */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 ml-1">
                <MessageSquare className="w-4 h-4 text-gray-400" />
                {t('contactPage.message') || 'รายละเอียด'}
              </label>
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200 focus-within:border-[#2ecc71] transition-all">
                <ReactQuill
                  theme="snow"
                  value={formData.message}
                  onChange={(content) => setFormData({ ...formData, message: content })}
                  placeholder={t('contactPage.placeholder') || 'อธิบายรายละเอียดที่ต้องการ...'}
                  className="contact-editor"
                />
              </div>
              <style>{`
                .contact-editor .ql-toolbar {
                  border: none;
                  border-bottom: 1px solid #f1f5f9;
                  background: #f8fafc;
                }
                .contact-editor .ql-container {
                  border: none;
                  min-height: 200px;
                  font-family: inherit;
                  font-size: 0.875rem;
                }
                .contact-editor .ql-editor.ql-blank::before {
                  color: #94a3b8;
                  font-style: normal;
                  font-weight: 500;
                }
              `}</style>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className={`
                  px-8 py-3 bg-[#2ecc71] text-white rounded-xl font-bold 
                  flex items-center justify-center gap-2 transition-all transform
                  hover:bg-[#27ae60] active:scale-95 shadow-lg shadow-green-500/20
                  disabled:opacity-50 disabled:pointer-events-none
                `}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 rotate-[-10deg]" />
                )}
                {t('contactPage.sendMessage') || 'ส่งข้อความ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
