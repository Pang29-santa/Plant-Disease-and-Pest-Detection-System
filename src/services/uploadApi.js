/**
 * Upload API Client
 * =================
 * API สำหรับอัปโหลดไฟล์ (รูปภาพ, เอกสาร)
 * 
 * APIs:
 * - POST /api/upload-image - อัปโหลดรูปภาพสำหรับ CKEditor
 */

import axios from 'axios';

const API_URL = '/api';

/**
 * อัปโหลดรูปภาพสำหรับ CKEditor (Rich Text Editor)
 * @param {File} file - ไฟล์รูปภาพ
 * @param {Function} onProgress - callback สำหรับติดตามความคืบหน้า (optional)
 * @returns {Promise<{url: string, uploaded: boolean, filename: string}>}
 */
export const uploadImage = async (file, onProgress = null) => {
  const formData = new FormData();
  formData.append('upload', file);

  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };

  // เพิ่ม progress tracking ถ้ามี callback
  if (onProgress) {
    config.onUploadProgress = (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgress(percentCompleted);
    };
  }

  const response = await axios.post(`${API_URL}/upload-image`, formData, config);
  return response.data;
};

/**
 * อัปโหลดรูปภาพหลายไฟล์
 * @param {File[]} files - array ของไฟล์รูปภาพ
 * @param {Function} onProgress - callback สำหรับติดตามความคืบหน้า (optional)
 * @returns {Promise<Array<{url: string, uploaded: boolean, filename: string}>>}
 */
export const uploadMultipleImages = async (files, onProgress = null) => {
  const uploadPromises = files.map((file, index) => {
    return uploadImage(file, (percent) => {
      if (onProgress) {
        // คำนวณ progress รวมของทุกไฟล์
        const totalProgress = ((index + percent / 100) / files.length) * 100;
        onProgress(Math.round(totalProgress));
      }
    });
  });

  return Promise.all(uploadPromises);
};

/**
 * ตรวจสอบไฟล์ก่อนอัปโหลด
 * @param {File} file - ไฟล์ที่ต้องการตรวจสอบ
 * @param {Object} options - ตัวเลือกการตรวจสอบ
 * @returns {{valid: boolean, error: string|null}}
 */
export const validateImageFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']
  } = options;

  // ตรวจสอบขนาดไฟล์
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `ไฟล์มีขนาดใหญ่เกินไป (สูงสุด ${maxSize / (1024 * 1024)}MB)`
    };
  }

  // ตรวจสอบประเภทไฟล์
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `ประเภทไฟล์ไม่ถูกต้อง (รองรับ: JPG, PNG, GIF, WebP, BMP)`
    };
  }

  return { valid: true, error: null };
};

/**
 * แปลงไฟล์เป็น Base64 (สำหรับ preview)
 * @param {File} file - ไฟล์รูปภาพ
 * @returns {Promise<string>} Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export default {
  uploadImage,
  uploadMultipleImages,
  validateImageFile,
  fileToBase64,
};
