import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { RequestJoinHouseDto } from './dto/requesJoinHouse.dto';
import { HousePendingDto } from 'src/module/house.approval/house.dto/house.approval';
dotenv.config();

@Injectable()
export class FirebaseService {
  private db: FirebaseFirestore.Firestore;
  constructor() {
    this.db = admin.firestore();
  }

  async sendAlertNotification(topic: string, title: string, body: string) {
    const message: admin.messaging.Message = {
      notification: { title, body },
      topic,
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('FCM sent:', response);
    } catch (err) {
      console.error('FCM error:', err);
    }
  }

  async sendRequestToJoinHouseNotification(request: RequestJoinHouseDto) {
    const houseDoc = await this.db
      .collection('home')
      .doc(request.houseId)
      .get();
    if (!houseDoc.exists) {
      console.error('House not found');
      return { success: false, error: 'House not found' };
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const name = await this.db
      .collection('users')
      .doc(request.userId)
      .get()
      .then((doc) => doc.data()?.name || 'Người dùng');
    const fcmTokens = houseDoc.data()?.fcmTokens as string[];
    if (!fcmTokens || fcmTokens.length === 0) {
      return { success: false, error: 'No FCM tokens' };
    }
    const address = houseDoc.data()?.address as string;
    const message: admin.messaging.MulticastMessage = {
      tokens: fcmTokens,

      notification: {
        title: 'Yêu cầu tham gia nhà',
        body: `${name} muốn tham gia ${address}`,
      },

      data: {
        address,
        description: request.description ?? '',
        type: 'JOIN_HOUSE_REQUEST',
      },
    };
    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      console.log('FCM sent:', response);
    } catch (err) {
      console.error('FCM error:', err);
    }
  }

  async sendResolveJoinHouseNotification(
    request: HousePendingDto,
    fcmTokenRequest: string,
    fcmTokenPending: string
  ) {
    const houseDoc = await this.db
      .collection('home')
      .doc(request.houseId)
      .get();
    if (!houseDoc.exists) {
      console.error('House not found');
      return { success: false, error: 'House not found' };
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const requestName = await this.db
      .collection('users')
      .doc(request.memberId)
      .get()
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      .then((doc) => doc.data()?.name || 'Người dùng');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const approvedName = await this.db
      .collection('users')
      .doc(request.memberApprovalId)
      .get()
      .then((doc) => doc.data()?.name || 'Người dùng');
    const fcmTokens = houseDoc.data()?.fcmTokens as string[];
    const validFcmTokens = fcmTokens.filter(
      (token) => !fcmTokenPending.includes(token),
    );

    if (!validFcmTokens || validFcmTokens.length === 0) {
      return { success: false, error: 'No FCM tokens' };
    }
    const address = houseDoc.data()?.address as string;
    // tin nhắn cho các thành viên trong nhà
    const message: admin.messaging.MulticastMessage = {
      tokens: validFcmTokens,

      notification: {
        title: 'Yêu cầu tham gia nhà',
        body: `${approvedName} đã ${request.isApproved ? 'chấp thuận' : 'từ chối'} yêu cầu tham gia ${requestName}`,
      },

      data: {
        address,
        description: request.isApproved
          ? 'Yêu cầu đã được chấp thuận'
          : 'Yêu cầu đã bị từ chối',
        type: 'JOIN_HOUSE_REQUEST',
      },
    };
    // tin nhắn cho người dùng đã gửi yêu cầu
    const messageForUserRequested: admin.messaging.Message = {
      token: fcmTokenRequest,
      notification: {
        title: 'Yêu cầu tham gia nhà',
        body: `${approvedName} đã ${request.isApproved ? 'chấp thuận' : 'từ chối'} yêu cầu tham gia của bạn` 
      },
      data: {
        address,
        description: request.isApproved
          ? 'Yêu cầu đã được chấp thuận'
          : 'Yêu cầu đã bị từ chối',
        type: 'JOIN_HOUSE_REQUEST',
      },
    };
    try {
      const response = await admin.messaging().sendEachForMulticast(message);
     await admin.messaging().send(messageForUserRequested);

      console.log('FCM sent:', response);
    } catch (err) {
      console.error('FCM error:', err);
    }
  }
}
