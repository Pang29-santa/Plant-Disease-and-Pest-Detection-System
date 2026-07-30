import axios from 'axios';

const API_URL = '/api/harvest-records';
const PLOTS_API_URL = '/api/plots';

/**
 * ดึงประวัติการเก็บเกี่ยวทั้งหมดของผู้ใช้
 * @param {number} userId - ID ผู้ใช้
 * @param {Object} params - พารามิเตอร์เพิ่มเติม (plot_id, vegetable_id, planting_id, skip, limit)
 * @returns {Promise<Array>} รายการประวัติการเก็บเกี่ยว
 */
export const getHarvestRecords = async (userId, params = {}) => {
  const response = await axios.get(API_URL, {
    params: { user_id: userId, ...params }
  });
  return response.data;
};

/**
 * ดึงประวัติการเก็บเกี่ยวตามแปลง
 * @param {number} plotId - ID ของแปลง (plot_id)
 * @returns {Promise<Object>} { plot_id, count, data }
 */
export const getHarvestHistoryByPlotId = async (plotId) => {
  const response = await axios.get(`${PLOTS_API_URL}/by-plot-id/${plotId}/harvest-history`);
  return response.data;
};

/**
 * ดึงสรุปการเก็บเกี่ยวของผู้ใช้
 * @param {number} userId - ID ผู้ใช้
 * @returns {Promise<Object>} ข้อมูลสรุป
 */
export const getHarvestSummary = async (userId) => {
  const response = await axios.get(`${API_URL}/summary/user/${userId}`);
  return response.data;
};

/**
 * ดึงสถิติการเก็บเกี่ยวของผู้ใช้ (แยกตามผัก)
 * @param {number} userId - ID ผู้ใช้
 * @returns {Promise<Object>} ข้อมูลสถิติ
 */
export const getHarvestStats = async (userId) => {
  const response = await axios.get(`${API_URL}/stats/user/${userId}`);
  return response.data;
};

export default {
  getHarvestRecords,
  getHarvestHistoryByPlotId,
  getHarvestSummary,
  getHarvestStats
};
