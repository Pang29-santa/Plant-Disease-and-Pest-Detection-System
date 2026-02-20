import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Leaf, MapPin, Camera, Upload, ArrowLeft, User, Phone, Mail, Lock, Eye, EyeOff
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import SearchableSelect from '../../components/SearchableSelect';

const Register = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();
  
  // Form State
  const [formData, setFormData] = useState({
    fullname: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    subdistricts_id: ''
  });
  
  // Location Selection State
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  
  // Image Upload State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch Provinces on Mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get('/api/provinces');
        setProvinces(response.data);
      } catch (err) {
        console.error('Failed to fetch provinces:', err);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch Districts when Province changes
  useEffect(() => {
    if (selectedProvince) {
      const fetchDistricts = async () => {
        try {
          const response = await axios.get(`/api/districts?province_id=${selectedProvince}`);
          setDistricts(response.data);
          setSubdistricts([]); // Clear subdistricts
          setSelectedDistrict(''); // Reset selection
          setFormData(prev => ({ ...prev, subdistricts_id: '' }));
        } catch (err) {
          console.error('Failed to fetch districts:', err);
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
      setSubdistricts([]);
    }
  }, [selectedProvince]);

  // Fetch Subdistricts when District changes
  useEffect(() => {
    if (selectedDistrict) {
      const fetchSubdistricts = async () => {
        try {
          const response = await axios.get(`/api/subdistricts?district_id=${selectedDistrict}`);
          setSubdistricts(response.data);
          setFormData(prev => ({ ...prev, subdistricts_id: '' })); // Reset selection
        } catch (err) {
          console.error('Failed to fetch subdistricts:', err);
        }
      };
      fetchSubdistricts();
    } else {
      setSubdistricts([]);
    }
  }, [selectedDistrict]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!formData.subdistricts_id) {
      setError('Please select district and subdistrict');
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('fullname', formData.fullname);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('password', formData.password);
      data.append('subdistricts_id', formData.subdistricts_id);
      
      if (imageFile) {
        data.append('image', imageFile);
      }

      const result = await register(data);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getLocalizedName = (item) => {
    return i18n.language === 'th' ? item.name_in_thai : item.name_in_english;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary-900 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?q=80&w=2070&auto=format&fit=crop")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 to-primary-800/50 backdrop-blur-sm" />
        
        <div className="relative z-10 w-full flex flex-col justify-between p-12">
          <div>
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <Leaf className="w-5 h-5 text-green-400" />
              <span className="text-white font-medium tracking-wide">Smart Agriculture</span>
            </div>
          </div>
          
          <div className="max-w-md">
            <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
              {t('home.description')}
            </h1>
            <p className="text-lg text-green-100 leading-relaxed">
              เข้าร่วมชุมชนเกษตรกรยุคใหม่ที่ใช้เทคโนโลยีเพื่อผลผลิตที่ดีกว่า
            </p>
          </div>
          
          <div className="flex gap-4 text-green-200 text-sm">
            <span>© 2024 Vegetable Project</span>
            <span>•</span>
            <span>{t('auth.register.terms')}</span>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-12 bg-white overflow-y-auto max-h-screen relative">
        <div className="absolute top-4 left-4 lg:hidden">
          <Link 
            to="/" 
            className="p-2 flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors bg-gray-50 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-bold">{t('nav.home')}</span>
          </Link>
        </div>
        <div className="hidden lg:block absolute top-12 left-12">
           <Link 
            to="/" 
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
          >
            <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg group-hover:bg-white/20 border border-white/10 transition-all">
              <ArrowLeft className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-sm">{t('nav.home')}</span>
          </Link>
        </div>
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <div className="w-full max-w-md space-y-8 py-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              {t('auth.register.title')}
            </h2>
            <p className="mt-2 text-gray-600">
              {t('auth.register.subtitle')}
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center gap-3 animate-fade-in">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Profile Picture Upload */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div 
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg ring-2 ring-gray-100 transition-all group-hover:ring-primary-400">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <User className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full shadow-md hover:bg-primary-700 transition-colors">
                  <Camera className="w-4 h-4" />
                </div>
              </div>
              <span className="mt-2 text-sm text-gray-500 cursor-pointer hover:text-primary-600" onClick={() => fileInputRef.current?.click()}>
                {t('auth.register.uploadPhoto')}
              </span>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            <div className="space-y-4">
              {/* 2. Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.register.fullname')}
                </label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                  <input
                    type="text"
                    value={formData.fullname}
                    onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
                    placeholder="Somchai Jai-dee"
                    required
                  />
                </div>
              </div>

              {/* 3. Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.register.phone')}
                </label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
                    placeholder="0812345678"
                    required
                  />
                </div>
              </div>

              {/* 4. Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.register.email')}
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              {/* 5, 6, 7. Address Selection */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Province */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.register.province')}
                  </label>
                  <SearchableSelect
                    options={provinces}
                    value={selectedProvince}
                    onChange={setSelectedProvince}
                    placeholder={t('auth.register.select')}
                    displayValue={getLocalizedName}
                  />
                </div>

                {/* District */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.register.district')}
                  </label>
                  <SearchableSelect
                    options={districts}
                    value={selectedDistrict}
                    onChange={setSelectedDistrict}
                    placeholder={t('auth.register.select')}
                    disabled={!selectedProvince}
                    displayValue={getLocalizedName}
                  />
                </div>

                {/* Subdistrict */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.register.subdistrict')}
                  </label>
                  <SearchableSelect
                    options={subdistricts}
                    value={formData.subdistricts_id}
                    onChange={(val) => setFormData({ ...formData, subdistricts_id: val })}
                    placeholder={t('auth.register.select')}
                    disabled={!selectedDistrict}
                    displayValue={getLocalizedName}
                  />
                </div>
              </div>

              {/* 8. Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.register.password')}
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* 9. Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.register.confirmPassword')}
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* 10. Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-primary-600 text-white font-semibold rounded-xl
                       hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500/20 
                       active:scale-[0.98] transition-all duration-200 disabled:opacity-50 
                       disabled:cursor-not-allowed shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <Leaf className="w-5 h-5" />
                  {t('auth.register.submit')}
                </>
              )}
            </button>

            {/* 11. Login Link */}
            <p className="text-center text-sm text-gray-600">
              {t('auth.register.haveAccount')}{' '}
              <Link 
                to="/login"
                className="font-semibold text-primary-600 hover:text-primary-700 hover:underline"
              >
                {t('auth.register.login')}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
