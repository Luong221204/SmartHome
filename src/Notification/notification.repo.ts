import { Inject, Injectable } from '@nestjs/common';
import { FcmTokenDto } from "./dto/fcmToken.dto";
import * as admin from 'firebase-admin';
import { Home } from 'src/dtos/dtos.home';
import { RequestJoinHouseDto } from './dto/requesJoinHouse.dto';
import { FirebaseService } from './firebase.service';

@Injectable()
export class NotificationRepository {
  constructor(private firebaseService: FirebaseService) { }

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

  getFcmToken(docId: string): any {
    const snap = admin.firestore().collection('userFcmToken').doc(docId);
    void snap.delete();

    return { success: true };
  }

  
}
