import { Injectable } from "@nestjs/common";
import * as admin from 'firebase-admin';


@Injectable()
export class UserService {
    private db: FirebaseFirestore.Firestore;

    constructor(

    ) {
    this.db = admin.firestore();
        
    }

    async getFcmTokensbyUserId(userId: string): Promise<string[]> {
        const userDoc = await this.db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return [];
        }
        const fcmTokens: string[] = userDoc.data()?.fcmTokens as string[];
        return fcmTokens || [];
    }

    
}