/**
 * useAdminStats Hook
 * ==================
 * Hook สำหรับดึงข้อมูลสถิติสำหรับหน้า Admin
 * 
 * Usage:
 * const { stats, loading, error, fetchStats } = useAdminStats();
 */

import { useState, useCallback, useEffect } from 'react';
import adminStatsApi from '../services/adminStatsApi';

export const useAdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * ดึงข้อมูลสถิติทั่วไป
   * @param {number} year - ปี
   * @param {number} month - เดือน (optional)
   * @param {string} diseaseType - '1' หรือ '2' (optional)
   */
  const fetchStats = useCallback(async (year, month = null, diseaseType = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await adminStatsApi.getDetectionStats(year, month, diseaseType);
      setStats(data);
      return data;
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * ดึงข้อมูลสถิติประจำวัน (top 3)
   * @param {string} date - วันที่ YYYY-MM-DD (optional, default: วันนี้)
   */
  const fetchDailyStats = useCallback(async (date = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await adminStatsApi.getTopDailyDetections(date);
      setStats(data);
      return data;
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * ดึงข้อมูลสถิติสำหรับวันนี้
   */
  const fetchTodayStats = useCallback(async () => {
    return fetchDailyStats();
  }, [fetchDailyStats]);

  /**
   * ดึงข้อมูลสถิติสำหรับเดือนปัจจุบัน
   * @param {number} year - ปี (optional)
   */
  const fetchCurrentMonthStats = useCallback(async (year = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await adminStatsApi.getCurrentMonthStats(year);
      setStats(data);
      return data;
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * ดึงข้อมูลสถิติสำหรับปีปัจจุบัน
   */
  const fetchCurrentYearStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await adminStatsApi.getCurrentYearStats();
      setStats(data);
      return data;
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * ดึงรายการเดือนที่มีข้อมูล
   * @param {number} year - ปี
   */
  const fetchAvailableMonths = useCallback(async (year) => {
    try {
      return await adminStatsApi.getAvailableMonths(year);
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  return {
    stats,
    loading,
    error,
    fetchStats,
    fetchDailyStats,
    fetchTodayStats,
    fetchCurrentMonthStats,
    fetchCurrentYearStats,
    fetchAvailableMonths,
  };
};

/**
 * useAvailableMonths Hook
 * Hook สำหรับดึงรายการเดือนที่มีข้อมูล
 * 
 * Usage:
 * const { months, loading, fetchMonths } = useAvailableMonths(year);
 */
export const useAvailableMonths = (initialYear = null) => {
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMonths = useCallback(async (year) => {
    if (!year) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await adminStatsApi.getAvailableMonths(year);
      setMonths(data);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // โหลดข้อมูลอัตโนมัติถ้ามี initialYear
  useEffect(() => {
    if (initialYear) {
      fetchMonths(initialYear);
    }
  }, [initialYear, fetchMonths]);

  return {
    months,
    loading,
    error,
    fetchMonths,
  };
};

export default useAdminStats;
