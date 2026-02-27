import { Timestamp } from 'firebase-admin/firestore';

export class Action {
  command: string;
  deviceId: string;
  value: number;
  status: boolean;
}

export class Condition {
  operation: string;      // "=", ">=", "<="
  property: string;       // "temperature"
  sensorId: string;
  threshold: number;
}

export class Control {
  cooldownMinutes: number;
  lastExecuted?: Timestamp | null;
}

export class Rule {
  id?: string; // Firestore document id
  action: Action;
  condition: Condition;
  control: Control;
}

import { IsBoolean, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ActionDto {
  @IsString()
  command: string;

  @IsString()
  deviceId: string;

  @IsNumber()
  value: number;

  @IsBoolean()
  status: boolean;
}

class ConditionDto {
  @IsString()
  operation: string;

  @IsString()
  property: string;

  @IsString()
  sensorId: string;

  @IsNumber()
  threshold: number;
}

class ScheduleDto {
  @IsString()
  cron: string;

  @IsString()
  timezone: string;

}

class ControlDto {
  @IsNumber()
  cooldownMinutes: number;
  lastExecuted: Timestamp;

}

export class AutomationDto {
  @ValidateNested()
  @Type(() => ActionDto)
  action: ActionDto;

  @ValidateNested()
  @Type(() => ConditionDto)
  condition: ConditionDto;

  @ValidateNested()
  @Type(() => ControlDto)
  control: ControlDto;

  schedule: ScheduleDto;
  name: string;
  id: string;
  houseId: string;
  type: string;
  isEnabled: boolean;
}
