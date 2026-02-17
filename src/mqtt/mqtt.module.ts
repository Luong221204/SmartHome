import { Module, Global } from '@nestjs/common';
import { MqttBrokerService } from './mqtt.service';

@Global() // Thêm decorator này
@Module({
  providers: [MqttBrokerService],
  exports: [MqttBrokerService], // Export để module khác dùng được
})
export class MqttBrokerModule {}