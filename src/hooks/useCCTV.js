/**
 * useCCTV Hook
 * ============
 * Hook สำหรับจัดการกล้อง CCTV (สตรีมและสถานะ)
 * 
 * Usage:
 * const { status, loading, error, checkStatus, getStreamUrl } = useCCTV(cctvId);
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import cctvStreamApi from '../services/cctvStreamApi';

export const useCCTV = (cctvId) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  /**
   * ตรวจสอบสถานะกล้อง
   */
  const checkStatus = useCallback(async () => {
    if (!cctvId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await cctvStreamApi.getCameraStatus(cctvId);
      setStatus(data);
      return data;
    } catch (err) {
      setError(err.message || 'ไม่สามารถตรวจสอบสถานะกล้องได้');
      return null;
    } finally {
      setLoading(false);
    }
  }, [cctvId]);

  /**
   * ดึง URL สำหรับสตรีม
   */
  const getStreamUrl = useCallback(() => {
    if (!cctvId) return null;
    return cctvStreamApi.getCameraStreamUrl(cctvId);
  }, [cctvId]);

  /**
   * ถ่ายภาพ snapshot
   */
  const captureSnapshot = useCallback(async () => {
    if (!cctvId) return null;
    
    try {
      const snapshot = await cctvStreamApi.captureSnapshot(cctvId);
      return snapshot;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [cctvId]);

  /**
   * เริ่มตรวจสอบสถานะอัตโนมัติทุก n วินาที
   * @param {number} interval - ระยะเวลาเป็นวินาที (default: 30)
   */
  const startAutoCheck = useCallback((interval = 30) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    checkStatus(); // ตรวจสอบทันที
    
    intervalRef.current = setInterval(() => {
      checkStatus();
    }, interval * 1000);
  }, [checkStatus]);

  /**
   * หยุดตรวจสอบสถานะอัตโนมัติ
   */
  const stopAutoCheck = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Cleanup เมื่อ unmount
  useEffect(() => {
    return () => {
      stopAutoCheck();
    };
  }, [stopAutoCheck]);

  // ตรวจสอบสถานะทันทีเมื่อ cctvId เปลี่ยน
  useEffect(() => {
    if (cctvId) {
      checkStatus();
    }
  }, [cctvId, checkStatus]);

  return {
    status,
    loading,
    error,
    checkStatus,
    getStreamUrl,
    captureSnapshot,
    startAutoCheck,
    stopAutoCheck,
    isOnline: status?.status === 'online',
  };
};

/**
 * useCCTVStream Hook
 * Hook สำหรับจัดการสตรีมวิดีโอ
 * 
 * Usage:
 * const { streamUrl, attachToImage } = useCCTVStream(cctvId);
 */
export const useCCTVStream = (cctvId) => {
  const [streamUrl, setStreamUrl] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (cctvId) {
      const url = cctvStreamApi.getCameraStreamUrl(cctvId);
      setStreamUrl(url);
    } else {
      setStreamUrl(null);
    }
  }, [cctvId]);

  /**
   * แนบสตรีมให้กับ Image element
   * @param {HTMLImageElement} imgElement - Image element
   * @returns {Function} ฟังก์ชันสำหรับหยุดสตรีม
   */
  const attachToImage = useCallback((imgElement) => {
    if (!cctvId || !imgElement) return () => {};
    
    setIsStreaming(true);
    const cleanup = cctvStreamApi.attachStreamToImage(cctvId, imgElement);
    
    return () => {
      cleanup();
      setIsStreaming(false);
    };
  }, [cctvId]);

  /**
   * แนบสตรีมให้กับ Video element
   * @param {HTMLVideoElement} videoElement - Video element
   */
  const attachToVideo = useCallback(async (videoElement) => {
    if (!cctvId || !videoElement) return () => {};
    
    setIsStreaming(true);
    const cleanup = await cctvStreamApi.attachStreamToVideo(cctvId, videoElement);
    
    return () => {
      cleanup();
      setIsStreaming(false);
    };
  }, [cctvId]);

  return {
    streamUrl,
    isStreaming,
    attachToImage,
    attachToVideo,
  };
};

/**
 * useMultipleCCTV Hook
 * Hook สำหรับจัดการหลายกล้องพร้อมกัน
 * 
 * Usage:
 * const { statuses, loading, checkAllStatus } = useMultipleCCTV(cctvIds);
 */
export const useMultipleCCTV = (cctvIds = []) => {
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkAllStatus = useCallback(async () => {
    if (!cctvIds.length) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const results = await cctvStreamApi.getMultipleCameraStatus(cctvIds);
      const statusMap = {};
      results.forEach((result) => {
        statusMap[result.id] = result;
      });
      setStatuses(statusMap);
      return statusMap;
    } catch (err) {
      setError(err.message);
      return {};
    } finally {
      setLoading(false);
    }
  }, [cctvIds]);

  useEffect(() => {
    if (cctvIds.length > 0) {
      checkAllStatus();
    }
  }, [cctvIds, checkAllStatus]);

  return {
    statuses,
    loading,
    error,
    checkAllStatus,
    getOnlineCount: () => Object.values(statuses).filter(s => s.status === 'online').length,
    getOfflineCount: () => Object.values(statuses).filter(s => s.status === 'offline').length,
  };
};

export default useCCTV;
