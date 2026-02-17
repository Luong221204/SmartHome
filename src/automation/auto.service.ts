import { Inject, Injectable } from "@nestjs/common";
import { AutoRepo } from "./auto.repo";
import {AutomationDto } from "./auto.dto/auto.object";
import { User } from "src/auth/user.entity";


@Injectable()
export class AutoService {
  constructor(private readonly repo: AutoRepo) {

  }

  async createAutomation(
    body: AutomationDto,
  ): Promise<{ success: boolean; error?: string }> {
    return await this.repo.create(body);
  }

  async updateAutomation(
    body: AutomationDto,
  ): Promise<{ success: boolean; error?: string }> {
    // Implement update logic here, for now we just call create as a placeholder
    return await this.repo.update(body);
  }

  async findAll(user: User, houseId: string) {
    return await this.repo.findAll(user, houseId);
  }

  async deleteAutomation(user: User, automationId: string) {
    return await this.repo.deleteAutomation(user, automationId);
  }

  async implementAutomationLogic(sensorId:string) {

    
  }
  
}