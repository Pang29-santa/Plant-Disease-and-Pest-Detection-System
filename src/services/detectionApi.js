import axios from 'axios';

const AI_API_URL = '/api/ai';
const DETECTION_API_URL = '/api/detection';

/**
 * วิเคราะห์รูปภาพแบบ public (ไม่ต้อง login)
 * @param {File} imageFile - ไฟล์รูปภาพ
 * @returns {Promise} ผลการวิเคราะห์
 */
export const analyzePublic = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);

  const response = await axios.post('/api/analyze-public', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * บันทึกผลการตรวจจับ (save_detection)
 * @param {Object} data - ข้อมูลการตรวจจับ
 * @returns {Promise} ผลการบันทึก
 */
export const saveDetection = async (data) => {
  const response = await axios.post('/api/save_detection', data);
  return response.data;
};

/**
 * เพิ่มการตรวจจับ (detection/add)
 * @param {Object} data - ข้อมูลการตรวจจับ
 * @returns {Promise} ผลการเพิ่ม
 */
export const addDetection = async (data) => {
  const response = await axios.post(`${DETECTION_API_URL}/add`, data);
  return response.data;
};

/**
 * ดึงประวัติการตรวจจับของผู้ใช้
 * @param {number} userId - ID ผู้ใช้
 * @param {Object} params - พารามิเตอร์ (plot_id, start_date, end_date, limit, skip)
 * @returns {Promise<Array>} รายการประวัติ
 */
export const getDetectionsByUser = async (userId, params = {}) => {
  const response = await axios.get(`${DETECTION_API_URL}/by-user/${userId}`, { params });
  return response.data;
};

/**
 * ดึงรายละเอียดการตรวจจับ
 * @param {string} detectionId - MongoDB ID ของการตรวจจับ
 * @returns {Promise<Object>} รายละเอียด
 */
export const getDetectionById = async (detectionId) => {
  const response = await axios.get(`${DETECTION_API_URL}/${detectionId}`);
  return response.data;
};

export default {
  analyzePublic,
  saveDetection,
  addDetection,
  getDetectionsByUser,
  getDetectionById,
};
