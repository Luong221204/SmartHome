import { Inject, Injectable } from '@nestjs/common';
import { FcmTokenDto } from "./dto/fcmToken.dto";
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationRepository {
  constructor() {

  }

  async updateFcmToken(
    f: FcmTokenDto,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const snap = await admin
        .firestore()
        .collection('userFcmToken')
        .where('houseId', '==', f.houseId)
        .where('fcmToken', '==', f.fcmToken)
        .get();
      if (snap.empty) {
        await admin.firestore().collection('userFcmToken').add({
          houseId: f.houseId,
          fcmToken: f.fcmToken,
        });
      }
      return { success: true };
    } catch (error) {
      console.error('Lỗi khi cập nhật FCM Token:', error);
      return { success: false, error: 'Lỗi khi cập nhật FCM Token' };
    }
  }
}