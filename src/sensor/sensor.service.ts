import { Injectable } from '@nestjs/common';
import { SensorRepository } from './sensor.repository';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class SensorService {
  constructor(private readonly sensorRepository: SensorRepository) {

  }
  @OnEvent('mqtt.sensors')
  handleSensor(payload) {
   // Vào đến đây chắc chắn là dữ liệu sensor, không cần check topic 'device' nữa
   console.log('Xử lý sensor:', payload.data);
   //this.handleSensorData(payload);
}


handleSensorData(payload: any) {
  const { sensorId, current } = payload;

  // Biến đổi Object 'current' thành một Map
  // Object.entries(current) sẽ trả về mảng các cặp [key, value]
  const currentMap = new Map<string, any>(Object.entries(current));

  // 1. Duyệt qua các cảm biến có trong Map
    currentMap.forEach((value, key) => {
      console.log(`Cảm biến: ${key}, Giá trị: ${value}`);
  });

  // 2. Kiểm tra nhanh một thông số
  if (currentMap.has('temp')) {
    console.log('Nhiệt độ hiện tại là:', currentMap.get('temp'));
  }

  // 3. Lấy tổng số lượng thông số cảm biến gửi lên
  console.log(`Số lượng thông số: ${currentMap.size}`);
}
}