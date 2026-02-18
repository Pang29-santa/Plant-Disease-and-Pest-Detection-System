import React, { useState, useEffect, useRef } from 'react';
import { User, Send, ChevronLeft, ArrowRight, ShieldCheck, Mail, Calendar, Phone, Edit2, Save, X, Camera, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import SearchableSelect from '../../components/SearchableSelect';

const ProfilePage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { user, login } = useAuth(); // We might need to refresh user data context
    
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        phone: '',
        subdistricts_id: ''
    });
    
    // Location Selection State
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [subdistricts, setSubdistricts] = useState([]);
    
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');

    const fileInputRef = useRef(null);

    // Initial Data Loading
    useEffect(() => {
        if (user) {
            setFormData({
                fullname: user.fullname || '',
                email: user.email || '',
                phone: user.phone || '',
                subdistricts_id: user.subdistricts_id || ''
            });

             // If user has location data, we need to pre-fill the location selectors
             // This can be complex depending on API.
             // Strategy:
             // 1. Fetch user's full location details if only ID is stored, or use what's in 'user' object if populated
             // 2. Fetch all provinces
             // 3. Then trigger district/subdistrict fetches
             
             // For now, let's just fetch provinces and if we have location info, try to set it.
             // Assuming user object might have nested location info or we need to fetch it.
             // Let's check how Register does it. It only sets ID.
             // If we only have subdistricts_id, we need to reverse lookup to find province and district.
             // Or, we can just let user pick new ones if they want to change.
             // Better user experience: Show current location text if available, and selectors to change.
             
             if (user.subdistricts_id) {
                 fetchLocationDetails(user.subdistricts_id);
             }
        }
    }, [user]);

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
                // Only clear if manual change, not initial load
                if (!loadingLocation) {
                     setSubdistricts([]); 
                     setSelectedDistrict(''); 
                     setFormData(prev => ({ ...prev, subdistricts_id: '' }));
                }
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
                 if (!loadingLocation) {
                    setFormData(prev => ({ ...prev, subdistricts_id: '' }));
                 }
                } catch (err) {
                console.error('Failed to fetch subdistricts:', err);
                }
            };
            fetchSubdistricts();
        } else {
            setSubdistricts([]);
        }
    }, [selectedDistrict]);

    const [loadingLocation, setLoadingLocation] = useState(false);

    const fetchLocationDetails = async (subdistrictId) => {
        if (!subdistrictId) return; // Add check to prevent undefined ID calls
        setLoadingLocation(true);
        try {
            // Need an API to get full hierarchy from subdistrict ID
            // Or fetch subdistrict -> get district_id -> fetch district -> get province_id
            
            // 1. Get Subdistrict
            const subRes = await axios.get(`/api/subdistricts/${subdistrictId}`);
            const subData = subRes.data;
            
            // 2. Get District
            const districtId = subData.district_id || subData.districts_id;
            if (!districtId) {
                 console.warn("No district ID found for subdistrict:", subData);
                 setLoadingLocation(false);
                 return;
            }
            const distRes = await axios.get(`/api/districts/${districtId}`);
            const distData = distRes.data;
            
            // 3. Set State in order (wait for effects?)
            // Setting state directly to trigger effects correctly is tricky.
            // Better to manually populate options if possible, or sequence state updates.
            
            setSelectedProvince(distData.provinces_id || distData.province_id);
            // Wait for province effect? No, let's just set the ID and let the effect run.
            // But effect clears downstream data. We need a flag. -> used loadingLocation flag
            
            // We need to wait for districts to load before setting selectedDistrict
            const districtsRes = await axios.get(`/api/districts?province_id=${distData.provinces_id || distData.province_id}`);
            setDistricts(districtsRes.data);
            setSelectedDistrict(districtId);

            const subdistrictsRes = await axios.get(`/api/subdistricts?district_id=${districtId}`);
            setSubdistricts(subdistrictsRes.data);
            
            // FormData is already set from user object
            
        } catch (err) {
            console.error("Failed to load location details", err);
        } finally {
            setLoadingLocation(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Check file type
        if (!file.type.startsWith('image/')) {
            Swal.fire({
                icon: 'error',
                title: t('profile.alerts.invalidFile'),
                text: t('profile.alerts.invalidFileText'),
            });
            return;
        }
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            Swal.fire({
                icon: 'error',
                title: t('profile.alerts.fileTooLarge'),
                text: t('profile.alerts.fileTooLargeText'),
            });
            return;
        }
        
        setUploading(true);
        const imageFormData = new FormData();
        imageFormData.append('file', file); // Use 'file' as key to match backend expectation
        
        try {
            // 1. Upload Image
            const uploadResponse = await axios.post('/api/users/upload', imageFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            if (uploadResponse.data && uploadResponse.data.image_path) {
                // 2. Update User Profile with new image path
                const userId = user._id || user.id;
                const updateData = {
                    ...formData,
                    image_path: uploadResponse.data.image_path
                };
                
                await axios.put(`/api/users/${userId}`, updateData);
                
                Swal.fire({
                    icon: 'success',
                    title: t('profile.alerts.uploadSuccess'),
                    text: t('profile.alerts.uploadSuccessText'),
                    timer: 1500,
                    showConfirmButton: false
                });
                
                // Refresh page/context
                window.location.reload();
            }
        } catch (error) {
            console.error('Image upload failed:', error);
             Swal.fire({
                icon: 'error',
                title: t('common.error'),
                text: error.response?.data?.detail || t('profile.alerts.uploadError')
            });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Determine user ID (use _id if available, fallback to user_id for some legacy cases or mock)
            const userId = user._id || user.id; 
            
            // Call API to update user
            const response = await axios.put(`/api/users/${userId}`, formData);
            
            if (response.data) {
                // Success
                Swal.fire({
                    icon: 'success',
                    title: t('common.success'),
                    text: t('profile.alerts.updateSuccessText'),
                    timer: 1500,
                    showConfirmButton: false
                });
                
                window.location.reload(); 
            }
        } catch (error) {
            console.error('Update failed:', error);
            Swal.fire({
                icon: 'error',
                title: t('common.error'),
                text: error.response?.data?.detail || t('profile.alerts.updateError')
            });
        } finally {
            setLoading(false);
        }
    };
    
    const getLocalizedName = (item) => {
        return i18n.language === 'th' ? item.name_in_thai : item.name_in_english;
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 w-full overflow-x-hidden">
            <div className="max-w-3xl mx-auto w-full md:px-4 md:mt-8">
                <div className="bg-white rounded-none md:rounded-[3rem] shadow-none md:shadow-2xl md:shadow-primary-200/50 overflow-hidden border-b md:border border-white">
                    {/* Header with Green Theme */}
                    <div className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 px-6 py-12 sm:p-12 text-center text-white overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="relative z-10 flex flex-col items-center">
                          {/* Profile Image with Edit Overlay */}
                          <div 
                            className="w-32 h-32 rounded-[2.5rem] border-4 border-white/20 overflow-hidden bg-white/10 backdrop-blur-md mb-6 shadow-2xl relative group cursor-pointer"
                            onClick={handleImageClick}
                          >
                              {uploading ? (
                                  <div className="w-full h-full flex items-center justify-center bg-black/50">
                                      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  </div>
                              ) : (
                                  <>
                                    {user?.image_path ? (
                                        <img src={`${import.meta.env.VITE_API_URL}/${user.image_path}`} alt={t('nav.profile')} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User className="w-16 h-16 text-white/50" />
                                        </div>
                                    )}
                                    
                                    {/* Camera Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center duration-300">
                                        <Camera className="w-8 h-8 text-white drop-shadow-md" />
                                    </div>
                                  </>
                              )}
                              
                              <input 
                                  type="file" 
                                  ref={fileInputRef} 
                                  className="hidden" 
                                  accept="image/jpeg,image/png"
                                  onChange={handleImageChange}
                              />
                          </div>

                          {/* Email Display */}
                          <div className="transition-all duration-300 opacity-100 w-full px-2">
                             <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 truncate max-w-full">{user?.fullname}</h1>
                              <div className="flex items-center justify-center gap-2 text-primary-100 font-bold bg-white/10 px-4 py-1.5 rounded-full mx-auto w-fit backdrop-blur-sm max-w-full">
                                <Mail className="w-4 h-4 flex-shrink-0" />
                                <p className="text-sm truncate">{user?.email}</p>
                              </div>
                          </div>
                        </div>
                    </div>
                    
                    <div className="p-6 sm:p-12">
                         {/* Edit Form - Always Visible */}
                         <form onSubmit={handleSubmit} className="space-y-6 mb-12">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">{t('auth.register.fullname')}</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                                        </div>
                                        <input 
                                            type="text"
                                            name="fullname"
                                            value={formData.fullname}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold text-gray-800"
                                            placeholder={t('profile.placeholders.fullname')}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">{t('auth.register.email')}</label>
                                    <div className="relative group">
                                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                                        </div>
                                        <input 
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold text-gray-800"
                                            placeholder={t('profile.placeholders.email')}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">{t('auth.register.phone')}</label>
                                    <div className="relative group">
                                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                                        </div>
                                        <input 
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold text-gray-800"
                                            placeholder={t('profile.placeholders.phone')}
                                        />
                                    </div>
                                </div>
                                
                                {/* Address Section */}
                                <div className="pt-4 border-t border-gray-100">
                                    <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-primary-600" />
                                        {t('admin.users.form.location')}
                                    </h3>
                                    <div className="grid grid-cols-1 gap-5">
                                        {/* Province */}
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
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
                                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
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
                                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                                                {t('auth.register.subdistrict')}
                                            </label>
                                            <SearchableSelect
                                                options={subdistricts}
                                                value={formData.subdistricts_id}
                                                onChange={(val) => setFormData(prev => ({ ...prev, subdistricts_id: val }))}
                                                placeholder={t('auth.register.select')}
                                                disabled={!selectedDistrict}
                                                displayValue={getLocalizedName}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/30 flex items-center justify-center gap-2 active:scale-[0.98] mt-8"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        {t('common.save')}
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="space-y-6 animate-fadeIn border-t border-gray-100 pt-8">
                            <h3 className="text-lg font-black text-gray-900 mb-4 ml-1">{t('profile.connectedServices')}</h3>
                            {/* Telegram Block */}
                            <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 gap-6 group hover:shadow-xl hover:shadow-blue-100/40 transition-all duration-500">
                                 <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-white rounded-[1.2rem] flex items-center justify-center text-blue-500 shadow-sm border border-blue-100 group-hover:scale-110 transition-transform flex-shrink-0">
                                        <Send className="w-7 h-7" />
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('profile.telegramConnection')}</p>
                                        <p className={`font-black text-lg ${user?.telegram_chat_id ? 'text-blue-600' : 'text-gray-400'}`}>
                                            {user?.telegram_chat_id ? t('telegramPage.status.connected') : t('telegramPage.status.not_connected')}
                                        </p>
                                    </div>
                                 </div>
                                 <button 
                                    onClick={() => navigate('/telegram')}
                                    className="w-full sm:w-auto px-8 py-3 bg-white border border-blue-200 text-blue-600 rounded-2xl text-sm font-black hover:bg-blue-50 transition-all active:scale-95 shadow-sm hover:shadow-md"
                                 >
                                     {t('profile.manage')}
                                 </button>
                            </div>
                        </div>

                        <button 
                            onClick={() => navigate('/')}
                            className="w-full mt-12 py-5 bg-gray-900 text-white rounded-[2rem] font-black hover:bg-black transition-all shadow-xl shadow-gray-900/30 flex items-center justify-center gap-3 group active:scale-95"
                        >
                            {t('profile.backHome')}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
