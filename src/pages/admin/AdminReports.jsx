import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/admin/AdminLayout';
import { FileBarChart, Search, Download } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminReports = () => {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [filters, setFilters] = useState({
        year: currentYear,
        month: currentMonth,
        type: '' 
    });

    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    
    const months = Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: t(`months.${i + 1}`)
    }));

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = async () => {
        try {
            setLoading(true);
            const params = {
                year: filters.year,
                month: filters.month,
                ...(filters.type && { type: filters.type })
            };

            const res = await axios.get('/api/diseases-pest/reports/monthly', { params });
            if (res.data?.success) setReportData(res.data);
        } catch (err) {
            console.error('Failed to fetch report:', err);
            Swal.fire(t('admin.alerts.error'), t('admin.diseases.form.errorFetch'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (!reportData) return;
        
        const monthName = t(`months.${reportData.month}`);
        const typeName = filters.type === '1' ? t('admin.diseases.types.disease') : filters.type === '2' ? t('admin.diseases.types.pest') : t('admin.reports.filters.all');
        
        let csv = `${t('admin.reports.csv.header', { month: monthName, year: reportData.year + (t('common.switch') === 'English' ? 543 : 0), type: typeName })}\n\n`;
        csv += `${t('admin.reports.csv.total')},${reportData.total_detections}\n`;
        csv += `${t('admin.reports.csv.disease')},${reportData.disease_detections}\n`;
        csv += `${t('admin.reports.csv.pest')},${reportData.pest_detections}\n\n`;
        csv += `${t('admin.reports.csv.table.rank')},${t('admin.reports.csv.table.thaiName')},${t('admin.reports.csv.table.engName')},${t('admin.reports.csv.table.type')},${t('admin.reports.csv.table.count')}\n`;
        
        reportData.data.forEach((item, idx) => {
            csv += `${idx + 1},${item.thai_name},${item.eng_name || '-'},${item.type_name},${item.detection_count}\n`;
        });

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `report_${reportData.year}_${reportData.month}_${filters.type || 'all'}.csv`;
        link.click();
    };

    const getChartData = () => {
        if (!reportData) return [];
        return reportData.data.slice(0, 10).map(item => ({
            name: item.thai_name.length > 15 ? item.thai_name.substring(0, 12) + '...' : item.thai_name,
            [t('admin.reports.stats.disease')]: item.type === '1' ? item.detection_count : 0,
            [t('admin.reports.stats.pest')]: item.type === '2' ? item.detection_count : 0
        }));
    };

    return (
        <AdminLayout title={t('admin.reports.title')}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{t('admin.reports.filters.year')}</label>
                        <select
                            name="year"
                            value={filters.year}
                            onChange={handleFilterChange}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                        >
                            {years.map(year => (
                                <option key={year} value={year}>{year + (t('common.switch') === 'English' ? 543 : 0)}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{t('admin.reports.filters.month')}</label>
                        <select
                            name="month"
                            value={filters.month}
                            onChange={handleFilterChange}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                        >
                            {months.map(month => (
                                <option key={month.value} value={month.value}>{month.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{t('admin.reports.filters.type')}</label>
                        <select
                            name="type"
                            value={filters.type}
                            onChange={handleFilterChange}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                        >
                            <option value="">{t('admin.reports.filters.all')}</option>
                            <option value="1">{t('admin.diseases.types.disease')}</option>
                            <option value="2">{t('admin.diseases.types.pest')}</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-100 transition-all disabled:opacity-50"
                        >
                            <Search className="w-5 h-5" />
                            {loading ? t('admin.reports.filters.searching') : t('admin.reports.filters.search')}
                        </button>
                    </div>
                </div>
            </div>

            {reportData && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: t('admin.reports.stats.total'), val: reportData.total_detections, color: 'blue', icon: FileBarChart },
                            { label: t('admin.reports.stats.disease'), val: reportData.disease_detections, color: 'red', icon: () => <ShieldAlert className="w-8 h-8" /> },
                            { label: t('admin.reports.stats.pest'), val: reportData.pest_detections, color: 'orange', icon: () => <Bug className="w-8 h-8" /> }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between group hover:shadow-md transition-all">
                                <div>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                                    <p className={`text-4xl font-black text-${stat.color}-600 tabular-nums`}>{stat.val}</p>
                                </div>
                                <div className={`p-4 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl group-hover:scale-110 transition-transform`}>
                                    {typeof stat.icon === 'function' ? stat.icon() : <stat.icon className="w-8 h-8" />}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h3 className="text-xl font-black text-gray-800 mb-8 flex items-center border-l-4 border-green-500 pl-4 uppercase tracking-tight">
                                {t('admin.reports.chart.title', { month: t(`months.${reportData.month}`), year: reportData.year + (t('common.switch') === 'English' ? 543 : 0) })}
                            </h3>
                            {reportData.data.length > 0 ? (
                                <div className="h-[350px] w-full mt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                            <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} fontSize={11} fontWeight={600} tick={{ fill: '#9ca3af' }} />
                                            <YAxis fontSize={12} tick={{ fill: '#9ca3af' }} />
                                            <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                            <Bar dataKey={t('admin.reports.stats.disease')} fill="#ef4444" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey={t('admin.reports.stats.pest')} fill="#f97316" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-[350px] flex flex-col items-center justify-center text-gray-400 gap-3">
                                    <TrendingUp className="w-12 h-12 stroke-[1.5] opacity-20" />
                                    <p className="font-medium">{t('admin.reports.chart.noData')}</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <div className="flex justify-between items-center mb-8 pb-2 border-b border-gray-50">
                                <h3 className="text-xl font-black text-gray-800 flex items-center border-l-4 border-orange-500 pl-4 uppercase tracking-tight">
                                    {t('admin.reports.topRank.title')}
                                </h3>
                                <button
                                    onClick={handleExport}
                                    className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
                                >
                                    <Download className="w-4 h-4" />
                                    {t('admin.reports.topRank.export')}
                                </button>
                            </div>
                            
                            {reportData.data.length === 0 ? (
                                <div className="text-center py-20 text-gray-400 italic">
                                    {t('admin.reports.chart.noData')}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reportData.data.slice(0, 5).map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-green-200 hover:bg-white hover:shadow-lg transition-all group">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-black ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-white text-gray-400 shadow-sm'}`}>
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-800 group-hover:text-green-700 transition-colors uppercase tracking-tight">{item.thai_name}</p>
                                                    <p className="text-xs text-gray-400 italic font-medium">{item.eng_name || '-'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl font-black text-green-600 tabular-nums">{item.detection_count}</span>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('admin.reports.topRank.count')}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {!reportData && !loading && (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[32px] shadow-sm border border-gray-100 min-h-[500px] animate-in slide-in-from-bottom-8 duration-700">
                    <div className="p-8 bg-green-50 rounded-[2.5rem] mb-8 ring-8 ring-green-50/50">
                        <FileBarChart className="w-16 h-16 text-green-600 stroke-[1.5]" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-4 text-center max-w-sm leading-tight">{t('admin.reports.empty.title')}</h3>
                    <p className="text-gray-400 text-center max-w-sm font-medium leading-relaxed">
                        {t('admin.reports.empty.text')}
                    </p>
                </div>
            )}
        </AdminLayout>
    );
};

const ShieldAlert = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
    </svg>
);

const Bug = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
    </svg>
);

const TrendingUp = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"/>
    </svg>
);

export default AdminReports;
