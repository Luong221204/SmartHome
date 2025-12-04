import { Injectable } from '@nestjs/common';
import { FirestoreService } from './firestore.service';
import { MyGateway } from 'src/gateway/gateway';
import * as admin from 'firebase-admin';

@Injectable()
export class HomeService {
  private firestoreService: FirestoreService;
  private gatewayService: MyGateway;
  constructor(firestoreService: FirestoreService, gatewayService: MyGateway) {
    this.firestoreService = firestoreService;
    this.gatewayService = gatewayService;
  }

  async getHello(): Promise<{ success: boolean }> {
    try {
      await this.firestoreService
        .getCollection('home')
        .doc('gs')
        .update({ data: [] });

      await this.firestoreService
        .getCollection('home')
        .doc('fs')
        .update({ data: [] });

      await this.firestoreService
        .getCollection('home')
        .doc('rs')
        .update({ data: [] });

       await this.firestoreService
        .getCollection('home')
        .doc('temperature')
        .update({ data: [] });
       await this.firestoreService
        .getCollection('home')
        .doc('humidity')
        .update({ data: [] });
      return { success: true };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      return { success: false };
    }
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
    rain: boolean;
  }): Promise<void> {
    await this.firestoreService
      .getCollection('home')
      .doc('temperature-humidity')
      .set(data);
    this.gatewayService.server.emit('temperatureHumidityUpdate', {
      temperature: data.temperature,
      humidity: data.humidity,
      rain: data.rain,
    });
  }

  async updateTemperatureHumidityForChart(data: {
    temperature: number;
    humidity: number;
    rain: boolean;
  }): Promise<void> {
    const doc = await this.firestoreService
      .getCollection('home')
      .doc('temperature')
      .get();

    const doc1 = await this.firestoreService
      .getCollection('home')
      .doc('humidity')
      .get();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const dataArray = doc.data()?.data || [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const dataArray1 = doc1.data()?.data || [];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (dataArray.length >= 30) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      dataArray.shift(); // Xóa phần tử đầu tiên nếu đã đủ 20 phần tử
    }

     // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (dataArray1.length >= 30) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      dataArray1.shift(); // Xóa phần tử đầu tiên nếu đã đủ 20 phần tử
    }
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0'); // luôn 2 chữ số
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    dataArray.push({
      level: data.temperature,
      time: `${hours}:${minutes}`,
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    dataArray1.push({
      level: data.humidity,
      time: `${hours}:${minutes}`,
    });

    await this.firestoreService
      .getCollection('home')
      .doc('temperature')
      .update({
        data: dataArray,
      });

    await this.firestoreService.getCollection('home').doc('humidity').update({
      data: dataArray1,
    });

    const doc2 = await this.firestoreService
      .getCollection('home')
      .doc('temperature')
      .get();
    this.gatewayService.server.emit('temperature', doc2.data());

    const doc3 = await this.firestoreService
      .getCollection('home')
      .doc('humidity')
      .get();
    this.gatewayService.server.emit('humidity', doc3.data());
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
  async updateFsData(
    data: number,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const doc = await this.firestoreService
        .getCollection('home')
        .doc('fs')
        .get();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const dataArray = doc.data()?.data || [];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (dataArray.length >= 30) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        dataArray.shift();
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0'); // luôn 2 chữ số
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      dataArray.push({
        level: data,
        time: `${hours}:${minutes}`,
      });
      await this.firestoreService.getCollection('home').doc('fs').update({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        data: dataArray,
      });
      const doc1 = await this.firestoreService
        .getCollection('home')
        .doc('fs')
        .get();
      console.log('doc', doc1.data());
      this.gatewayService.server.emit('fsStatusUpdate', doc1.data());
      return { success: true };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      return { success: false, error: error.message };
    }
  }

  async updateFsLevel(
    level: number,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.firestoreService.getCollection('home').doc('fs').update({
        level: level,
      });
      const doc = await this.firestoreService
        .getCollection('home')
        .doc('fs')
        .get();
      console.log('doc', doc.data());
      this.gatewayService.server.emit('fsStatusUpdate', doc.data());
      return { success: true };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      return { success: false, error: error.message };
    }
  }

  async getFsStatus(): Promise<{
    status: boolean;
    data: Array<{ level: number; time: string }>;
    infor: string;
    level: number;

  }> {
    const doc = await this.firestoreService
      .getCollection('home')
      .doc('fs')
      .get();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.log(doc.data()?.data.length);

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      status: doc.data()?.status,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: doc.data()?.data,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      infor: doc.data()?.infor,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      level: doc.data()?.level,

    };
  }

  async getTemp(): Promise<{
    data: Array<{ level: number; time: string }>;
  }> {
    const doc = await this.firestoreService
      .getCollection('home')
      .doc('temperature')
      .get();

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: doc.data()?.data,
    };
  }

  async getHumid(): Promise<{
    data: Array<{ level: number; time: string }>;
  }> {
    const doc = await this.firestoreService
      .getCollection('home')
      .doc('humidity')
      .get();

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: doc.data()?.data,
    };
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
  async updateRsLevel(
    level: number,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.firestoreService.getCollection('home').doc('rs').update({
        level: level,
      });
      const doc = await this.firestoreService
        .getCollection('home')
        .doc('rs')
        .get();
      console.log('doc', doc.data());
      this.gatewayService.server.emit('fsStatusUpdate', doc.data());
      return { success: true };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      return { success: false, error: error.message };
    }
  }

  async updateRsData(
    data: number,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const doc = await this.firestoreService
        .getCollection('home')
        .doc('rs')
        .get();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const dataArray = doc.data()?.data || [];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (dataArray.length >= 30) {
        dataArray.shift();
      }
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0'); // luôn 2 chữ số
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      dataArray.push({
        level: data,
        time: `${hours}:${minutes}`,
      });
      await this.firestoreService.getCollection('home').doc('rs').update({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        data: dataArray,
      });
      const doc1 = await this.firestoreService
        .getCollection('home')
        .doc('rs')
        .get();
      console.log('doc', doc1.data());
      this.gatewayService.server.emit('rsStatusUpdate', doc1.data());
      return { success: true };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      return { success: false, error: error.message };
    }
  }
  async getRsStatus(): Promise<{
    status: boolean;
    data: Array<{ level: number; time: string }>;
    infor: string;
    level: number;
  }> {
    const doc = await this.firestoreService
      .getCollection('home')
      .doc('rs')
      .get();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.log(doc.data()?.data.length);

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      status: doc.data()?.status,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: doc.data()?.data,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      infor: doc.data()?.infor,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      level: doc.data()?.level,
    };
  }

  async updateGs(obj: any): Promise<{ success: boolean; error?: string }> {
    try {
      this.gatewayService.server.emit('gasStatusUpdate', obj);
      await this.firestoreService.getCollection('home').doc('gs').update({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        status: obj.status,
      });

      return { success: true };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      return { success: false, error: error.message };
    }
  }

  async updateGsData(
    data: number,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const doc = await this.firestoreService
        .getCollection('home')
        .doc('gs')
        .get();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const dataArray = doc.data()?.data || [];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (dataArray.length >= 30) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        dataArray.shift(); // Xóa phần tử đầu tiên nếu đã đủ 20 phần tử
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0'); // luôn 2 chữ số
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      dataArray.push({
        level: data,
        time: `${hours}:${minutes}`,
      });

      await this.firestoreService.getCollection('home').doc('gs').update({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        data: dataArray,
      });

      const doc1 = await this.firestoreService
        .getCollection('home')
        .doc('gs')
        .get();
      console.log('doc', doc1.data());
      this.gatewayService.server.emit('gasStatusUpdate', doc1.data());
      return { success: true };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      return { success: false, error: error.message };
    }
  }

  async updateGsLevel(
    level: number,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.firestoreService.getCollection('home').doc('gs').update({
        level: level,
      });
      const doc = await this.firestoreService
        .getCollection('home')
        .doc('gs')
        .get();
      console.log('doc', doc.data());
      this.gatewayService.server.emit('gasStatusUpdate', doc.data());
      return { success: true };
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      return { success: false, error: error.message };
    }
  }
  async getGsStatus(): Promise<{
    status: boolean;
    data: Array<{ level: number; time: string }>;
    infor: string;
    level: number;
  }> {
    const doc = await this.firestoreService
      .getCollection('home')
      .doc('gs')
      .get();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.log(doc.data()?.data.length);

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      status: doc.data()?.status,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: doc.data()?.data,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      infor: doc.data()?.infor,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      level: doc.data()?.level,

    };
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
    return doc.data()?.password;
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
