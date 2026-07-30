import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import workerApi from '../../services/workerApi';
import cctvApi from '../../services/cctvApi';
import {
  Activity, ChevronLeft, Play, Square, RefreshCw, 
  Camera, Bug, Cog, AlertCircle, CheckCircle2, XCircle,
  TestTube, Loader2
} from 'lucide-react';
import Swal from 'sweetalert2';

const WorkerStatus = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || user?.user_id;

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cctvs, setCctvs] = useState([]);
  const [testingCam, setTestingCam] = useState({});

  const fetchStatus = useCallback(async () => {
    try {
      const res = await workerApi.getStatus();
      setStatus(res?.status || null);
    } catch (err) {
      console.error('Failed to fetch worker status:', err);
      Swal.fire({
        icon: 'error',
        title: 'ไม่สามารถโหลดสถานะ Worker',
        text: err?.response?.data?.message || err.message
      });
    }
  }, []);

  const fetchCctvs = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await cctvApi.getByUserId(userId);
      setCctvs(res?.data || []);
    } catch (err) {
      console.error('Failed to load cameras:', err);
    }
  }, [userId]);

  useEffect(() => {
    fetchStatus();
    fetchCctvs();
    const interval = setInterval(() => {
      fetchStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus, fetchCctvs]);

  const handleStart = async () => {
    setLoading(true);
    try {
      await workerApi.start();
      await fetchStatus();
      Swal.fire({
        icon: 'success',
        title: 'Worker เริ่มทำงานแล้ว',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'ไม่สามารถเริ่ม Worker',
        text: err?.response?.data?.message || err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    const confirmed = await Swal.fire({
      icon: 'warning',
      title: 'หยุด Worker?',
      text: 'ระบบจะหยุดตรวจสอบกล้องอัตโนมัติชั่วคราว',
      showCancelButton: true,
      confirmButtonText: 'หยุด',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444'
    });
    if (!confirmed.isConfirmed) return;
    setLoading(true);
    try {
      await workerApi.stop();
      await fetchStatus();
      Swal.fire({
        icon: 'success',
        title: 'Worker หยุดแล้ว',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'ไม่สามารถหยุด Worker',
        text: err?.response?.data?.message || err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestCamera = async (cctv) => {
    const id = cctv.CCTV_id || cctv._id;
    setTestingCam(prev => ({ ...prev, [id]: true }));
    try {
      const res = await workerApi.testCamera(cctv.CCTV_id || cctv._id);
      Swal.fire({
        icon: res?.success ? 'info' : 'warning',
        title: res?.success ? `ทดสอบกล้อง ${cctv.camera_name || id}` : 'ทดสอบไม่สำเร็จ',
        html: `
          <div class="text-left text-sm">
            <p><b>พบ:</b> ${res?.is_detected ? 'ใช่' : 'ไม่'}</p>
            <p><b>สุขภาพดี:</b> ${res?.is_healthy ? 'ใช่' : 'ไม่'}</p>
            <p><b>ผลลัพธ์:</b> ${res?.label || '-'}</p>
            <p><b>ความมั่นใจ:</b> ${res?.confidence ? (res.confidence * 100).toFixed(1) + '%' : '-'}</p>
            <p><b>เกณฑ์:</b> ${res?.threshold ? (res.threshold * 100).toFixed(0) + '%' : '-'}</p>
          </div>
        `,
        confirmButtonText: 'ปิด'
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'ทดสอบกล้องไม่สำเร็จ',
        text: err?.response?.data?.message || err.message
      });
    } finally {
      setTestingCam(prev => ({ ...prev, [id]: false }));
    }
  };

  const isRunning = status?.running;
  const isEnabled = status?.enabled;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-black text-gray-800">สถานะ Detection Worker</h1>
              <p className="text-sm text-gray-500">ระบบตรวจสอบกล้อง CCTV อัตโนมัติ</p>
            </div>
          </div>
          <button
            onClick={fetchStatus}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold text-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            รีเฟรช
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Status Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isRunning ? 'bg-green-100' : 'bg-red-100'}`}>
                <Activity className={`w-7 h-7 ${isRunning ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {isRunning ? 'Worker กำลังทำงาน' : 'Worker หยุดทำงาน'}
                </h2>
                <p className="text-sm text-gray-500">
                  {isEnabled ? 'เปิดใช้งานตามการตั้งค่า' : 'ปิดใช้งานใน .env'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isRunning ? (
                <button
                  onClick={handleStop}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
                  หยุด Worker
                </button>
              ) : (
                <button
                  onClick={handleStart}
                  disabled={loading || !isEnabled}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  เริ่ม Worker
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {status && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={RefreshCw}
              label="รอบการตรวจสอบ"
              value={status.loop_count || 0}
              color="blue"
            />
            <StatCard
              icon={Camera}
              label="กล้องที่ประมวลผลล่าสุด"
              value={status.cameras_processed || 0}
              color="sky"
            />
            <StatCard
              icon={AlertCircle}
              label="กล้องที่ผิดพลาด"
              value={status.cameras_error || 0}
              color="red"
            />
            <StatCard
              icon={Bug}
              label="การตรวจจับวันนี้"
              value={status.detections_today || 0}
              color="orange"
            />
          </div>
        )}

        {/* Config Card */}
        {status && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Cog className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-bold text-gray-800">การตั้งค่า</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-500 mb-1">เกณฑ์ความมั่นใจ</p>
                <p className="font-bold text-gray-800">{(status.threshold * 100).toFixed(0)}%</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-500 mb-1">ระยะห่างรอบตรวจ</p>
                <p className="font-bold text-gray-800">{status.poll_interval_sec} วินาที</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-500 mb-1">คูลดาวน์</p>
                <p className="font-bold text-gray-800">{status.cooldown_sec} วินาที</p>
              </div>
            </div>
          </div>
        )}

        {/* Test Cameras */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TestTube className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-800">ทดสอบกล้องทีละตัว</h3>
          </div>
          {cctvs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Camera className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>ไม่พบกล้อง กรุณาเพิ่มกล้องในหน้า CCTV</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cctvs.map((cam) => {
                const id = cam.CCTV_id || cam._id;
                const isTesting = testingCam[id];
                return (
                  <div key={id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Camera className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-bold text-gray-800">{cam.camera_name || `กล้อง #${id}`}</p>
                        <p className="text-xs text-gray-500">{cam.ip_address}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleTestCamera(cam)}
                      disabled={isTesting}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                    >
                      {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
                      ทดสอบ
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Last Error */}
        {status?.last_error && (
          <div className="bg-red-50 border border-red-100 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-bold text-red-800">ข้อผิดพลาดล่าสุด</h3>
            </div>
            <p className="text-sm text-red-700">{status.last_error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    sky: 'bg-sky-50 text-sky-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600',
  };
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorMap[color] || colorMap.blue}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-black text-gray-800">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
};

export default WorkerStatus;
