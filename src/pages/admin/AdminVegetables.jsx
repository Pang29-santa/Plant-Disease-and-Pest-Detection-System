import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';
import { Pencil, Trash2, Plus, Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';

const AdminVegetables = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [vegetables, setVegetables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const limit = 5;
    const [totalCount, setTotalCount] = useState(0);

    const fetchData = async () => {
        try {
            setLoading(true);
            const skip = (page - 1) * limit;
            const url = searchTerm 
                ? `/api/vegetable/search?q=${encodeURIComponent(searchTerm)}`
                : `/api/vegetable?skip=${skip}&limit=${limit}`;
            
            const res = await axios.get(url);
            if (res.data?.success || res.data?.data) {
                const data = res.data.data || [];
                setVegetables(data);
                setTotalCount(res.data.total || data.length || 0);
            }
        } catch (err) {
            console.error('Failed to fetch vegetables:', err);
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
            title: t('admin.vegetables.confirm.deleteTitle'),
            text: t('admin.vegetables.confirm.deleteText'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: t('admin.confirm'),
            cancelButtonText: t('admin.cancel')
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/vegetable/${id}`);
                await Swal.fire(t('admin.alerts.success'), t('admin.vegetables.confirm.deleteSuccess'), 'success');
                fetchData();
            } catch (err) {
                console.error('Failed to delete:', err);
                const errorMessage = err.response?.data?.detail || t('admin.vegetables.confirm.deleteError');
                Swal.fire(t('admin.alerts.error'), errorMessage, 'error');
            }
        }
    };

    return (
        <AdminLayout title={t('admin.vegetables.title')}>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-green-800">{t('admin.vegetables.listTitle')}</h2>
                
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <form onSubmit={handleSearch} className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder={t('admin.vegetables.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    </form>

                    <Link to="/admin/vegetables/new" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 whitespace-nowrap transition-colors">
                        <Plus className="w-4 h-4" /> {t('admin.vegetables.addNew')}
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['id', 'image', 'thaiName', 'engName', 'manage'].map(key => (
                                    <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {key === 'manage' ? t('admin.users.table.manage') : t(`admin.diseases.table.${key}`)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">{t('common.loading')}</td></tr>
                            ) : vegetables.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">{t('common.noResults')}</td></tr>
                            ) : (
                                vegetables.map((veg) => (
                                    <tr key={veg._id || veg.vegetable_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{veg.vegetable_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <img 
                                                alt={veg.thai_name}
                                                src={(veg.image_paths && veg.image_paths.length > 0) ? `${import.meta.env.VITE_API_URL}/${veg.image_paths[0]}` : (veg.image_path ? `${import.meta.env.VITE_API_URL}/${veg.image_path}` : 'https://placehold.co/100')} 
                                                className="w-24 h-24 rounded-lg object-cover"
                                                onError={(e) => {e.target.src = 'https://placehold.co/100'}} 
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{veg.thai_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{veg.eng_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-3">
                                                <Link to={`/admin/vegetables/view/${veg._id}`} className="text-blue-600 hover:text-blue-900" title={t('admin.users.actions.view')}>
                                                    <Eye className="w-5 h-5" />
                                                </Link>
                                                <Link to={`/admin/vegetables/edit/${veg._id}`} className="text-yellow-600 hover:text-yellow-900" title={t('admin.editInfo')}>
                                                    <Pencil className="w-5 h-5" />
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(veg._id)}
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

export default AdminVegetables;
