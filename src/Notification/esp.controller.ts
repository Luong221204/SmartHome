import { Controller, Post, Body } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
@Controller('esp')
export class EspController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Post('update')
  async updateValue(@Body() data: { value: number }) {
    console.log('ESP32 gửi:', data.value);

    await this.firebaseService.sendNotification(
      'esp32',
      'ESP32 Update',
      `Giá trị mới: ${data.value}`,
    );

    return { status: 'ok' };
  }
}
