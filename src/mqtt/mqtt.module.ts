import { Module, Global, forwardRef } from '@nestjs/common';
import { MqttBrokerService } from './mqtt.service';
import { GatewayModule } from 'src/gateway/gateway.module';

@Global() // Thêm decorator này
@Module({
  imports: [],
  providers: [MqttBrokerService],
  exports: [MqttBrokerService], // Export để module khác dùng được
})
export class MqttBrokerModule {}