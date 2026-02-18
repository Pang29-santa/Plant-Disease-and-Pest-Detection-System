import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { ChevronLeft, Save, Upload, X, Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminDiseaseForm = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isEdit = !!id;
    const defaultType = location.state?.defaultType || '1';

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
    });

    const [existingCover, setExistingCover] = useState(null);
    const [newCover, setNewCover] = useState(null);
    const [existingGallery, setExistingGallery] = useState([]);
    const [newGallery, setNewGallery] = useState([]);
    const [loading, setLoading] = useState(false);

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'clean']
        ],
    };

    useEffect(() => {
        if (isEdit) fetchDisease();
    }, [id]);

    useEffect(() => {
        return () => {
            if (newCover?.preview) URL.revokeObjectURL(newCover.preview);
            newGallery.forEach(item => URL.revokeObjectURL(item.preview));
        };
    }, [newCover, newGallery]);

    const fetchDisease = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/diseases-pest/${id}`);
            if (res.data) {
                setFormData({
                    type: res.data.type || defaultType,
                    thai_name: res.data.thai_name || '',
                    eng_name: res.data.eng_name || '',
                    cause: res.data.cause || '',
                    cause_en: res.data.cause_en || '',
                    description: res.data.description || '',
                    description_en: res.data.description_en || '',
                    prevention: res.data.prevention || '',
                    prevention_en: res.data.prevention_en || '',
                    treatment: res.data.treatment || '',
                    treatment_en: res.data.treatment_en || '',
                });

                const images = res.data.image_paths || (res.data.image_path ? [res.data.image_path] : []);
                if (images.length > 0) {
                    setExistingCover(images[0]);
                    setExistingGallery(images.slice(1));
                }
            }
        } catch (err) {
            console.error('Failed to fetch disease:', err);
            Swal.fire(t('admin.alerts.error'), t('admin.diseases.form.errorFetch'), 'error');
            navigate('/admin/diseases');
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

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (newCover?.preview) URL.revokeObjectURL(newCover.preview);
        setNewCover({ file, preview: URL.createObjectURL(file) });
        e.target.value = '';
    };

    const removeCover = () => {
        if (newCover) {
            URL.revokeObjectURL(newCover.preview);
            setNewCover(null);
        }
        setExistingCover(null);
    };

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const totalImages = (newCover || existingCover ? 1 : 0) + existingGallery.length + newGallery.length + files.length;
        if (totalImages > 5) {
             Swal.fire(t('admin.alerts.warning'), t('admin.diseases.form.maxImagesWarning'), 'warning');
             return;
        }

        const newItems = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
        setNewGallery(prev => [...prev, ...newItems]);
        e.target.value = '';
    };

    const removeExistingGallery = (index) => setExistingGallery(prev => prev.filter((_, i) => i !== index));
    const removeNewGallery = (index) => {
        URL.revokeObjectURL(newGallery[index].preview);
        setNewGallery(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.thai_name) {
            return Swal.fire(t('admin.alerts.warning'), t('admin.diseases.form.warnThaiName'), 'warning');
        }

        try {
            setLoading(true);
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));

            if (isEdit) {
                if (newCover) data.append('cover_image', newCover.file);
                if (existingCover) data.append('existing_cover_path', existingCover);
                newGallery.forEach(item => data.append('gallery_images', item.file));
                data.append('existing_gallery_paths', JSON.stringify(existingGallery));
                
                await axios.put(`/api/diseases-pest/${id}/with-images`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
                await Swal.fire(t('admin.alerts.success'), t('admin.diseases.form.successSave'), 'success');
            } else {
                if (newCover) data.append('cover_image', newCover.file);
                newGallery.forEach(item => data.append('gallery_images', item.file));
                await axios.post('/api/diseases-pest/with-images', data, { headers: { 'Content-Type': 'multipart/form-data' } });
                await Swal.fire(t('admin.alerts.success'), t('admin.diseases.form.successAdd'), 'success');
            }
            navigate('/admin/diseases');
        } catch (err) {
            console.error('Error saving:', err);
            Swal.fire(t('admin.alerts.error'), `${t('admin.diseases.form.errorSave')}: ${err.response?.data?.detail || err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (path) => `${import.meta.env.VITE_API_URL}/${path.split('/').map(p => encodeURIComponent(p)).join('/')}`;

    return (
        <AdminLayout title={isEdit ? t('admin.diseases.form.editTitle') : t('admin.diseases.form.addTitle')}>
            <div className="mb-6">
                <Link to="/admin/diseases" className="inline-flex items-center text-gray-600 hover:text-green-600 transition-colors">
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
                                value={formData.type === '1' ? `${t('admin.diseases.types.disease')} (Disease)` : `${t('admin.diseases.types.pest')} (Pest)`}
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
                                value={formData.thai_name}
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
                                value={formData.eng_name}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition-shadow"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('admin.diseases.form.coverImage')} <span className="text-red-500">*</span>
                        </label>
                        
                        <div className={`relative w-full h-64 rounded-lg flex flex-col items-center justify-center overflow-hidden group border-2 border-dashed transition-all ${
                            (newCover || existingCover) ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                        }`}>
                            {(newCover || existingCover) ? (
                                <>
                                    <img 
                                        src={newCover ? newCover.preview : getImageUrl(existingCover)} 
                                        alt="Cover" 
                                        className="w-full h-full object-contain"
                                        onError={(e) => e.target.src = 'https://placehold.co/400?text=No+Image'}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={removeCover}
                                            className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all transform hover:scale-110"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                                    <Upload className="w-10 h-10 text-gray-400 mb-3" />
                                    <span className="text-sm text-gray-600 font-medium">{t('admin.diseases.form.uploadCover')}</span>
                                    <span className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP</span>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleCoverChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
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

                    <div className="pt-8 border-t">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                             <Upload className="w-5 h-5 text-green-600" /> {t('admin.diseases.form.galleryImages')}
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {existingGallery.map((path, index) => (
                                <div key={`exist-${index}`} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group">
                                    <img src={getImageUrl(path)} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingGallery(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            {newGallery.map((item, index) => (
                                <div key={`new-${index}`} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group">
                                    <img src={item.preview} alt={`New Gallery ${index}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeNewGallery(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            {((existingCover || newCover ? 1 : 0) + existingGallery.length + newGallery.length < 5) && (
                                <label className="flex flex-col items-center justify-center aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                    <Plus className="w-6 h-6 text-gray-400 mb-1" />
                                    <span className="text-xs text-gray-500">{t('admin.diseases.form.addImage')}</span>
                                    <input type="file" accept="image/*" multiple onChange={handleGalleryChange} className="hidden" />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t">
                        <Link to="/admin/diseases" className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center transition-colors">
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

export default AdminDiseaseForm;
