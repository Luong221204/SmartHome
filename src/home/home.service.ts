import { Injectable } from '@nestjs/common';
import { FirestoreService } from './firestore.service';

@Injectable()
export class HomeService {
  private firestoreService: FirestoreService;
  constructor(firestoreService: FirestoreService) {
    this.firestoreService = firestoreService;
  }
  //cập nhật trang thái bơm
  async updatePump(data: any): Promise<{ success: boolean; error?: string }> {
    try {
      await this.firestoreService
        .getCollection('home')
        .doc('pump')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        .update(data);
      return { success: true };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      return { success: false, error: error.message };
    }
  }

  //lấy trạng thái bơm
  async getPumpStatus(): Promise<boolean> {
    const doc = await this.firestoreService
      .getCollection('home')
      .doc('pump')
      .get();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return doc.data()?.status;
  }
  //cập nhật trạng thái quạt
  async updateFan(data: any): Promise<{ success: boolean; error?: string }> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await this.firestoreService.getCollection('home').doc('fan').update(data);
      return { success: true };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      return { success: false, error: error.message };
    }
  }
  //lấy trạng thái quạt
  async getFanStatus(): Promise<boolean> {
    const doc = await this.firestoreService
      .getCollection('home')
      .doc('fan')
      .get();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return doc.data()?.status;
  }

  //cập nhật trạng thái quạt
  async updateDoor(data: any): Promise<{ success: boolean; error?: string }> {
    try {
      await this.firestoreService
        .getCollection('home')
        .doc('door')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        .update(data);
      return { success: true };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      return { success: false, error: error.message };
    }
  }
  //lấy trạng thái quạt
  async getDoorStatus(): Promise<boolean> {
    const doc = await this.firestoreService
      .getCollection('home')
      .doc('door')
      .get();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return doc.data()?.status;
  }
}
