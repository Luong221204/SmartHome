import { Inject, Injectable } from "@nestjs/common";
import { DeviceRepository } from "./device.repo";


@Injectable()
export class DeviceService {
  constructor(private readonly deviceRepo: DeviceRepository) {}
 }
