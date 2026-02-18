import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { ChevronLeft, Pencil } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminPestDetail = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const [pest, setPest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPest();
    }, [id]);

    const fetchPest = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/diseases-pest/${id}`);
            if (res.data) setPest(res.data);
        } catch (err) {
            console.error('Failed to fetch details:', err);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (path) => `${import.meta.env.VITE_API_URL}/${path.split('/').map(p => encodeURIComponent(p)).join('/')}`;

    if (loading) return <AdminLayout title={t('common.loading')}><div className="flex justify-center p-12 text-gray-400">{t('common.loading')}</div></AdminLayout>;
    if (!pest) return <AdminLayout title={t('admin.alerts.error')}><div className="flex justify-center p-12 text-gray-400">{t('admin.common.noResults')}</div></AdminLayout>;

    return (
        <AdminLayout title={t('admin.diseases.detail.title')}>
            <div className="mb-6 flex justify-between items-center">
                <Link to="/admin/pests" className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors">
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    {t('admin.diseases.form.back')}
                </Link>
                <Link
                    to={`/admin/pests/edit/${pest._id}`}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
                >
                    <Pencil className="w-4 h-4 mr-2" />
                    {t('admin.diseases.detail.edit')}
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
                <div className="bg-primary-50/50 p-6 border-b border-primary-100">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="w-full md:w-64 h-64 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <img
                                src={pest.image_path ? getImageUrl(pest.image_path) : 'https://placehold.co/400?text=No+Image'}
                                alt={pest.thai_name}
                                className="w-full h-full object-cover"
                                onError={(e) => e.target.src = 'https://placehold.co/400?text=No+Image'}
                            />
                        </div>
                        <div className="flex-1 space-y-4 py-2">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 leading-tight">{pest.thai_name}</h1>
                                <p className="text-xl text-gray-500 italic font-medium">{pest.eng_name || '-'}</p>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <span className="px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide shadow-sm bg-orange-100 text-orange-800">
                                    {t('admin.diseases.types.pest')} (Pest)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-12">
                    {[
                        { label: t('admin.diseases.form.causeTh'), labelEn: 'Causes (English)', content: pest.cause, contentEn: pest.cause_en },
                        { label: t('admin.diseases.form.symptomsTh'), labelEn: 'Symptoms (English)', content: pest.description, contentEn: pest.description_en },
                        { label: t('admin.diseases.form.preventionTh'), labelEn: 'Prevention (English)', content: pest.prevention, contentEn: pest.prevention_en },
                        { label: t('admin.diseases.form.treatmentTh'), labelEn: 'Treatment (English)', content: pest.treatment, contentEn: pest.treatment_en }
                    ].map((section, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-primary-800 flex items-center border-l-4 border-primary-500 pl-3">{section.label}</h3>
                                <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50/50 p-4 rounded-xl border border-gray-100 min-h-[100px]" 
                                    dangerouslySetInnerHTML={{ __html: section.content || '-' }} 
                                />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-primary-800 flex items-center border-l-4 border-primary-500 pl-3">{section.labelEn}</h3>
                                <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50/50 p-4 rounded-xl border border-gray-100 min-h-[100px]" 
                                    dangerouslySetInnerHTML={{ __html: section.contentEn || '-' }} 
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminPestDetail;
