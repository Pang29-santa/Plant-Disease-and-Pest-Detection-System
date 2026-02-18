import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { ChevronLeft, Save, Upload, X } from 'lucide-react';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminPestForm = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isEdit = !!id;
    const defaultType = location.state?.defaultType || '2';

    const [formData, setFormData] = useState({
        type: defaultType,
        thai_name: '',
        eng_name: '',
        cause: '',
        cause_en: '',
        description: '',
        description_en: '',
        prevention: '',
        prevention_en: '',
        treatment: '',
        treatment_en: '',
        image_path: ''
    });

    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'clean']
        ],
    };

    useEffect(() => {
        if (isEdit) fetchPest();
    }, [id]);

    const fetchPest = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/diseases-pest/${id}`);
            if (res.data) {
                setFormData(res.data);
                if (res.data.image_path) {
                    setImagePreview(`${import.meta.env.VITE_API_URL}/${res.data.image_path.split('/').map(p => encodeURIComponent(p)).join('/')}`);
                }
            }
        } catch (err) {
            console.error('Failed to fetch pest:', err);
            Swal.fire(t('admin.alerts.error'), t('admin.diseases.form.errorFetch'), 'error');
            navigate('/admin/pests');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleQuillChange = (value, field) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (imagePreview && !imagePreview.includes(import.meta.env.VITE_API_URL)) {
                URL.revokeObjectURL(imagePreview);
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.thai_name) {
            return Swal.fire(t('admin.alerts.warning'), t('admin.diseases.form.warnThaiName'), 'warning');
        }

        try {
            setLoading(true);
            let imagePath = formData.image_path;

            if (imageFile) {
                const uploadData = new FormData();
                uploadData.append('file', imageFile);
                const uploadRes = await axios.post('/api/diseases-pest/upload', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (uploadRes.data.success) {
                    imagePath = uploadRes.data.image_path;
                }
            }

            const dataToSubmit = { ...formData, image_path: imagePath };
            delete dataToSubmit._id; 

            if (isEdit) {
                await axios.put(`/api/diseases-pest/${id}`, dataToSubmit);
                await Swal.fire(t('admin.alerts.success'), t('admin.diseases.form.successSave'), 'success');
            } else {
                await axios.post('/api/diseases-pest', dataToSubmit);
                await Swal.fire(t('admin.alerts.success'), t('admin.diseases.form.successAdd'), 'success');
            }
            navigate('/admin/pests');
        } catch (err) {
            console.error('Error saving:', err);
            Swal.fire(t('admin.alerts.error'), t('admin.diseases.form.errorSave'), 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout title={isEdit ? t('admin.diseases.form.editTitle') : t('admin.diseases.form.addTitle')}>
            <div className="mb-6">
                <Link to="/admin/pests" className="inline-flex items-center text-gray-600 hover:text-green-600 transition-colors">
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    {t('admin.diseases.form.back')}
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 w-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b">
                    {isEdit ? t('admin.diseases.form.editTitle') : t('admin.diseases.form.addTitle')}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.diseases.form.type')}</label>
                            <input
                                type="text"
                                value={`${t('admin.diseases.types.pest')} (Pest)`}
                                disabled
                                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.diseases.form.thaiName')} <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="thai_name"
                                value={formData.thai_name || ''}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition-shadow"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.diseases.form.engName')}</label>
                            <input
                                type="text"
                                name="eng_name"
                                value={formData.eng_name || ''}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition-shadow"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.diseases.form.coverImage')}</label>
                        <div className="flex items-start space-x-4">
                            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50 relative group">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Upload className="w-8 h-8 text-gray-400" />
                                )}
                            </div>
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-green-50 file:text-green-700
                                    hover:file:bg-green-100 transition-all"
                                />
                                <p className="mt-2 text-xs text-gray-500">JPG, PNG, WEBP (Max 5MB)</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-12">
                        {[
                            { label: t('admin.diseases.form.causeTh'), field: 'cause' },
                            { label: t('admin.diseases.form.causeEn'), field: 'cause_en' },
                            { label: t('admin.diseases.form.symptomsTh'), field: 'description' },
                            { label: t('admin.diseases.form.symptomsEn'), field: 'description_en' },
                            { label: t('admin.diseases.form.preventionTh'), field: 'prevention' },
                            { label: t('admin.diseases.form.preventionEn'), field: 'prevention_en' },
                            { label: t('admin.diseases.form.treatmentTh'), field: 'treatment' },
                            { label: t('admin.diseases.form.treatmentEn'), field: 'treatment_en' }
                        ].map((item, idx) => (
                            <div key={idx}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{item.label}</label>
                                <div className="h-64 mb-12">
                                    <ReactQuill 
                                        theme="snow"
                                        value={formData[item.field] || ''}
                                        onChange={(val) => handleQuillChange(val, item.field)}
                                        modules={modules}
                                        className="h-full"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t">
                        <Link to="/admin/pests" className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center transition-colors">
                            <X className="w-4 h-4 mr-2" /> {t('admin.diseases.form.cancel')}
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50 transition-colors"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? t('admin.diseases.form.saving') : t('admin.diseases.form.save')}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default AdminPestForm;
