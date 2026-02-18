import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/admin/AdminLayout';
import { ArrowLeft, User, Mail, Phone, MapPin, Shield, Calendar, Edit, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

const AdminUserDetail = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id || id === 'undefined') {
            Swal.fire('Error', t('admin.alerts.noUserId'), 'error');
            navigate('/admin/users');
            return;
        }
        fetchUserData();
    }, [id]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/users/${id}`);
            setUser(res.data);
            
            if (res.data.subdistricts_id) {
                const locRes = await axios.get(`/api/location/full/${res.data.subdistricts_id}`);
                setLocation(locRes.data);
            }
        } catch (err) {
            console.error('Failed to fetch user:', err);
            Swal.fire('Error', t('admin.alerts.noUserData'), 'error');
            navigate('/admin/users');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout title={t('admin.userDetail')}>
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    <p className="mt-4 text-gray-500">{t('common.loading')}</p>
                </div>
            </AdminLayout>
        );
    }

    if (!user) return null;

    return (
        <AdminLayout title={t('admin.userDetail')}>
            <div className="mb-6 flex justify-between items-center" aria-label={t('admin.userDetail')}>
                <button
                    onClick={() => navigate('/admin/users')}
                    className="flex items-center text-gray-600 hover:text-green-600 transition"
                >
                    <ArrowLeft className="w-5 h-5 mr-1" />
                    {t('common.back')}
                </button>
                <Link
                    to={`/admin/users/edit/${id}`}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition"
                >
                    <Edit className="w-4 h-4" />
                    {t('admin.editInfo')}
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8 flex flex-col items-center">
                    <div className="w-40 h-40 rounded-full border-4 border-green-50 overflow-hidden shadow-inner mb-6 bg-gray-50 flex items-center justify-center">
                        {user.image_path ? (
                            <img 
                                src={`${import.meta.env.VITE_API_URL}/${user.image_path}`} 
                                alt={user.fullname} 
                                className="w-full h-full object-cover"
                                onError={(e) => {e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.fullname)}}
                            />
                        ) : (
                            <User className="w-20 h-20 text-gray-200" />
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 text-center">{user.fullname}</h2>
                    <p className="text-gray-500 mt-1">ID: {user.user_id}</p>
                    
                    <div className="mt-6 w-full space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <Shield className={`w-5 h-5 ${user.role === 'admin' ? 'text-teal-600' : 'text-blue-600'}`} />
                            <div>
                                <p className="text-xs text-gray-400">{t('admin.role')}</p>
                                <p className="text-sm font-semibold capitalize">{user.role === 'admin' ? t('admin.roles.admin') : t('admin.roles.user')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <ShieldAlert className={`w-5 h-5 ${user.status === 'active' ? 'text-green-600' : 'text-red-600'}`} />
                            <div>
                                <p className="text-xs text-gray-400">{t('admin.status')}</p>
                                <p className="text-sm font-semibold capitalize">
                                    {user.status === 'active' ? t('admin.statuses.active') : user.status === 'suspended' ? t('admin.statuses.suspended') : t('admin.statuses.inactive')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Contact Info */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span className="w-2 h-6 bg-green-500 rounded-full"></span>
                            {t('admin.contactInfo')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">{t('admin.email')}</p>
                                    <p className="text-lg font-medium text-gray-700">{user.email || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">{t('admin.phone')}</p>
                                    <p className="text-lg font-medium text-gray-700">{user.phone || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Address Info */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span className="w-2 h-6 bg-green-500 rounded-full"></span>
                            {t('admin.addressInfo')}
                        </h3>
                        {location ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-400 mb-1">{t('admin.province')}</p>
                                    <p className="font-semibold text-gray-700">{location.province?.name_in_thai || '-'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-400 mb-1">{t('admin.district')}</p>
                                    <p className="font-semibold text-gray-700">{location.district?.name_in_thai || '-'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs text-gray-400 mb-1">{t('admin.subdistrict')}</p>
                                    <p className="font-semibold text-gray-700">{location.subdistrict?.name_in_thai || '-'}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-400">{t('admin.noAddress')}</p>
                            </div>
                        )}
                    </div>

                    {/* Other Info */}
                    {(user.telegram_chat_id || user.telegram_connected_at) && (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                                {t('admin.telegramInfo')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <p className="text-sm text-gray-400">{t('admin.telegramChatId')}</p>
                                    <p className="text-lg font-medium text-gray-700">{user.telegram_chat_id || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">{t('admin.connectedAt')}</p>
                                    <p className="text-lg font-medium text-gray-700">
                                        {user.telegram_connected_at ? new Date(user.telegram_connected_at).toLocaleDateString('th-TH') : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminUserDetail;
