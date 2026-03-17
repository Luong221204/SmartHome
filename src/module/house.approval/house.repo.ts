import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { HouseRequestDto } from './house.dto/house.request';
import { RequestJoinHouseDto } from 'src/notification/dto/requesJoinHouse.dto';
import * as admin from 'firebase-admin';
import { HouseCreateDto } from './house.dto/house.create';
import { HouseUpdateDto } from './house.dto/house.update';
import { HousePendingDto } from './house.dto/house.approval';
import { FcmTokenDto } from 'src/notification/dto/fcmToken.dto';
import e from 'express';
@Injectable()
export class HouseApprovalRepository {
  public db: FirebaseFirestore.Firestore;
  constructor() {
    this.db = admin.firestore();
  }

  async requsetToJoinHouse(
    request: HouseRequestDto,
  ): Promise<{ success: boolean }> {
    try {
      await this.db.collection('houseRequestToAccess').add(request);
      return { success: true };
    } catch (err) {
      console.error('Error adding document: ', err);
      throw new BadRequestException('Error adding document');
    }
  }

  async getHouseIdsByUserId(userId: string): Promise<string[]> {
    try {
      const snapshot = await this.db
        .collection('home')
        .where('userId', '==', userId)
        .get();
      const houseIds: string[] = [];
      snapshot.forEach((doc) => {
        houseIds.push(doc.data().houseId);
      });
      return houseIds;
    } catch (err) {
      console.error('Error getting documents: ', err);
      throw new BadRequestException('Error getting house IDs by user ID');
    }
  }

  async saveRequestJoinHouseNotification(request: RequestJoinHouseDto) {
    const snap = await this.db.collection('home').doc(request.houseId).get();
    if (!snap.exists) {
      console.error('House not found');
      throw new BadRequestException('House not found');
    }
    try {
      const createdAt = request.createdAt || new Date();
      const data = await this.db.collection('houseRequestToAccess').add({
        userId: request.userId,
        houseId: request.houseId,
        createdAt: createdAt,
        description: request.description,
        isApproved: false,
        fcmToken: request.fcmToken || '',
        isPending: false,
        isWithdrawn: false,
      });
      for (let i = 0; i < snap.data()?.userIds.length; i++) {
        await this.db.collection('notification').add({
          userId: snap.data()?.userIds[i],
          type: 'request-join-house',
          collection: 'houseRequestToAccess',
          documentId: data.id,
          createdAt: createdAt,
          isRead: false,
          description: `${request.userId} đã gửi yêu cầu tham gia nhà ${snap.data()?.address}`,
        });
      }
      return { success: true };
    } catch (error) {
      console.error('Lỗi khi lưu yêu cầu tham gia nhà:', error);
      throw new BadRequestException('Lỗi khi lưu yêu cầu tham gia nhà');
    }
  }

