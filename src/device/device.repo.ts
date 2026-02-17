import { Injectable } from "@nestjs/common";
import { FirestoreService } from "src/home/firestore.service";
import * as admin from 'firebase-admin';


@Injectable()
export class DeviceRepository {
    private db: FirebaseFirestore.Firestore;
  constructor() {
        this.db = admin.firestore();
  }
}