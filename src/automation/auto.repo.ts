import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { AutomationDto } from './auto.dto/auto.object';
import { UpdateData } from 'firebase-admin/firestore';
import { User } from 'src/auth/user.entity';
@Injectable()
export class AutoRepo {
    private db: FirebaseFirestore.Firestore;

    constructor() {
        this.db = admin.firestore();
    }

    async create(
        body: AutomationDto,
    ): Promise<{ success: boolean; error?: string }> {
        try {
            await this.db.collection('automations').add(body);
            return { success: true };
        } catch (error) {
            console.error('Error creating automation:', error);
            return { success: false, error: error.message };
        }
    }

    async update(
        body: AutomationDto,
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const docRef = this.db.collection('automations').doc(body.id);
            await docRef.update(body as UpdateData<any>);
            return { success: true };
        } catch (error) {
            console.error('Error updating automation:', error);
            return { success: false, error: error.message };
        }
    }

    async findAll(user: User, houseId: string) {
        const userDoc = await this.db.collection('users').doc(user.id).get();

        if (!userDoc.exists) {
            throw new NotFoundException('User không tồn tại');
        }


        const userData = userDoc.data();

        const houseIds: string[] = userData?.houseIds ?? [];
        // 🔹 2. Check quyền
        if (!houseIds.includes(houseId)) {
            throw new ForbiddenException('Không có quyền truy cập house này');
        }

        // 🔹 3. Nếu hợp lệ → query automation
        const snapshot = await this.db
            .collection('automations')
            .where('houseId', '==', houseId)
            .get();

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    }

    async deleteAutomation(user: User, automationId: string) {
        const userRef = this.db.collection('users').doc(user.id);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            throw new NotFoundException('User not found');
        }

        const userData = userSnap.data();
        const houseIds: string[] = userData?.houseIds ?? [];

        // Lấy automation
        const automationRef = this.db.collection('automations').doc(automationId);

        const automationSnap = await automationRef.get();

        if (!automationSnap.exists) {
            throw new NotFoundException('Automation not found');
        }

        const automationData = automationSnap.data();
        const houseId = automationData?.houseId;

        // Check quyền
        if (!houseIds.includes(houseId)) {
            throw new ForbiddenException(
                'Bạn không có quyền xóa automation này',
            );
        }

        // Xóa
        await automationRef.delete();

        return {
            message: 'Xóa automation thành công',
        };
    }

    async implementAutomationLogic(
    houseId: string,
    sensorId: string,
    value: number,
  ) {
    const snapshot = await this.db
      .collection('automations')
      .where('houseId', '==', houseId)
      .get();

    snapshot.forEach(async (doc) => {
      const automation = doc.data() as AutomationDto;

      const condition = automation.condition;

      if (condition.sensorId !== sensorId) return;

      const isMatch = this.evaluateCondition(
        value,
        condition.operation,
        condition.threshold,
      );

      if (isMatch) {
        //await this.executeAction(automation.action, houseId);
      }
    });
  }

  
  evaluateCondition(
    sensorValue: number,
    operator: string,
    conditionValue: number,
  ): boolean {
    switch (operator) {
      case '>':
        return sensorValue > conditionValue;
      case '<':
        return sensorValue < conditionValue;
      case '>=':
        return sensorValue >= conditionValue;
      case '<=':
        return sensorValue <= conditionValue;
      case '==':
        return sensorValue === conditionValue;
      default:
        return false;
    }
  }

  async executeAction(action: any, houseId: string) {
  /*const topic = `house/${houseId}/device/${action.deviceId}`;

  this.mqttClient.publish(
    topic,
    JSON.stringify({
      command: action.command,
    }),
  );

  console.log('Action executed:', action);*/
}

}
