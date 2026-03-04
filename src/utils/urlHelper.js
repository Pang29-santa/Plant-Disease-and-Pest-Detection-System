/**
 * URL Helper Utilities
 */

/**
 * แปลง path รูปภาพให้เป็น URL ที่ใช้งานได้จริง
 * รองรับทั้งแบบที่ส่งมาจาก Backend (Relative) และแบบที่เป็น URL อยู่แล้ว
 */
export const getImageUrl = (path) => {
  if (!path) return 'https://placehold.co/600x400?text=No+Image';
  
  // ถ้าเป็น URL เต็มอยู่แล้ว หรือเป็น Base64
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  
  // ถ้าเริ่มต้นด้วย / ให้พยายามใช้ผ่าน Proxy ของ Frontend ก่อน (เพื่อเลี่ยงปัญหา ngrok warning)
  if (path.startsWith('/')) {
    return path;
  }
  
  // กรณีอื่นๆ (เช่น ส่งมาแค่ "static/...") ให้ใส่ / เข้าไปข้างหน้า
  return `/${path}`;
};

export default {
  getImageUrl
};
