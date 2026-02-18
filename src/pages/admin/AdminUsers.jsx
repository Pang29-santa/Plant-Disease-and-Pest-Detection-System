import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/admin/AdminLayout';
import { Search, Plus, Eye, UserCheck, UserX, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

const AdminUsers = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;
    const [totalCount, setTotalCount] = useState(0);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const skip = (page - 1) * limit;
            const url = searchTerm 
                ? `/api/users?search=${searchTerm}&skip=${skip}&limit=${limit}`
                : `/api/users?skip=${skip}&limit=${limit}`;
            
            const res = await axios.get(url);
            if (res.data?.success) {
                setUsers(res.data.data);
                setTotalCount(res.data.total || 0);
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    const handleStatusChange = async (userId, newStatus) => {
        const actionLabel = newStatus === 'active' 
            ? t('admin.users.actions.activate') 
            : t('admin.users.actions.suspend');
        
        const result = await Swal.fire({
            title: t('admin.users.confirm.title', { action: actionLabel }),
            text: t('admin.users.confirm.text', { action: actionLabel }),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: newStatus === 'active' ? '#10b981' : '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: t('admin.confirm'),
            cancelButtonText: t('admin.cancel')
        });

        if (result.isConfirmed) {
            try {
                await axios.patch(`/api/users/${userId}/status?status=${newStatus}`);
                Swal.fire(t('admin.alerts.success'), t('admin.users.confirm.success', { action: actionLabel }), 'success');
                fetchUsers();
            } catch (err) {
                console.error('Failed to update status:', err);
                Swal.fire(t('admin.alerts.error'), t('admin.users.confirm.error'), 'error');
            }
        }
    };

    const StatusBadge = ({ status }) => {
        const config = {
            active: { bg: 'bg-green-100', text: 'text-green-800', label: t('admin.statuses.active') },
            inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: t('admin.statuses.inactive') },
            suspended: { bg: 'bg-red-100', text: 'text-red-800', label: t('admin.statuses.suspended') }
        }[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: t('admin.statuses.inactive') };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const RoleBadge = ({ role }) => {
        const isAdmin = role === 'admin';
        const colorClass = isAdmin ? 'bg-teal-100 text-teal-800' : 'bg-blue-100 text-blue-800';
        const label = isAdmin ? t('admin.roles.admin') : t('admin.roles.user');
        
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
                {label}
            </span>
        );
    };

    return (
        <AdminLayout title={t('admin.users.title')}>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header Actions */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <form onSubmit={handleSearch} className="flex-1 max-w-md">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={t('admin.users.searchPlaceholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            </div>
                        </form>

                        <Link
                            to="/admin/users/new"
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 justify-center transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            {t('admin.users.addNew')}
                        </Link>
                    </div>
                </div>

                {/* Main Content */}
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <p className="mt-2 text-gray-600">{t('common.loading')}</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        {t('admin.users.no_data')}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['user', 'phone', 'email', 'role', 'status'].map(key => (
                                            <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {t(`admin.users.table.${key}`)}
                                            </th>
                                        ))}
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('admin.users.table.manage')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user, index) => (
                                        <tr key={user._id || `user-${index}`} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <img
                                                        src={user.image_path ? `${import.meta.env.VITE_API_URL}/${user.image_path}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname || 'User')}`}
                                                        alt={user.fullname}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                        onError={(e) => {e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname || 'User')}`}}
                                                    />
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium text-gray-900">{user.fullname || '-'}</p>
                                                        <p className="text-xs text-gray-500">ID: {user.user_id || '-'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap"><RoleBadge role={user.role} /></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={user.status} /></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => navigate(`/admin/users/view/${user._id}`)}
                                                        className="text-blue-600 hover:text-blue-900 transition-colors"
                                                        title={t('admin.users.actions.view')}
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    {user.status === 'active' ? (
                                                        <button
                                                            onClick={() => handleStatusChange(user._id, 'suspended')}
                                                            className="text-red-600 hover:text-red-900 transition-colors"
                                                            title={t('admin.users.actions.suspend')}
                                                        >
                                                            <UserX className="w-5 h-5" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleStatusChange(user._id, 'active')}
                                                            className="text-green-600 hover:text-green-900 transition-colors"
                                                            title={t('admin.users.actions.activate')}
                                                        >
                                                            <UserCheck className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
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
                    </>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminUsers;
