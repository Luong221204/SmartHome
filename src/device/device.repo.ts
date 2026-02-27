import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { FirestoreService } from "src/home/firestore.service";
import * as admin from 'firebase-admin';
import { AutomationDeviceDto } from "./dto/device.dto";


@Injectable()
export class DeviceRepository {



  private db: FirebaseFirestore.Firestore;
  private lastCheckedMap: Map<string, number> = new Map(); // Lưu timestamp lần gửi cuối
  constructor() {
    this.db = admin.firestore();
  }

  async getDeviceLog(deviceId: string, limit: number, startAfter?: string) {
    let query = this.db
      .collection('devices')
      .doc(deviceId)
      .collection('activity_logs')
      .orderBy('time', 'desc')
      .limit(limit);

    if (startAfter) {
      let cursor: FirebaseFirestore.Timestamp | undefined;
      cursor = admin.firestore.Timestamp.fromMillis(Number(startAfter));
      console.log('Cursor timestamp:', cursor.toDate());
      query = query.startAfter(cursor);
    }

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }
  async deleteDevice(deviceId: string) {
    try {
      await this.db.collection('devices').doc(deviceId).delete();
      return { success: true };

    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  async createDevice(deviceDto: {
    name: string;
    type: string;
    houseId: string;
    roomId: string;
  }) {
    try {
      const { name, type, houseId, roomId } = deviceDto;

      if (!name || !type || !houseId || !roomId) {
        throw new HttpException(
          { success: false, message: 'Missing required fields' },
          HttpStatus.BAD_REQUEST
        );
      }

      // 1. Query các device cùng type
      const snapshot = await this.db
        .collection('devices')
        .where('type', '==', type)
        .get();

      const nextNumber = snapshot.size + 1;

      const finalId = `${type.toUpperCase()}_${nextNumber}`;
      const deviceRef = this.db.collection('devices').doc(finalId);

      // 2. Check nếu ID đã tồn tại (tránh ghi đè)
      const existingDoc = await deviceRef.get();
      if (existingDoc.exists) {
        throw new HttpException(
          { success: false, message: 'Device ID already exists' },
          HttpStatus.CONFLICT
        );
      }

      const newDevice = {
        name,
        type,
        houseId,
        roomId,
        value: 0,
        kwh: 0,
        levels: {
          1: 51,
          2: 102,
          3: 153,
          4: 204,
          5: 255,
        },
        status: false,
        createdAt: admin.firestore.Timestamp.now(),
      };

      await deviceRef.set(newDevice);

      const today = new Date().toISOString().split('T')[0];

      await deviceRef.collection('energy_stats').doc(today).set(
        {
          date: today,
          kwh: 0,
          lastUpdated: admin.firestore.Timestamp.now(),
        },
        { merge: true },
      );

      return {
        success: true,
        deviceId: deviceRef.id,
      };

    } catch (error) {

      // Nếu là HttpException mình tự throw → giữ nguyên
      if (error instanceof HttpException) {
        throw error;
      }

      // Firebase permission
      if (error.code === 7) {
        throw new HttpException(
          { success: false, message: 'Permission denied' },
          HttpStatus.FORBIDDEN
        );
      }

      // Firebase unavailable / network
      if (error.code === 14) {
        throw new HttpException(
          { success: false, message: 'Firestore unavailable' },
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }

      // Mặc định
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Internal server error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getDeviceDetail(deviceId: string) {
    const deviceRef = this.db.collection('devices').doc(deviceId);
    const snapshot = await deviceRef.get();
    if (!snapshot.exists) {
      throw new HttpException(
        { message: 'Device not found' },
        HttpStatus.NOT_FOUND
      );
    }
    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  }

  async getEnergyStats(deviceId: string) {
    const energyRef = this.db
      .collection('devices')
      .doc(deviceId)
      .collection('energy_stats')
      .orderBy('date', 'desc')
      .limit(30); // Lấy 30 ngày gần nhất
    const snapshot = await energyRef.get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  async getDeviceByRoomId(roomId: string) {
    const snapshot = await this.db
      .collection('devices')
      .where('houseId', '==', roomId)
      .get();
    if (snapshot.empty) {
      throw new HttpException(
        { message: 'Device not found' },
        HttpStatus.NOT_FOUND
      );
    }
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }


  async update(body: any): Promise<{ success: boolean; error?: string }> {
    try {
      const deviceRef = this.db.collection('devices').doc(body.deviceId);
      const deviceSnap = await deviceRef.get();
      if (!deviceSnap.exists) {
        throw new HttpException(
          { message: 'Device not found' },
          HttpStatus.NOT_FOUND,
      );
      }
      await deviceRef.update({
        status: body.status,
        value: body.value,
      });
      const deviceRef2 = this.db
        .collection('devices')
        .doc(body.deviceId).collection('activity_logs').doc();
      await deviceRef2.set({
        status: body.status,
        value: body.value,
        description: `${deviceSnap.data()?.name} đã được ${body.status ? 'bật với giá trị ' + body.value : 'tắt'} `,
        time: admin.firestore.Timestamp.now(),
      });
      return { success: true };
    } catch (error) {
      console.log('Error updating device:', error);
      throw new HttpException(
      { message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async handlePowerData(deviceId: string, watt: number, status: boolean) {
    if (!status) {
      // Nếu thiết bị tắt, reset timestamp để khi bật lại sẽ tính từ thời điểm đó
      this.lastCheckedMap.set(deviceId, Date.now());
      return;
    } else {
      const now = Date.now();
      const lastChecked = this.lastCheckedMap.get(deviceId) || now;

      // 1. Tính toán điện năng tiêu thụ (kWh) giữa 2 lần gửi
      // Công thức: (Watt * Giờ trôi qua) / 1000
      const hoursElapsed = (now - lastChecked) / (1000 * 60 * 60);
      const kwhAdded = (watt * hoursElapsed) / 1000;

      // Cập nhật timestamp lần gửi cuối
      this.lastCheckedMap.set(deviceId, now);

      if (kwhAdded <= 0) return;

      // 2. Xác định Document của ngày hôm nay (YYYY-MM-DD)
      const today = new Date().toISOString().split('T')[0];
      const energyRef = this.db
        .collection('devices')
        .doc(deviceId)
        .collection('energy_stats')
        .doc(today);

      // 3. Sử dụng FieldValue.increment để cộng dồn an toàn
      await energyRef.set(
        {
          date: today,
          kwh: admin.firestore.FieldValue.increment(kwhAdded),
          lastWatt: watt,
          lastUpdated: admin.firestore.Timestamp.now(),
        },
        { merge: true },
      );

      console.log(
        `[Energy] Đã cộng thêm ${kwhAdded.toFixed(6)} kWh cho thiết bị ${deviceId}`,
      );
    }
  }

  async prepareNextDayDoc(docId: string) {
    // 2. Lấy danh sách tất cả thiết bị cần đo điện năng
    const devicesSnapshot = await this.db.collection('devices').get();

    const batch = this.db.batch();

    devicesSnapshot.forEach((deviceDoc) => {
      const nextDayRef = this.db
        .collection('devices')
        .doc(deviceDoc.id)
        .collection('energy_stats')
        .doc(docId);

      // 3. Khởi tạo Document mới với kwh = 0
      // Sử dụng set với { merge: true } để tránh ghi đè nếu doc đã tồn tại
      batch.set(
        nextDayRef,
        {
          date: docId,
          kwh: 0,
          lastWatt: 0,
          lastUpdated: admin.firestore.Timestamp.now(),
          createdAt: admin.firestore.Timestamp.now(),
        },
        { merge: true },
      );
    });

    await batch.commit();
    console.log(`[Energy] Đã tạo sẵn Document cho ngày: ${docId}`);
  }
}