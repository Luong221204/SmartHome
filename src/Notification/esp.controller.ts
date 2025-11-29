import { Controller, Post, Body } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { HomeService } from 'src/home/home.service';
@Controller('esp')
export class EspController {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly homeService: HomeService,
  ) {}

  @Post('update')
  async updateValue(@Body() data: { value: string }) {
    console.log('ESP32 gửi:', data.value);
    if (data.value === 'cháy') {
      await this.homeService.updatePump({ status: true });
      await this.homeService.updateBuz({ status: true });
      await this.firebaseService.sendNotification(
        'esp32',
        'Cảnh báo thảm họa',
        `Nhà đang có ${data.value}`,
      );
    } else if (data.value === 'bình thường') {
      await this.homeService.updatePump({ status: false });
      await this.homeService.updateFan({ status: false });
      await this.homeService.updateBuz({ status: false });
    } else if (data.value === 'khói') {
      await this.homeService.updateFan({ status: true });
      await this.homeService.updateBuz({ status: true });

      await this.firebaseService.sendNotification(
        'esp32',
        'Cảnh báo thảm họa',
        `Nhà đang có ${data.value}`,
      );
    }

    return { status: 'ok' };
  }
}