  async resovleJoinHouse(body: HousePendingDto) {
    try {
      const docRef = await this.db
        .collection('houseRequestToAccess')
        .where('houseId', '==', body.houseId)
        .where('userId', '==', body.memberId)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();
      if (docRef.empty) {
        throw new BadRequestException('Yêu cầu không tồn tại');
      } else {
        if (docRef.docs[0].data().isWithdrawn == true) {
          throw new BadRequestException('Yêu cầu đã được người dùng rút lại');
        };
      }
      if (docRef.docs[0].data().isPending == true) {
        throw new BadRequestException('Yêu cầu đã được xử lý');
      } else {
        await this.db
          .collection('houseRequestToAccess')
          .doc(docRef.docs[0].id)
          .update({ isPending: true, isApproved: body.isApproved });
        const data = await this.db.collection('housemembers').add({
          houseId: body.houseId,
          memberId: body.memberId,
          approvedAt: new Date(),
          isApproved: body.isApproved,
          memberApprovalId: body.memberApprovalId,
        });
        const snap = await this.db.collection('home').doc(body.houseId).get();
        if (!snap.exists) {
          console.error('House not found');
          throw new BadRequestException('House not found');
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const requestName = await this.db
          .collection('users')
          .doc(body.memberId)
          .get()
          .then((doc) => doc.data()?.name || 'Người dùng');

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const approvedName = await this.db
          .collection('users')
          .doc(body.memberApprovalId)
          .get()
          .then((doc) => doc.data()?.name || 'Người dùng');
        for (let i = 0; i < snap.data()?.userIds.length; i++) {
          await this.db.collection('notification').add({
            userId: snap.data()?.userIds[i],
            type: 'request-join-house-resolved',
            collection: 'housemembers',
            documentId: data.id,
            createdAt: new Date(),
            isRead: false,
            description: `${approvedName} đã ${body.isApproved ? 'chấp thuận' : 'từ chối'} yêu cầu tham gia ${requestName} vào nhà ${snap.data()?.houseName}`,
          });
        }
        ; if (body.isApproved) {
          await this.db
            .collection('home')
            .doc(body.houseId)
            .update({
              userIds: admin.firestore.FieldValue.arrayUnion(body.memberId),
            });
        }
      }
      return { success: true, fcmToken: docRef.docs[0].data().fcmToken };
    }
    catch (error) {
      console.error('Lỗi khi duyệt yêu cầu tham gia nhà:', error);
      throw new BadRequestException('Lỗi khi duyệt yêu cầu tham gia nhà');
    }
  }

  async withDrawRequest(houseId: string, userId: string) {
    try {
      const docRef = await this.db
        .collection('houseRequestToAccess')
        .where('houseId', '==', houseId)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();
      if (docRef.empty) {
        throw new BadRequestException('Yêu cầu không tồn tại');
      } else {
        if (docRef.docs[0].data().isPending == true) {
          throw new BadRequestException('Yêu cầu đã được xử lý');
        } else {
          await this.db
            .collection('houseRequestToAccess')
            .doc(docRef.docs[0].id)
            .update({ isWithdrawn: true });
        }
      }
      return { success: true };
    } catch (error) {
      console.error('Lỗi khi rút yêu cầu tham gia nhà', error);
      throw new BadRequestException('Error withdrawing house request');
    }
  }
  async createHouse(houseData: HouseCreateDto) {
    try {
      const docRef = await this.db.collection('home').add({
        ownerId: houseData.userId,
        houseName: houseData.houseName,
        createdAt: houseData.createdAt || new Date(),
        fcmTokens: houseData.fcmTokens || [],
        userIds: [houseData.userId],
        totalPower: 0,
        totalRoom: 0,
        totalSensor: 0,
        totalDevice: 0,
        address: houseData.address || '',
      });
      await this.db
        .collection('users')
        .doc(houseData.userId)
        .update({
          houseIds: admin.firestore.FieldValue.arrayUnion(docRef.id),
        });
      return true;
    } catch (error) {
      console.error('Error creating house:', error);
      throw new BadRequestException('Error creating house');
    }
  }

  async updateHouse(houseData: HouseUpdateDto) {
    try {
      const houseRef = this.db.collection('home').doc(houseData.houseId);
      if (!houseRef) {
        return { success: false, error: 'House not found' };
      }
      await houseRef.update({
        houseName: houseData.houseName,
        address: houseData.address,
      });
      return { success: true };
    } catch (error) {
      throw new BadRequestException('Error updating house');
    }
  }

  async getUserIdsByHouseId(houseId: string): Promise<string[]> {
    try {
      const houseRef = this.db.collection('home').doc(houseId);
      const houseDoc = await houseRef.get();
      if (!houseDoc.exists) {
        throw new BadRequestException('House not found');
      }
      return houseDoc.data()?.userIds || [];
    } catch (error) {
      console.error('Error getting userIds by houseId:', error);
      throw new BadRequestException('Error getting userIds by houseId');
    }
  }

  async getAddressByHouseId(houseId: string): Promise<string> {
    try {
      const houseRef = this.db.collection('home').doc(houseId);
      const houseDoc = await houseRef.get();
      if (!houseDoc.exists) {
        throw new BadRequestException('House not found');
      }
      return houseDoc.data()?.address || '';
    } catch (error) {
      console.error('Error getting address by houseId:', error);
      throw new BadRequestException('Error getting address by houseId');
    }
  }


  async createRoom(body: any) {
    try {
      const docRef = await this.db.collection('rooms').add({
        ...body,
        totalDevice: 0,
        createdAt: new Date(),
      });

      // Lấy dữ liệu vừa tạo để trả về
      const newDoc = await docRef.get();
      await this.db.collection("home").doc(body.houseId).update({
        totalRoom: admin.firestore.FieldValue.increment(1),
      })
      return {
        id: docRef.id,
        ...newDoc.data()
      };
    } catch (error) {
      console.error('Error creating room:', error);
      throw new BadRequestException('Error creating room');
    }
  }

  async getRoomsByHouseId(houseId: string) {
    try {
      const snapshot = await this.db
        .collection('rooms')
        .where('houseId', '==', houseId)
        .get();
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error getting rooms by houseId:', error);
      throw new BadRequestException('Error getting rooms by houseId');
    }
  }

  async getHouseInfo(houseId: string) {
    try {
      const snapshot = this.db.collection('home').doc(houseId).get();
      return (await snapshot).data();
    } catch (error) {
      console.error('Error getting house info by houseId:', error);
      throw new BadRequestException('Error getting house info by houseId');
    }
  }

  async getDeviceAndSensorByRoomId(roomId: string) {
    try {
      // 1. Thực hiện gọi song song cả 2 collection để tối ưu tốc độ
      const [devicesSnap, sensorsSnap] = await Promise.all([
        this.db.collection('devices').where('roomId', '==', roomId).get(),
        this.db.collection('sensors').where('roomId', '==', roomId).get()
      ]);

      // 2. Map dữ liệu từ Devices
      const devicesList = devicesSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          roomId: data.roomId,
          gpio: data.gipo,
          name: data.name,
          status: data.status,
          value: data.value,
          type: data.type, // Giả sử trong DB đã có trường type
          kind: 'DEVICE'    // Gán cứng giá trị phân biệt
        };
      });

