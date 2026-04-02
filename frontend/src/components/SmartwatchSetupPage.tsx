// frontend/src/components/SmartwatchSetupPage.tsx
// สร้างหน้าใหม่สำหรับตั้งค่า Smartwatch

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Watch, Bluetooth, BluetoothConnected, Heart, Activity,
  Battery, Zap, AlertCircle, Loader2, Check, X,
  ChevronRight, Smartphone, Wifi, WifiOff, RefreshCw,
  Settings, Save, Trash2, Edit2, PlusCircle
} from 'lucide-react';
import { bluetoothService, HeartRateData, DeviceInfo } from '../service/BluetoothService';

interface SmartwatchDevice {
  id: string;
  name: string;
  brand: string;
  model: string;
  connectionType: 'bluetooth' | 'manual' | 'api';
  macAddress?: string;
  lastSync?: Date;
  isActive: boolean;
  metrics?: {
    heartRate: number;
    steps: number;
    calories: number;
    lastUpdate: Date;
  };
}

interface SmartwatchSetupPageProps {
  userId: string;
  onConnect?: (device: SmartwatchDevice) => void;
  onClose?: () => void;
}

const SMARTWATCH_BRANDS = [
  { id: 'apple', name: 'Apple Watch', icon: '🍎', color: 'bg-gray-800', connectionTypes: ['api'] },
  { id: 'garmin', name: 'Garmin', icon: '🏃', color: 'bg-blue-600', connectionTypes: ['bluetooth', 'api'] },
  { id: 'samsung', name: 'Samsung Galaxy Watch', icon: '⭐', color: 'bg-blue-500', connectionTypes: ['bluetooth', 'api'] },
  { id: 'xiaomi', name: 'Xiaomi Mi Band', icon: '📱', color: 'bg-orange-500', connectionTypes: ['bluetooth', 'manual'] },
  { id: 'fitbit', name: 'Fitbit', icon: '💪', color: 'bg-green-600', connectionTypes: ['bluetooth', 'api'] },
  { id: 'huawei', name: 'Huawei Watch', icon: '⌚', color: 'bg-red-500', connectionTypes: ['bluetooth', 'manual'] },
  { id: 'other', name: 'อื่นๆ', icon: '⌚', color: 'bg-gray-500', connectionTypes: ['manual'] },
];

