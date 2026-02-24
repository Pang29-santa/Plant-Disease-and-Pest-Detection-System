/**
 * CCTV Stream API Client
 * ======================
 * API สำหรับสตรีมวิดีโอและตรวจสอบสถานะกล้อง CCTV
 * 
 * APIs:
 * - GET /api/cctv/stream/{cctv_id} - สตรีมวิดีโอแบบ MJPEG
 * - GET /api/cctv/status/{cctv_id} - ตรวจสอบสถานะกล้อง
 */

import axios from 'axios';

const API_URL = '/api/cctv';

/**
 * ตรวจสอบสถานะกล้อง CCTV (online/offline)
 * @param {string} cctvId - ID ของกล้อง (MongoDB ObjectId)
 * @returns {Promise<{
 *   status: 'online' | 'offline' | 'not_found',
 *   protocol?: string,
 *   reason?: string
 * }>}
 */
export const getCameraStatus = async (cctvId) => {
  const response = await axios.get(`${API_URL}/status/${cctvId}`);
  return response.data;
};

/**
 * ดึง URL สำหรับสตรีมวิดีโอจากกล้อง
 * @param {string} cctvId - ID ของกล้อง (MongoDB ObjectId)
 * @returns {string} URL สำหรับสตรีม
 */
export const getCameraStreamUrl = (cctvId) => {
  return `${API_URL}/stream/${cctvId}`;
};

/**
 * ตรวจสอบสถานะกล้องหลายตัวพร้อมกัน
 * @param {string[]} cctvIds - Array ของ CCTV IDs
 * @returns {Promise<Array<{id: string, status: string, protocol?: string}>>}
 */
export const getMultipleCameraStatus = async (cctvIds) => {
  const promises = cctvIds.map(async (id) => {
    try {
      const status = await getCameraStatus(id);
      return { id, ...status };
    } catch (error) {
      return { id, status: 'error', error: error.message };
    }
  });
  
  return Promise.all(promises);
};

/**
 * สร้าง Image element สำหรับแสดงสตรีม (ใช้กับ MJPEG stream)
 * @param {string} cctvId - ID ของกล้อง
 * @param {HTMLImageElement} imgElement - Image element ที่ต้องการแสดงสตรีม
 * @returns {Function} ฟังก์ชันสำหรับหยุดสตรีม
 */
export const attachStreamToImage = (cctvId, imgElement) => {
  const streamUrl = getCameraStreamUrl(cctvId);
  
  // ตั้งค่า src ของ image element
  imgElement.src = streamUrl;
  
  // คืนค่าฟังก์ชันสำหรับ cleanup
  return () => {
    imgElement.src = '';
  };
};

/**
 * สร้าง Video element สำหรับแสดงสตรีม (ใช้กับ HLS หรือ DASH ในอนาคต)
 * @param {string} cctvId - ID ของกล้อง
 * @param {HTMLVideoElement} videoElement - Video element
 * @returns {Promise<Function>} ฟังก์ชันสำหรับหยุดสตรีม
 */
export const attachStreamToVideo = async (cctvId, videoElement) => {
  // สำหรับ MJPEG stream ใน video element ต้องใช้ data URL หรือ proxy
  // ในกรณีนี้เราจะใช้ fetch และ MediaSource API (ถ้ารองรับ)
  
  const streamUrl = getCameraStreamUrl(cctvId);
  
  // ถ้า browser รองรับ MJPEG ใน video tag โดยตรง
  if (videoElement.canPlayType('multipart/x-mixed-replace')) {
    videoElement.src = streamUrl;
  } else {
    // Fallback: ใช้ Image element แทน
    console.warn('Browser does not support MJPEG in video element, consider using img element instead');
  }
  
  return () => {
    videoElement.pause();
    videoElement.src = '';
    videoElement.load();
  };
};

/**
 * Hook สำหรับจัดการสตรีม (สำหรับใช้ใน React)
 * @returns {Object} ฟังก์ชันและ state สำหรับจัดการสตรีม
 */
export const useCCTVStream = () => {
  // นี่เป็น pseudo-code สำหรับใช้เป็นแนวทางการสร้าง React Hook
  // ต้อง implement จริงในไฟล์ hooks/useCCTV.js
  
  return {
    getStatus: getCameraStatus,
    getStreamUrl: getCameraStreamUrl,
    getMultipleStatus: getMultipleCameraStatus,
  };
};

/**
 * ตรวจสอบว่า browser รองรับ MJPEG stream หรือไม่
 * @returns {boolean}
 */
export const isMjpegSupported = () => {
  const img = new Image();
  return typeof img.src !== 'undefined';
};

/**
 * สร้าง snapshot จากกล้อง (ถ่ายภาพนิ่ง)
 * @param {string} cctvId - ID ของกล้อง
 * @returns {Promise<string>} Base64 ของภาพ snapshot
 */
export const captureSnapshot = async (cctvId) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      try {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve(dataUrl);
      } catch (error) {
        reject(new Error('Cannot capture snapshot: ' + error.message));
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load camera stream'));
    };
    
    // เพิ่ม timestamp เพื่อป้องกัน caching
    img.src = `${getCameraStreamUrl(cctvId)}?t=${Date.now()}`;
  });
};

export default {
  getCameraStatus,
  getCameraStreamUrl,
  getMultipleCameraStatus,
  attachStreamToImage,
  attachStreamToVideo,
  isMjpegSupported,
  captureSnapshot,
};
