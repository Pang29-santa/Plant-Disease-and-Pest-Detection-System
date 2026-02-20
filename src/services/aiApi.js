/**
 * AI Detection API Client
 * เรียก API ที่ backend เพื่อวิเคราะห์รูปภาพด้วย Kimi AI
 */

import axios from 'axios';

const API_URL = '/api/ai';

/**
 * วิเคราะห์โรคพืชจากรูปภาพ
 * @param {File} imageFile - ไฟล์รูปภาพ
 * @param {Object} options - ตัวเลือกเพิ่มเติม
 * @returns {Promise} ผลการวิเคราะห์
 */
export const detectDisease = async (imageFile, options = {}) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('save_result', options.saveResult ? 'true' : 'false');
  if (options.plotId) {
    formData.append('plot_id', options.plotId);
  }

  const response = await axios.post(`${API_URL}/detect/disease`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * วิเคราะห์แมลงศัตรูพืชจากรูปภาพ
 * @param {File} imageFile - ไฟล์รูปภาพ
 * @param {Object} options - ตัวเลือกเพิ่มเติม
 * @returns {Promise} ผลการวิเคราะห์
 */
export const detectPest = async (imageFile, options = {}) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('save_result', options.saveResult ? 'true' : 'false');
  if (options.plotId) {
    formData.append('plot_id', options.plotId);
  }

  const response = await axios.post(`${API_URL}/detect/pest`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * สนทนากับ AI ผู้ช่วย
 * @param {string} message - ข้อความคำถาม
 * @param {string} context - บริบทเพิ่มเติม (optional)
 * @returns {Promise} คำตอบจาก AI
 */
export const chatWithAI = async (message, context = null) => {
  const formData = new FormData();
  formData.append('message', message);
  if (context) {
    formData.append('context', context);
  }

  const response = await axios.post(`${API_URL}/chat`, formData);
  return response.data;
};

/**
 * ดึงประวัติการตรวจจับ
 * @param {Object} params - พารามิเตอร์
 * @returns {Promise} รายการประวัติ
 */
export const getDetectionHistory = async (params = {}) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.user_id) {
      console.warn('No user ID found for fetching history');
      return [];
  }
  console.log(`[API] Fetching detection history for user ${user.user_id}`, params);
  const response = await axios.get(`/api/detection/by-user/${user.user_id}`, {
    params: params,
  });
  console.log(`[API] Received ${response.data?.length || 0} records`);
  return response.data;
};

/**
 * ยืนยันผลการตรวจจับ AI
 * @param {string} detectionId - ID การตรวจจับ
 * @param {Object} data - ข้อมูลการยืนยัน
 * @returns {Promise} ผลการอัปเดต
 */
export const verifyDetection = async (detectionId, data) => {
  const formData = new FormData();
  formData.append('is_correct', data.isCorrect ? 'true' : 'false');
  if (data.correctDiseaseId) {
    formData.append('correct_disease_id', data.correctDiseaseId);
  }
  if (data.notes) {
    formData.append('notes', data.notes);
  }

  const response = await axios.post(
    `${API_URL}/verify-detection/${detectionId}`,
    formData
  );
  return response.data;
};

export default {
  detectDisease,
  detectPest,
  chatWithAI,
  getDetectionHistory,
  verifyDetection,
};