export function SmartwatchSetupPage({ userId, onConnect, onClose }: SmartwatchSetupPageProps) {
  const [step, setStep] = useState<'select' | 'connect' | 'manual' | 'success'>('select');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [devices, setDevices] = useState<SmartwatchDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [manualForm, setManualForm] = useState({
    name: '',
    brand: '',
    model: '',
    macAddress: '',
    notes: '',
  });
  
  // โหลดอุปกรณ์ที่บันทึกไว้
  useEffect(() => {
    const savedDevices = localStorage.getItem(`nutriai_smartwatches_${userId}`);
    if (savedDevices) {
      try {
        setDevices(JSON.parse(savedDevices));
      } catch (e) {}
    }
  }, [userId]);

  // บันทึกอุปกรณ์
  const saveDevices = (newDevices: SmartwatchDevice[]) => {
    setDevices(newDevices);
    localStorage.setItem(`nutriai_smartwatches_${userId}`, JSON.stringify(newDevices));
  };

  // สแกนหา Bluetooth devices
  const handleBluetoothScan = async () => {
    if (!bluetoothService.isSupported()) {
      setScanError('เบราว์เซอร์ของคุณไม่รองรับ Web Bluetooth กรุณาใช้ Chrome, Edge หรือ Opera');
      return;
    }

    setIsScanning(true);
    setScanError(null);
    setConnectionStatus('กรุณาเลือกอุปกรณ์จากหน้าต่างแจ้งเตือนของเบราว์เซอร์...');

    try {
      const device = await bluetoothService.connect();
      
      if (device) {
        setConnectionStatus(`เชื่อมต่อกับ ${device.name} สำเร็จ!`);
        
        // ตั้งค่า监听 heart rate
        bluetoothService.onHeartRateChange((data: HeartRateData) => {
          console.log('Heart Rate:', data.heartRate);
          updateDeviceMetrics(device.id, {
            heartRate: data.heartRate,
            lastUpdate: new Date(),
          });
        });
        
        // บันทึกอุปกรณ์
        const newDevice: SmartwatchDevice = {
          id: device.id,
          name: device.name,
          brand: selectedBrand || device.deviceType,
          model: device.deviceType,
          connectionType: 'bluetooth',
          isActive: true,
          lastSync: new Date(),
          metrics: {
            heartRate: 0,
            steps: 0,
            calories: 0,
            lastUpdate: new Date(),
          },
        };
        
        const existingIndex = devices.findIndex(d => d.id === device.id);
        let updatedDevices = [...devices];
        if (existingIndex >= 0) {
          updatedDevices[existingIndex] = { ...updatedDevices[existingIndex], ...newDevice };
        } else {
          updatedDevices.push(newDevice);
        }
        
        saveDevices(updatedDevices);
        
        if (onConnect) onConnect(newDevice);
        setStep('success');
      } else {
        setScanError(`ยกเลิกการเชื่อมต่อ หรือเชื่อมต่อไม่สำเร็จ`);
      }
    } catch (error: any) {
      setScanError(error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsScanning(false);
      setConnectionStatus('');
    }
  };

  // อัปเดต metrics ของอุปกรณ์
  const updateDeviceMetrics = (deviceId: string, metrics: Partial<SmartwatchDevice['metrics']>) => {
    const updatedDevices = devices.map(device => {
      if (device.id === deviceId) {
        return {
          ...device,
          metrics: {
            heartRate: device.metrics?.heartRate || 0,
            steps: device.metrics?.steps || 0,
            calories: device.metrics?.calories || 0,
            lastUpdate: device.metrics?.lastUpdate || new Date(),
            ...metrics,
          },
        };
      }
      return device;
    });
    saveDevices(updatedDevices);
  };

  // เพิ่มอุปกรณ์แบบ Manual
  const handleManualAdd = () => {
    if (!manualForm.name.trim()) {
      setScanError('กรุณากรอกชื่ออุปกรณ์');
      return;
    }
    
    const newDevice: SmartwatchDevice = {
      id: `manual_${Date.now()}`,
      name: manualForm.name,
      brand: manualForm.brand || selectedBrand || 'other',
      model: manualForm.model || 'Unknown',
      connectionType: 'manual',
      macAddress: manualForm.macAddress || undefined,
      isActive: true,
      lastSync: new Date(),
      metrics: {
        heartRate: 0,
        steps: 0,
        calories: 0,
        lastUpdate: new Date(),
      },
    };
    
    const newDevices = [...devices, newDevice];
    saveDevices(newDevices);
    
    if (onConnect) onConnect(newDevice);
    setStep('success');
    setManualForm({ name: '', brand: '', model: '', macAddress: '', notes: '' });
  };

  // ลบอุปกรณ์
  const removeDevice = (deviceId: string) => {
    const newDevices = devices.filter(d => d.id !== deviceId);
    saveDevices(newDevices);
    
    if (devices.find(d => d.id === deviceId)?.connectionType === 'bluetooth') {
      bluetoothService.disconnect();
    }
  };

  // ตั้งค่าอุปกรณ์หลัก
  const setActiveDevice = (deviceId: string) => {
    const updatedDevices = devices.map(device => ({
      ...device,
      isActive: device.id === deviceId,
    }));
    saveDevices(updatedDevices);
    
    const activeDevice = updatedDevices.find(d => d.id === deviceId);
    if (activeDevice && onConnect) onConnect(activeDevice);
  };

  // ทดสอบการเชื่อมต่อ
  const testConnection = async (device: SmartwatchDevice) => {
    if (device.connectionType === 'bluetooth') {
      setIsConnecting(true);
      try {
        const deviceData = await bluetoothService.connect();
        if (deviceData) {
          alert('เชื่อมต่อสำเร็จ!');
          updateDeviceMetrics(device.id, { lastUpdate: new Date() });
        } else {
          alert('เชื่อมต่อไม่สำเร็จ');
        }
      } catch (error: any) {
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert('อุปกรณ์แบบ Manual ไม่สามารถทดสอบเชื่อมต่ออัตโนมัติได้');
    }
  };

  const brandInfo = selectedBrand ? SMARTWATCH_BRANDS.find(b => b.id === selectedBrand) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-light to-slate-100 dark:from-background-dark dark:to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Watch className="size-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-black">เชื่อมต่อ Smartwatch</h1>
              <p className="text-sm text-slate-500">เชื่อมต่ออุปกรณ์เพื่อรับข้อมูลสุขภาพแบบ Real-time</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="size-5" />
            </button>
          )}
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[
            { id: 'select', label: 'เลือกอุปกรณ์', icon: Watch },
            { id: 'connect', label: 'เชื่อมต่อ', icon: Bluetooth },
            { id: 'success', label: 'เสร็จสิ้น', icon: Check },
          ].map((s, idx) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex items-center justify-center size-10 rounded-full border-2 transition-all ${
                step === s.id 
                  ? 'border-primary bg-primary text-white' 
                  : (step === 'success' && s.id === 'select') || (step === 'success' && s.id === 'connect')
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-slate-300 dark:border-slate-600 text-slate-400'
              }`}>
                <s.icon className="size-4" />
              </div>
              {idx < 2 && (
                <div className={`w-16 h-0.5 mx-2 transition-all ${
                  step === 'success' ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                }`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Select Brand */}
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* อุปกรณ์ที่เชื่อมต่อแล้ว */}
              {devices.length > 0 && (
                <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <BluetoothConnected className="size-4 text-primary" />
                    อุปกรณ์ที่เชื่อมต่อแล้ว ({devices.length})
                  </h3>
                  <div className="space-y-3">
                    {devices.map(device => (
                      <div key={device.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                        <div className="flex items-center gap-3">
                          <div className={`size-10 rounded-xl ${brandInfo?.color || 'bg-primary/20'} flex items-center justify-center`}>
                            <Watch className="size-5 text-white" />
                          </div>
                          <div>
                            <p className="font-bold flex items-center gap-2">
                              {device.name}
                              {device.isActive && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary">Active</span>
                              )}
                            </p>
                            <p className="text-xs text-slate-400">
                              {device.brand} · {device.model} · {device.connectionType === 'bluetooth' ? 'Bluetooth' : 'Manual'}
                            </p>
                            {device.metrics?.heartRate && device.metrics.heartRate > 0 && (
                              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                <Heart className="size-3" /> {device.metrics.heartRate} bpm
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => testConnection(device)}
                            disabled={isConnecting}
                            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500"
                            title="ทดสอบการเชื่อมต่อ"
                          >
                            <RefreshCw className={`size-4 ${isConnecting ? 'animate-spin' : ''}`} />
                          </button>
                          <button
                            onClick={() => setActiveDevice(device.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                              device.isActive
                                ? 'bg-primary/20 text-primary'
                                : 'bg-slate-200 dark:bg-slate-600 text-slate-500 hover:bg-primary/10'
                            }`}
                          >
                            {device.isActive ? 'ใช้งานอยู่' : 'ตั้งเป็นหลัก'}
                          </button>
                          <button
                            onClick={() => removeDevice(device.id)}
                            className="p-2 rounded-lg hover:bg-red-100 text-red-400"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* เลือกแบรนด์ */}
              <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold mb-4">เลือกแบรนด์ Smartwatch ของคุณ</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {SMARTWATCH_BRANDS.map(brand => (
                    <button
                      key={brand.id}
                      onClick={() => setSelectedBrand(brand.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        selectedBrand === brand.id
                          ? 'border-primary bg-primary/10'
                          : 'border-slate-200 dark:border-slate-700 hover:border-primary/40'
                      }`}
                    >
                      <span className="text-3xl mb-2 block">{brand.icon}</span>
                      <p className="text-sm font-bold">{brand.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* ตัวเลือกการเชื่อมต่อ */}
              {selectedBrand && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
                >
                  <h3 className="font-bold mb-4">วิธีการเชื่อมต่อ</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {brandInfo?.connectionTypes.includes('bluetooth') && (
                      <button
                        onClick={() => setStep('connect')}
                        className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary/40 transition-all text-left group"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="size-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Bluetooth className="size-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-bold">เชื่อมต่อผ่าน Bluetooth</p>
                            <p className="text-xs text-slate-400">เชื่อมต่ออัตโนมัติ รับข้อมูล Real-time</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500">✓ รองรับการอ่าน Heart Rate แบบ Real-time</p>
                      </button>
                    )}
                    
                    {brandInfo?.connectionTypes.includes('manual') && (
                      <button
                        onClick={() => setStep('manual')}
                        className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary/40 transition-all text-left group"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="size-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <Settings className="size-5 text-green-500" />
                          </div>
                          <div>
                            <p className="font-bold">บันทึกข้อมูลด้วยตนเอง</p>
                            <p className="text-xs text-slate-400">กรอกข้อมูลอุปกรณ์ด้วยตนเอง</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500">✓ บันทึกข้อมูลพื้นฐานของอุปกรณ์</p>
                      </button>
                    )}

                    {brandInfo?.connectionTypes.includes('api') && (
                      <button
                        onClick={() => window.open('#', '_blank')}
                        className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary/40 transition-all text-left group"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="size-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <Smartphone className="size-5 text-purple-500" />
                          </div>
                          <div>
                            <p className="font-bold">เชื่อมต่อผ่าน API</p>
                            <p className="text-xs text-slate-400">ใช้แอปพลิเคชันคู่หู</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500">✓ ขอรับ Token จากแอปพลิเคชันของแบรนด์</p>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 2: Bluetooth Connection */}
          {step === 'connect' && (
            <motion.div
              key="connect"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-slate-800/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 text-center"
            >
              <div className="mb-6">
                <div className={`size-24 mx-auto rounded-full ${isScanning ? 'bg-primary/20 animate-pulse' : 'bg-slate-100 dark:bg-slate-700'} flex items-center justify-center mb-4`}>
                  {isScanning ? (
                    <Loader2 className="size-10 text-primary animate-spin" />
                  ) : (
                    <Bluetooth className="size-10 text-slate-400" />
                  )}
                </div>
                <h3 className="text-xl font-black mb-2">กำลังเชื่อมต่อ {brandInfo?.name}</h3>
                <p className="text-slate-400 text-sm">{connectionStatus || 'กรุณาเปิด Bluetooth และนำอุปกรณ์มาใกล้ๆ'}</p>
              </div>

              {scanError && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200">
                  <p className="text-red-600 text-sm flex items-center gap-2">
                    <AlertCircle className="size-4" />
                    {scanError}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleBluetoothScan}
                  disabled={isScanning}
                  className="w-full py-3 bg-primary text-background-dark rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isScanning ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Bluetooth className="size-4" />
                  )}
                  {isScanning ? 'กำลังค้นหา...' : 'เริ่มค้นหาอุปกรณ์'}
                </button>

                <button
                  onClick={() => setStep('select')}
                  className="w-full py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-500"
                >
                  กลับ
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-left">
                <p className="text-xs font-bold text-blue-600 mb-2">💡 วิธีการเชื่อมต่อ</p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>1. เปิด Bluetooth บน smartwatch และมือถือ/คอมพิวเตอร์</li>
                  <li>2. เปิดแอปพลิเคชันคู่หูของ smartwatch (Mi Fitness, Garmin Connect, etc.)</li>
                  <li>3. ตรวจสอบว่า smartwatch กำลังส่งข้อมูล Heart Rate อยู่</li>
                  <li>4. กดปุ่ม "เริ่มค้นหาอุปกรณ์"</li>
                  <li>5. เลือกอุปกรณ์ที่พบ และอนุญาตการเชื่อมต่อ</li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* Step: Manual Input */}
          {step === 'manual' && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700"
            >
              <h3 className="font-bold mb-4">บันทึกข้อมูลอุปกรณ์ด้วยตนเอง</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">ชื่ออุปกรณ์ *</label>
                  <input
                    type="text"
                    value={manualForm.name}
                    onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                    placeholder="เช่น Mi Band 7, Garmin Forerunner"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">รุ่น</label>
                  <input
                    type="text"
                    value={manualForm.model}
                    onChange={(e) => setManualForm({ ...manualForm, model: e.target.value })}
                    placeholder="รุ่นของอุปกรณ์"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">MAC Address (ถ้ามี)</label>
                  <input
                    type="text"
                    value={manualForm.macAddress}
                    onChange={(e) => setManualForm({ ...manualForm, macAddress: e.target.value })}
                    placeholder="XX:XX:XX:XX:XX:XX"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">หมายเหตุ</label>
                  <textarea
                    value={manualForm.notes}
                    onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                    placeholder="ข้อมูลเพิ่มเติมเกี่ยวกับอุปกรณ์"
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 resize-none"
                  />
                </div>
              </div>

              {scanError && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
                  {scanError}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep('select')}
                  className="flex-1 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                >
                  กลับ
                </button>
                <button
                  onClick={handleManualAdd}
                  className="flex-1 py-3 bg-primary text-background-dark rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <Save className="size-4" />
                  บันทึกอุปกรณ์
                </button>
              </div>
            </motion.div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-800/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 text-center"
            >
              <div className="size-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <Check className="size-10 text-green-500" />
              </div>
              <h3 className="text-xl font-black mb-2">เชื่อมต่อสำเร็จ! 🎉</h3>
              <p className="text-slate-400 mb-6">
                อุปกรณ์ของคุณพร้อมใช้งานแล้ว<br />
                สามารถดูข้อมูลสุขภาพได้ที่หน้า Exercise Log
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-primary text-background-dark rounded-xl font-bold"
              >
                ไปที่หน้า Exercise Log
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* คำแนะนำเพิ่มเติม */}
        {step === 'select' && (
          <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
            <p className="text-xs text-yellow-700 dark:text-yellow-400 flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>
                <strong>หมายเหตุ:</strong> Web Bluetooth รองรับเฉพาะ Chrome, Edge, Opera บน Desktop และ Android เท่านั้น 
                สำหรับ iOS (iPhone/iPad) หรือเบราว์เซอร์อื่นๆ กรุณาเลือก "บันทึกข้อมูลด้วยตนเอง"
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}