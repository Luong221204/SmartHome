import { Timestamp } from 'firebase-admin/firestore';

export class DeviceDataDto {
  power: number;
  time: Timestamp;
  
}
export class DeviceStateDto {
  power: number;
  value: number;
}
export class DeviceDto {
  lastUpdated: Timestamp;
  name: string;
  roomId: string;
  houseId: string;
  value: number;
  status: boolean;
  state: DeviceStateDto[];
}
export class AutomationDeviceDto {
    status: boolean;
    lastUpdated: Timestamp;
    roomId: string;
    value: number;
}