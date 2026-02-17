import { Timestamp } from 'firebase-admin/firestore';

export class Action {
  command: string;
  deviceId: string;
  value: number;
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
  id?: string;            // Firestore document id
  action: Action;
  condition: Condition;
  control: Control;
}

import { IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ActionDto {
  @IsString()
  command: string;

  @IsString()
  deviceId: string;

  @IsNumber()
  value: number;
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

class ControlDto {
  @IsNumber()
  cooldownMinutes: number;
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

  name: string;
  id: string;
  houseId: string;
}
