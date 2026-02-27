import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as net from 'net';
import { EventEmitter2 } from '@nestjs/event-emitter';
// Dùng require cho bản 0.46.0
const Aedes = require('aedes');

@Injectable()
export class MqttBrokerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttBrokerService.name);
  private aedesInstance: any;
  private server: net.Server;

  constructor(private eventEmitter: EventEmitter2) {}

  onModuleInit() {
    try {
      // Ở bản 0.46.0, Aedes là một Constructor chuẩn
      this.aedesInstance = new Aedes();

      this.server = net.createServer(this.aedesInstance.handle);

      const MQTT_PORT = 1883;
      this.server.listen(MQTT_PORT, () => {
        this.logger.log(`🚀 [MQTT] Broker ONLINE (v0.46.0) tại cổng ${MQTT_PORT}`);
      });

      // Trong phần this.aedesInstance.on('publish', ...)
      this.aedesInstance.on('publish', (packet, client) => {
        if (client) {
          const topic = packet.topic; // Ví dụ: "sensor/temp" hoặc "device/status"
          const data = packet.payload.toString();

          // Phát sự kiện dựa trên cấp đầu tiên của topic
          // Nếu topic là "sensor/temp" -> nó phát event tên là "mqtt.sensor"
          const mainTopic = topic.split('/')[0];
          this.eventEmitter.emit(`mqtt.${mainTopic}`, { topic, data });
        }
      });
      // Lắng nghe thiết bị kết nối
      this.aedesInstance.on('client', (client) => {
        console.log(`[MQTT] 🔐 Thiết bị kết nối: ${client.id}`);
      });
    } catch (error) {
      this.logger.error(`❌ Lỗi: ${error.message}`);
    }
  }

  onModuleDestroy() {
    if (this.server) this.server.close();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    if (this.aedesInstance) this.aedesInstance.close();
  }

  // Hàm để DeviceModule gọi ra lệnh cho thiết bị
  publish(topic: string, payload: any) {
    if (this.aedesInstance) {
            this.aedesInstance.publish({
                topic,
                payload: Buffer.from(typeof payload === 'string' ? payload : JSON.stringify(payload)),
                qos: 0,
                retain: false,
                cmd: 'publish',
                dup: false,
            }, (err) => {
                if (err) this.logger.error(`[MQTT] Publish thất bại: ${err.message}`);
            });
        };
    }
    
}