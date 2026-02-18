import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { ChevronLeft, Pencil } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminDiseaseDetail = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const [disease, setDisease] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDisease();
    }, [id]);

    const fetchDisease = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/diseases-pest/${id}`);
            if (res.data) setDisease(res.data);
        } catch (err) {
            console.error('Failed to fetch details:', err);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (path) => `${import.meta.env.VITE_API_URL}/${path.split('/').map(p => encodeURIComponent(p)).join('/')}`;

    if (loading) return <AdminLayout title={t('common.loading')}><div className="flex justify-center p-12 text-gray-400">{t('common.loading')}</div></AdminLayout>;
    if (!disease) return <AdminLayout title={t('admin.alerts.error')}><div className="flex justify-center p-12 text-gray-400">{t('admin.common.noResults')}</div></AdminLayout>;

    return (
        <AdminLayout title={t('admin.diseases.detail.title')}>
            <div className="mb-6 flex justify-between items-center">
                <Link to="/admin/diseases" className="inline-flex items-center text-gray-600 hover:text-green-600 transition-colors">
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    {t('admin.diseases.form.back')}
                </Link>
                <Link
                    to={`/admin/diseases/edit/${disease._id}`}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
                >
                    <Pencil className="w-4 h-4 mr-2" />
                    {t('admin.diseases.detail.edit')}
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
                <div className="bg-green-50/50 p-6 border-b border-green-100">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="w-full md:w-64 h-64 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <img
                                src={disease.image_path ? getImageUrl(disease.image_path) : 'https://placehold.co/400?text=No+Image'}
                                alt={disease.thai_name}
                                className="w-full h-full object-cover"
                                onError={(e) => e.target.src = 'https://placehold.co/400?text=No+Image'}
                            />
                        </div>
                        <div className="flex-1 space-y-4 py-2">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 leading-tight">{disease.thai_name}</h1>
                                <p className="text-xl text-gray-500 italic font-medium">{disease.eng_name || '-'}</p>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide shadow-sm ${
                                    disease.type === '1' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                                }`}>
                                    {disease.type === '1' ? `${t('admin.diseases.types.disease')} (Disease)` : `${t('admin.diseases.types.pest')} (Pest)`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-12">
                    {[
                        { label: t('admin.diseases.form.causeTh'), labelEn: 'Causes (English)', content: disease.cause, contentEn: disease.cause_en },
                        { label: t('admin.diseases.form.symptomsTh'), labelEn: 'Symptoms (English)', content: disease.description, contentEn: disease.description_en },
                        { label: t('admin.diseases.form.preventionTh'), labelEn: 'Prevention (English)', content: disease.prevention, contentEn: disease.prevention_en },
                        { label: t('admin.diseases.form.treatmentTh'), labelEn: 'Treatment (English)', content: disease.treatment, contentEn: disease.treatment_en }
                    ].map((section, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-green-800 flex items-center border-l-4 border-green-500 pl-3">{section.label}</h3>
                                <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50/50 p-4 rounded-xl border border-gray-100 min-h-[100px]" 
                                    dangerouslySetInnerHTML={{ __html: section.content || '-' }} 
                                />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-green-800 flex items-center border-l-4 border-green-500 pl-3">{section.labelEn}</h3>
                                <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50/50 p-4 rounded-xl border border-gray-100 min-h-[100px]" 
                                    dangerouslySetInnerHTML={{ __html: section.contentEn || '-' }} 
                                />
                            </div>
                        </div>
                    ))}

                    {disease.image_paths && disease.image_paths.length > 1 && (
                        <div className="space-y-6 pt-6 border-t">
                            <h3 className="text-lg font-bold text-green-800 flex items-center border-l-4 border-green-500 pl-3">{t('admin.diseases.detail.gallery')}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {disease.image_paths.slice(1).map((path, index) => (
                                    <div key={index} className="aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all group relative cursor-pointer"
                                         onClick={() => window.open(getImageUrl(path), '_blank')}>
                                        <img 
                                            src={getImageUrl(path)} 
                                            alt={`Gallery ${index + 1}`} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDiseaseDetail;
