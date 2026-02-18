import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Leaf,
  Bug,
  Sprout,
  Users
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Stats State
  const [stats, setStats] = useState({
    vegetables: 0,
    diseases: 0,
    pests: 0,
    users: 0
  });

  // Chart Data State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [topDiseases, setTopDiseases] = useState([]);
  const [topPests, setTopPests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check admin role
  useEffect(() => {
    if (user && user.role !== 'admin') {
      // navigate('/dashboard');
    }
  }, [user, navigate]);

  // Initial Data Fetch
  useEffect(() => {
    fetchGlobalStats();
    fetchDailyStats();
  }, []);

  const fetchGlobalStats = async () => {
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
        setTopDiseases(res.data.data.top_diseases || []);
        setTopPests(res.data.data.top_pests || []);
      }
    } catch (err) {
      console.error('Failed to fetch daily stats:', err);
      // Fallback
      setTopDiseases([]);
      setTopPests([]);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: t('admin.dashboard.stats.vegetables'),
      count: stats.vegetables,
      icon: Leaf,
      bg: 'bg-blue-600'
    },
    {
      title: t('admin.dashboard.stats.diseases'),
      count: stats.diseases,
      icon: Sprout,
      bg: 'bg-green-700'
    },
    {
      title: t('admin.dashboard.stats.pests'),
      count: stats.pests,
      icon: Bug,
      bg: 'bg-orange-500'
    },
    {
      title: t('admin.dashboard.stats.users'),
      count: stats.users,
      icon: Users,
      bg: 'bg-red-600'
    }
  ];

  return (
    <AdminLayout title={t('admin.dashboard.title')}>
      {/* Breadcrumb / Page Title */}
      <div className="mb-6 border-b pb-2">
        <h2 className="text-2xl font-bold text-green-700">{t('admin.dashboard.breadcrumb')}</h2>
        <div className="w-20 h-1 bg-green-500 mt-1 rounded-full"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`${card.bg} rounded-lg shadow-lg p-6 text-white relative overflow-hidden transition-transform hover:scale-[1.02] duration-300`}
          >
             {/* Decorative Icon Watermark */}
             <card.icon className="absolute -right-4 -bottom-4 w-32 h-32 text-white opacity-20 transform rotate-12" />
             
            <div className="relative z-10 flex flex-col items-center justify-center h-full gap-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold uppercase tracking-wider opacity-80">{card.title}</span>
                     <card.icon className="w-4 h-4 opacity-60" />
                </div>
              <span className="text-5xl font-black tabular-nums">{loading ? '-' : card.count}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Detection Statistics Section */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-green-800 mb-6 border-l-4 border-green-600 pl-4 uppercase tracking-tight">
          {t('admin.dashboard.daily.title')}
        </h3>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
                <label 
                  htmlFor="stats-date"
                  className="text-gray-500 font-bold uppercase text-xs tracking-widest cursor-pointer"
                >
                  {t('admin.dashboard.daily.selectDate')}:
                </label>
                <input 
                    id="stats-date"
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border border-gray-200 bg-gray-50 rounded-xl px-4 py-2 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                />
            </div>
            <button 
                onClick={fetchDailyStats}
                className="bg-green-700 hover:bg-green-800 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-green-100 transition-all hover:scale-105 active:scale-95"
            >
                {t('admin.dashboard.daily.load')}
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top 3 Diseases Chart */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <h4 className="text-lg font-bold text-gray-800 mb-2">{t('admin.dashboard.daily.topDiseases')}</h4>
                <p className="text-xs text-gray-400 font-medium mb-8 uppercase tracking-widest">{t('admin.dashboard.daily.topDiseases')} ({selectedDate})</p>
                <div className="h-72 relative">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topDiseases} layout="horizontal" margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis type="category" dataKey="name" tick={{fontSize: 11, fontWeight: 600, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                            <YAxis type="number" allowDecimals={false} tick={{fontSize: 12, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="count" fill="#F472B6" radius={[6, 6, 0, 0]} barSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                    {topDiseases.length === 0 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 gap-2">
                        <Sprout className="w-12 h-12 opacity-20" />
                        <p className="font-medium text-sm">{t('admin.dashboard.daily.noData')}</p>
                      </div>
                    )}
                </div>
            </div>

            {/* Top 3 Pests Chart */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                 <h4 className="text-lg font-bold text-gray-800 mb-2">{t('admin.dashboard.daily.topPests')}</h4>
                 <p className="text-xs text-gray-400 font-medium mb-8 uppercase tracking-widest">{t('admin.dashboard.daily.topPests')} ({selectedDate})</p>
                 <div className="h-72 relative">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topPests} layout="horizontal" margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis type="category" dataKey="name" tick={{fontSize: 11, fontWeight: 600, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                            <YAxis type="number" allowDecimals={false} tick={{fontSize: 12, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="count" fill="#34D399" radius={[6, 6, 0, 0]} barSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                     {topPests.length === 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 gap-2">
                          <Bug className="w-12 h-12 opacity-20" />
                          <p className="font-medium text-sm">{t('admin.dashboard.daily.noData')}</p>
                        </div>
                     )}
                 </div>
            </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
