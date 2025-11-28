import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class FirebaseService {
  private admin: admin.app.App;

  constructor() {
    this.admin = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }

  async sendNotification(topic: string, title: string, body: string) {
    const message: admin.messaging.Message = {
      notification: { title, body },
      topic,
    };

    try {
      const response = await this.admin.messaging().send(message);
      console.log('FCM sent:', response);
    } catch (err) {
      console.error('FCM error:', err);
    }
  }
}
