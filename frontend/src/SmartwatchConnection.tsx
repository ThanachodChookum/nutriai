// frontend/src/components/SmartwatchConnection.tsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bluetooth, BluetoothConnected, Watch, Heart, Activity,
  Battery, Zap, AlertCircle, Loader2, X, RefreshCw, Moon
} from 'lucide-react';
import { bluetoothService, HeartRateData, DeviceInfo } from './service/BluetoothService';

interface SmartwatchConnectionProps {
  userId: string;
  onHeartRateUpdate?: (hr: number) => void;
  onMetricsUpdate?: (metrics: any) => void;
  onCaloriesUpdate?: (deltaCal: number) => void;
}

export function SmartwatchConnection({ 
  userId, 
  onHeartRateUpdate, 
  onMetricsUpdate,
  onCaloriesUpdate
}: SmartwatchConnectionProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<DeviceInfo | null>(null);
  const [currentHeartRate, setCurrentHeartRate] = useState<number | null>(null);
  const [heartRateHistory, setHeartRateHistory] = useState<number[]>([]);
  const [currentSteps, setCurrentSteps] = useState<number | null>(null);
  const [currentCalories, setCurrentCalories] = useState<number | null>(null);
  const [currentSleep, setCurrentSleep] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const isBluetoothSupported = 'bluetooth' in navigator;

  const healthProfileRef = useRef<{weight: number, age: number, gender: string} | null>(null);
  const lastHrTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (userId && userId !== 'demo') {
      fetch(`/api/health/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data) healthProfileRef.current = { weight: data.weight || 70, age: data.age || 30, gender: data.gender || 'male' };
        })
        .catch(() => { healthProfileRef.current = { weight: 70, age: 30, gender: 'male' }; });
    } else {
      healthProfileRef.current = { weight: 70, age: 30, gender: 'male' };
    }
  }, [userId]);

  const processHeartRate = (hr: number) => {
    const now = Date.now();
    let deltaCal = 0;
    if (lastHrTimeRef.current && healthProfileRef.current) {
      const deltaMs = now - lastHrTimeRef.current;
      const { weight, age, gender } = healthProfileRef.current;
      let calPerMin = 0;
      // Keytel (2005) Equation
      if (gender === 'male' || gender === 'ชาย') {
        calPerMin = (-55.0969 + (0.6309 * hr) + (0.1988 * weight) + (0.2017 * age)) / 4.184;
      } else {
        calPerMin = (-20.4022 + (0.4472 * hr) - (0.1263 * weight) + (0.074 * age)) / 4.184;
      }
      if (calPerMin < 0) calPerMin = 1.0; // fallback baseload
      deltaCal = calPerMin * (deltaMs / 60000);
    }
    lastHrTimeRef.current = now;

    setCurrentHeartRate(hr);
    setHeartRateHistory(prev => [...prev.slice(-20), hr]);
    
    if (onHeartRateUpdate) {
      onHeartRateUpdate(hr);
    }

    if (deltaCal > 0) {
      setCurrentCalories(prev => (prev || 0) + deltaCal);
      if (onCaloriesUpdate) {
        onCaloriesUpdate(deltaCal);
      }
    }
  };

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
        processHeartRate(data.heartRate);
      });

      bluetoothService.onMetricsChange((metrics: any) => {
        if (metrics.steps !== null) setCurrentSteps(metrics.steps);
        if (metrics.sleepHours !== null) setCurrentSleep(metrics.sleepHours);
        // Note: we do not overwrite calories here, as it's computed real-time via HR.
        
        if (onMetricsUpdate) {
          onMetricsUpdate(metrics);
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
    let steps = 4500;
    let calories = 320;
    let sleepHours = 7.5;
    
    setCurrentSteps(steps);
    setCurrentCalories(calories);
    setCurrentSleep(sleepHours);

    const interval = setInterval(() => {
      hr += Math.floor(Math.random() * 10) - 5;
      hr = Math.min(180, Math.max(60, hr));
      steps += Math.floor(Math.random() * 5);

      setCurrentSteps(steps);
      
      processHeartRate(hr);
      
      // get the latest calories for metrics update workaround 
      // (actual state update happens inside processHeartRate but we pass something anyway)
      if (onMetricsUpdate) onMetricsUpdate({ steps, sleepHours });
    }, 3000);
    
    return () => clearInterval(interval);
  };

  const disconnectDevice = () => {
    bluetoothService.disconnect();
    setIsConnected(false);
    setCurrentDevice(null);
    setCurrentHeartRate(null);
    setHeartRateHistory([]);
    lastHrTimeRef.current = null;
    setCurrentSteps(null);
    setCurrentCalories(null);
    setCurrentSleep(null);
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
                {currentHeartRate || '-'}
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

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
              <div className="flex items-center gap-1.5 mb-1.5 text-primary">
                <Activity className="size-3" />
                <span className="text-[10px] font-bold">ก้าวเดิน</span>
              </div>
              <p className="text-xl font-black text-slate-700 dark:text-slate-200">
                {currentSteps?.toLocaleString() || '-'}
              </p>
            </div>
            
            <div className="bg-orange-500/5 rounded-xl p-3 border border-orange-500/10">
              <div className="flex items-center gap-1.5 mb-1.5 text-orange-500">
                <Zap className="size-3" />
                <span className="text-[10px] font-bold">แคลอรี่</span>
              </div>
              <p className="text-xl font-black text-slate-700 dark:text-slate-200">
                {currentCalories !== null ? currentCalories.toFixed(1) : '-'}
              </p>
            </div>
            
            <div className="bg-indigo-500/5 rounded-xl p-3 border border-indigo-500/10">
              <div className="flex items-center gap-1.5 mb-1.5 text-indigo-500">
                <Moon className="size-3" />
                <span className="text-[10px] font-bold">การนอน (ชม.)</span>
              </div>
              <p className="text-xl font-black text-slate-700 dark:text-slate-200">
                {currentSleep || '-'}
              </p>
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