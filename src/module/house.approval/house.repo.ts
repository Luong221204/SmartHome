import { Inject, Injectable } from '@nestjs/common';
import { HouseRequestDto } from './house.dto/house.request';
import { RequestJoinHouseDto } from 'src/notification/dto/requesJoinHouse.dto';
import * as admin from 'firebase-admin';
import { HouseCreateDto } from './house.dto/house.create';
import { HouseUpdateDto } from './house.dto/house.update';
import { HousePendingDto } from './house.dto/house.approval';
import { FcmTokenDto } from 'src/notification/dto/fcmToken.dto';
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
      return { success: false };
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
      return [];
    }
  }

  async saveRequestJoinHouseNotification(request: RequestJoinHouseDto) {
    const snap = await this.db.collection('home').doc(request.houseId).get();
    if (!snap.exists) {
      console.error('House not found');
      return { success: false, error: 'House not found' };
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
      return { success: false, error: 'Lỗi khi lưu yêu cầu tham gia nhà' };
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
        return { success: false, error: 'Yêu cầu không tồn tại' };
      } else {
        if (docRef.docs[0].data().isWithdrawn == true) {
          return {
            success: false,
            error: 'Yêu cầu đã được người dùng rút lại',
          };
        }
        if (docRef.docs[0].data().isPending == true) {
          return { success: false, error: 'Yêu cầu đã được xử lý' };
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
            return { success: false, error: 'House not found' };
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
      }
      return { success: true, fcmToken: docRef.docs[0].data().fcmToken };
    } catch (error) {
      console.error('Lỗi khi duyệt yêu cầu tham gia nhà:', error);
      return { success: false, error: 'Lỗi khi duyệt yêu cầu tham gia nhà' };
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
        return { success: false, error: 'Yêu cầu không tồn tại' };
      } else {
        if (docRef.docs[0].data().isPending == true) {
          return { success: false, error: 'Yêu cầu đã được xử lý' };
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
      return { success: false, error: 'Lỗi khi rút yêu cầu tham gia nhà' };
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
        address: houseData.address || '',
      });
      await this.db
        .collection('users')
        .doc(houseData.userId)
        .update({
          houseIds: admin.firestore.FieldValue.arrayUnion(docRef.id),
        });
      return { success: true, houseId: docRef.id };
    } catch (error) {
      console.error('Error creating house:', error);
      return { success: false, error: 'Error creating house' };
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
      return { success: false, error: 'Error updating house' };
    }
  }
}