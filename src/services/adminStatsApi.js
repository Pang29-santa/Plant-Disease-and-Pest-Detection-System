/**
 * Admin Stats API Client
 * ======================
 * API สำหรับสถิติต่างๆ สำหรับหน้า Admin
 * 
 * APIs:
 * - GET /api/admin/top-daily-detections - สถิติ 3 อันดับแรกประจำวัน
 * - GET /api/admin/detection-stats - สถิติการตรวจพบสำหรับ admin
 * - GET /api/admin/available-months - เดือนที่มีข้อมูลสำหรับปีที่เลือก
 */

import axios from 'axios';

const API_URL = '/api/admin';

/**
 * ดึงข้อมูล 3 อันดับแรกที่ตรวจพบมากที่สุดประจำวัน แยกตามโรคและแมลง
 * @param {string} date - วันที่ในรูปแบบ YYYY-MM-DD (default: วันนี้)
 * @returns {Promise<{
 *   date: string,
 *   top_diseases: Array<{id: number, name: string, count: number}>,
 *   top_pests: Array<{id: number, name: string, count: number}>
 * }>}
 */
export const getTopDailyDetections = async (date = null) => {
  const params = {};
  if (date) {
    params.date = date;
  }
  
  const response = await axios.get(`${API_URL}/top-daily-detections`, { params });
  return response.data;
};

/**
 * ดึงข้อมูลสถิติทั้งหมดสำหรับหน้า Admin (รองรับกราฟ)
 * @param {number} year - ปี (รองรับทั้ง พ.ศ. และ ค.ศ.)
 * @param {number} month - เดือน 1-12 (optional)
 * @param {string} diseaseType - '1' สำหรับโรค, '2' สำหรับศัตรูพืช
 * @returns {Promise<{
 *   total_detections: number,
 *   top_items: Array<{name: string, count: number}>,
 *   chart_data: {
 *     title: string,
 *     labels: string[],
 *     datasets: Array<{label: string, data: number[]}>
 *   }
 * }>}
 */
export const getDetectionStats = async (year, month = null, diseaseType = null) => {
  const params = { year };
  if (month) {
    params.month = month;
  }
  if (diseaseType) {
    params.disease_type = diseaseType;
  }
  
  const response = await axios.get(`${API_URL}/detection-stats`, { params });
  return response.data;
};

/**
 * ดึงข้อมูลเดือนที่มีการตรวจพบข้อมูล สำหรับปีที่ระบุ
 * @param {number} year - ปี (รองรับทั้ง พ.ศ. และ ค.ศ.)
 * @returns {Promise<Array<{value: number, name: string}>>}
 */
export const getAvailableMonths = async (year) => {
  const response = await axios.get(`${API_URL}/available-months`, {
    params: { year }
  });
  return response.data;
};

/**
 * ดึงข้อมูลสถิติสำหรับวันนี้
 * @returns {Promise<{
 *   date: string,
 *   top_diseases: Array<{id: number, name: string, count: number}>,
 *   top_pests: Array<{id: number, name: string, count: number}>
 * }>}
 */
export const getTodayStats = async () => {
  return getTopDailyDetections();
};

/**
 * ดึงข้อมูลสถิติสำหรับเดือนปัจจุบัน
 * @param {number} year - ปี (optional, default: ปีปัจจุบัน)
 * @returns {Promise<{
 *   total_detections: number,
 *   top_items: Array<{name: string, count: number}>,
 *   chart_data: object
 * }>}
 */
export const getCurrentMonthStats = async (year = null) => {
  const now = new Date();
  const currentYear = year || now.getFullYear();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
  
  return getDetectionStats(currentYear, currentMonth);
};

/**
 * ดึงข้อมูลสถิติสำหรับปีปัจจุบัน
 * @returns {Promise<{
 *   total_detections: number,
 *   top_items: Array<{name: string, count: number}>,
 *   chart_data: object
 * }>}
 */
export const getCurrentYearStats = async () => {
  const currentYear = new Date().getFullYear();
  return getDetectionStats(currentYear);
};

/**
 * Helper function: แปลงปี พ.ศ. เป็น ค.ศ.
 * @param {number} year - ปีที่ต้องการแปลง
 * @returns {number} ปี ค.ศ.
 */
export const toChristianYear = (year) => {
  return year > 2500 ? year - 543 : year;
};

/**
 * Helper function: แปลงปี ค.ศ. เป็น พ.ศ.
 * @param {number} year - ปีที่ต้องการแปลง
 * @returns {number} ปี พ.ศ.
 */
export const toBuddhistYear = (year) => {
  return year < 2500 ? year + 543 : year;
};

export default {
  getTopDailyDetections,
  getDetectionStats,
  getAvailableMonths,
  getTodayStats,
  getCurrentMonthStats,
  getCurrentYearStats,
  toChristianYear,
  toBuddhistYear,
};
