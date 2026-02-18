import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';
import { ChevronLeft, Pencil } from 'lucide-react';

const AdminVegetableDetail = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [vegetable, setVegetable] = useState(null);
    const [nutrition, setNutrition] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vegRes, nutRes] = await Promise.all([
                    axios.get(`/api/vegetable/${id}`),
                    axios.get(`/api/vegetable/${id}/nutrition`)
                ]);
                setVegetable(vegRes.data);
                if (nutRes.data?.nutrition) setNutrition(nutRes.data.nutrition);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const getImageUrl = (path) => `${import.meta.env.VITE_API_URL}/${path.split('/').map(p => encodeURIComponent(p)).join('/')}`;

    if (loading) return <AdminLayout title={t('common.loading')}><div className="flex justify-center p-12 text-gray-400">{t('common.loading')}</div></AdminLayout>;
    if (!vegetable) return <AdminLayout title={t('admin.alerts.error')}><div className="flex justify-center p-12 text-gray-400">{t('admin.common.noResults')}</div></AdminLayout>;

    return (
        <AdminLayout title={t('admin.vegetables.detail.title')}>
             <div className="mb-6 flex justify-between items-center">
                <button onClick={() => navigate('/admin/vegetables')} className="inline-flex items-center text-gray-600 hover:text-green-600 transition-colors">
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    {t('admin.diseases.form.back')}
                </button>
                <Link
                    to={`/admin/vegetables/edit/${id}`}
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
                                src={vegetable.image_path ? getImageUrl(vegetable.image_path) : 'https://placehold.co/400?text=No+Image'} 
                                alt={vegetable.thai_name}
                                className="w-full h-full object-cover"
                                onError={(e) => e.target.src = 'https://placehold.co/400?text=No+Image'}
                            />
                        </div>

                        <div className="flex-1 space-y-4 py-2">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 leading-tight">{vegetable.thai_name}</h1>
                                <p className="text-xl text-gray-500 italic font-medium">{vegetable.eng_name || '-'}</p>
                                <p className="text-sm text-gray-400 font-serif mt-1">{vegetable.sci_name || '-'}</p>
                            </div>
                            
                            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-xl shadow-sm">
                                <span className="text-sm font-bold uppercase tracking-wider mr-2">{t('admin.vegetables.form.growth')}:</span>
                                <span className="text-lg font-black">{vegetable.growth || '-'}</span>
                                <span className="text-sm font-bold ml-1">{t('admin.vegetables.detail.growthUnit')}</span>
                            </div>

                            <div className="pt-4">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">{t('admin.vegetables.form.nutrition.title')}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {nutrition.length > 0 ? nutrition.map((n, i) => (
                                        <div key={i} className="bg-white border border-gray-100 px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-500">{n.nutrient_name || n.nutrition_name}:</span>
                                            <span className="text-sm font-bold text-green-700">{n.nutrition_qty || n.amount} {n.unit}</span>
                                        </div>
                                    )) : <span className="text-sm text-gray-400 italic">{t('admin.common.noResults')}</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="p-8 space-y-12">
                    {[
                        { label: t('admin.vegetables.form.plantingTh'), labelEn: t('admin.vegetables.form.plantingEn'), content: vegetable.planting_method, contentEn: vegetable.planting_method_en },
                        { label: t('admin.vegetables.form.careTh'), labelEn: t('admin.vegetables.form.careEn'), content: vegetable.care, contentEn: vegetable.care_en },
                        { label: t('admin.vegetables.form.detailsTh'), labelEn: t('admin.vegetables.form.detailsEn'), content: vegetable.details, contentEn: vegetable.details_en }
                    ].map((section, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-green-800 flex items-center border-l-4 border-green-500 pl-3 uppercase tracking-wide">{section.label}</h3>
                                <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50/50 p-5 rounded-2xl border border-gray-100 min-h-[120px]" 
                                    dangerouslySetInnerHTML={{ __html: section.content || '-' }} 
                                />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-green-800 flex items-center border-l-4 border-green-500 pl-3 uppercase tracking-wide">{section.labelEn}</h3>
                                <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50/50 p-5 rounded-2xl border border-gray-100 min-h-[120px]" 
                                    dangerouslySetInnerHTML={{ __html: section.contentEn || '-' }} 
                                />
                            </div>
                        </div>
                    ))}

                    {vegetable.image_paths && vegetable.image_paths.length > 1 && (
                        <div className="pt-8 border-t border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 uppercase tracking-widest">{t('admin.diseases.detail.gallery')}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {vegetable.image_paths.slice(1).map((path, index) => (
                                    <div key={index} className="aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                                        <img 
                                            src={getImageUrl(path)} 
                                            alt={`Gallery ${index + 1}`} 
                                            className="w-full h-full object-cover cursor-pointer group-hover:scale-110 transition-transform duration-500"
                                            onClick={() => window.open(getImageUrl(path), '_blank')}
                                        />
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

export default AdminVegetableDetail;
