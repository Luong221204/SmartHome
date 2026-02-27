import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import { AutoService } from "./auto.service";
import { AutomationDto } from './auto.dto/auto.object';
import { MultiAuthGuard } from "src/common/decorators/guards/multi-auth.guard";


@Controller('automation')
export class AutoController {
  constructor(private readonly service: AutoService) {}

  @Post('create')
  async createAutomation(
    @Body() body: AutomationDto,
  ): Promise<{ success: boolean; error?: string }> {
        return this.service.createAutomation(body);
    }

   @Put('update')
   async updateAutomation(
    @Body() body: AutomationDto,
  ): Promise<{ success: boolean; error?: string }> {
    return this.service.updateAutomation(body);
    }


    @UseGuards(MultiAuthGuard)
    @Get(':houseId')
    async findAll(@Req() req, @Param('houseId') houseId: string) {
      return this.service.findAll(req.user, houseId);
    }


    @UseGuards(MultiAuthGuard)
    @Delete(':automationId')
  async deleteAutomation(
    @Req() req,
    @Param('automationId') automationId: string,
  ) {
      return this.service.deleteAutomation(req.user, automationId);
    }

  @Get('')
  async getAutomationByDeviceId(
    @Query('deviceId') deviceId: string,
    @Query('limit',new ParseIntPipe()) limit: number,
    @Query('startAfter') startAfter?: string,
  ) {
    return this.service.getAutomationScene(deviceId, limit, startAfter);
    }

}