import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import harvestApi from '../../services/harvestApi';
import axios from 'axios';
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Sprout,
  LayoutGrid,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Loader2,
  Leaf
} from 'lucide-react';
import Swal from 'sweetalert2';

const fmt = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const fmtNum = (n) => {
  if (n === undefined || n === null) return '-';
  return Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const HarvestHistory = () => {
  const { t, i18n } = useTranslation();
  const isThai = i18n.language?.startsWith('th');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [plots, setPlots] = useState([]);
  const [selectedPlot, setSelectedPlot] = useState(searchParams.get('plot_id') || '');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isPlotSelectOpen, setIsPlotSelectOpen] = useState(false);
  const plotSelectRef = useRef(null);
  const limit = 10;

  const fetchData = async () => {
    if (!user?.user_id) return;
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (selectedPlot) {
        params.plot_id = parseInt(selectedPlot, 10);
      }
      const [recordsRes, summaryRes] = await Promise.all([
        harvestApi.getHarvestRecords(user.user_id, params),
        harvestApi.getHarvestSummary(user.user_id)
      ]);
      setRecords(recordsRes || []);
      setSummary(summaryRes);
    } catch (err) {
      console.error('Failed to fetch harvest history:', err);
      Swal.fire(t('admin.alerts.error'), 'ไม่สามารถโหลดประวัติการเก็บเกี่ยวได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlots = async () => {
    if (!user?.user_id) return;
    try {
      const res = await axios.get('/api/plots', { params: { user_id: user.user_id } });
      setPlots(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch plots:', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchPlots();
  }, [user, selectedPlot]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (plotSelectRef.current && !plotSelectRef.current.contains(e.target)) {
        setIsPlotSelectOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredRecords = selectedPlot
    ? records.filter(r => String(r.plot_id) === selectedPlot)
    : records;

  const totalPages = Math.ceil(filteredRecords.length / limit) || 1;
  const paginatedRecords = filteredRecords.slice((page - 1) * limit, page * limit);

  const currentSummary = selectedPlot
    ? {
        total_records: filteredRecords.length,
        total_income: filteredRecords.reduce((sum, r) => sum + (parseFloat(r.income || r.amount) || 0), 0),
        total_cost: filteredRecords.reduce((sum, r) => sum + (parseFloat(r.cost || r.expense) || 0), 0),
        total_quantity: filteredRecords.reduce((sum, r) => sum + (parseFloat(r.quantity) || 0), 0),
      }
    : summary || {};

  currentSummary.total_profit = (currentSummary.total_income || 0) - (currentSummary.total_cost || 0);

  const selectedPlotObj = plots.find(p => String(p.plot_id) === selectedPlot);

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <button
                onClick={() => navigate('/plots')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 mb-2 transition-colors group cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>{t('common.back', 'กลับไปหน้าแปลงผัก')}</span>
              </button>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {t('harvestHistoryPage.title', 'ประวัติการเก็บเกี่ยวทั้งหมด')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                {t('harvestHistoryPage.subtitle', 'ติดตามรายได้ ต้นทุน และสรุปกำไรสุทธิจากการเก็บเกี่ยวผลผลิต')}
              </p>
            </div>

            {/* Custom Plot Filter Dropdown */}
            <div className="relative" ref={plotSelectRef}>
              <button
                type="button"
                onClick={() => setIsPlotSelectOpen(!isPlotSelectOpen)}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between gap-3 shadow-xs hover:border-emerald-500 transition-all cursor-pointer min-w-[200px]"
              >
                <div className="flex items-center gap-2 truncate">
                  <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {selectedPlotObj ? (selectedPlotObj.name || selectedPlotObj.plot_name) : t('harvestHistoryPage.allPlots', 'ทุกแปลง')}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isPlotSelectOpen ? 'rotate-180' : ''}`} />
              </button>

              {isPlotSelectOpen && (
                <div className="absolute top-full right-0 left-0 sm:left-auto z-50 mt-1.5 w-full sm:w-64 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                  <div
                    onClick={() => { setSelectedPlot(''); setIsPlotSelectOpen(false); setPage(1); setSearchParams({}); }}
                    className={`px-4 py-2.5 text-xs cursor-pointer flex items-center justify-between transition-colors hover:bg-emerald-50 ${!selectedPlot ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 font-medium'}`}
                  >
                    <span>{t('harvestHistoryPage.allPlots', 'ทุกแปลง')}</span>
                    {!selectedPlot && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  {plots.map(p => (
                    <div
                      key={p._id || p.plot_id}
                      onClick={() => { setSelectedPlot(String(p.plot_id)); setIsPlotSelectOpen(false); setPage(1); setSearchParams({ plot_id: String(p.plot_id) }); }}
                      className={`px-4 py-2.5 text-xs cursor-pointer flex items-center justify-between transition-colors hover:bg-emerald-50 ${selectedPlot === String(p.plot_id) ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 font-medium'}`}
                    >
                      <span className="truncate">{p.name || p.plot_name}</span>
                      <span className="text-[10px] text-slate-400 font-semibold shrink-0 ml-2">#{p.plot_id}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <SummaryCard
            icon={Package}
            label={t('harvestHistoryPage.totalHarvests', 'จำนวนการเก็บเกี่ยว')}
            value={`${currentSummary.total_records || 0} ครั้ง`}
            bgClass="bg-blue-50/70 border-blue-100 text-blue-900"
            iconBgClass="bg-blue-100 text-blue-700"
          />
          <SummaryCard
            icon={Sprout}
            label={t('harvestHistoryPage.totalYield', 'ปริมาณรวม')}
            value={`${fmtNum(currentSummary.total_quantity)} กก.`}
            bgClass="bg-amber-50/70 border-amber-100 text-amber-900"
            iconBgClass="bg-amber-100 text-amber-700"
          />
          <SummaryCard
            icon={TrendingUp}
            label={t('harvestHistoryPage.totalRevenue', 'รายได้รวม')}
            value={`฿${fmtNum(currentSummary.total_income)}`}
            bgClass="bg-teal-50/70 border-teal-100 text-teal-900"
            iconBgClass="bg-teal-100 text-teal-700"
          />
          <SummaryCard
            icon={DollarSign}
            label={t('harvestHistoryPage.netProfit', 'กำไรสุทธิ')}
            value={`฿${fmtNum(currentSummary.total_profit)}`}
            bgClass={currentSummary.total_profit >= 0 ? 'bg-emerald-50/70 border-emerald-100 text-emerald-900' : 'bg-rose-50/70 border-rose-100 text-rose-900'}
            iconBgClass={currentSummary.total_profit >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}
          />
        </div>

        {/* Data Table Container */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin mx-auto text-emerald-600 mb-2" />
              <p className="text-xs font-semibold">กำลังโหลดข้อมูลประวัติการเก็บเกี่ยว...</p>
            </div>
          ) : paginatedRecords.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <LayoutGrid className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">ยังไม่มีประวัติการเก็บเกี่ยว</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                เริ่มต้นบันทึกการเก็บเกี่ยวจากหน้าแปลงผักเพื่อติดตามรายได้และผลผลิต
              </p>
              <button
                onClick={() => navigate('/plots')}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
              >
                ไปที่หน้าแปลงผัก
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-4">{t('harvestHistoryPage.table.plot', 'แปลง')}</th>
                      <th className="py-3.5 px-4">{t('harvestHistoryPage.table.crop', 'ผัก')}</th>
                      <th className="py-3.5 px-4">{t('harvestHistoryPage.table.date', 'วันที่เก็บเกี่ยว')}</th>
                      <th className="py-3.5 px-4 text-right">{t('harvestHistoryPage.table.yield', 'ปริมาณ (กก.)')}</th>
                      <th className="py-3.5 px-4 text-right">{t('harvestHistoryPage.table.income', 'รายรับ (บาท)')}</th>
                      <th className="py-3.5 px-4 text-right">{t('harvestHistoryPage.table.cost', 'รายจ่าย (บาท)')}</th>
                      <th className="py-3.5 px-4 text-right">{t('harvestHistoryPage.table.profit', 'กำไร (บาท)')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                    {paginatedRecords.map((record, idx) => {
                      const income = parseFloat(record.income || record.amount) || 0;
                      const cost = parseFloat(record.cost || record.expense) || 0;
                      const profit = income - cost;
                      const plotName = record.plot_name || plots.find(p => p.plot_id === record.plot_id)?.name || `แปลง #${record.plot_id}`;

                      return (
                        <tr key={record._id || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                              {plotName}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                              <Leaf className="w-3 h-3 text-emerald-600" />
                              {record.vegetable_name || '-'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {fmt(record.harvesting_date || record.actual_harvest_date)}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-slate-700">
                            {fmtNum(record.quantity)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-teal-600">
                            ฿{fmtNum(income)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-amber-600">
                            ฿{fmtNum(cost)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className={`inline-block font-bold px-2.5 py-0.5 rounded-md ${profit >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                              {profit >= 0 ? '+' : ''}฿{fmtNum(profit)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-slate-50/80 px-4 py-3 border-t border-slate-100 flex items-center justify-center">
                  <div className="inline-flex items-center gap-1">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, idx) => (
                      <button
                        key={idx + 1}
                        onClick={() => setPage(idx + 1)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          page === idx + 1
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ icon: Icon, label, value, bgClass, iconBgClass }) => (
  <div className={`${bgClass} border rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 shadow-xs`}>
    <div className={`${iconBgClass} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-wider opacity-70 truncate">{label}</p>
      <p className="text-base sm:text-lg font-black tracking-tight truncate mt-0.5">{value}</p>
    </div>
  </div>
);

export default HarvestHistory;
