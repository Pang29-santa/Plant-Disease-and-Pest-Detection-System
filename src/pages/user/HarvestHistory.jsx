import React, { useState, useEffect } from 'react';
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
  Loader2
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [plots, setPlots] = useState([]);
  const [selectedPlot, setSelectedPlot] = useState(searchParams.get('plot_id') || '');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
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

  const handlePlotChange = (e) => {
    const plotId = e.target.value;
    setSelectedPlot(plotId);
    setPage(1);
    if (plotId) {
      setSearchParams({ plot_id: plotId });
    } else {
      setSearchParams({});
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate('/plots')}
              className="flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('common.back', 'กลับ')}
            </button>
            <h1 className="text-3xl font-black text-gray-900">ประวัติการเก็บเกี่ยว</h1>
            <p className="text-gray-500 mt-1">ติดตามรายได้ ต้นทุน และกำไรจากการเก็บเกี่ยวทั้งหมด</p>
          </div>

          {/* Plot Filter */}
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedPlot}
              onChange={handlePlotChange}
              className="bg-transparent border-none focus:ring-0 text-sm text-gray-700 min-w-[180px]"
            >
              <option value="">ทุกแปลง</option>
              {plots.map(plot => (
                <option key={plot._id || plot.plot_id} value={plot.plot_id}>
                  {plot.name || plot.plot_name} (แปลง #{plot.plot_id})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            icon={Package}
            label="จำนวนครั้ง"
            value={currentSummary.total_records || 0}
            color="bg-blue-500"
          />
          <SummaryCard
            icon={Sprout}
            label="ปริมาณรวม"
            value={`${fmtNum(currentSummary.total_quantity)} กก.`}
            color="bg-green-500"
          />
          <SummaryCard
            icon={TrendingUp}
            label="รายได้รวม"
            value={`฿${fmtNum(currentSummary.total_income)}`}
            color="bg-emerald-500"
          />
          <SummaryCard
            icon={DollarSign}
            label="กำไรสุทธิ"
            value={`฿${fmtNum(currentSummary.total_profit)}`}
            color={currentSummary.total_profit >= 0 ? 'bg-primary-500' : 'bg-red-500'}
          />
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
              <p className="mt-3 text-gray-500">กำลังโหลดข้อมูล...</p>
            </div>
          ) : paginatedRecords.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <LayoutGrid className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>ยังไม่มีประวัติการเก็บเกี่ยว</p>
              <button
                onClick={() => navigate('/plots')}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                ไปที่หน้าแปลงผัก
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">แปลง</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">ผัก</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">วันที่เก็บเกี่ยว</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">ปริมาณ</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">รายได้</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">ต้นทุน</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">กำไร</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedRecords.map((record, idx) => {
                      const income = parseFloat(record.income || record.amount) || 0;
                      const cost = parseFloat(record.cost || record.expense) || 0;
                      const profit = income - cost;
                      return (
                        <tr key={record._id || idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.plot_name || plots.find(p => p.plot_id === record.plot_id)?.name || `แปลง #${record.plot_id}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {record.vegetable_name || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {fmt(record.harvesting_date || record.actual_harvest_date)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                            {fmtNum(record.quantity)} กก.
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-emerald-600 font-medium">
                            ฿{fmtNum(income)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-orange-600 font-medium">
                            ฿{fmtNum(cost)}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ฿{fmtNum(profit)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-center">
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    {Array.from({ length: totalPages }, (_, idx) => (
                      <button
                        key={idx + 1}
                        onClick={() => setPage(idx + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                          page === idx + 1
                            ? 'z-10 bg-primary-600 border-primary-600 text-white'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
    <div className={`${color} text-white p-3 rounded-xl`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-xl font-black text-gray-900">{value}</p>
    </div>
  </div>
);

export default HarvestHistory;
