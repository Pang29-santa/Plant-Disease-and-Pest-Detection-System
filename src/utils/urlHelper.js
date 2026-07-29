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
  
  // Static files are served by FastAPI, not by the Vite frontend server.
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

  return apiBaseUrl ? `${apiBaseUrl}${normalizedPath}` : normalizedPath;
};

export default {
  getImageUrl
};
