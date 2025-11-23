import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import serviceAccount from '../serviceAccount.json';

@Injectable()
export class FirebaseService {
  private admin: admin.app.App;

  constructor() {
    this.admin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
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
