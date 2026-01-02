import { Injectable } from '@nestjs/common';
import { SensorRepository } from './sensor.repository';

@Injectable()
export class SensorService {
  constructor(private readonly sensorRepository: SensorRepository) {

  }
}