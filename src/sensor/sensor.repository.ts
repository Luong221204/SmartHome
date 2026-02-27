import { Inject, Injectable } from '@nestjs/common';
import { FirestoreService } from 'src/home/firestore.service';
import * as admin from 'firebase-admin';
import { last } from 'rxjs';
import { time } from 'console';

@Injectable()
export class SensorRepository {
  private db: FirebaseFirestore.Firestore;
  private lastCheckedMap: Map<string, Record<string, number>> = new Map(); // lưu tbc của từng sensorId và từng key trong current
  private lastCheckedMap2: Map<string, number> = new Map(); // Lưu số lần đc gửi của từng sensorId 

  constructor() {
    this.db = admin.firestore();
    this.db.settings({ ignoreUndefinedProperties: true });
  }

  async addNewSensor(body: {
    name: string;
    type: string;
    houseId: string;
    roomId: string;
    refferTo: string;
  }): Promise<boolean> {
    const { name, type, houseId, roomId, refferTo } = body;
    const sensorId = `${type.toUpperCase()}_${houseId}_${Date.now()}`;
    const newSensor = {
      name,
      type,
      houseId,
      roomId,
      refferTo,
      status: true,
      data: {},
      current: {},
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = this.db.collection('sensors').doc(sensorId);
    await docRef.set(newSensor);
    return true;
  }

  async deleteSensor(
    sensorId: string,
  ): Promise<{ success: boolean; error?: string }> {
    const docRef = this.db.collection('sensors').doc(sensorId);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return { success: false, error: 'Sensor not found' };
    }
    await docRef.delete();
    return { success: true };
  }

  async saveSensorData(
    sensorId: string,
    current: Record<string, number>,
  ): Promise<string> {
    const docRef = this.db.collection('sensors').doc(sensorId);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      throw new Error('Sensor not found');
    }
    const lastChecked = this.lastCheckedMap2.get(sensorId) || 0;
    if (lastChecked >= 2) {
      const data = docSnap.data()?.data ?? {};
      const dataToSave = this.lastCheckedMap.get(sensorId) ?? {};

      for (const key of Object.keys(current)) {
        if (!data[key]) {
          data[key] = [];
        }

        data[key].push({
          level: dataToSave[key],
          time: admin.firestore.Timestamp.now(),
        });

        data[key] = this.filterDataOlderThan24Hours(data[key]);
      }

      await docRef.update({ data });

      this.lastCheckedMap2.set(sensorId, 0);
    }else{
      // 1. Lấy số lần đếm hiện tại và tăng lên
      const count = (this.lastCheckedMap2.get(sensorId) || 0) + 1;
      this.lastCheckedMap2.set(sensorId, count);

      // 2. Lấy dữ liệu TBC tạm thời
      const dataToSave = this.lastCheckedMap.get(sensorId) || {};

      Object.keys(current).forEach((key) => {
        if (key === 'lastChecked') return; // Không tính TBC cho biến đếm thời gian

        const currentValue = current[key];
        const oldAvg = dataToSave[key] || 0;

        // Áp dụng công thức TBC lũy tiến
        dataToSave[key] = (oldAvg * (count - 1) + currentValue) / count;
      });

      // 3. Cập nhật lại Map
      this.lastCheckedMap.set(sensorId, dataToSave);
    }
    const sensorData = docSnap.data();
    const houseId = sensorData?.houseId;
    await docRef.update({
      current,
      lastUpdated: admin.firestore.Timestamp.now()
    })
    return houseId;
  }

  filterDataOlderThan24Hours(dataArray: any[]) {
    const now = Date.now();
    const twentyFourHoursInMs = 24 * 60 * 60 * 1000;

    return dataArray.filter((item) => {
    // 1. Kiểm tra nếu time là Timestamp của Firestore (có hàm toMillis hoặc toDate)
    // Trường hợp này xảy ra khi ông lấy dữ liệu cũ từ DB lên
    let itemTimeMs: number;

    if (item.time && typeof item.time.toMillis === 'function') {
      itemTimeMs = item.time.toMillis();
    } 
    // 2. Trường hợp item.time là Date object hoặc số (nếu ông tự tạo)
    else {
      itemTimeMs = new Date(item.time).getTime();
      }

      // Giữ lại những phần tử có khoảng cách tới hiện tại nhỏ hơn 24h
      return now - itemTimeMs < twentyFourHoursInMs;
    });
}

 async getSensorsByRoomId(roomId: string) {
    const sensorsRef = this.db.collection('sensors');
    const snapshot = await sensorsRef.where('roomId', '==', roomId).get();
    const sensors = [];
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        type: data.type,
        status: data.status,
      };
    });
  }
  async getSensorDetail(sensorId: string) {
    const docRef = this.db.collection('sensors').doc(sensorId);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      throw new Error('Sensor not found');
    }
    const reffer = docSnap.data()?.refferTo;
    if(reffer){
      const refferDoc = await this.db.collection('thresholds').doc(reffer).get();
    return {
      id: sensorId,
      ...docSnap.data(),
      type: refferDoc.data()
    };
}
}
async updateSensor(body: {
    id: string;
    name: string;
    type: string; 
    status: boolean;
    houseId: string;
    roomId: string;
    refferTo: string;
  }) {
    const { id,name, type, status, houseId, roomId, refferTo } = body;
    try{
      await this.db.collection('sensors').doc(id).update({
        name,
        type,
        status,
        houseId,
        roomId,
        refferTo,
      })
      return true;
    } catch (error) {
      console.error('Error updating sensor:', error);
      throw new Error('Failed to update sensor');
    }
}

async getSensorsByHouseId(houseId: string) {
  const sensorsRef = this.db.collection('sensors');
  const snapshot = await sensorsRef.where('houseId', '==', houseId).get();

  // 1. Sử dụng Promise.all để xử lý tất cả các doc cùng lúc
  const sensorsWithThresholds = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const sensorData = doc.data();
      const sensorType = sensorData.refferTo;

      // 2. Truy vấn vào collection 'thresholds' dựa trên type của sensor
      // Giả sử mỗi type chỉ có 1 cấu hình threshold
      const thresholdRef = this.db.collection('thresholds');
      const thresholdSnapshot = await thresholdRef.doc(sensorType).get();



      // 3. Trả về object kết hợp thông tin sensor và threshold
      return {
        id: doc.id,
        name: sensorData.name,
        type: thresholdSnapshot.data() // Sẽ chứa thông tin ngưỡng tương ứng
      };
    })
  );

  return sensorsWithThresholds;
}
}