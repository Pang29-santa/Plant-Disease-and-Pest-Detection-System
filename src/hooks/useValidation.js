/**
 * useValidation Hook
 * ==================
 * Hook สำหรับตรวจสอบความถูกต้องของข้อมูล (ตรวจสอบชื่อซ้ำ)
 * 
 * Usage:
 * const { checkVegetable, checkDiseasePest, isChecking, error } = useValidation();
 */

import { useState, useCallback, useRef } from 'react';
import validationApi from '../services/validationApi';

export const useValidation = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState(null);
  
  // ใช้ ref เพื่อเก็บ timeout สำหรับ debounce
  const timeoutRef = useRef(null);

  /**
   * ตรวจสอบชื่อผักซ้ำ (พร้อม debounce)
   * @param {string} thaiName - ชื่อผักภาษาไทย
   * @param {number} delay - delay ใน milliseconds (default: 500)
   * @returns {Promise<{exists: boolean, message: string}>}
   */
  const checkVegetable = useCallback(async (thaiName, delay = 500) => {
    if (!thaiName || thaiName.trim() === '') {
      return { exists: false, message: '' };
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    return new Promise((resolve) => {
      timeoutRef.current = setTimeout(async () => {
        setIsChecking(true);
        setError(null);
        
        try {
          const result = await validationApi.checkVegetableName(thaiName.trim());
          setIsChecking(false);
          resolve(result);
        } catch (err) {
          setIsChecking(false);
          setError(err.message);
          resolve({ exists: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบ' });
        }
      }, delay);
    });
  }, []);

  /**
   * ตรวจสอบชื่อโรค/ศัตรูพืชซ้ำ (พร้อม debounce)
   * @param {string} thaiName - ชื่อโรค/ศัตรูพืชภาษาไทย
   * @param {string} type - '1' สำหรับโรค, '2' สำหรับศัตรูพืช
   * @param {number} delay - delay ใน milliseconds (default: 500)
   * @returns {Promise<{exists: boolean, message: string}>}
   */
  const checkDiseasePest = useCallback(async (thaiName, type = null, delay = 500) => {
    if (!thaiName || thaiName.trim() === '') {
      return { exists: false, message: '' };
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    return new Promise((resolve) => {
      timeoutRef.current = setTimeout(async () => {
        setIsChecking(true);
        setError(null);
        
        try {
          const result = await validationApi.checkDiseasePestName(thaiName.trim(), type);
          setIsChecking(false);
          resolve(result);
        } catch (err) {
          setIsChecking(false);
          setError(err.message);
          resolve({ exists: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบ' });
        }
      }, delay);
    });
  }, []);

  /**
   * ตรวจสอบชื่อผักซ้ำทันที (ไม่มี debounce)
   * @param {string} thaiName - ชื่อผักภาษาไทย
   * @returns {Promise<{exists: boolean, message: string}>}
   */
  const checkVegetableImmediate = useCallback(async (thaiName) => {
    if (!thaiName || thaiName.trim() === '') {
      return { exists: false, message: '' };
    }

    setIsChecking(true);
    setError(null);
    
    try {
      const result = await validationApi.checkVegetableName(thaiName.trim());
      setIsChecking(false);
      return result;
    } catch (err) {
      setIsChecking(false);
      setError(err.message);
      return { exists: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบ' };
    }
  }, []);

  /**
   * ตรวจสอบชื่อโรค/ศัตรูพืชซ้ำทันที (ไม่มี debounce)
   * @param {string} thaiName - ชื่อโรค/ศัตรูพืชภาษาไทย
   * @param {string} type - '1' สำหรับโรค, '2' สำหรับศัตรูพืช
   * @returns {Promise<{exists: boolean, message: string}>}
   */
  const checkDiseasePestImmediate = useCallback(async (thaiName, type = null) => {
    if (!thaiName || thaiName.trim() === '') {
      return { exists: false, message: '' };
    }

    setIsChecking(true);
    setError(null);
    
    try {
      const result = await validationApi.checkDiseasePestName(thaiName.trim(), type);
      setIsChecking(false);
      return result;
    } catch (err) {
      setIsChecking(false);
      setError(err.message);
      return { exists: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบ' };
    }
  }, []);

  return {
    checkVegetable,
    checkDiseasePest,
    checkVegetableImmediate,
    checkDiseasePestImmediate,
    isChecking,
    error,
  };
};

export default useValidation;
