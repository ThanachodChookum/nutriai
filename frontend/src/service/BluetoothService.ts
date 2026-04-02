// frontend/src/services/BluetoothService.ts
export interface HeartRateData {
  heartRate: number;
  timestamp: Date;
}

export interface StepData {
  steps: number;
  timestamp: Date;
}

export interface CaloriesData {
  calories: number;
  timestamp: Date;
}

export interface DeviceInfo {
  id: string;
  name: string;
  deviceType: string;
}

class BluetoothService {
  private device: BluetoothDevice | null = null;
  private heartRateCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private heartRateListener: ((data: HeartRateData) => void) | null = null;
  private isConnected: boolean = false;
 // ✅ เพิ่ม method isSupported
  isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }
  async connect(): Promise<DeviceInfo> {
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['heart_rate', 'battery_service', 'device_information'],
      });

      this.device = device;
      
      device.addEventListener('gattserverdisconnected', () => {
        this.isConnected = false;
        console.log('Device disconnected');
        this.reconnect();
      });

      let server = null;
      let retries = 3;
      while (retries > 0 && !server) {
        try {
          server = await device.gatt?.connect();
        } catch (err) {
          console.warn(`GATT Connect failed, retrying... (${retries} left)`);
          retries--;
          if (retries === 0) throw err;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      if (!server) throw new Error('Cannot connect to GATT server');

      let service;
      try {
        service = await server.getPrimaryService('heart_rate');
      } catch (err) {
        throw new Error('อุปกรณ์นี้ไม่ได้เปิดโหมด Broadcast Heart Rate กรุณาเปิดในการตั้งค่านาฬิกา (เช่น Huawei Watch ต้องเปิดในโหมดออกกำลังกาย)');
      }
      this.heartRateCharacteristic = await service.getCharacteristic('heart_rate_measurement');
      
      this.isConnected = true;
      await this.startHeartRateMonitoring();
      
      return {
        id: device.id,
        name: device.name || 'Unknown Device',
        deviceType: this.detectDeviceType(device.name || ''),
      };
    } catch (error: any) {
      console.error('Connection error:', error);
      this.isConnected = false;
      let msg = error.message || 'การเชื่อมต่อบลูทูธล้มเหลว';
      if (msg.includes('Connection attempt failed') || msg.includes('NetworkError')) {
        msg = 'การเชื่อมต่อถูกปฏิเสธ: นาฬิกาอาจกำลังเชื่อมต่อกับแอปในโทรศัพท์ (เช่น Huawei Health) แนะนำให้ปิดบลูทูธที่มือถือชั่วคราวแล้วลองใหม่';
      }
      throw new Error(msg);
    }
  }

  private async startHeartRateMonitoring() {
    if (!this.heartRateCharacteristic) return;

    await this.heartRateCharacteristic.startNotifications();
    
    this.heartRateCharacteristic.addEventListener(
      'characteristicvaluechanged',
      this.handleHeartRateMeasurement.bind(this)
    );
  }

  private handleHeartRateMeasurement(event: Event) {
    const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
    const value = characteristic.value;
    
    if (!value) return;
    
    const flags = value.getUint8(0);
    const heartRateFormat = flags & 0x01;
    let heartRate: number;
    
    if (heartRateFormat === 0) {
      heartRate = value.getUint8(1);
    } else {
      heartRate = value.getUint16(1, true);
    }
    
    if (this.heartRateListener && heartRate > 0) {
      this.heartRateListener({
        heartRate,
        timestamp: new Date(),
      });
    }
  }

  simulateData(callback: (data: HeartRateData) => void) {
    let hr = 75;
    const interval = setInterval(() => {
      hr += Math.floor(Math.random() * 10) - 5;
      hr = Math.min(180, Math.max(60, hr));
      
      callback({
        heartRate: hr,
        timestamp: new Date(),
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }

  onHeartRateChange(callback: (data: HeartRateData) => void) {
    this.heartRateListener = callback;
  }

  disconnect() {
    if (this.device && this.device.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.isConnected = false;
    this.heartRateCharacteristic = null;
  }

  private detectDeviceType(deviceName: string): string {
    const name = deviceName.toLowerCase();
    if (name.includes('mi band')) return 'mi_band';
    if (name.includes('amazfit')) return 'amazfit';
    if (name.includes('garmin')) return 'garmin';
    if (name.includes('fitbit')) return 'fitbit';
    if (name.includes('apple')) return 'apple_watch';
    if (name.includes('samsung')) return 'samsung';
    return 'generic';
  }

  private async reconnect() {
    setTimeout(async () => {
      if (this.device && !this.isConnected) {
        console.log('Attempting to reconnect...');
        await this.connect();
      }
    }, 5000);
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const bluetoothService = new BluetoothService();