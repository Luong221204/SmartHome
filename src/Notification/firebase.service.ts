import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class FirebaseService {
  private db: FirebaseFirestore.Firestore;
  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-require-imports
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }

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

  async sendRequestToJoinHouseNotification(
    ownerFcmToken: string,
    name: string,
    house: string,
    description: string,
  ) {
    const message: admin.messaging.Message = {
      token: ownerFcmToken, // 👈 QUAN TRỌNG

      notification: {
        title: 'Yêu cầu tham gia nhà',
        body: `${name} muốn tham gia ${house}`,
      },

      data: {
        house,
        description,
        type: 'JOIN_HOUSE_REQUEST',
      },
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('FCM sent:', response);
    } catch (err) {
      console.error('FCM error:', err);
    }
  }
}
