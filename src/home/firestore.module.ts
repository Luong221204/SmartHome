// firestore.module.ts
import { Global, Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();
@Global()
@Module({
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: () => {
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(
                /\\n/g,
                '\n',
              ),
            }),
          });
        }
        return admin;
      },
    },
  ],
  exports: ['FIREBASE_ADMIN'], // để module khác dùng được
})
export class FirestoreModule {}
