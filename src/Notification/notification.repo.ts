import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { FcmTokenDto } from "./dto/fcmToken.dto";
import * as admin from 'firebase-admin';
import { Home } from 'src/dtos/dtos.home';
import { RequestJoinHouseDto } from './dto/requesJoinHouse.dto';
import { FirebaseService } from './firebase.service';

@Injectable()
export class NotificationRepository {
  private db: FirebaseFirestore.Firestore;

  constructor(private firebaseService: FirebaseService) {
    this.db = admin.firestore();
  }

  async updateFcmToken(
    f: FcmTokenDto,
  ): Promise<{ success: boolean; error?: string }> {
    const userRef = this.db.collection('users').doc(f.userId);
    const snap = await userRef.get();

    if (!snap.exists) {
      return { success: false, error: 'Tài khoản không tồn tại' };
    }

    try {
      await userRef.update({
        fcmTokens: admin.firestore.FieldValue.arrayUnion(f.fcmToken),
      });

      return { success: true };
    } catch (e) {
      console.error('Update FCM Token error:', e);
      return { success: false, error: 'Lỗi khi cập nhật FCM Token' };
    }
  }

  async deleteFcmToken(
    f: FcmTokenDto,
  ): Promise<boolean> {
    const userRef = this.db.collection('users').doc(f.userId);
    const snap = await userRef.get();

    if (!snap.exists) {
      throw new BadRequestException("Tài khoản không tồn tại");
    }

    try {
      await userRef.update({
        fcmTokens: admin.firestore.FieldValue.arrayRemove(f.fcmToken),
      });

      return true;
    } catch (e) {
      console.error('Update FCM Token error:', e);
      throw new BadRequestException(e);
    }
  }

  getFcmToken(docId: string): any {
    const snap = admin.firestore().collection('userFcmToken').doc(docId);
    void snap.delete();

    return { success: true };
  }

  async getNotifications(userId: string): Promise<any[]> {
  // 1. Lấy danh sách liên kết từ notification_user
  const snap = await this.db
    .collection('notification_user')
    .where('userId', '==', userId)
    .get();

  if (snap.empty) {
    return [];
  }

  // 2. Tạo danh sách các Promise để lấy chi tiết từng thông báo
  const detailPromises = snap.docs.map(async (userDoc) => {
    const userData = userDoc.data();
    const notificationId = userData.notificationId;

    // Truy vấn vào collection 'notification' bằng ID
    const notifDoc = await this.db.collection('notification').doc(notificationId).get();

    if (notifDoc.exists) {
      return {
        id: notifDoc.id,
        ...notifDoc.data(),
        // Bạn có thể gộp thêm thông tin từ notification_user nếu cần (ví dụ: ngày nhận, trạng thái đã đọc)
        ...userData 
      };
    }
    return null;
  });

  // 3. Chờ tất cả các truy vấn chi tiết hoàn tất
  const results = await Promise.all(detailPromises);

  // 4. Lọc bỏ các giá trị null (trường hợp id tồn tại trong notification_user nhưng ko có trong notification)
  return results.filter(notif => notif !== null);
}

  async markAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const notificationRef = this.db
        .collection('notification')
        .doc(notificationId);
      const snap = await notificationRef.get();
      if (!snap.exists) {
        return { success: false, error: 'Thông báo không tồn tại' };
      }
      await notificationRef.update({ isRead: true });
      return { success: true };
    } catch (e) {
      console.error('Mark as read error:', e);
      return { success: false, error: 'Lỗi khi đánh dấu thông báo đã đọc' };
    }
  }

  async getNotificationById(notificationId: string): Promise<any | null> {
    const notificationRef = this.db
      .collection('notification')
      .doc(notificationId);
    const snap = await notificationRef.get();
    const info = await this.db
      .collection(snap.data()?.collection)
      .doc(snap.data()?.documentId)
      .get();
    return snap.exists ? info.data() : null;
  }



  
  async getUserIdsByHouseId(houseId: string): Promise<string[]> {
    try {
      const houseRef = this.db.collection('home').doc(houseId);
      const houseDoc = await houseRef.get();
      if (!houseDoc.exists) {
        return [];
      }
      return houseDoc.data()?.userIds || [];
    } catch (error) {     
       console.error('Error getting userIds by houseId:', error);
      return [];
    }
  }

  async getAddressByHouseId(houseId: string): Promise<string> {
    try {
      const houseRef = this.db.collection('home').doc(houseId);
      const houseDoc = await houseRef.get();
      if (!houseDoc.exists) {
        return '';
      }
      return houseDoc.data()?.address || '';
    } catch (error) {
      console.error('Error getting address by houseId:', error);
      return '';
    }
}
}