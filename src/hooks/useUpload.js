/**
 * useUpload Hook
 * ==============
 * Hook สำหรับอัปโหลดไฟล์
 * 
 * Usage:
 * const { upload, uploading, progress, error, validateFile } = useUpload();
 */

import { useState, useCallback } from 'react';
import uploadApi from '../services/uploadApi';

export const useUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  /**
   * อัปโหลดรูปภาพ
   * @param {File} file - ไฟล์รูปภาพ
   * @param {Object} options - ตัวเลือกเพิ่มเติม
   * @returns {Promise<{url: string, uploaded: boolean, filename: string}>}
   */
  const upload = useCallback(async (file, options = {}) => {
    // Validate file ก่อนอัปโหลด
    const validation = uploadApi.validateImageFile(file, options.validation);
    if (!validation.valid) {
      setError(validation.error);
      return null;
    }

    setUploading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      const data = await uploadApi.uploadImage(file, (percent) => {
        setProgress(percent);
        if (options.onProgress) {
          options.onProgress(percent);
        }
      });

      setResult(data);
      
      if (options.onSuccess) {
        options.onSuccess(data);
      }

      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'อัปโหลดล้มเหลว';
      setError(errorMsg);
      
      if (options.onError) {
        options.onError(errorMsg);
      }
      
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  /**
   * อัปโหลดหลายไฟล์
   * @param {File[]} files - array ของไฟล์
   * @param {Object} options - ตัวเลือกเพิ่มเติม
   * @returns {Promise<Array>}
   */
  const uploadMultiple = useCallback(async (files, options = {}) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const results = await uploadApi.uploadMultipleImages(files, (percent) => {
        setProgress(percent);
        if (options.onProgress) {
          options.onProgress(percent);
        }
      });

      setResult(results);
      
      if (options.onSuccess) {
        options.onSuccess(results);
      }

      return results;
    } catch (err) {
      const errorMsg = err.message || 'อัปโหลดล้มเหลว';
      setError(errorMsg);
      
      if (options.onError) {
        options.onError(errorMsg);
      }
      
      return [];
    } finally {
      setUploading(false);
    }
  }, []);

  /**
   * ตรวจสอบไฟล์
   * @param {File} file - ไฟล์ที่ต้องการตรวจสอบ
   * @param {Object} options - ตัวเลือกการตรวจสอบ
   * @returns {{valid: boolean, error: string|null}}
   */
  const validateFile = useCallback((file, options = {}) => {
    return uploadApi.validateImageFile(file, options);
  }, []);

  /**
   * แปลงไฟล์เป็น Base64 (สำหรับ preview)
   * @param {File} file - ไฟล์รูปภาพ
   * @returns {Promise<string>}
   */
  const fileToBase64 = useCallback(async (file) => {
    try {
      return await uploadApi.fileToBase64(file);
    } catch (err) {
      setError('ไม่สามารถอ่านไฟล์ได้');
      return null;
    }
  }, []);

  /**
   * รีเซ็ต state
   */
  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
    setResult(null);
  }, []);

  return {
    upload,
    uploadMultiple,
    uploading,
    progress,
    error,
    result,
    validateFile,
    fileToBase64,
    reset,
  };
};

export default useUpload;
