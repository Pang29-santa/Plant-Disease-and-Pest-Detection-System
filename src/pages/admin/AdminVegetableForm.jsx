import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';
import { ChevronLeft, Save, Plus, Trash2, Upload, X } from 'lucide-react';
import Swal from 'sweetalert2';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const AdminVegetableForm = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        thai_name: '',
        eng_name: '',
        sci_name: '',
        growth: '',
        planting_method: '',
        planting_method_en: '',
        care: '',
        care_en: '',
        details: '',
        details_en: '',
        vegetable_id: ''
    });

    const [existingCover, setExistingCover] = useState(null);
    const [newCover, setNewCover] = useState(null);
    const [existingGallery, setExistingGallery] = useState([]);
    const [newGallery, setNewGallery] = useState([]);
    const [nutritionList, setNutritionList] = useState([]);
    const [nutritionOptions, setNutritionOptions] = useState([]);
    const [selectedNutrientId, setSelectedNutrientId] = useState('');
    const [nutAmount, setNutAmount] = useState('');
    const [nutUnit, setNutUnit] = useState('g');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEditMode) fetchVegetableData();
        fetchNutritionOptions();
    }, [id]);

    useEffect(() => {
        return () => {
            if (newCover?.preview) URL.revokeObjectURL(newCover.preview);
            newGallery.forEach(item => URL.revokeObjectURL(item.preview));
        };
    }, [newCover, newGallery]);

    const fetchNutritionOptions = async () => {
        try {
            const res = await axios.get('/api/nutrition');
            if (Array.isArray(res.data)) setNutritionOptions(res.data);
        } catch (err) {
            console.error("Failed to fetch nutrition options", err);
        }
    };

    const fetchVegetableData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/vegetable/${id}`);
            if (res.data) {
                setFormData({
                    thai_name: res.data.thai_name || '',
                    eng_name: res.data.eng_name || '',
                    sci_name: res.data.sci_name || '',
                    growth: res.data.growth || '',
                    planting_method: res.data.planting_method || '',
                    planting_method_en: res.data.planting_method_en || '',
                    care: res.data.care || '',
                    care_en: res.data.care_en || '',
                    details: res.data.details || '',
                    details_en: res.data.details_en || '',
                    vegetable_id: res.data.vegetable_id || res.data.id || ''
                });

                const images = Array.isArray(res.data.image_paths) ? res.data.image_paths : (res.data.image_path ? [res.data.image_path] : []);
                if (images.length > 0) {
                    setExistingCover(images[0]);
                    setExistingGallery(images.slice(1));
                }
                fetchNutritionData(id);
            }
        } catch (error) {
            console.error("Error fetching vegetable:", error);
            Swal.fire(t('admin.alerts.error'), t('admin.vegetables.errorFetch'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchNutritionData = async (vegId) => {
        try {
            const res = await axios.get(`/api/vegetable/${vegId}/nutrition`);
            if (res.data?.nutrition) {
                setNutritionList(res.data.nutrition.map(n => ({
                    nutrition_id: n.nutrition_id,
                    nutrient_name: n.nutrient_name || n.nutrition_name,
                    amount: n.nutrition_qty || n.amount,
                    unit: n.unit
                })));
            }
        } catch (error) {
            console.error("Error fetching nutrition:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditorChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (newCover?.preview) URL.revokeObjectURL(newCover.preview);
        setNewCover({ file, preview: URL.createObjectURL(file) });
        e.target.value = '';
    };

    const removeCover = () => {
        if (newCover?.preview) URL.revokeObjectURL(newCover.preview);
        setNewCover(null);
        setExistingCover(null);
    };

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const hasCover = (newCover || existingCover) ? 1 : 0;
        const currentGallery = existingGallery.length + newGallery.length;
        
        if (hasCover + currentGallery + files.length > 5) {
             Swal.fire(t('admin.alerts.warning'), t('admin.vegetables.errorUploadLimit'), 'warning');
             return;
        }

        const newItems = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
        setNewGallery([...newGallery, ...newItems]);
        e.target.value = '';
    };

    const addNutrition = () => {
        if (!selectedNutrientId || !nutAmount) return;
        const selectedNutrient = nutritionOptions.find(n => (n.nutrition_id?.toString() === selectedNutrientId.toString()) || (n._id?.toString() === selectedNutrientId.toString()));
        if (selectedNutrient) {
            setNutritionList([...nutritionList, {
                nutrition_id: selectedNutrient.nutrition_id,
                nutrient_name: selectedNutrient.nutrition_name || selectedNutrient.nutrient_name,
                amount: parseFloat(nutAmount),
                unit: nutUnit
            }]);
            setSelectedNutrientId('');
            setNutAmount('');
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            
            if (isEditMode) {
                if (newCover) data.append('cover_image', newCover.file);
                if (existingCover) data.append('existing_cover_path', existingCover);
                newGallery.forEach(item => data.append('gallery_images', item.file));
                data.append('existing_gallery_paths', JSON.stringify(existingGallery));
            } else {
                if (newCover) data.append('cover_image', newCover.file);
                newGallery.forEach(item => data.append('gallery_images', item.file));
            }

            const response = isEditMode 
                ? await axios.put(`/api/vegetable/${id}/with-images`, data, { headers: { 'Content-Type': 'multipart/form-data' }})
                : await axios.post('/api/vegetable/with-images', data, { headers: { 'Content-Type': 'multipart/form-data' }});

            if (response.data) {
                const vegDbId = response.data._id || response.data.id;
                if (nutritionList.length > 0) {
                    const nutritionPayload = nutritionList.map(item => ({
                        nutrition_id: item.nutrition_id, 
                        nutrient_name: item.nutrient_name,
                        nutrition_qty: parseFloat(item.amount),
                        unit: item.unit
                    }));
                    await axios.post(`/api/vegetable/${vegDbId}/nutrition`, nutritionPayload);
                }
                Swal.fire(t('admin.alerts.success'), t('admin.alerts.successSave'), 'success').then(() => navigate('/admin/vegetables'));
            }
        } catch (error) {
            console.error("Error saving vegetable:", error);
            Swal.fire(t('admin.alerts.error'), `${t('admin.alerts.errorSave')}: ${error.response?.data?.detail || error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };
    
    const modules = {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{'list': 'ordered'}, {'list': 'bullet'}],
          ['link', 'clean']
        ],
    };

    const getImageUrl = (path) => `${import.meta.env.VITE_API_URL}/${path.split('/').map(p => encodeURIComponent(p)).join('/')}`;

    return (
        <AdminLayout title={isEditMode ? t('admin.vegetables.edit') : t('admin.vegetables.add')}>
            <div className="w-full mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4 mb-6 border-b pb-4">
                    <button onClick={() => navigate('/admin/vegetables')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">{isEditMode ? t('admin.vegetables.edit') : t('admin.vegetables.add')}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        {[
                            { label: t('admin.vegetables.form.thaiName'), name: 'thai_name', placeholder: t('admin.vegetables.form.nutrition.placeholder') },
                            { label: t('admin.vegetables.form.engName'), name: 'eng_name', placeholder: 'Example: Tomato' },
                            { label: t('admin.vegetables.form.sciName'), name: 'sci_name' },
                            { label: t('admin.vegetables.form.growth'), name: 'growth', type: 'number' }
                        ].map(field => (
                            <div key={field.name}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                                <input
                                    type={field.type || 'text'}
                                    name={field.name}
                                    value={formData[field.name]}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                    placeholder={field.placeholder}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.diseases.form.coverImage')} <span className="text-red-500">*</span></label>
                        <div className={`relative w-full h-64 rounded-xl flex flex-col items-center justify-center overflow-hidden border-2 transition-all ${
                            (newCover || existingCover) ? 'bg-white border-gray-100 shadow-inner' : 'bg-gray-50 border-dashed border-gray-300 hover:bg-gray-100'
                        }`}>
                            {(newCover || existingCover) ? (
                                <>
                                    <img 
                                        src={newCover ? newCover.preview : getImageUrl(existingCover)} 
                                        alt="Cover" 
                                        className="w-full h-full object-contain"
                                        onError={(e) => e.target.src = 'https://placehold.co/400?text=No+Image'}
                                    />
                                    <button type="button" onClick={removeCover} className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg transform hover:scale-110 transition-all"><X className="w-5 h-5" /></button>
                                </>
                            ) : (
                                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                                    <span className="text-gray-600 font-medium">{t('admin.diseases.form.coverImage')}</span>
                                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-12 space-y-12">
                    {[
                        { label: t('admin.vegetables.form.plantingTh'), name: 'planting_method' },
                        { label: t('admin.vegetables.form.plantingEn'), name: 'planting_method_en' },
                        { label: t('admin.vegetables.form.careTh'), name: 'care' },
                        { label: t('admin.vegetables.form.careEn'), name: 'care_en' },
                        { label: t('admin.vegetables.form.detailsTh'), name: 'details' },
                        { label: t('admin.vegetables.form.detailsEn'), name: 'details_en' }
                    ].map(field => (
                        <div key={field.name}>
                            <label className="block text-sm font-bold text-gray-800 mb-3 border-l-4 border-green-500 pl-3">{field.label}</label>
                            <div className="h-64 mb-12">
                                <ReactQuill theme="snow" value={formData[field.name]} onChange={(val) => handleEditorChange(field.name, val)} modules={modules} className="h-full" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 pt-8 border-t border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><Plus className="w-5 h-5 text-green-600" /> {t('admin.vegetables.form.nutrition.title')}</h3>
                    <div className="flex flex-wrap items-end gap-4 mb-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <div className="flex-1 min-w-[240px]">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('admin.vegetables.form.nutrition.select')}</label>
                            <select value={selectedNutrientId} onChange={(e) => setSelectedNutrientId(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all">
                                <option value="">-- {t('admin.vegetables.form.nutrition.select')} --</option>
                                {nutritionOptions.map(opt => <option key={opt._id} value={opt.nutrition_id}>{opt.nutrition_name}</option>)}
                            </select>
                        </div>
                        <div className="w-32">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('admin.vegetables.form.nutrition.amount')}</label>
                            <input type="number" value={nutAmount} onChange={(e) => setNutAmount(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all" />
                        </div>
                        <div className="w-40">
                             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('admin.vegetables.form.nutrition.unit')}</label>
                             <select value={nutUnit} onChange={(e) => setNutUnit(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all">
                                 {['g', 'mg', 'ug', 'kcal'].map(u => <option key={u} value={u}>{u}</option>)}
                             </select>
                        </div>
                        <button onClick={addNutrition} className="bg-green-600 text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-green-700 transition-all shadow-md hover:shadow-lg active:scale-95">{t('admin.vegetables.form.nutrition.add')}</button>
                    </div>

                    {nutritionList.length > 0 && (
                        <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                            <table className="min-w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">{t('admin.vegetables.form.nutrition.name')}</th>
                                        <th className="px-6 py-4">{t('admin.vegetables.form.nutrition.amount')}</th>
                                        <th className="px-6 py-4">{t('admin.vegetables.form.nutrition.unit')}</th>
                                        <th className="px-6 py-4 w-12"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {nutritionList.map((nut, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-700">{nut.nutrient_name}</td>
                                            <td className="px-6 py-4 text-gray-600">{nut.amount}</td>
                                            <td className="px-6 py-4 text-gray-600">{nut.unit}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => setNutritionList(nutritionList.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="mt-16 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><Upload className="w-5 h-5 text-green-600" /> {t('admin.diseases.detail.gallery')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {existingGallery.map((path, index) => (
                            <div key={`ex-${index}`} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 group shadow-sm hover:shadow-md transition-all">
                                <img src={getImageUrl(path)} alt="Gallery" className="w-full h-full object-cover" />
                                <button onClick={() => setExistingGallery(existingGallery.filter((_, i) => i !== index))} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-lg"><X className="w-3.5 h-3.5" /></button>
                            </div>
                        ))}
                        {newGallery.map((item, index) => (
                            <div key={`new-${index}`} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 group shadow-sm hover:shadow-md transition-all">
                                <img src={item.preview} alt="New" className="w-full h-full object-cover" />
                                <button onClick={() => { URL.revokeObjectURL(item.preview); setNewGallery(newGallery.filter((_, i) => i !== index)); }} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-lg"><X className="w-3.5 h-3.5" /></button>
                            </div>
                        ))}
                        {(existingGallery.length + newGallery.length + (existingCover || newCover ? 1 : 0) < 5) && (
                            <label className="flex flex-col items-center justify-center aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-100/80 transition-all hover:border-green-300 group">
                                <Plus className="w-8 h-8 text-gray-400 mb-2 group-hover:text-green-500 transition-colors" />
                                <span className="text-xs font-bold text-gray-400 group-hover:text-green-600 tracking-wider">ADD PHOTO</span>
                                <input type="file" accept="image/*" multiple onChange={handleGalleryChange} className="hidden" />
                            </label>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-16 pt-8 border-t border-gray-100">
                    <button onClick={() => navigate('/admin/vegetables')} className="px-8 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition-all active:scale-95">{t('admin.diseases.form.cancel')}</button>
                    <button onClick={handleSubmit} disabled={loading} className="px-10 py-2.5 bg-green-700 text-white rounded-xl font-bold hover:bg-green-800 transition-all shadow-lg hover:shadow-green-900/20 flex items-center gap-2 active:scale-95 disabled:opacity-50">
                        <Save className="w-4.5 h-4.5" />
                        {loading ? t('admin.diseases.form.saving') : t('admin.diseases.form.save')}
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminVegetableForm;
