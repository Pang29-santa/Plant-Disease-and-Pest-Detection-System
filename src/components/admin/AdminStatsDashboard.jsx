/**
 * AdminStatsDashboard Component
 * =============================
 * Component สำหรับแสดงสถิติสำหรับหน้า Admin
 * 
 * Usage:
 * <AdminStatsDashboard />
 * <AdminStatsDashboard year={2026} />
 */

import React, { useState, useEffect } from 'react';
import { useAdminStats, useAvailableMonths } from '../../hooks';

const AdminStatsDashboard = ({ initialYear = new Date().getFullYear() }) => {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(null);
  const { stats, loading, error, fetchStats, fetchTodayStats } = useAdminStats();
  const { months } = useAvailableMonths(year);

  // Load initial stats
  useEffect(() => {
    fetchStats(year, month);
  }, [year, month, fetchStats]);

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    setYear(newYear);
    setMonth(null); // Reset month when year changes
  };

  const handleMonthChange = (e) => {
    const value = e.target.value;
    setMonth(value === 'all' ? null : parseInt(value));
  };

  // Calculate chart max value for scaling
  const chartMax = stats?.chart_data?.datasets 
    ? Math.max(
        ...stats.chart_data.datasets.flatMap(d => d.data),
        1
      ) 
    : 1;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          สถิติการตรวจพบ
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ปี
            </label>
            <select
              value={year}
              onChange={handleYearChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y + 543} ({y})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เดือน
            </label>
            <select
              value={month || 'all'}
              onChange={handleMonthChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">ทั้งปี</option>
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => fetchTodayStats()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              ดูสถิติวันนี้
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          เกิดข้อผิดพลาด: {error}
        </div>
      )}

      {!loading && !error && stats && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 mb-1">การตรวจพบทั้งหมด</p>
              <p className="text-3xl font-bold text-blue-800">
                {stats.total_detections?.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 mb-1">โรคพืช (จากกราฟ)</p>
              <p className="text-3xl font-bold text-green-800">
                {stats.chart_data?.datasets?.[0]?.data?.reduce((a, b) => a + b, 0) || 0}
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-orange-600 mb-1">ศัตรูพืช (จากกราฟ)</p>
              <p className="text-3xl font-bold text-orange-800">
                {stats.chart_data?.datasets?.[1]?.data?.reduce((a, b) => a + b, 0) || 0}
              </p>
            </div>
          </div>

          {/* Chart */}
          {stats.chart_data && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {stats.chart_data.title}
              </h3>
              
              {/* Simple Bar Chart */}
              <div className="border-l-2 border-b-2 border-gray-300 p-4">
                <div className="flex items-end justify-between h-64 gap-2">
                  {stats.chart_data.labels?.map((label, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      {/* Disease Bar */}
                      <div className="w-full flex gap-1">
                        <div
                          className="flex-1 bg-green-500 rounded-t transition-all duration-300"
                          style={{
                            height: `${(stats.chart_data.datasets[0].data[index] / chartMax) * 200}px`,
                            minHeight: stats.chart_data.datasets[0].data[index] > 0 ? '4px' : '0'
                          }}
                          title={`${stats.chart_data.datasets[0].label}: ${stats.chart_data.datasets[0].data[index]}`}
                        />
                        <div
                          className="flex-1 bg-orange-500 rounded-t transition-all duration-300"
                          style={{
                            height: `${(stats.chart_data.datasets[1].data[index] / chartMax) * 200}px`,
                            minHeight: stats.chart_data.datasets[1].data[index] > 0 ? '4px' : '0'
                          }}
                          title={`${stats.chart_data.datasets[1].label}: ${stats.chart_data.datasets[1].data[index]}`}
                        />
                      </div>
                      <span className="text-xs text-gray-600 mt-2 -rotate-45 origin-top-left">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-6 mt-4">
                {stats.chart_data.datasets?.map((dataset, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded ${
                        index === 0 ? 'bg-green-500' : 'bg-orange-500'
                      }`}
                    />
                    <span className="text-sm text-gray-700">{dataset.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Items */}
          {stats.top_items?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                อันดับที่พบมากที่สุด
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">อันดับ</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ชื่อ</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">จำนวน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.top_items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-2 text-gray-600">{index + 1}</td>
                        <td className="px-4 py-2 font-medium">{item.name}</td>
                        <td className="px-4 py-2 text-right">{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminStatsDashboard;
