import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Leaf,
  Bug,
  Sprout,
  Users,
  Camera,
  Activity,
  Calendar,
  Loader2,
  FileBarChart
} from 'lucide-react';
import Swal from 'sweetalert2';

const ReportPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [dailyStats, setDailyStats] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/dashboard/stats');
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchDailyStats = async () => {
    try {
      const res = await axios.get(`/api/dashboard/daily-stats?date=${selectedDate}`);
      if (res.data?.success) {
        setDailyStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch daily stats:', err);
      setDailyStats({ top_diseases: [], top_pests: [] });
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchDailyStats()]);
      setLoading(false);
    };
    load();
  }, [selectedDate]);

  const statCards = [
    { icon: Leaf, label: 'ผัก', value: stats?.vegetables || 0, color: 'bg-green-500' },
    { icon: Sprout, label: 'โรคพืช', value: stats?.diseases || 0, color: 'bg-red-500' },
    { icon: Bug, label: 'ศัตรูพืช', value: stats?.pests || 0, color: 'bg-orange-500' },
    { icon: Users, label: 'ผู้ใช้งาน', value: stats?.users || 0, color: 'bg-blue-500' },
    { icon: Camera, label: 'กล้อง CCTV', value: stats?.cctv || 0, color: 'bg-purple-500' },
    { icon: Activity, label: 'การตรวจจับ', value: stats?.detections || 0, color: 'bg-teal-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back', 'กลับ')}
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <FileBarChart className="w-8 h-8 text-primary-600" />
                รายงานสรุประบบ
              </h1>
              <p className="text-gray-500 mt-1">ภาพรวมข้อมูลและสถิติของระบบทั้งหมด</p>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
              <Calendar className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm text-gray-700"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
            <p className="mt-3 text-gray-500">กำลังโหลดข้อมูล...</p>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {statCards.map((card, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
                  <div className={`${card.color} text-white p-3 rounded-xl`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{card.label}</p>
                    <p className="text-2xl font-black text-gray-900">{card.value.toLocaleString('th-TH')}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Daily Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-red-500" />
                  โรคพืชที่ตรวจพบมากที่สุด ({selectedDate})
                </h2>
                {dailyStats?.top_diseases?.length > 0 ? (
                  <div className="space-y-3">
                    {dailyStats.top_diseases.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="font-medium text-gray-700">{idx + 1}. {item.name}</span>
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                          {item.count} ครั้ง
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">ไม่มีข้อมูลการตรวจพบโรคพืชในวันที่เลือก</p>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Bug className="w-5 h-5 text-orange-500" />
                  ศัตรูพืชที่ตรวจพบมากที่สุด ({selectedDate})
                </h2>
                {dailyStats?.top_pests?.length > 0 ? (
                  <div className="space-y-3">
                    {dailyStats.top_pests.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="font-medium text-gray-700">{idx + 1}. {item.name}</span>
                        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-bold">
                          {item.count} ครั้ง
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">ไม่มีข้อมูลการตรวจพบศัตรูพืชในวันที่เลือก</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportPage;
