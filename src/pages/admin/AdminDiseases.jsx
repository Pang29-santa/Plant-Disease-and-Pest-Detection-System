import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';
import { Pencil, Trash2, Plus, Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';

const AdminDiseases = () => {
    const { t } = useTranslation();
    const [diseases, setDiseases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const limit = 5;
    const [totalCount, setTotalCount] = useState(0);
    const filterType = '1'; // 1 = Disease

    const fetchData = async () => {
        try {
            setLoading(true);
            const skip = (page - 1) * limit;
            let url = `/api/diseases-pest?skip=${skip}&limit=${limit}&type=${filterType}`;
            
            if (searchTerm) {
                url += `&search=${encodeURIComponent(searchTerm)}`;
            }
            
            const res = await axios.get(url);
            if (res.data?.success) {
                setDiseases(res.data.data);
                setTotalCount(res.data.total || 0);
            }
        } catch (err) {
            console.error('Failed to fetch diseases:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page, searchTerm]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchData();
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: t('admin.diseases.confirm.deleteTitle'),
            text: t('admin.diseases.confirm.deleteText'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: t('admin.confirm'),
            cancelButtonText: t('admin.cancel')
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/diseases-pest/${id}`);
                await Swal.fire(t('admin.alerts.success'), t('admin.diseases.confirm.deleteSuccess'), 'success');
                fetchData();
            } catch (err) {
                console.error('Failed to delete:', err);
                Swal.fire(t('admin.alerts.error'), t('admin.diseases.confirm.deleteError'), 'error');
            }
        }
    };

    return (
        <AdminLayout title={t('admin.diseases.title')}>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-green-800">{t('admin.diseases.diseaseListTitle')}</h2>
                
                <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                    <form onSubmit={handleSearch} className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder={t('admin.diseases.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                         <button type="submit" className="absolute left-3 top-2.5 text-gray-400">
                             <Search className="w-4 h-4" />
                         </button>
                    </form>

                    <Link to="/admin/diseases/new" state={{ defaultType: '1' }} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 whitespace-nowrap transition-colors">
                        <Plus className="w-4 h-4" /> {t('admin.diseases.addNew')}
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['id', 'image', 'thaiName', 'engName', 'type', 'manage'].map(key => (
                                    <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t(`admin.diseases.table.${key}`)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">{t('common.loading')}</td></tr>
                            ) : diseases.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">{t('common.noResults')}</td></tr>
                            ) : (
                                diseases.map((item) => (
                                    <tr key={item._id || item.ID} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.ID}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <img
                                                alt={item.thai_name}
                                                src={(item.image_paths && item.image_paths.length > 0) ? `${import.meta.env.VITE_API_URL}/${item.image_paths[0]}` : (item.image_path ? `${import.meta.env.VITE_API_URL}/${item.image_path}` : 'https://placehold.co/100')} 
                                                className="w-16 h-16 rounded-lg object-cover"
                                                onError={(e) => {e.target.src = 'https://placehold.co/100'}} 
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.thai_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.eng_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                item.type === '1' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                                            }`}>
                                                {item.type === '1' ? t('admin.diseases.types.disease') : t('admin.diseases.types.pest')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-3">
                                                <Link to={`/admin/diseases/view/${item._id}`} className="text-blue-600 hover:text-blue-900" title={t('admin.users.actions.view')}>
                                                    <Eye className="w-5 h-5" />
                                                </Link>
                                                <Link to={`/admin/diseases/edit/${item._id}`} className="text-yellow-600 hover:text-yellow-900" title={t('admin.editInfo')}>
                                                    <Pencil className="w-5 h-5" />
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(item._id)}
                                                    className="text-red-600 hover:text-red-900" 
                                                    title={t('admin.delete')}
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-center sm:px-6">
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label={t('common.pagination')}>
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        
                        {Array.from({ length: Math.ceil(totalCount / limit) }, (_, idx) => (
                            <button
                                key={idx + 1}
                                onClick={() => setPage(idx + 1)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                                    page === idx + 1
                                        ? 'z-10 bg-green-600 border-green-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                        
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page >= Math.ceil(totalCount / limit)}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </nav>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDiseases;
