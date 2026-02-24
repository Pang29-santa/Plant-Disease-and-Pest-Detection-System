/**
 * Validation API Client
 * =====================
 * API สำหรับตรวจสอบความถูกต้องของข้อมูล (ตรวจสอบชื่อซ้ำ)
 * 
 * APIs:
 * - GET /api/check-vegetable-name - ตรวจสอบชื่อผักซ้ำ
 * - GET /api/check-diseasepest-name - ตรวจสอบชื่อโรค/ศัตรูพืชซ้ำ
 */

import axios from 'axios';

const API_URL = '/api';

/**
 * ตรวจสอบว่าชื่อผัก (ภาษาไทย) มีอยู่ในระบบแล้วหรือไม่
 * @param {string} thaiName - ชื่อผักภาษาไทย
 * @returns {Promise<{exists: boolean, thai_name: string, message: string}>}
 */
export const checkVegetableName = async (thaiName) => {
  const response = await axios.get(`${API_URL}/check-vegetable-name`, {
    params: { thai_name: thaiName }
  });
  return response.data;
};

/**
 * ตรวจสอบว่าชื่อโรคหรือศัตรูพืชมีอยู่ในระบบแล้วหรือไม่
 * @param {string} thaiName - ชื่อโรค/ศัตรูพืชภาษาไทย
 * @param {string} type - '1' สำหรับโรค, '2' สำหรับศัตรูพืช (optional)
 * @returns {Promise<{exists: boolean, thai_name: string, type: string, type_name: string, message: string}>}
 */
export const checkDiseasePestName = async (thaiName, type = null) => {
  const params = { thai_name: thaiName };
  if (type) {
    params.type = type;
  }
  
  const response = await axios.get(`${API_URL}/check-diseasepest-name`, {
    params
  });
  return response.data;
};

/**
 * ตรวจสอบชื่อผักแบบ real-time (พร้อม debounce)
 * @param {string} thaiName - ชื่อผักภาษาไทย
 * @param {number} delay - delay ใน milliseconds (default: 500)
 * @returns {Promise<{exists: boolean, thai_name: string, message: string}>}
 */
export const checkVegetableNameWithDebounce = (() => {
  let timeoutId = null;
  
  return (thaiName, delay = 500) => {
    return new Promise((resolve, reject) => {
      // Clear previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Set new timeout
      timeoutId = setTimeout(async () => {
        try {
          const result = await checkVegetableName(thaiName);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };
})();

/**
 * ตรวจสอบชื่อโรค/ศัตรูพืชแบบ real-time (พร้อม debounce)
 * @param {string} thaiName - ชื่อโรค/ศัตรูพืชภาษาไทย
 * @param {string} type - '1' สำหรับโรค, '2' สำหรับศัตรูพืช
 * @param {number} delay - delay ใน milliseconds (default: 500)
 * @returns {Promise<{exists: boolean, thai_name: string, type: string, type_name: string, message: string}>}
 */
export const checkDiseasePestNameWithDebounce = (() => {
  let timeoutId = null;
  
  return (thaiName, type = null, delay = 500) => {
    return new Promise((resolve, reject) => {
      // Clear previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Set new timeout
      timeoutId = setTimeout(async () => {
        try {
          const result = await checkDiseasePestName(thaiName, type);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };
})();

export default {
  checkVegetableName,
  checkDiseasePestName,
  checkVegetableNameWithDebounce,
  checkDiseasePestNameWithDebounce,
};
