/**
 * Language API Client
 * ===================
 * API สำหรับ sync ภาษากับ backend
 * 
 * Note: โปรเจกต์นี้ใช้ i18next สำหรับจัดการภาษาฝั่ง client
 * ไฟล์นี้ใช้เพื่อ sync ภาษาที่เลือกกับ backend เท่านั้น
 * 
 * APIs:
 * - POST /set-lang/{lang} - ตั้งค่าภาษา (th/en)
 */

import axios from 'axios';

const SUPPORTED_LANGS = ['th', 'en'];

/**
 * บันทึกภาษาที่เลือกลง backend (สำหรับ sync กับ server)
 * @param {'th' | 'en'} lang - รหัสภาษา ('th' หรือ 'en')
 * @returns {Promise<{ok: boolean, lang: string}>}
 */
export const setLanguage = async (lang) => {
  if (!SUPPORTED_LANGS.includes(lang)) {
    throw new Error(`Unsupported language: ${lang}. Supported: ${SUPPORTED_LANGS.join(', ')}`);
  }
  
  const response = await axios.post(`/set-lang/${lang}`);
  return response.data;
};

export default {
  setLanguage,
  SUPPORTED_LANGS,
};
