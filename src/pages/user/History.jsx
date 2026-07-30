import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    Calendar, Search, Filter, ChevronLeft, ChevronRight, 
    Download, Eye, Bug, Leaf, AlertCircle, History as HistoryIcon,
    BarChart3, X, Sparkles, Activity, Info, Thermometer, Shield, Droplets, LayoutGrid, RotateCcw
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDetectionHistory } from '../../services/aiApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Swal from 'sweetalert2';
import { getImageUrl } from '../../utils/urlHelper';

// Utility for date formatting
const formatDate = (dateString, isThai = true) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(isThai ? 'th-TH' : 'en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

const cleanHtmlContent = (str) => {
  if (!str) return '';
  const knownWords = [
    'spots', 'distinct', 'merge', 'leaf', 'affecting', 'most', 'disease',
    'drying', 'plant', 'common', 'infestations', 'imidacloprid', 'fungi',
    'pathogens', 'agricultural', 'treatment', 'management', 'symptoms',
    'appearance', 'yellowing', 'hopperburn', 'stunted', 'infection',
    'premature', 'growth', 'caused', 'leafhoppers', 'family', 'Cicadellidae',
    'suck', 'vegetables', 'transmit', 'Alternaria', 'Cercospora', 'Colletotrichum',
    'spreads', 'splash', 'contaminated', 'extract', 'biological', 'recommended',
    'insecticides', 'carbosulfan', 'pests', 'diseases', 'control', 'prevention'
  ];
  let cleaned = String(str)
    .replace(/&shy;|\u00AD/g, '')
    .replace(/([a-zA-Z])[\r\n]+\s*([a-zA-Z])/g, '$1$2');

  knownWords.forEach(kw => {
    for (let len1 = 1; len1 < kw.length; len1++) {
      const p1 = kw.slice(0, len1);
      const p2 = kw.slice(len1);
      const regex = new RegExp('\\b' + p1 + '\\s+' + p2 + '\\b', 'gi');
      cleaned = cleaned.replace(regex, (match) => {
        return (match[0] === match[0].toUpperCase())
          ? kw.charAt(0).toUpperCase() + kw.slice(1)
          : kw.toLowerCase();
      });
    }
  });
  return cleaned;
};

const HistoryPage = () => {
    const { t, i18n } = useTranslation();
    const isThai = i18n.language?.startsWith('th');
    const navigate = useNavigate();
    
    // State
    const [viewMode, setViewMode] = useState('daily'); // daily, weekly, monthly, yearly
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedType, setSelectedType] = useState('all'); // all, disease, pest
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    const typeDropdownRef = useRef(null);

    const itemsPerPage = 10;

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
                start = end;
                break;
        }
        return { start, end };
    };

    // Close custom type dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target)) {
                setIsTypeDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Scroll lock for modals
    useEffect(() => {
        if (selectedDetail || selectedImage) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [selectedDetail, selectedImage]);

    const openDetail = async (id, fallback) => {
        if (fallback) {
            setSelectedDetail(fallback);
        }
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

            const result = await getDetectionHistory(params);
            
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
                    displayName: item.disease?.thai_name || 'Unknown'
                };
            }));
            
            if (result.total) {
                setTotalPages(Math.ceil(total / itemsPerPage));
            } else {
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
    const chartData = useMemo(() => {
        if (!historyData.length) return [];
        
        const groupedByDate = {};
        
        historyData.forEach(item => {
            const date = new Date(item.created_at || item.timestamp);
            const dateKey = date.toLocaleDateString(isThai ? 'th-TH' : 'en-US', {
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
        
        return Object.values(groupedByDate).reverse();
    }, [historyData, isThai]);

    // Metric Summary Counts
    const metrics = useMemo(() => {
        const total = historyData.length;
        const diseases = historyData.filter(i => i.type === 'disease').length;
        const pests = historyData.filter(i => i.type === 'pest').length;
        return { total, diseases, pests };
    }, [historyData]);

    const getStatusColor = (type) => {
        return type === 'disease' 
            ? 'bg-rose-50 text-rose-700 border-rose-200' 
            : 'bg-amber-50 text-amber-700 border-amber-200';
    };

    const typeOptions = [
        { value: 'all', label: t('historyPage.filters.all'), icon: LayoutGrid },
        { value: 'disease', label: t('nav.diseases'), icon: Leaf },
        { value: 'pest', label: t('nav.pests'), icon: Bug },
    ];

    const currentTypeLabel = typeOptions.find(o => o.value === selectedType)?.label || t('historyPage.filters.all');

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Header Banner */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-xs font-bold mb-3">
                            <HistoryIcon className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{isThai ? 'ประวัติการตรวจจับ' : 'Detection History'}</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                            {t('historyPage.title')}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-2 max-w-xl">
                            {t('historyPage.subtitle')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Filters Card */}
                <div className="bg-white p-5 sm:p-7 rounded-3xl shadow-sm border border-slate-200/80 space-y-5">
                    {/* View Mode Tabs */}
                    <div>
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                            {t('historyPage.filters.period')}
                        </label>
                        <div className="grid grid-cols-4 bg-slate-100 p-1 rounded-2xl gap-1">
                            {['daily', 'weekly', 'monthly', 'yearly'].map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`py-2 px-1 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                                        viewMode === mode 
                                        ? 'bg-white text-emerald-700 shadow-sm font-black' 
                                        : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    {t(`historyPage.filters.${mode}`)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Range & Type Select Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        {/* Date Range Selector - Mobile Responsive Grid */}
                        <div className="md:col-span-7 space-y-1.5 min-w-0">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">
                                {t('historyPage.filters.dateRange')}
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 min-w-0">
                                <div className="relative w-full min-w-0">
                                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    <input
                                        type="date"
                                        lang={isThai ? 'th-TH' : 'en-US'}
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none font-semibold text-xs text-slate-800 transition-all"
                                    />
                                </div>
                                <div className="relative w-full min-w-0">
                                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    <input
                                        type="date"
                                        lang={isThai ? 'th-TH' : 'en-US'}
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none font-semibold text-xs text-slate-800 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Custom Interactive Type Select */}
                        <div className="md:col-span-3 space-y-1.5 min-w-0" ref={typeDropdownRef}>
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">
                                {t('historyPage.filters.type')}
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between hover:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all cursor-pointer"
                                >
                                    <span className="flex items-center gap-2 truncate">
                                        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span className="truncate">{currentTypeLabel}</span>
                                    </span>
                                    <ChevronLeft className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isTypeDropdownOpen ? '-rotate-90' : 'rotate-180'}`} />
                                </button>

                                {isTypeDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                                        {typeOptions.map((opt) => {
                                            const IconComp = opt.icon;
                                            return (
                                                <div
                                                    key={opt.value}
                                                    onClick={() => {
                                                        setSelectedType(opt.value);
                                                        setIsTypeDropdownOpen(false);
                                                    }}
                                                    className={`px-3.5 py-2.5 text-xs cursor-pointer flex items-center justify-between transition-colors hover:bg-emerald-50 hover:text-emerald-700 ${
                                                        selectedType === opt.value ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 font-medium'
                                                    }`}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <IconComp className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>{opt.label}</span>
                                                    </span>
                                                    {selectedType === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Search Action Button */}
                        <div className="md:col-span-2">
                            <button 
                                onClick={() => { setPage(1); fetchData(); }}
                                className="w-full h-[42px] bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-200 active:scale-95 cursor-pointer"
                            >
                                <Search className="w-4 h-4" />
                                <span>{t('historyPage.filters.search')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* KPI Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                        <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{isThai ? 'การตรวจพบทั้งหมด' : 'Total Detections'}</p>
                            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{metrics.total}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                            <Activity className="w-5 h-5 text-slate-600" />
                        </div>
                    </div>

                    <div className="bg-white border border-rose-100 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                        <div>
                            <p className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">{isThai ? 'ตรวจพบโรคพืช' : 'Disease Detections'}</p>
                            <p className="text-xl sm:text-2xl font-black text-rose-700 mt-0.5">{metrics.diseases}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                            <Leaf className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="bg-white border border-amber-100 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                        <div>
                            <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">{isThai ? 'ตรวจพบศัตรูพืช' : 'Pest Detections'}</p>
                            <p className="text-xl sm:text-2xl font-black text-amber-800 mt-0.5">{metrics.pests}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                            <Bug className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Detection Summary Chart */}
                <div className="bg-white p-5 sm:p-7 rounded-3xl shadow-sm border border-slate-200/80">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                            <BarChart3 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900 leading-tight">
                                {t('historyPage.chart.title')}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                {(() => {
                                    const sDate = new Date(startDate);
                                    const eDate = new Date(endDate);
                                    const today = new Date();
                                    
                                    const isSameDay = startDate === endDate;
                                    const isToday = sDate.toDateString() === today.toDateString() && isSameDay;
                                    
                                    if (isSameDay) {
                                        return (
                                            <span className="text-emerald-700 font-bold">
                                                {t('historyPage.filters.period')}: {' '}
                                                {sDate.toLocaleDateString(isThai ? 'th-TH' : 'en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                                {isToday && ` (${t('historyPage.filters.today')})`}
                                            </span>
                                        );
                                    }
                                    
                                    return (
                                        <span className="text-emerald-700 font-bold">
                                            {t('historyPage.filters.period')}: {' '}
                                            {sDate.toLocaleDateString(isThai ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short' })} - {eDate.toLocaleDateString(isThai ? 'th-TH' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    );
                                })()}
                            </p>
                        </div>
                    </div>

                    <div className="h-60 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 11, fontWeight: 'bold', fill: '#64748b' }} 
                                    dy={8}
                                />
                                <YAxis 
                                    allowDecimals={false} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} 
                                />
                                <Tooltip 
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                    formatter={(value, name) => [value, name === 'disease' ? t('nav.diseases') : t('nav.pests')]}
                                />
                                <Legend 
                                    verticalAlign="top" 
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => <span className="font-bold text-xs text-slate-700">{value === 'disease' ? t('nav.diseases') : t('nav.pests')}</span>}
                                />
                                <Bar dataKey="disease" name="disease" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="pest" name="pest" fill="#f97316" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* List/Table View Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                                <HistoryIcon className="w-4 h-4 text-emerald-600" />
                            </div>
                            <h3 className="text-base font-black text-slate-900">
                                {t('historyPage.table.detected')}
                            </h3>
                        </div>
                    </div>

                    {/* Desktop Table View (hidden on mobile) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                                    <th className="py-3.5 px-5 w-16">#</th>
                                    <th className="py-3.5 px-5">{t('historyPage.table.date')}</th>
                                    <th className="py-3.5 px-5">{t('historyPage.table.detected')}</th>
                                    <th className="py-3.5 px-5 text-center">{t('historyPage.table.type')}</th>
                                    <th className="py-3.5 px-5">{t('historyPage.table.location')}</th>
                                    <th className="py-3.5 px-5 text-right">{t('historyPage.table.manage')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="py-4 px-5"><div className="h-4 bg-slate-100 rounded w-8"></div></td>
                                            <td className="py-4 px-5"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                                            <td className="py-4 px-5"><div className="h-4 bg-slate-100 rounded w-40"></div></td>
                                            <td className="py-4 px-5"><div className="h-6 bg-slate-100 rounded-full w-20 mx-auto"></div></td>
                                            <td className="py-4 px-5"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                                            <td className="py-4 px-5"><div className="h-8 bg-slate-100 rounded-xl w-24 ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : historyData.length > 0 ? (
                                    historyData.map((item, index) => (
                                        <tr key={item.id || index} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3.5 px-5 font-bold text-slate-500">
                                                {(page - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="py-3.5 px-5 font-semibold text-slate-700">
                                                {formatDate(item.created_at, isThai)}
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-3">
                                                    {item.image_path && (
                                                        <img 
                                                            src={getImageUrl(item.image_path)} 
                                                            alt="Detect" 
                                                            className="w-9 h-9 rounded-lg object-cover shadow-xs border border-slate-200"
                                                        />
                                                    )}
                                                     <span className="font-bold text-slate-900">
                                                        {isThai
                                                          ? (item.disease?.thai_name || item.disease?.eng_name || item.predictions?.[0]?.label || 'Unknown')
                                                          : (item.disease?.eng_name || item.disease?.thai_name || item.predictions?.[0]?.label || 'Unknown')}
                                                     </span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-5 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusColor(item.type)}`}>
                                                    {item.type === 'disease' ? <Leaf className="w-3 h-3 mr-1" /> : <Bug className="w-3 h-3 mr-1" />}
                                                    {item.type === 'disease' ? t('nav.diseases') : t('nav.pests')}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-5 text-xs font-semibold text-slate-600">
                                                {item.plot?.name ? (isThai ? `แปลง ${item.plot.name}` : `Plot ${item.plot.name}`) : '-'} 
                                                <span className="text-slate-300 mx-2">|</span>
                                                {item.vegetable?.name || '-'}
                                            </td>
                                            <td className="py-3.5 px-5 text-right">
                                                {(() => {
                                                    const targetId = item.disease_pest_id || item.disease_id || item.disease?._id || item.disease?.id;
                                                    const hasDetail = Boolean(targetId || item.disease);
                                                    return (
                                                        <button 
                                                            onClick={() => openDetail(targetId, item.disease)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                                                            disabled={!hasDetail}
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            <span>{t('historyPage.table.view')}</span>
                                                        </button>
                                                    );
                                                })()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                                                    <Search className="w-6 h-6 text-slate-400" />
                                                </div>
                                                <p className="font-bold text-sm text-slate-700">{t('common.noResults')}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{t('vegetablesPage.tryAgain')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card List View (visible on mobile only) */}
                    <div className="block md:hidden p-4 space-y-3">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="p-4 bg-slate-50 rounded-2xl animate-pulse space-y-3">
                                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                                    <div className="h-10 bg-slate-200 rounded"></div>
                                </div>
                            ))
                        ) : historyData.length > 0 ? (
                            historyData.map((item, index) => {
                                const targetId = item.disease_pest_id || item.disease_id || item.disease?._id || item.disease?.id;
                                const hasDetail = Boolean(targetId || item.disease);
                                return (
                                    <div key={item.id || index} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-3">
                                        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                                            <span>#{ (page - 1) * itemsPerPage + index + 1 } — {formatDate(item.created_at, isThai)}</span>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(item.type)}`}>
                                                {item.type === 'disease' ? t('nav.diseases') : t('nav.pests')}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {item.image_path && (
                                                <img 
                                                    src={getImageUrl(item.image_path)} 
                                                    alt="Detect" 
                                                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                                                />
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-sm text-slate-900 truncate">
                                                    {isThai
                                                      ? (item.disease?.thai_name || item.disease?.eng_name || item.predictions?.[0]?.label || 'Unknown')
                                                      : (item.disease?.eng_name || item.disease?.thai_name || item.predictions?.[0]?.label || 'Unknown')}
                                                </p>
                                                <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                                                    {item.plot?.name ? (isThai ? `แปลง ${item.plot.name}` : `Plot ${item.plot.name}`) : '-'} | {item.vegetable?.name || '-'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-1 flex justify-end">
                                            <button 
                                                onClick={() => openDetail(targetId, item.disease)}
                                                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                                                disabled={!hasDetail}
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>{t('historyPage.table.view')}</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-8 text-center text-slate-400">
                                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="font-bold text-xs text-slate-700">{t('common.noResults')}</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between bg-white">
                         <div className="text-xs font-semibold text-slate-500">
                            {t('vegetablesPage.page', { page: page, totalPages: totalPages })}
                         </div>
                         <div className="flex gap-2">
                             <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                             >
                                  <ChevronLeft className="w-4 h-4" />
                              </button>
                             <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                             >
                                  <ChevronRight className="w-4 h-4" />
                              </button>
                         </div>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedDetail && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={() => setSelectedDetail(null)} />

                    <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 duration-300">
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedDetail(null)}
                            className="absolute top-4 right-4 z-50 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-all active:scale-95 shadow-xs"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Left: Image */}
                        <div className={`w-full md:w-5/12 ${selectedDetail.type === '1' ? 'bg-rose-950' : 'bg-amber-950'} relative flex flex-col transition-all duration-500 ease-out basis-64 min-h-[16rem] md:basis-auto md:min-h-0 shadow-2xl z-10`}>
                            <div className="relative w-full h-full">
                                <img
                                    src={selectedDetail.image_path ? getImageUrl(selectedDetail.image_path) : 'https://placehold.co/800x600?text=No+Image'}
                                    className="w-full h-full object-cover opacity-85"
                                    alt={selectedDetail.thai_name}
                                />
                                <div className={`absolute inset-0 bg-gradient-to-t ${selectedDetail.type === '1' ? 'from-rose-950/95' : 'from-amber-950/95'} via-transparent to-transparent`} />

                                <div className="absolute bottom-0 left-0 p-6 sm:p-8 text-white w-full">
                                    <div className="flex items-center gap-2 mb-3 bg-white/10 backdrop-blur-md w-fit px-3 py-1 rounded-lg border border-white/10">
                                        <Activity className={`w-3.5 h-3.5 ${selectedDetail.type === '1' ? 'text-rose-400' : 'text-amber-400'} animate-pulse`} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{selectedDetail.severity || t('detectPage.severity.medium')} Danger</span>
                                    </div>
                                    <h2 className="text-2xl sm:text-4xl font-black mb-2 drop-shadow-md tracking-tight leading-tight">
                                        {isThai ? selectedDetail.thai_name : (selectedDetail.eng_name || selectedDetail.thai_name)}
                                    </h2>
                                    <p className="text-white/70 font-bold text-sm uppercase tracking-wider">{isThai ? selectedDetail.eng_name : selectedDetail.thai_name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Content */}
                        <div className="w-full md:w-7/12 bg-white flex-1 md:h-full overflow-y-auto custom-scrollbar flex flex-col">
                            <div className="p-6 sm:p-10 space-y-8">
                                <section>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-10 h-10 rounded-xl ${selectedDetail.type === '1' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'} flex items-center justify-center shrink-0 shadow-xs`}>
                                            <Info className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">{t('detailPage.description')}</h3>
                                    </div>
                                    <div 
                                        className="text-slate-600 text-xs sm:text-sm leading-relaxed prose prose-slate max-w-none font-medium [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_p]:mb-3 formatted-text html-content" 
                                        dangerouslySetInnerHTML={{ __html: cleanHtmlContent((isThai ? selectedDetail.description : (selectedDetail.description_en || selectedDetail.description)) || t('vegetablesPage.noDataDetails')) }} 
                                    />
                                </section>

                                <section>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
                                            {selectedDetail.type === '1' ? <Thermometer className="w-5 h-5" /> : <Bug className="w-5 h-5" />}
                                        </div>
                                        <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">{t('detailPage.cause')}</h3>
                                    </div>
                                    <div 
                                        className="text-slate-600 text-xs sm:text-sm leading-relaxed prose prose-slate max-w-none font-medium [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_p]:mb-3 formatted-text html-content" 
                                        dangerouslySetInnerHTML={{ __html: cleanHtmlContent((isThai ? selectedDetail.cause : (selectedDetail.cause_en || selectedDetail.cause)) || t('vegetablesPage.noDataDetails')) }} 
                                    />
                                </section>

                                <section>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">{t('detailPage.treatment')}</h3>
                                    </div>
                                    <div 
                                        className="text-slate-600 text-xs sm:text-sm leading-relaxed prose prose-emerald max-w-none font-medium [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_p]:mb-3 formatted-text html-content" 
                                        dangerouslySetInnerHTML={{ __html: cleanHtmlContent((isThai ? selectedDetail.treatment : (selectedDetail.treatment_en || selectedDetail.treatment)) || t('vegetablesPage.noDataDetails')) }} 
                                    />
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Popup Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
                    <button
                        className="absolute top-6 right-6 p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all active:scale-95"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <img
                        src={getImageUrl(selectedImage)}
                        alt="Full size"
                        className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default HistoryPage;
