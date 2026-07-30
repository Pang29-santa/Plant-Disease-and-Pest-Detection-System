import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const workerApi = {
  // ดูสถานะ worker
  getStatus: async () => {
    const res = await axios.get(`${API_BASE_URL}/api/ai/worker/status`);
    return res.data;
  },

  // เริ่ม worker
  start: async () => {
    const res = await axios.post(`${API_BASE_URL}/api/ai/worker/start`);
    return res.data;
  },

  // หยุด worker
  stop: async () => {
    const res = await axios.post(`${API_BASE_URL}/api/ai/worker/stop`);
    return res.data;
  },

  // ทดสอบกล้องเดียว
  testCamera: async (cctvId) => {
    const res = await axios.post(`${API_BASE_URL}/api/ai/worker/test-camera/${cctvId}`);
    return res.data;
  }
};

export default workerApi;
