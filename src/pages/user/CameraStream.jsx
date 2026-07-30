import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import cctvStreamApi from '../../services/cctvStreamApi';
import axios from 'axios';
import {
  ArrowLeft,
  Camera,
  Video,
  Maximize2,
  Minimize2,
  RefreshCw,
  Wifi,
  WifiOff,
  Loader2,
  AlertCircle,
  Grid,
  LayoutGrid
} from 'lucide-react';
import Swal from 'sweetalert2';

const CameraStreamPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const userId = user?.id || user?.user_id;
  const preselectedId = location.state?.selectedCameraId;

  const [cctvs, setCctvs] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCameras = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await axios.get('/api/cctv', { params: { user_id: userId } });
      const cameras = res.data || [];
      setCctvs(cameras);
      if (cameras.length > 0 && !selectedCamera) {
        const preselected = preselectedId
          ? cameras.find(c => (c._id || c.id) === preselectedId)
          : null;
        setSelectedCamera(preselected || cameras[0]);
      }
    } catch (err) {
      console.error('Failed to fetch cameras:', err);
      Swal.fire(t('admin.alerts.error'), 'ไม่สามารถโหลดข้อมูลกล้องได้', 'error');
    } finally {
      setLoading(false);
    }
  }, [userId, selectedCamera, preselectedId]);

  const checkStatuses = useCallback(async () => {
    if (cctvs.length === 0) return;
    setRefreshing(true);
    const newStatuses = {};
    for (const cctv of cctvs) {
      try {
        const status = await cctvStreamApi.getCameraStatus(cctv._id);
        newStatuses[cctv._id] = status;
      } catch (err) {
        newStatuses[cctv._id] = { status: 'offline', reason: 'error' };
      }
    }
    setStatuses(newStatuses);
    setRefreshing(false);
  }, [cctvs]);

  useEffect(() => {
    fetchCameras();
  }, [fetchCameras]);

  useEffect(() => {
    if (cctvs.length > 0) {
      checkStatuses();
    }
  }, [cctvs.length]);

  const selectedStatus = selectedCamera ? statuses[selectedCamera._id] : null;
  const isOnline = selectedStatus?.status === 'online';

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/cctv')}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black flex items-center gap-2">
                <Video className="w-6 h-6 text-primary-400" />
                หน้าจอติดตามกล้อง
              </h1>
              <p className="text-gray-400 text-sm">ดูสตรีมสดจากกล้องวงจรปิดทั้งหมด</p>
            </div>
          </div>
          <button
            onClick={checkStatuses}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            ตรวจสอบสถานะ
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary-400" />
            <p className="mt-4 text-gray-400">กำลังโหลดข้อมูลกล้อง...</p>
          </div>
        ) : cctvs.length === 0 ? (
          <div className="bg-gray-800 rounded-2xl p-12 text-center">
            <Camera className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-xl font-bold text-gray-300">ยังไม่มีกล้องวงจรปิด</p>
            <p className="text-gray-400 mt-2">ไปที่หน้าจัดการ CCTV เพื่อเพิ่มกล้อง</p>
            <button
              onClick={() => navigate('/cctv')}
              className="mt-6 px-6 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition-colors"
            >
              ไปที่หน้า CCTV
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Stream */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    <Camera className="w-5 h-5 text-primary-400" />
                    <span className="font-bold">{selectedCamera?.camera_name || 'กล้อง'}</span>
                    {selectedStatus && (
                      <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${isOnline ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                        {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                        {isOnline ? 'ออนไลน์' : 'ออฟไลน์'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative aspect-video bg-black">
                  {selectedCamera ? (
                    <img
                      src={cctvStreamApi.getCameraStreamUrl(selectedCamera._id)}
                      alt={selectedCamera.camera_name}
                      className="w-full h-full object-contain"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      เลือกกล้องเพื่อดูสตรีม
                    </div>
                  )}
                  {!isOnline && selectedStatus && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                      <WifiOff className="w-12 h-12 text-red-400 mb-2" />
                      <p className="text-red-300 font-medium">กล้องออฟไลน์</p>
                      <p className="text-gray-400 text-sm">{selectedStatus.reason || 'ไม่สามารถเชื่อมต่อได้'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Camera List */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-2">
                <Grid className="w-4 h-4 text-gray-400" />
                <span className="font-bold">รายการกล้อง ({cctvs.length})</span>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {cctvs.map((cctv) => {
                  const status = statuses[cctv._id];
                  const online = status?.status === 'online';
                  const isSelected = selectedCamera?._id === cctv._id;
                  return (
                    <button
                      key={cctv._id}
                      onClick={() => setSelectedCamera(cctv)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-gray-700 hover:bg-gray-750 transition-colors ${
                        isSelected ? 'bg-gray-700 border-l-4 border-l-primary-500' : 'border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${online ? 'bg-green-400' : 'bg-red-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{cctv.camera_name}</p>
                        <p className="text-xs text-gray-400 truncate">{cctv.ip_address}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraStreamPage;
