import { Injectable } from '@nestjs/common';
import { FirestoreService } from './firestore.service';
import { MyGateway } from 'src/gateway/gateway';

@Injectable()
export class HomeService {
  private firestoreService: FirestoreService;
  private gatewayService: MyGateway;
  constructor(firestoreService: FirestoreService, gatewayService: MyGateway) {
    this.firestoreService = firestoreService;
    this.gatewayService = gatewayService;
  }
  //cập nhật trang thái bơm
  async updatePump(data: any): Promise<{ success: boolean; error?: string }> {
    try {
      this.gatewayService.server.emit('pumpStatusUpdate', data);
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
      this.gatewayService.server.emit('fanStatusUpdate', data);

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
      this.gatewayService.server.emit('doorStatusUpdate', data);

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

  async updateLed(data: {
    status: boolean;
    location: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      this.gatewayService.server.emit('ledStatusUpdate', data);

      await this.firestoreService
        .getCollection('home')
        .doc(`Light-${data.location}`)
        .update({ status: data.status });
      return { success: true };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return { success: false, error: 'Cập nhật trạng thái đèn thất bại' };
    }
  }

  async getLedStatus(
    location: string,
  ): Promise<{ location: string; status: boolean }> {
    const doc = await this.firestoreService
      .getCollection('home')
      .doc(`Light-${location}`)
      .get();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let status = doc.data()?.status;
    if (status === undefined) {
      status = false;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { location, status };
  }

  async updateTemperatureHumidity(data: {
    temperature: number;
    humidity: number;
  }): Promise<void> {
    await this.firestoreService
      .getCollection('home')
      .doc('temperature-humidity')
      .set(data);
    this.gatewayService.server.emit('temperatureHumidityUpdate', {
      temperature: data.temperature,
      humidity: data.humidity,
    });
  }

  async changePassword(
    oldPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const docRef = this.firestoreService
        .getCollection('home')
        .doc('security');
      const doc = await docRef.get();
      if (doc.data()?.password !== oldPassword) {
        return { success: false, error: 'Mật khẩu cũ không đúng' };
      } else {
        void this.firestoreService
          .getCollection('home')
          .doc('security')
          .update({ password: newPassword });
        return { success: true };
      }
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      return { success: false, error: error.message };
    }
  }

  async updateFs(data: any): Promise<{ success: boolean; error?: string }> {
    try {
      // Gửi real-time qua Gateway
      this.gatewayService.server.emit('fsStatusUpdate', data);

      await this.firestoreService
        .getCollection('home')
        .doc('fs')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        .update(data);

      return { success: true };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      return { success: false, error: error.message };
    }
  }

  async getFsStatus(): Promise<boolean> {
    const doc = await this.firestoreService
      .getCollection('home')
      .doc('fs')
      .get();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return doc.data()?.status;
  }

  async updateRs(data: any): Promise<{ success: boolean; error?: string }> {
    try {
      this.gatewayService.server.emit('rsStatusUpdate', data);

      await this.firestoreService
        .getCollection('home')
        .doc('rs')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        .update(data);

      return { success: true };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      return { success: false, error: error.message };
    }
  }
  async getRsStatus(): Promise<boolean> {
    const doc = await this.firestoreService
      .getCollection('home')
      .doc('rs')
      .get();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return doc.data()?.status;
  }

  async updateGs(data: any): Promise<{ success: boolean; error?: string }> {
    try {
      this.gatewayService.server.emit('gsStatusUpdate', data);

      await this.firestoreService
        .getCollection('home')
        .doc('gs')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        .update(data);

      return { success: true };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      return { success: false, error: error.message };
    }
  }
  async getGsStatus(): Promise<boolean> {
    const doc = await this.firestoreService
      .getCollection('home')
      .doc('gs')
      .get();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return doc.data()?.status;
  }

  async updateBuz(data: any): Promise<{ success: boolean; error?: string }> {
    try {
      this.gatewayService.server.emit('buzStatusUpdate', data);

      await this.firestoreService
        .getCollection('home')
        .doc('buzzer')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        .update(data);

      return { success: true };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      return { success: false, error: error.message };
    }
  }
  async getBuzStatus(): Promise<boolean> {
    const doc = await this.firestoreService
      .getCollection('home')
      .doc('buzzer')
      .get();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return doc.data()?.status;
  }

  async getPassword(): Promise<string> {
    const doc = await this.firestoreService
      .getCollection('home')
      .doc('password')
      .get();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return doc.data()?.content;
  }

  async updatePassword(
    data: any,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      this.gatewayService.server.emit('passwordUpdate', data);

      await this.firestoreService
        .getCollection('home')
        .doc('password')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        .update(data);

      return { success: true };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      return { success: false, error: error.message };
    }
  }
}
