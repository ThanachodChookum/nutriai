// frontend/src/components/SmartwatchConnection.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bluetooth, BluetoothConnected, Watch, Heart, Activity,
  Battery, Zap, AlertCircle, Loader2, X, RefreshCw
} from 'lucide-react';
import { bluetoothService, HeartRateData, DeviceInfo } from './service/BluetoothService';

interface SmartwatchConnectionProps {
  userId: string;
  onHeartRateUpdate?: (hr: number) => void;
  onMetricsUpdate?: (metrics: any) => void;
}

export function SmartwatchConnection({ 
  userId, 
  onHeartRateUpdate, 
  onMetricsUpdate 
}: SmartwatchConnectionProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<DeviceInfo | null>(null);
  const [currentHeartRate, setCurrentHeartRate] = useState<number | null>(null);
  const [heartRateHistory, setHeartRateHistory] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const isBluetoothSupported = 'bluetooth' in navigator;

  const connectToDevice = async () => {
    if (!isBluetoothSupported) {
      setError('เบราว์เซอร์ของคุณไม่รองรับ Bluetooth Web API');
      return;
    }

    setIsConnecting(true);
    setError(null);
    
    try {
      const device = await bluetoothService.connect();
      
      setIsConnected(true);
      setCurrentDevice(device);
      
      localStorage.setItem(`nutriai_watch_${userId}`, JSON.stringify({
        deviceId: device.id,
        deviceName: device.name,
        deviceType: device.deviceType,
        connectedAt: new Date().toISOString(),
      }));
      
      bluetoothService.onHeartRateChange((data: HeartRateData) => {
        setCurrentHeartRate(data.heartRate);
        setHeartRateHistory(prev => [...prev.slice(-20), data.heartRate]);
        
        if (onHeartRateUpdate) {
          onHeartRateUpdate(data.heartRate);
        }
      });
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsConnecting(false);
    }
  };

  const startDemoMode = () => {
    setIsDemoMode(true);
    setIsConnected(true);
    setCurrentDevice({
      id: 'demo',
      name: 'Demo Smartwatch',
      deviceType: 'demo',
    });
    
    let hr = 75;
    const interval = setInterval(() => {
      hr += Math.floor(Math.random() * 10) - 5;
      hr = Math.min(180, Math.max(60, hr));
      setCurrentHeartRate(hr);
      setHeartRateHistory(prev => [...prev.slice(-20), hr]);
      
      if (onHeartRateUpdate) onHeartRateUpdate(hr);
    }, 3000);
    
    return () => clearInterval(interval);
  };

  const disconnectDevice = () => {
    bluetoothService.disconnect();
    setIsConnected(false);
    setCurrentDevice(null);
    setCurrentHeartRate(null);
    setHeartRateHistory([]);
    setIsDemoMode(false);
    
    localStorage.removeItem(`nutriai_watch_${userId}`);
  };

  useEffect(() => {
    const savedDevice = localStorage.getItem(`nutriai_watch_${userId}`);
    if (savedDevice) {
      try {
        const device = JSON.parse(savedDevice);
        setCurrentDevice(device);
        // Note: Web Bluetooth requires a user gesture for connection,
        // so we cannot automatically re-connect here on page load.
        // We just restore the UI state to remind the user of their last device.
      } catch (e) {}
    }
  }, [userId]);

  const avgHeartRate = heartRateHistory.length === 0 ? 0 : Math.round(heartRateHistory.reduce((a, b) => a + b, 0) / heartRateHistory.length);
  const maxHeartRate = Math.max(...heartRateHistory, 0);
  const minHeartRate = heartRateHistory.length === 0 ? 0 : Math.min(...heartRateHistory);

  return (
    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`size-10 rounded-xl flex items-center justify-center ${
            isConnected 
              ? 'bg-primary/20 text-primary' 
              : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
          }`}>
            {isConnected ? (
              <BluetoothConnected className="size-5" />
            ) : (
              <Watch className="size-5" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-sm">Smartwatch Connection</h4>
            <p className="text-[11px] text-slate-400">
              {isConnected 
                ? `เชื่อมต่อกับ ${currentDevice?.name} แล้ว`
                : 'เชื่อมต่อเพื่อรับข้อมูลสุขภาพแบบเรียลไทม์'
              }
            </p>
          </div>
        </div>
        
        {isConnected ? (
          <button
            onClick={disconnectDevice}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          >
            ตัดการเชื่อมต่อ
          </button>
        ) : (
          <button
            onClick={connectToDevice}
            disabled={isConnecting}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1"
          >
            {isConnecting ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Bluetooth className="size-3" />
            )}
            เชื่อมต่ออุปกรณ์
          </button>
        )}
      </div>

      {isConnected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4"
        >
          <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <Heart className="size-3 text-red-500" />
                อัตราการเต้นหัวใจ (เรียลไทม์)
              </span>
              {isDemoMode && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                  โหมดทดลอง
                </span>
              )}
            </div>
            
            <div className="flex items-end gap-2">
              <p className="text-5xl font-black text-red-500">
                {currentHeartRate || '--'}
              </p>
              <p className="text-lg font-bold text-slate-400 mb-1">bpm</p>
            </div>
            
            {heartRateHistory.length > 0 && (
              <div className="mt-3 h-12 flex items-end gap-0.5">
                {heartRateHistory.slice(-30).map((hr, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-red-400/50 rounded-t"
                    style={{ height: `${(hr / 200) * 100}%` }}
                  />
                ))}
              </div>
            )}
            
            <div className="flex justify-between mt-3 text-[10px] text-slate-400">
              <span>เฉลี่ย: {avgHeartRate} bpm</span>
              <span>สูงสุด: {maxHeartRate} bpm</span>
              <span>ต่ำสุด: {minHeartRate} bpm</span>
            </div>
          </div>
        </motion.div>
      )}



      {!isConnected && (
        <button
          onClick={startDemoMode}
          className="w-full mt-4 py-2 rounded-xl text-xs font-medium border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 hover:border-primary/40 hover:text-primary transition-colors flex items-center justify-center gap-2"
        >
          <Zap className="size-3" />
          ทดลองใช้โหมดจำลอง (Demo Mode)
        </button>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-red-500" />
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        </motion.div>
      )}

      {!isBluetoothSupported && !isDemoMode && !isConnected && (
        <div className="mt-4 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200">
          <p className="text-xs text-yellow-700 dark:text-yellow-400">
            ⚠️ เบราว์เซอร์ของคุณไม่รองรับ Web Bluetooth กรุณาใช้ Chrome, Edge, หรือ Opera บน Desktop หรือ Android
          </p>
        </div>
      )}
    </div>
  );
}