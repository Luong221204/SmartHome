import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { User } from './user.entity';
@Injectable()
export class UserFirestoreService {
  private users = admin.firestore().collection('users');

  private userSession = admin.firestore().collection('userSession');
  async findByEmail(email: string): Promise<User | null> {
    const snap = await this.users.where('email', '==', email).limit(1).get();
    if (snap.empty) return null;
    const data = snap.docs[0].data() as Omit<User, 'id'>; // loại bỏ id

    return { id: snap.docs[0].id, ...data };
  }
  async findById(id: string): Promise<User | null> {
    const doc = await this.users.doc(id).get();
    if (!doc.exists) return null; // kiểm tra đúng document có tồn tại

    const data = doc.data() as Omit<User, 'id'>;
    return { ...data, id: doc.id };
  }

  async createUser(user: any) {
    const doc = this.users.doc(); // auto id
    await doc.set(user);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return { id: doc.id, ...user };
  }

  async updateUser(id: string, data: any) {
    await this.users.doc(id).update(data);
  }

  async createSession(userId: string, refreshToken: string) {
    const snap = await this.userSession
      .where('userId', '==', userId)
      .limit(1)
      .get();
    if (!snap.empty) {
      const docRef = snap.docs[0].ref;
      // 👉 xóa session
      await docRef.delete();
    };

    const doc = this.userSession.doc(); // auto id
    await doc.set({ userId, refreshToken });
    return { id: doc.id, userId, refreshToken };
  }

  async findValid(userId: string, refreshToken: string): Promise<User | null> {
    const snap = await this.userSession
      .where('userId', '==', userId)
      .where('refreshToken', '==', refreshToken)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const data = snap.docs[0].data();
    const user = await this.findById(data.userId);
    return user;
  }
}