      // 3. Map dữ liệu từ Sensors
      const sensorsList = sensorsSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          gpio: data.gipo,
          status: data.status,
          type: data.type, // Giả sử trong DB đã có trường type
          kind: 'SENSOR'    // Gán cứng giá trị phân biệt
        };
      });

      // 4. Gộp 2 list lại thành 1
      const combinedList = [...devicesList, ...sensorsList];

      return combinedList;

    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      throw error;
    }
  }

  async getDeviceAndSensorByHouseId(houseId: string) {
    try {
      // 1. Thực hiện gọi song song cả 2 collection để tối ưu tốc độ
      const [devicesSnap, sensorsSnap] = await Promise.all([
        this.db.collection('devices').where('houseId', '==', houseId).get(),
        this.db.collection('sensors').where('houseId', '==', houseId).get(),
      ]);
      const devicesData = devicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sensorsData = sensorsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // 2. Lấy danh sách roomId không trùng lặp từ cả 2 mảng
      const allRoomIds = [
        ...new Set([
          ...devicesData.map((d: any) => d.roomId),
          ...sensorsData.map((s: any) => s.roomId)
        ])
      ].filter(id => !!id); // Loại bỏ các giá trị null/undefined nếu có

      // 3. Truy vấn collection 'rooms' để lấy roomName
      let roomsMap: Record<string, string> = {};
      if (allRoomIds.length > 0) {
        // Lưu ý: Firestore 'in' query giới hạn tối đa 30 item mỗi lần gọi
        const roomsSnap = await this.db.collection('rooms')
          .where('__name__', 'in', allRoomIds)
          .get();

        roomsSnap.forEach(doc => {
          roomsMap[doc.id] = doc.data().name; // Giả sử field chứa tên phòng là 'name'
        });
      }

      // 2. Map dữ liệu từ Devices
      const devicesList = devicesSnap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          status: data.status,
          value: data.value,
          roomId: data.roomId,
          roomName: roomsMap[data.roomId] || 'Unknown Room', // Lấy tên từ Map
          gipo: data.gipo,
          type: data.type, // Giả sử trong DB đã có trường type
          kind: 'DEVICE', // Gán cứng giá trị phân biệt
        };
      });

      // 3. Map dữ liệu từ Sensors
      const sensorsList = sensorsSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          status: data.status,
          gipo: data.gipo,
          roomId: data.roomId,
          roomName: roomsMap[data.roomId] || 'Unknown Room', // Lấy tên từ Map
          type: data.type, // Giả sử trong DB đã có trường type
          kind: 'SENSOR'    // Gán cứng giá trị phân biệt
        };
      });

      // 4. Gộp 2 list lại thành 1
      const combinedList = [...devicesList, ...sensorsList];

      return combinedList;

    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      throw error;
    }
  }


  async deleteRoom(r: string): Promise<boolean> {
    try {
      const roomRef = this.db.collection('rooms').doc(r)
      await this.db
        .collection('home')
        .doc((await roomRef.get()).data()?.houseId)
        .update({
          totalDevice: admin.firestore.FieldValue.increment(-1),
        })
      await roomRef.delete()

      return true;
    } catch (error) {
      throw new BadRequestException(e)
    }
  }

  async initializeGatewayPins(gatewayId: string) {
    const gpiosRef = this.db.collection('gpios');
    const batch = this.db.batch(); // Dùng Batch để ghi nhiều bản ghi cùng lúc cho nhanh

    // Danh sách các chân "vàng" và khả năng của chúng
    const standardPins = [
      // Nhóm Digital chuẩn
      { pin: 4, caps: ['DIGITAL_IN', 'DIGITAL_OUT', 'PWM', 'TOUCH'] },
      { pin: 5, caps: ['DIGITAL_IN', 'DIGITAL_OUT', 'PWM'] },
      { pin: 13, caps: ['DIGITAL_IN', 'DIGITAL_OUT', 'PWM', 'TOUCH', 'HSPI_ID'] },
      { pin: 14, caps: ['DIGITAL_IN', 'DIGITAL_OUT', 'PWM', 'TOUCH', 'HSPI_CLK'] },
      { pin: 16, caps: ['DIGITAL_IN', 'DIGITAL_OUT', 'PWM'] },
      { pin: 17, caps: ['DIGITAL_IN', 'DIGITAL_OUT', 'PWM'] },
      { pin: 27, caps: ['DIGITAL_IN', 'DIGITAL_OUT', 'PWM', 'TOUCH'] },

      // Nhóm Giao tiếp (Communication)
      { pin: 18, caps: ['DIGITAL_IN', 'DIGITAL_OUT', 'SPI_SCK'] },
      { pin: 19, caps: ['DIGITAL_IN', 'DIGITAL_OUT', 'SPI_MISO'] },
      { pin: 21, caps: ['DIGITAL_IN', 'DIGITAL_OUT', 'I2C_SDA'] },
      { pin: 22, caps: ['DIGITAL_IN', 'DIGITAL_OUT', 'I2C_SCL'] },
      { pin: 23, caps: ['DIGITAL_IN', 'DIGITAL_OUT', 'SPI_MOSI'] },

      // Nhóm Analog & Năng lực cao
      { pin: 25, caps: ['DIGITAL_IN', 'DIGITAL_OUT', 'ANALOG_IN', 'DAC'] },
      { pin: 26, caps: ['DIGITAL_IN', 'DIGITAL_OUT', 'ANALOG_IN', 'DAC'] },
      { pin: 32, caps: ['DIGITAL_IN', 'ANALOG_IN', 'TOUCH'] },
      { pin: 33, caps: ['DIGITAL_IN', 'ANALOG_IN', 'TOUCH'] },
    ];

    standardPins.forEach((item) => {
      // ID document là kết hợp giữa Gateway và Số chân để dễ quản lý
      const docId = `${gatewayId}_${item.pin}`;
      const docRef = gpiosRef.doc(docId);

      batch.set(docRef, {
        gatewayId: gatewayId,
        pinNumber: item.pin,
        capabilities: item.caps,
        status: 'AVAILABLE', // Mặc định là trống
        referTo: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    return { message: `Đã khởi tạo ${standardPins.length} chân cho Gateway ${gatewayId}` };
  }
}
