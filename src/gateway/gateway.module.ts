import { Module } from '@nestjs/common';
import { MyGateway } from './gateway';
import { DeviceModule } from 'src/device/device.module';
import { SensorModule } from 'src/sensor/sensor.module';
import { MqttBrokerModule } from 'src/mqtt/mqtt.module';

@Module({
  imports: [DeviceModule, MqttBrokerModule],
  providers: [MyGateway],
  exports: [MyGateway],
})
export class GatewayModule {}
