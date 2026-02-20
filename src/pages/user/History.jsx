import React, { useState, useEffect } from 'react';
import { 
    Calendar, Search, Filter, ChevronLeft, ChevronRight, 
    Download, Eye, Bug, Leaf, AlertCircle, History as HistoryIcon,
    BarChart3, X, Sparkles, Activity, Info, Thermometer, Shield, Droplets, LayoutGrid
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDetectionHistory } from '../../services/aiApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Swal from 'sweetalert2';

// Utility for date formatting
const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

const HistoryPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    // State
    const [viewMode, setViewMode] = useState('daily'); // daily, weekly, monthly, yearly
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    
    // Get default date range based on view mode
    const getDefaultDateRangeForMode = (mode) => {
        const today = new Date();
        const end = today.toISOString().split('T')[0];
        let start = end;
        
        switch (mode) {
            case 'yearly':
                start = `${today.getFullYear()}-01-01`;
                break;
            case 'monthly':
                start = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
                break;
            case 'weekly': {
                const dayOfWeek = today.getDay();
                const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                const monday = new Date(today);
                monday.setDate(today.getDate() + diffToMonday);
                start = monday.toISOString().split('T')[0];
                break;
            }
            case 'daily':
            default:
                // Same day for start and end
                start = end;
                break;
        }
        return { start, end };
    };
    const [selectedType, setSelectedType] = useState('all'); // all, disease, pest
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);

    const itemsPerPage = 10;

    const openDetail = async (id) => {
        if (!id) return;
        setDetailLoading(true);
        try {
            const res = await axios.get(`/api/diseases-pest/${id}`);
            if (res.data) {
                setSelectedDetail(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch details:', err);
        } finally {
            setDetailLoading(false);
        }
    };

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            // Calculate date range based on startDate and endDate
            const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
            const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
            
            const rangeStart = new Date(Date.UTC(startYear, startMonth - 1, startDay, 0, 0, 0));
            const rangeEnd = new Date(Date.UTC(endYear, endMonth - 1, endDay, 23, 59, 59, 999));
            
            const apiStartDate = rangeStart.toISOString();
            const apiEndDate = rangeEnd.toISOString();

            const params = {
                skip: (page - 1) * itemsPerPage,
                limit: itemsPerPage,
                start_date: apiStartDate,
                end_date: apiEndDate,
                type: selectedType !== 'all' ? selectedType : undefined
            };
            
            // Debug: Log the date range being sent
            console.log(`[History] View Mode: ${viewMode}`);
            console.log(`[History] Date Range: ${apiStartDate} to ${apiEndDate}`);

            const result = await getDetectionHistory(params);
            
            // Handle response format (assuming backend returns { items: [], total: number } or just [])
            const items = Array.isArray(result) ? result : (result.items || []);
            const total = result.total || items.length;
            
            setHistoryData(items.map(item => {
                const diseaseType = item.disease?.type;
                const mappedType = diseaseType === '1' ? 'disease' : (diseaseType === '2' ? 'pest' : 'unknown');
                
                return {
                    ...item,
                    created_at: item.timestamp,
                    type: mappedType,
                    disease_name: mappedType === 'disease' ? item.disease?.thai_name : undefined,
                    pest_name: mappedType === 'pest' ? item.disease?.thai_name : undefined,
                    // Ensure we have a display name regardless of type for the table
                    displayName: item.disease?.thai_name || 'Unknown'
                };
            }));
            
            // If total is not provided, estimate pages based on items length (if fetched less than limit, it's last page)
            if (result.total) {
                setTotalPages(Math.ceil(total / itemsPerPage));
            } else {
                 // Fallback for simple list return
                 setTotalPages(items.length < itemsPerPage ? page : page + 1);
            }
            
        } catch (error) {
            console.error('Fetch history error:', error);
            Swal.fire({
                icon: 'error',
                title: t('common.error'),
                text: t('admin.diseases.form.errorFetch'),
            });
        } finally {
            setLoading(false);
        }
    };

    // Reset to default date range when view mode changes
    useEffect(() => {
        const { start, end } = getDefaultDateRangeForMode(viewMode);
        setStartDate(start);
        setEndDate(end);
        setPage(1);
    }, [viewMode]);
    
    useEffect(() => {
        fetchData();
    }, [page, startDate, endDate, selectedType]); 

    // Chart Data Preparation - Group by date
    const chartData = React.useMemo(() => {
        if (!historyData.length) return [];
        
        // Group data by date
        const groupedByDate = {};
        
        historyData.forEach(item => {
            const date = new Date(item.created_at || item.timestamp);
            const dateKey = date.toLocaleDateString('th-TH', {
                day: 'numeric',
                month: 'short'
            });
            
            if (!groupedByDate[dateKey]) {
                groupedByDate[dateKey] = { name: dateKey, disease: 0, pest: 0 };
            }
            
            if (item.type === 'disease') {
                groupedByDate[dateKey].disease += 1;
            } else if (item.type === 'pest') {
                groupedByDate[dateKey].pest += 1;
            }
        });
        
        // Convert to array and sort by date
        return Object.values(groupedByDate).reverse();
    }, [historyData]);

    const getStatusColor = (type) => {
        return type === 'disease' 
            ? 'bg-red-100 text-red-700 border-red-200' 
            : 'bg-orange-100 text-orange-700 border-orange-200';
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
                        {t('historyPage.title')}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        {t('historyPage.subtitle')}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Filters Section */}
                <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        {/* Period Selector */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                {t('historyPage.filters.period')}
                            </label>
                            <div className="flex bg-gray-100 p-1 rounded-xl">
                                {['daily', 'weekly', 'monthly', 'yearly'].map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setViewMode(mode)}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                                            viewMode === mode 
                                            ? 'bg-white text-teal-600 shadow-sm' 
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        {t(`historyPage.filters.${mode}`)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date Range Selector - For all modes */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                ช่วงวันที่
                            </label>
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none font-bold text-gray-700"
                                    />
                                </div>
                                <span className="text-gray-400 font-bold">ถึง</span>
                                <div className="relative flex-1">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none font-bold text-gray-700"
                                    />
                                </div>
                            </div>
                        </div>

                         {/* Type Selector */}
                         <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                                {t('historyPage.filters.type')}
                            </label>
                            <div className="relative">
                                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none font-bold text-gray-700 appearance-none cursor-pointer"
                                >
                                    <option value="all">{t('historyPage.filters.all')}</option>
                                    <option value="disease">{t('nav.diseases')}</option>
                                    <option value="pest">{t('nav.pests')}</option>
                                </select>
                            </div>
                        </div>

                        {/* Search Button */}
                        <button 
                            onClick={() => { setPage(1); fetchData(); }}
                            className="h-[50px] bg-teal-600 text-white rounded-xl font-black hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 active:scale-95"
                        >
                            <Search className="w-5 h-5" />
                            {t('historyPage.filters.search')}
                        </button>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <BarChart3 className="w-6 h-6 text-gray-400" />
                        <div>
                            <h3 className="text-lg font-black text-gray-900 leading-tight">
                                {t('historyPage.chart.title')}
                            </h3>
                            <p className="text-sm text-gray-500 font-medium mt-1">
                                {(() => {
                                    const sDate = new Date(startDate);
                                    const eDate = new Date(endDate);
                                    const today = new Date();
                                    
                                    const isSameDay = startDate === endDate;
                                    const isToday = sDate.toDateString() === today.toDateString() && isSameDay;
                                    
                                    if (isSameDay) {
                                        return (
                                            <span className="text-teal-600 font-bold">
                                                {t('historyPage.filters.period')}: {' '}
                                                {sDate.toLocaleDateString('th-TH', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                                {isToday && ' (วันนี้)'}
                                            </span>
                                        );
                                    }
                                    
                                    return (
                                        <span className="text-teal-600 font-bold">
                                            {t('historyPage.filters.period')}: {' '}
                                            {sDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} - {eDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    );
                                })()}
                            </p>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 12, fontWeight: 'bold', fill: '#6b7280' }} 
                                    dy={10}
                                />
                                <YAxis 
                                    allowDecimals={false} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 12, fontWeight: 'bold', fill: '#9ca3af' }} 
                                />
                                <Tooltip 
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value, name) => [value, name === 'disease' ? t('nav.diseases') : t('nav.pests')]}
                                />
                                <Legend 
                                    verticalAlign="top" 
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => <span className="font-bold text-gray-600">{value === 'disease' ? t('nav.diseases') : t('nav.pests')}</span>}
                                />
                                <Bar dataKey="disease" name="disease" fill="#ef4444" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="pest" name="pest" fill="#f97316" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* List/Table Section */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <HistoryIcon className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-black text-gray-900">
                                {t('historyPage.table.detected')}
                            </h3>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 text-left">
                                    <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-widest w-16">#</th>
                                    <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-widest">{t('historyPage.table.date')}</th>
                                    <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-widest">{t('historyPage.table.detected')}</th>
                                    <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-widest text-center">{t('historyPage.table.type')}</th>
                                    <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-widest">{t('historyPage.table.location')}</th>
                                    <th className="py-4 px-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">{t('historyPage.table.manage')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    // Skeleton Loading
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="py-4 px-6"><div className="h-4 bg-gray-100 rounded w-8"></div></td>
                                            <td className="py-4 px-6"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                                            <td className="py-4 px-6"><div className="h-4 bg-gray-100 rounded w-40"></div></td>
                                            <td className="py-4 px-6"><div className="h-6 bg-gray-100 rounded-full w-20 mx-auto"></div></td>
                                            <td className="py-4 px-6"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                                            <td className="py-4 px-6"><div className="h-8 bg-gray-100 rounded-xl w-24 ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : historyData.length > 0 ? (
                                    historyData.map((item, index) => (
                                        <tr key={item.id || index} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6 text-sm font-bold text-gray-500">
                                                {(page - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="py-4 px-6 text-sm font-bold text-gray-700">
                                                {formatDate(item.created_at)}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    {item.image_path && (
                                                        <img 
                                                            src={`${import.meta.env.VITE_API_URL || ''}/${item.image_path}`} 
                                                            alt="Detect" 
                                                            className="w-10 h-10 rounded-lg object-cover shadow-sm group-hover:scale-110 transition-transform"
                                                        />
                                                    )}
                                                    <span className="font-bold text-gray-900">
                                                        {item.disease_name || item.pest_name || item.predictions?.[0]?.label || 'Unknown'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusColor(item.type)}`}>
                                                    {item.type === 'disease' ? <Leaf className="w-3 h-3 mr-1" /> : <Bug className="w-3 h-3 mr-1" />}
                                                    {item.type === 'disease' ? t('nav.diseases') : t('nav.pests')}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-sm font-medium text-gray-600">
                                                {item.plot?.name ? `Plot ${item.plot.name}` : '-'} 
                                                <span className="text-gray-300 mx-2">|</span>
                                                {item.vegetable?.name || '-'}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button 
                                                    onClick={() => openDetail(item.disease_pest_id)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-black hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 transition-all shadow-sm"
                                                    disabled={!item.disease_pest_id}
                                                >
                                                    <Eye className="w-3 h-3" />
                                                    {t('historyPage.table.view')}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                                                    <Search className="w-8 h-8 opacity-50" />
                                                </div>
                                                <p className="font-bold text-lg">{t('common.noResults')}</p>
                                                <p className="text-sm">{t('vegetablesPage.tryAgain')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-6 border-t border-gray-100 flex items-center justify-between">
                         <div className="text-sm font-medium text-gray-500">
                            {t('vegetablesPage.page', { page: page, totalPages: totalPages })}
                         </div>
                         <div className="flex gap-2">
                             <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                             >
                                 <ChevronLeft className="w-5 h-5" />
                             </button>
                             <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                             >
                                 <ChevronRight className="w-5 h-5" />
                             </button>
                         </div>
                    </div>
                </div>
            </div>
            {/* Detail Modal */}
            {selectedDetail && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity" onClick={() => setSelectedDetail(null)} />

                    <div className="relative w-full max-w-6xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] animate-in zoom-in-95 duration-300">
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedDetail(null)}
                            className="absolute top-6 right-6 z-50 p-2.5 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white md:text-gray-500 md:bg-gray-100 md:hover:bg-gray-200 transition-all active:scale-95 shadow-lg"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Left: Image */}
                        <div className={`w-full md:w-5/12 ${selectedDetail.type === '1' ? 'bg-red-950' : 'bg-orange-950'} relative flex flex-col transition-all duration-500 ease-out ${isScrolled ? 'basis-24 min-h-[6rem]' : 'basis-64 min-h-[16rem]'} md:basis-auto md:min-h-0 shadow-2xl z-10`}>
                            <div className={`relative w-full h-full transition-all duration-500 ${isScrolled ? 'opacity-90' : 'opacity-100'}`}>
                                <img
                                    src={selectedDetail.image_path ? `${import.meta.env.VITE_API_URL}/${selectedDetail.image_path}` : 'https://placehold.co/800x600?text=No+Image'}
                                    className={`w-full h-full object-cover opacity-80 transition-all duration-700 ${isScrolled ? 'scale-110 blur-sm' : 'scale-100'}`}
                                    alt={selectedDetail.thai_name}
                                />
                                <div className={`absolute inset-0 bg-gradient-to-t md:bg-gradient-to-b ${selectedDetail.type === '1' ? 'from-red-950/95' : 'from-orange-950/95'} via-transparent to-transparent md:from-transparent md:${selectedDetail.type === '1' ? 'to-red-950/90' : 'to-orange-950/90'}`} />

                                <div className={`absolute bottom-0 left-0 p-8 md:p-12 md:top-0 md:left-0 text-white w-full transition-all duration-500 md:transform-none ${isScrolled ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}`}>
                                    <div className="flex items-center gap-2 mb-4 bg-white/10 backdrop-blur-md w-fit px-3 py-1 rounded-lg border border-white/10">
                                        <Activity className={`w-4 h-4 ${selectedDetail.type === '1' ? 'text-red-400' : 'text-orange-400'} animate-pulse`} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{selectedDetail.severity || t('detectPage.severity.medium')} Danger</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 drop-shadow-2xl tracking-tighter leading-none">
                                        {selectedDetail.thai_name}
                                    </h2>
                                    <p className="text-white/60 font-black text-xl md:text-2xl drop-shadow-md uppercase tracking-widest">{selectedDetail.eng_name}</p>
                                </div>

                                {/* Desktop Gallery */}
                                {selectedDetail.image_paths && selectedDetail.image_paths.length > 1 && (
                                    <div className={`hidden md:block absolute bottom-0 left-0 w-full p-10 z-10 transition-all duration-500 ${isScrolled ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`}>
                                        <p className={`${selectedDetail.type === '1' ? 'text-red-200' : 'text-orange-200'} text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2`}>
                                            <Sparkles className="w-3.5 h-3.5" /> {t('vegetablesPage.moreImages')}
                                        </p>
                                        <div className="grid grid-cols-4 gap-3">
                                            {selectedDetail.image_paths.slice(1).map((path, index) => (
                                                <div
                                                    key={index}
                                                    className="aspect-square rounded-2xl overflow-hidden border-2 border-white/10 cursor-pointer hover:border-white transition-all bg-black/20 group/thumb"
                                                    onClick={() => setSelectedImage(path)}
                                                >
                                                    <img
                                                        src={`${import.meta.env.VITE_API_URL}/${path}`}
                                                        alt={`Gallery ${index}`}
                                                        className="w-full h-full object-cover group-hover/thumb:scale-125 transition-transform duration-700"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Content */}
                        <div
                            className="w-full md:w-7/12 bg-white flex-1 md:h-full overflow-y-auto custom-scrollbar flex flex-col"
                            onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 50)}
                        >
                            <div className="p-8 md:p-16 space-y-12">
                                {/* Detailed Info */}
                                <div className="space-y-12">
                                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="flex items-center gap-5 mb-6">
                                            <div className={`w-14 h-14 rounded-2xl ${selectedDetail.type === '1' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'} flex items-center justify-center shrink-0 shadow-lg`}>
                                                <Info className="w-7 h-7" />
                                            </div>
                                            <h3 className="font-extrabold text-gray-900 text-2xl tracking-tight">{t('detailPage.description')}</h3>
                                        </div>
                                        <div 
                                            className="text-gray-600 text-lg leading-relaxed prose prose-slate max-w-none font-medium [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_p]:mb-4" 
                                            dangerouslySetInnerHTML={{ __html: selectedDetail.description || t('vegetablesPage.noDataDetails') }} 
                                        />
                                    </section>

                                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        <div className="flex items-center gap-5 mb-6">
                                            <div className={`w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 shadow-lg shadow-red-100`}>
                                                {selectedDetail.type === '1' ? <Thermometer className="w-7 h-7" /> : <Bug className="w-7 h-7" />}
                                            </div>
                                            <h3 className="font-extrabold text-gray-900 text-2xl tracking-tight">{t('detailPage.cause')}</h3>
                                        </div>
                                        <div 
                                            className="text-gray-600 text-lg leading-relaxed prose prose-slate max-w-none font-medium [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_p]:mb-4" 
                                            dangerouslySetInnerHTML={{ __html: selectedDetail.cause || t('vegetablesPage.noDataDetails') }} 
                                        />
                                    </section>

                                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                                        <div className="flex items-center gap-5 mb-6">
                                            <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 shadow-lg shadow-green-100">
                                                <Shield className="w-7 h-7" />
                                            </div>
                                            <h3 className="font-extrabold text-gray-900 text-2xl tracking-tight">{t('detailPage.treatment')}</h3>
                                        </div>
                                        <div 
                                            className="text-gray-600 text-lg leading-relaxed prose prose-emerald max-w-none font-medium [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_p]:mb-4" 
                                            dangerouslySetInnerHTML={{ __html: selectedDetail.treatment || t('vegetablesPage.noDataDetails') }} 
                                        />
                                    </section>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Popup Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-gray-900/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setSelectedImage(null)}>
                    <button
                        className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all active:scale-95"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <img
                        src={`${import.meta.env.VITE_API_URL}/${selectedImage}`}
                        alt="Full size"
                        className="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
            
            <style>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #e2e8f0;
              border-radius: 20px;
              border: 2px solid transparent;
              background-clip: content-box;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #cbd5e1;
              background-clip: content-box;
            }
            `}</style>
        </div>
    );
};

export default HistoryPage;
