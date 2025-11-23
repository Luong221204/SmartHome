import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
@Injectable()
export class FirestoreService {
  private db: FirebaseFirestore.Firestore;
  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-require-imports
        credential: admin.credential.cert(require('../serviceAccount.json')),
      });
    }

    this.db = admin.firestore();
  }

  getCollection(collectionName: string) {
    return this.db.collection(collectionName);
  }
}
