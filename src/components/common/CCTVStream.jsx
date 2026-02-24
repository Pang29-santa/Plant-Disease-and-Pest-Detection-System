/**
 * CCTVStream Component
 * ====================
 * Component สำหรับแสดงสตรีมวิดีโอจากกล้อง CCTV
 * 
 * Usage:
 * <CCTVStream cctvId="12345" />
 * <CCTVStream cctvId="12345" showStatus showControls />
 */

import React, { useRef, useEffect, useState } from 'react';
import { useCCTV, useCCTVStream } from '../../hooks';

const CCTVStream = ({
  cctvId,
  showStatus = true,
  showControls = true,
  className = '',
  onSnapshot,
}) => {
  const imgRef = useRef(null);
  const { status, loading: statusLoading, isOnline, checkStatus } = useCCTV(cctvId);
  const { streamUrl, attachToImage } = useCCTVStream(cctvId);
  const [isStreaming, setIsStreaming] = useState(false);

  // Attach stream to image element
  useEffect(() => {
    if (imgRef.current && streamUrl && isOnline) {
      setIsStreaming(true);
      const cleanup = attachToImage(imgRef.current);
      
      return () => {
        cleanup();
        setIsStreaming(false);
      };
    }
  }, [streamUrl, isOnline, attachToImage]);

  const handleSnapshot = async () => {
    if (imgRef.current && isOnline) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = imgRef.current.naturalWidth;
        canvas.height = imgRef.current.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgRef.current, 0, 0);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        if (onSnapshot) {
          onSnapshot(dataUrl);
        }
        
        // ดาวน์โหลดรูป
        const link = document.createElement('a');
        link.download = `snapshot-${cctvId}-${Date.now()}.jpg`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Failed to capture snapshot:', err);
      }
    }
  };

  const getStatusColor = () => {
    if (statusLoading) return 'bg-yellow-500';
    if (isOnline) return 'bg-green-500';
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (statusLoading) return 'กำลังตรวจสอบ...';
    if (isOnline) return 'ออนไลน์';
    return 'ออฟไลน์';
  };

  return (
    <div className={`relative rounded-lg overflow-hidden bg-black ${className}`}>
      {/* Video/Image Stream */}
      <div className="relative aspect-video">
        {isOnline ? (
          <img
            ref={imgRef}
            alt="CCTV Stream"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <div className="text-center text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p>ไม่สามารถเชื่อมต่อกล้องได้</p>
              <button
                onClick={checkStatus}
                className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                ลองใหม่
              </button>
            </div>
          </div>
        )}

        {/* Status Badge */}
        {showStatus && (
          <div className="absolute top-2 left-2 flex items-center gap-2 px-3 py-1 bg-black/70 rounded-full text-white text-sm">
            <span className={`w-2 h-2 rounded-full ${getStatusColor()}`}></span>
            <span>{getStatusText()}</span>
          </div>
        )}

        {/* Streaming Indicator */}
        {isStreaming && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-red-600 rounded text-white text-xs font-bold animate-pulse">
            LIVE
          </div>
        )}
      </div>

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-between">
            <div className="text-white text-sm">
              กล้อง #{cctvId?.slice(-6)}
            </div>
            <div className="flex gap-2">
              <button
                onClick={checkStatus}
                disabled={statusLoading}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors disabled:opacity-50"
                title="ตรวจสอบสถานะ"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={handleSnapshot}
                disabled={!isOnline}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors disabled:opacity-50"
                title="บันทึกภาพ"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CCTVStream;
