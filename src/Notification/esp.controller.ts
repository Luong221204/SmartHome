import { Controller, Post, Body, Get, Query, Patch, Req } from '@nestjs/common';
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

  @Get('notifications')
  async getNotifications(@Req() req,@Query('userId') userId: string) {
    return await this.notificationRepository.getNotifications(userId);
  }

  @Patch('fcm-token')
  async updateFcmToken(@Body() data: FcmTokenDto) {
    console.log('Cập nhật FCM Token từ ESP32:', data.fcmToken);
    return await this.notificationRepository.updateFcmToken(data);
  }

  @Patch('delete-fcm-token')
   async deleteFcmToken(@Body() data: FcmTokenDto) {
    console.log('Cập nhật FCM Token từ ESP32:', data.fcmToken);
    return await this.notificationRepository.deleteFcmToken(data);
  }

  @Patch('read-notification')
  async readNotification(@Body() data: { notificationId: string }) {
    return await this.notificationRepository.markAsRead(data.notificationId);
  }

  @Get('notification-info')
  async getNotificationInfo(@Query('notificationId') notificationId: string) {
    return await this.notificationRepository.getNotificationById(
      notificationId,
    );
  }
}
