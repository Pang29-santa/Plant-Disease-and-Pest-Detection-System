import axios from 'axios';

const API_URL = '/api/cctv';

/**
 * สร้างกล้อง CCTV ใหม่แบบ FormData (รองรับการอัปโหลดไฟล์)
 * @param {FormData} formData - ข้อมูลกล้องในรูปแบบ FormData
 * @returns {Promise} ผลการสร้าง
 */
export const createCCTVForm = async (formData) => {
  const response = await axios.post(`${API_URL}/form`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * อัปเดตกล้อง CCTV แบบ FormData (รองรับการอัปโหลดไฟล์)
 * @param {string} id - ID ของกล้อง
 * @param {FormData} formData - ข้อมูลกล้องในรูปแบบ FormData
 * @returns {Promise} ผลการอัปเดต
 */
export const updateCCTVForm = async (id, formData) => {
  const response = await axios.put(`${API_URL}/${id}/form`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export default {
  createCCTVForm,
  updateCCTVForm,
};
