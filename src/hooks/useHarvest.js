import { useState, useEffect, useCallback } from 'react';
import harvestApi from '../services/harvestApi';

/**
 * Hook สำหรับดึงข้อมูลประวัติการเก็บเกี่ยว
 * @param {number} userId - ID ผู้ใช้
 * @param {Object} options - options { plotId, limit }
 */
export const useHarvest = (userId, options = {}) => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecords = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (options.plotId) params.plot_id = options.plotId;
      if (options.limit) params.limit = options.limit;

      const [recordsRes, summaryRes] = await Promise.all([
        harvestApi.getHarvestRecords(userId, params),
        harvestApi.getHarvestSummary(userId)
      ]);
      setRecords(recordsRes || []);
      setSummary(summaryRes);
    } catch (err) {
      setError(err.message || 'Failed to fetch harvest records');
    } finally {
      setLoading(false);
    }
  }, [userId, options.plotId, options.limit]);

  const fetchStats = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await harvestApi.getHarvestStats(userId);
      setStats(res);
    } catch (err) {
      console.error('Failed to fetch harvest stats:', err);
    }
  }, [userId]);

  useEffect(() => {
    fetchRecords();
    fetchStats();
  }, [fetchRecords, fetchStats]);

  return {
    records,
    summary,
    stats,
    loading,
    error,
    refetch: fetchRecords,
  };
};

export default useHarvest;
