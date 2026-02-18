/**
 * Telegram API Client
 * เรียก API ที่ backend เพื่อเชื่อมต่อ Telegram
 */

import axios from 'axios';

const API_URL = '/api/telegram';

/**
 * ดึงข้อมูลการเชื่อมต่อ Telegram ของผู้ใช้
 * @param {number} userId - ID ของผู้ใช้
 * @returns {Promise} ข้อมูลการเชื่อมต่อ
 */
export const getTelegramConnection = async (userId) => {
  const response = await axios.get(`${API_URL}/user/${userId}`);
  return response.data;
};

/**
 * สร้างการเชื่อมต่อ Telegram ใหม่
 * @param {Object} data - ข้อมูลการเชื่อมต่อ
 * @returns {Promise} ผลการสร้าง
 */
export const createTelegramConnection = async (data) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

/**
 * อัปเดตข้อมูลการเชื่อมต่อ Telegram
 * @param {string} id - ID การเชื่อมต่อ
 * @param {Object} data - ข้อมูลที่ต้องการอัปเดต
 * @returns {Promise} ผลการอัปเดต
 */
export const updateTelegramConnection = async (id, data) => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

/**
 * ลบการเชื่อมต่อ Telegram
 * @param {string} id - ID การเชื่อมต่อ
 * @returns {Promise} ผลการลบ
 */
export const deleteTelegramConnection = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

/**
 * ยืนยันรหัสเชื่อมต่อ Telegram
 * @param {number} userId - ID ของผู้ใช้
 * @param {string} code - รหัสยืนยัน
 * @returns {Promise} ผลการยืนยัน
 */
export const verifyConnectionCode = async (userId, code) => {
  const response = await axios.post(`${API_URL}/verify-code`, {
    user_id: userId,
    code: code,
  });
  return response.data;
};

/**
 * ส่งข้อความทดสอบไปยัง Telegram
 * @param {string} id - ID การเชื่อมต่อ
 * @returns {Promise} ผลการส่ง
 */
export const sendTestMessage = async (id) => {
  const response = await axios.post(`${API_URL}/${id}/send-test`);
  return response.data;
};

/**
 * ส่งการแจ้งเตือนไปยัง Telegram
 * @param {number} userId - ID ของผู้ใช้
 * @param {string} message - ข้อความ
 * @returns {Promise} ผลการส่ง
 */
export const sendNotification = async (userId, message) => {
  const response = await axios.post(`${API_URL}/send-notification`, {
    user_id: userId,
    message: message,
  });
  return response.data;
};

/**
 * ขอรหัสยืนยันใหม่จาก Telegram Bot
 * @param {number} userId - ID ของผู้ใช้
 * @returns {Promise} ผลการขอรหัส
 */
export const requestNewCode = async (userId) => {
  const response = await axios.post(`${API_URL}/request-code`, {
    user_id: userId,
  });
  return response.data;
};

export default {
  getTelegramConnection,
  createTelegramConnection,
  updateTelegramConnection,
  deleteTelegramConnection,
  verifyConnectionCode,
  sendTestMessage,
  sendNotification,
  requestNewCode,
};
