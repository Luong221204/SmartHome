import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirestoreService {
  public db: FirebaseFirestore.Firestore;
  constructor() {
    this.db = admin.firestore();
  }

  getCollection(collectionName: string) {
    return this.db.collection(collectionName);
  }
}
