import { Body, Controller, Get, Post } from '@nestjs/common';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
  constructor(private service: HomeService) {}

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
}
