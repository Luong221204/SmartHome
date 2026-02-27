import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { AutomationDto } from './auto.dto/auto.object';
import { UpdateData } from 'firebase-admin/firestore';
import { User } from 'src/auth/user.entity';
import { DeviceService } from 'src/device/device.service';
@Injectable()
export class AutoRepo {
  private db: FirebaseFirestore.Firestore;

  constructor(private readonly deviceService: DeviceService) {
    this.db = admin.firestore();
  }

  async loadAllSchedulers(): Promise<
    FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
  > {
    const snapshot = await this.db
      .collection('automations')
      .where('type', '==', 'SCHEDULE')
      .where('isEnabled', '==', true)
      .get();
    return snapshot;
  }

   // Hàm thực thi hành động (tương tự như phần sensor)
   async executeScheduleAction(id: string, data: AutomationDto) {
    const batch = this.db.batch();
    const now = admin.firestore.Timestamp.now();

    // 1. Cập nhật thiết bị
    const deviceRef = this.db.collection('devices').doc(data.action.deviceId);
    batch.update(deviceRef, {
      'state.power': data.action.value === 1,
      lastUpdated: now,
    });

    await batch.commit();
  }

  async saveNotifcation(data: AutomationDto): Promise<string> {
     // 2. Ghi Log
    const notificationRef = await this.db.collection('notification').add({
      description: `Lịch trình: ${data.name} đã thực thi.`,
      createAt: admin.firestore.Timestamp.now(),
      title: 'Tự động',
      houseId: data.houseId,
    });
    return notificationRef.id;
  }

  async create(
    body: AutomationDto,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.db.collection('automations').add({
        ...body,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error creating automation:', error);
      return { success: false, error: error.message };
    }
  }

  async update(
    body: AutomationDto,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const docRef = this.db.collection('automations').doc(body.id);
      await docRef.update(body as UpdateData<any>);
      return { success: true };
    } catch (error) {
      console.error('Error updating automation:', error);
      return { success: false, error: error.message };
    }
  }

  async findAll(user: User, houseId: string) {
    const userDoc = await this.db.collection('users').doc(user.id).get();

    if (!userDoc.exists) {
      throw new NotFoundException('User không tồn tại');
    }

    const userData = userDoc.data();

    const houseIds: string[] = userData?.houseIds ?? [];
    // 🔹 2. Check quyền
    if (!houseIds.includes(houseId)) {
      throw new ForbiddenException('Không có quyền truy cập house này');
    }

    // 🔹 3. Nếu hợp lệ → query automation
    const snapshot = await this.db
      .collection('automations')
      .where('houseId', '==', houseId)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  async deleteAutomation(user: User, automationId: string) {
    const userRef = this.db.collection('users').doc(user.id);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      throw new NotFoundException('User not found');
    }

    const userData = userSnap.data();
    const houseIds: string[] = userData?.houseIds ?? [];

    // Lấy automation
    const automationRef = this.db.collection('automations').doc(automationId);

    const automationSnap = await automationRef.get();

    if (!automationSnap.exists) {
      throw new NotFoundException('Automation not found');
    }

    const automationData = automationSnap.data();
    const houseId = automationData?.houseId;

    // Check quyền
    if (!houseIds.includes(houseId)) {
      throw new ForbiddenException('Bạn không có quyền xóa automation này');
    }

    // Xóa
    await automationRef.delete();

    return {
      message: 'Xóa automation thành công',
    };
  }
  async getAutomationByDeviceId(deviceId: string) {
    const snapshot = await this.db
      .collection('automations')
      .where('action.deviceId', '==', deviceId)
      .get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AutomationDto[];
  }

  async implementAutomationLogic(
    houseId: string,
    sensorId: string,
    value: Record<string, number>
  ): Promise<AutomationDto[]> {
    const snapshot = await this.db
      .collection('automations')
      .where('houseId', '==', houseId)
      .where('type', '==','SENSOR')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id, // 👈 thêm docId
      ...doc.data(), // spread data
    })) as AutomationDto[];
  }

  async updateLastExecuted(automationId: string) {
    const automationRef = this.db.collection('automations').doc(automationId);
    await automationRef.update({
      'control.lastExecuted': admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  async getAutomationScenes(
    deviceId: string,
    limit: number,
    startAfter?: string,
  ) {
    let query = this.db
      .collection('automations')
      .where('action.deviceId', '==', deviceId)
      .orderBy('createdAt', 'desc')
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
}
