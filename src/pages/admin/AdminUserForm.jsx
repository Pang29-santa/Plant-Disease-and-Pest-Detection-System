import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/admin/AdminLayout';
import { ArrowLeft, Upload, Save, RotateCcw, User as UserIcon } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

const AdminUserForm = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        fullname: '',
        phone: '',
        email: '',
        password: '',
        role: 'user',
        status: 'active',
        subdistricts_id: '',
        image_path: ''
    });

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [subdistricts, setSubdistricts] = useState([]);
    
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProvinces();
        if (isEdit) {
            if (id === 'undefined') {
                navigate('/admin/users');
                return;
            }
            fetchUserData();
        }
    }, [id]);

    const fetchProvinces = async () => {
        try {
            const res = await axios.get('/api/provinces');
            setProvinces(res.data);
        } catch (err) {
            console.error('Failed to fetch provinces:', err);
        }
    };

    const fetchDistricts = async (provinceId) => {
        try {
            const res = await axios.get(`/api/districts?province_id=${provinceId}`);
            setDistricts(res.data);
            setSubdistricts([]);
        } catch (err) {
            console.error('Failed to fetch districts:', err);
        }
    };

    const fetchSubdistricts = async (districtId) => {
        try {
            const res = await axios.get(`/api/subdistricts?district_id=${districtId}`);
            setSubdistricts(res.data);
        } catch (err) {
            console.error('Failed to fetch subdistricts:', err);
        }
    };

    const fetchUserData = async () => {
        try {
            const res = await axios.get(`/api/users/${id}`);
            const user = res.data;
            setFormData({
                ...user,
                password: '' // Don't show password
            });
            if (user.image_path) {
                setPreviewImage(`${import.meta.env.VITE_API_URL}/${user.image_path}`);
            }
            
            if (user.subdistricts_id) {
                try {
                    const locRes = await axios.get(`/api/location/full/${user.subdistricts_id}`);
                    const { province, district } = locRes.data;
                    if (province) {
                        setSelectedProvince(province.id);
                        await fetchDistricts(province.id);
                    }
                    if (district) {
                        setSelectedDistrict(district.id);
                        await fetchSubdistricts(district.id);
                    }
                } catch (locErr) {
                    console.error('Failed to fetch location details:', locErr);
                }
            }
        } catch (err) {
            console.error('Failed to fetch user data:', err);
            Swal.fire(t('admin.alerts.error'), t('admin.users.confirm.error'), 'error');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProvinceChange = (e) => {
        const provinceId = e.target.value;
        setSelectedProvince(provinceId);
        setSelectedDistrict('');
        setFormData(prev => ({ ...prev, subdistricts_id: '' }));
        if (provinceId) fetchDistricts(provinceId);
        else {
            setDistricts([]);
            setSubdistricts([]);
        }
    };

    const handleDistrictChange = (e) => {
        const districtId = e.target.value;
        setSelectedDistrict(districtId);
        setFormData(prev => ({ ...prev, subdistricts_id: '' }));
        if (districtId) fetchSubdistricts(districtId);
        else setSubdistricts([]);
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);

            const uploadData = new FormData();
            uploadData.append('file', file);
            try {
                const res = await axios.post('/api/users/upload', uploadData);
                setFormData(prev => ({ ...prev, image_path: res.data.image_path }));
            } catch (err) {
                console.error('Upload failed:', err);
                Swal.fire(t('admin.alerts.error'), 'Upload failed', 'error');
            }
        }
    };

    const handleClear = () => {
        setFormData({
            fullname: '',
            phone: '',
            email: '',
            password: '',
            role: 'user',
            status: 'active',
            subdistricts_id: '',
            image_path: ''
        });
        setSelectedProvince('');
        setSelectedDistrict('');
        setPreviewImage(null);
        setDistricts([]);
        setSubdistricts([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.fullname || !formData.phone || !formData.email) {
            return Swal.fire(t('admin.alerts.warning'), t('admin.users.form.validation.required'), 'warning');
        }
        if (!isEdit && !formData.password) {
            return Swal.fire(t('admin.alerts.warning'), t('admin.users.form.validation.passwordRequired'), 'warning');
        }

        try {
            setLoading(true);
            if (isEdit) {
                const submitData = { ...formData };
                if (!submitData.password) delete submitData.password;
                delete submitData.id;
                delete submitData._id;
                
                await axios.put(`/api/users/${id}`, submitData);
                await Swal.fire(t('admin.alerts.success'), t('admin.users.confirm.success', { action: t('common.save') }), 'success');
            } else {
                await axios.post('/api/users', formData);
                await Swal.fire(t('admin.alerts.success'), t('admin.users.confirm.success', { action: t('common.add') }), 'success');
            }
            navigate('/admin/users');
        } catch (err) {
            console.error('Save failed:', err);
            const msg = err.response?.data?.detail || t('admin.users.confirm.error');
            Swal.fire(t('admin.alerts.error'), msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout title={isEdit ? t('admin.users.form.titleEdit') : t('admin.users.form.titleNew')}>
            <div className="mb-6">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="flex items-center text-gray-600 hover:text-green-600 transition"
                >
                    <ArrowLeft className="w-5 h-5 mr-1" />
                    {t('admin.users.form.back')}
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <form onSubmit={handleSubmit} className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Image */}
                        <div className="flex flex-col items-center">
                            <div className="relative group">
                                <div className="w-48 h-48 rounded-full bg-gray-100 border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
                                    {previewImage ? (
                                        <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="w-20 h-20 text-gray-300" />
                                    )}
                                </div>
                                <label className="absolute bottom-2 right-2 p-3 bg-green-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-green-700 transition transform group-hover:scale-110">
                                    <Upload className="w-5 h-5" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                            <p className="mt-4 text-sm text-gray-500 font-medium">{t('admin.users.form.uploadImage')}</p>
                            <p className="text-xs text-gray-400 mt-1">{t('admin.users.form.imageHint')}</p>
                        </div>

                        {/* Form Fields */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('admin.users.form.fullname')} <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="fullname"
                                        value={formData.fullname}
                                        onChange={handleChange}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:bg-white transition outline-none"
                                        placeholder={t('admin.users.form.fullnamePlaceholder')}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('admin.users.form.phone')} <span className="text-red-500">*</span></label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:bg-white transition outline-none"
                                        placeholder={t('admin.users.form.phonePlaceholder')}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('admin.users.form.email')} <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:bg-white transition outline-none"
                                        placeholder={t('admin.users.form.emailPlaceholder')}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('admin.users.form.password')} <span className="text-red-500">{isEdit ? t('admin.users.form.passwordHint') : '*'}</span></label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:bg-white transition outline-none"
                                        placeholder={t('admin.users.form.passwordPlaceholder')}
                                        required={!isEdit}
                                    />
                                </div>
                            </div>

                            {/* Location Section */}
                            <div className="bg-green-50 p-6 rounded-xl border border-green-100 mt-8">
                                <h3 className="text-md font-bold text-green-800 mb-4">{t('admin.users.form.location')}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('admin.users.form.selectProvince')}</label>
                                        <select
                                            value={selectedProvince}
                                            onChange={handleProvinceChange}
                                            className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                        >
                                            <option value="">{t('admin.users.form.selectProvince')}</option>
                                            {provinces.map(p => (
                                                <option key={p.id} value={p.id}>{p.name_in_thai}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('admin.users.form.selectDistrict')}</label>
                                        <select
                                            value={selectedDistrict}
                                            onChange={handleDistrictChange}
                                            disabled={!selectedProvince}
                                            className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        >
                                            <option value="">{t('admin.users.form.selectDistrict')}</option>
                                            {districts.map(d => (
                                                <option key={d.id} value={d.id}>{d.name_in_thai}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">{t('admin.users.form.selectSubdistrict')}</label>
                                        <select
                                            name="subdistricts_id"
                                            value={formData.subdistricts_id}
                                            onChange={handleChange}
                                            disabled={!selectedDistrict}
                                            className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        >
                                            <option value="">{t('admin.users.form.selectSubdistrict')}</option>
                                            {subdistricts.map(s => (
                                                <option key={s.id} value={s.id}>{s.name_in_thai}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Role Selection */}
                            <div className="flex gap-6 pt-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('admin.users.form.role')}</label>
                                    <div className="flex gap-4">
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="role"
                                                value="user"
                                                checked={formData.role === 'user'}
                                                onChange={handleChange}
                                                className="hidden"
                                            />
                                            <span className={`px-4 py-2 rounded-lg border ${formData.role === 'user' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                                                {t('admin.roles.user')}
                                            </span>
                                        </label>
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="role"
                                                value="admin"
                                                checked={formData.role === 'admin'}
                                                onChange={handleChange}
                                                className="hidden"
                                            />
                                            <span className={`px-4 py-2 rounded-lg border ${formData.role === 'admin' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                                                {t('admin.roles.admin')}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-8 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 flex items-center justify-center gap-2 transition disabled:opacity-50"
                                >
                                    <Save className="w-5 h-5" />
                                    {loading ? t('admin.diseases.form.saving') : t('admin.users.form.buttons.save')}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="px-8 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 rounded-xl transition flex items-center gap-2"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                    {t('admin.users.form.buttons.clear')}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default AdminUserForm;
