import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { FcmTokenDto } from './dto/fcmToken.dto';
import { NotificationRepository } from './notification.repo';
import { RequestJoinHouseDto } from './dto/requesJoinHouse.dto';
@Controller('esp')
export class EspController {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  @Post('update')
  async updateValue(@Body() data: { value: string }) {
    console.log('ESP32 gửi:', data.value);
    if (data.value === 'cháy') {
      await this.firebaseService.sendAlertNotification(
        'esp32',
        'Cảnh báo thảm họa',
        `Nhà đang có ${data.value}`,
      );
    } else if (data.value === 'bình thường') { /* empty */ } else if (data.value === 'khói') {
      await this.firebaseService.sendAlertNotification(
        'esp32',
        'Cảnh báo thảm họa',
        `Nhà đang có ${data.value}`,
      );
    }

    return { status: 'ok' };
  }

  @Post('fcm-token')
  async updateFcmToken(@Body() data: FcmTokenDto) {
    console.log('Cập nhật FCM Token từ ESP32:', data.fcmToken);
    return await this.notificationRepository.updateFcmToken(data);
  }

}
