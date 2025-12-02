import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
  constructor(private service: HomeService) {}

  @Get()
  getHello(): { success: boolean } {
    return { success: true };
  }
  @Post('update-pump')
  async updatePump(
    @Body('status') status: boolean,
  ): Promise<{ success: boolean; error?: string }> {
    return await this.service.updatePump({ status });
  }

  @Get('pump-status')
  async getPumpStatus(): Promise<{ status: boolean }> {
    const status = await this.service.getPumpStatus();
    return { status };
  }

  @Post('update-fan')
  async updateFan(
    @Body('status') status: boolean,
  ): Promise<{ success: boolean; error?: string }> {
    return await this.service.updateFan({ status });
  }

  @Get('fan-status')
  async getFanStatus(): Promise<{ status: boolean }> {
    const status = await this.service.getFanStatus();
    return { status };
  }

  @Post('update-door')
  async updateDoor(
    @Body() status: any,
  ): Promise<{ success: boolean; error?: string }> {
    return await this.service.updateDoor(status);
  }

  @Get('door-status')
  async getDoorStatus(): Promise<{ status: boolean }> {
    const status = await this.service.getDoorStatus();
    return { status };
  }

  @Post('update-led')
  async updateLed(
    @Body() { status, location },
  ): Promise<{ success: boolean; error?: string }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return await this.service.updateLed({ status, location });
  }

  @Get('led-status')
  async getLedAt(
    @Query('location') location: string,
  ): Promise<{ location: string; status: boolean }> {
    return await this.service.getLedStatus(location);
  }

  @Post('temp-humid')
  // eslint-disable-next-line @typescript-eslint/require-await
  async receiveTempHumid(
    @Body() data: { temperature: number; humidity: number; rain: boolean },
  ) {
    console.log('Nhận dữ liệu từ ESP32:', data);
    void this.service.updateTemperatureHumidity(data);
    return { status: 'ok' };
  }

  @Post('change-password')
  async changePassword(
    @Body() data: { oldPassword: string; newPassword: string },
  ): Promise<{ success: boolean; error?: string }> {
    return await this.service.changePassword(
      data.oldPassword,
      data.newPassword,
    );
  }

  @Post('update-fs')
  async updateFs(
    @Body('status') status: boolean,
  ): Promise<{ success: boolean; error?: string }> {
    return await this.service.updateFs({ status });
  }

  @Get('fs-status')
  async getFsStatus(): Promise<{ status: boolean }> {
    const status = await this.service.getFsStatus();
    return { status };
  }

  @Post('update-rs')
  async updateRs(
    @Body('status') status: boolean,
  ): Promise<{ success: boolean; error?: string }> {
    return await this.service.updateRs({ status });
  }

  @Get('Rs-status')
  async getRsStatus(): Promise<{ status: boolean }> {
    const status = await this.service.getRsStatus();
    return { status };
  }

  @Post('update-gs')
  async updateGs(
    @Body('status') status: boolean,
  ): Promise<{ success: boolean; error?: string }> {
    return await this.service.updateGs({ status });
  }

  @Get('gs-status')
  async getGsStatus(): Promise<{ status: boolean }> {
    const status = await this.service.getGsStatus();
    return { status };
  }

  @Post('update-buz')
  async updateBuz(
    @Body() { status },
  ): Promise<{ success: boolean; error?: string }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return await this.service.updateBuz({ status });
  }

  @Get('buz-status')
  async getBuzStatus(): Promise<{ status: boolean }> {
    const status = await this.service.getBuzStatus();
    return { status };
  }

  @Get('all-status')
  async getAllStatus() {
    return {
      pump: await this.service.getPumpStatus(),
      fan: await this.service.getFanStatus(),
      door: await this.service.getDoorStatus(),
      living_led: await this.service
        .getLedStatus('living room')
        .then((r) => r.status),
      bed_led: await this.service.getLedStatus('bedroom').then((r) => r.status),
      fs: await this.service.getFsStatus(),
      rs: await this.service.getRsStatus(),
      gs: await this.service.getGsStatus(),
      buzzer: await this.service.getBuzStatus(),
    };
  }

  @Get('password')
  async getPassword(): Promise<{ password: string }> {
    const password = await this.service.getPassword();
    return { password };
  }

  @Post('update-password')
  async updatePassword(
    @Body() { password },
  ): Promise<{ success: boolean; error?: string }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return await this.service.updatePassword({ password });
  }

}
