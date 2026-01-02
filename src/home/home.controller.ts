import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { HomeService } from './home.service';
import { MultiAuthGuard } from 'src/common/decorators/guards/multi-auth.guard';
import { Auth } from 'firebase-admin/auth';
import { JwtAuthGuard } from 'src/common/decorators/guards/jwt-auth.guard';


@Controller('home')
export class HomeController {
  constructor(private service: HomeService) {}


  @UseGuards(MultiAuthGuard)
  @Get()
  getStatus(@Req() req) {
     return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('hello')
  getHello(): Promise<{ success: boolean }> {
    return this.service.getHello();
  }
  @UseGuards(MultiAuthGuard)
  @Post('update-pump')
  async updatePump(
    @Body('status') status: boolean,
  ): Promise<{ success: boolean; error?: string }> {
    return await this.service.updatePump({ status });
  }

  @UseGuards(MultiAuthGuard)
  @Get('pump-status')
  async getPumpStatus(): Promise<{ status: boolean }> {
    const status = await this.service.getPumpStatus();
    return { status };
  }
  @UseGuards(MultiAuthGuard)
  @Post('update-fan')
  async updateFan(
    @Body('status') status: boolean,
  ): Promise<{ success: boolean; error?: string }> {
    return await this.service.updateFan({ status });
  }
  @UseGuards(MultiAuthGuard)
  @Get('fan-status')
  async getFanStatus(): Promise<{ status: boolean }> {
    const status = await this.service.getFanStatus();
    return { status };
  }
  @UseGuards(MultiAuthGuard)
  @Post('update-door')
  async updateDoor(
    @Body() status: any,
  ): Promise<{ success: boolean; error?: string }> {
    return await this.service.updateDoor(status);
  }
  @UseGuards(MultiAuthGuard)
  @Get('door-status')
  async getDoorStatus(): Promise<{ status: boolean }> {
    const status = await this.service.getDoorStatus();
    return { status };
  }
  @UseGuards(MultiAuthGuard)
  @Post('update-led')
  async updateLed(
    @Body() { status, location },
  ): Promise<{ success: boolean; error?: string }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return await this.service.updateLed({ status, location });
  }
  @UseGuards(MultiAuthGuard)
  @Get('led-status')
  async getLedAt(
    @Query('location') location: string,
  ): Promise<{ location: string; status: boolean }> {
    return await this.service.getLedStatus(location);
  }
  @UseGuards(MultiAuthGuard)
  @Post('temp-humid')
  // eslint-disable-next-line @typescript-eslint/require-await
  async receiveTempHumid(
    @Body() data: { temperature: number; humidity: number; rain: boolean },
  ) {
    console.log('Nhận dữ liệu từ ESP32:', data);
    void this.service.updateTemperatureHumidity(data);
    return { status: 'ok' };
  }
  @UseGuards(MultiAuthGuard)
  @Post('temp-humid/chart')
  // eslint-disable-next-line @typescript-eslint/require-await
  async receiveTempHumidForChart(
    @Body() data: { temperature: number; humidity: number; rain: boolean },
  ) {
    console.log('Nhận dữ liệu từ ESP32:', data);
    void this.service.updateTemperatureHumidityForChart(data);
    return { status: 'ok' };
  }
  @UseGuards(MultiAuthGuard)
  @Post('change-password')
  async changePassword(
    @Body() data: { oldPassword: string; newPassword: string },
  ): Promise<{ success: boolean; error?: string }> {
    return await this.service.changePassword(
      data.oldPassword,
      data.newPassword,
    );
  }
  @UseGuards(MultiAuthGuard)
  @Post('update-fs')
  async updateFs(
    @Body('status') status: boolean,
  ): Promise<{ success: boolean; error?: string }> {
    return await this.service.updateFs({ status });
  }
  @UseGuards(MultiAuthGuard)
  @Get('fs-status')
  async getFsStatus(): Promise<{
    status: boolean;
    data: Array<{ level: number; time: string }>;
    infor: string;
    level: number;
  }> {
    const status = await this.service.getFsStatus();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return {
      status: status.status,
      data: status.data,
      infor: status.infor,
      level: status.level,
    };
  }
  @UseGuards(MultiAuthGuard)
  @Post('update-rs')
  async updateRs(
    @Body('status') status: boolean,
  ): Promise<{ success: boolean; error?: string }> {
    return await this.service.updateRs({ status });
  }
  @UseGuards(MultiAuthGuard)
  @Get('Rs-status')
  async getRsStatus(): Promise<{
    status: boolean;
    data: Array<{ level: number; time: string }>;
    infor: string;
    level: number;
  }> {
    const status = await this.service.getRsStatus();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { status: status.status, data: status.data, infor: status.infor,level: status.level };
  }
  @UseGuards(MultiAuthGuard)
  @Post('update-gs')
  async updateGs(
    @Body('status') status: boolean,
  ): Promise<{ success: boolean; error?: string }> {
    return await this.service.updateGs({ status });
  }
  @UseGuards(MultiAuthGuard)
  @Get('gs-status')
  async getGsStatus(): Promise<{
    status: boolean;
    data: Array<{ level: number; time: string }>;
    infor: string;
    level: number;
  }> {
    const status = await this.service.getGsStatus();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return {
      status: status.status,
      data: status.data,
      infor: status.infor,
      level: status.level,
    };
  }
  @UseGuards(MultiAuthGuard)
  @Post('update-buz')
  async updateBuz(
    @Body() { status },
  ): Promise<{ success: boolean; error?: string }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return await this.service.updateBuz({ status });
  }
  @UseGuards(MultiAuthGuard)
  @Get('buz-status')
  async getBuzStatus(): Promise<{ status: boolean }> {
    const status = await this.service.getBuzStatus();
    return { status };
  }
  @UseGuards(MultiAuthGuard)
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
      fs: (await this.service.getFsStatus()).status,
      rs: (await this.service.getRsStatus()).status,
      gs: (await this.service.getGsStatus()).status,
      buzzer: await this.service.getBuzStatus(),
    };
  }
  @UseGuards(MultiAuthGuard)
  @Get('password')
  async getPassword(): Promise<{ password: string }> {
    const password = await this.service.getPassword();
    return { password };
  }
  @UseGuards(MultiAuthGuard)
  @Post('update-password')
  async updatePassword(
    @Body() { password },
  ): Promise<{ success: boolean; error?: string }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return await this.service.updatePassword({ password });
  }
  @UseGuards(MultiAuthGuard)
  @Post('update-gs/level')
  async updateGsLevel(
    @Body('level') level: number,
  ): Promise<{ success: boolean; error?: string }> {
    return await this.service.updateGsLevel(level);
  }
  @UseGuards(MultiAuthGuard)
  @Post('update-gs/data')
  async updateGsData(
    @Body('level') level: number,
  ): Promise<{ success: boolean; error?: string }> {
    return await this.service.updateGsData(level);
  }
  @UseGuards(MultiAuthGuard)
  @Post('update-fs/level')
  async updateFsLevel(
    @Body('level') level: number,
  ): Promise<{ success: boolean; error?: string }> {
    return await this.service.updateFsLevel(level);
  }
  @UseGuards(MultiAuthGuard)
  @Post('update-fs/data')
  async updateFsData(
    @Body('level') level: number,
  ): Promise<{ success: boolean; error?: string }> {
    return await this.service.updateFsData(level);
  }
  @UseGuards(MultiAuthGuard)
  @Post('update-rs/level')
  async updateRsLevel(
    @Body('level') level: number,
  ): Promise<{ success: boolean; error?: string }> {
    return await this.service.updateRsLevel(level);
  }
  @UseGuards(MultiAuthGuard)
  @Post('update-rs/data')
  async updateRsData(
    @Body('level') level: number,
  ): Promise<{ success: boolean; error?: string }> {
    return await this.service.updateRsData(level);
  }
  @UseGuards(MultiAuthGuard)
  @Get('all-levels')
  async getAllLevels(): Promise<{
    fs_level: number;
    rs_level: number;
    gs_level: number;
  }> {
    const fs_level = (await this.service.getFsStatus()).level;
    const rs_level = (await this.service.getRsStatus()).level;
    const gs_level = (await this.service.getGsStatus()).level;
    return { fs_level, rs_level, gs_level };
  }
  @UseGuards(MultiAuthGuard)
  @Get('temp-chart')
  async getTemp(): Promise<{
    data: Array<{ level: number; time: string }>;
  }> {
    const status = await this.service.getTemp();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return {
      data: status.data,
    };
  }
  @UseGuards(MultiAuthGuard)
  @Get('humid-chart')
  async getHumid(): Promise<{
    data: Array<{ level: number; time: string }>;
  }> {
    const status = await this.service.getHumid();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return {
      data: status.data,
    };
  }

}
