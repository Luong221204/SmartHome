import { Body, Injectable, OnModuleInit } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DeviceService } from 'src/device/device.service';
import { MqttBrokerService } from 'src/mqtt/mqtt.service';
import { SensorService } from 'src/sensor/sensor.service';
import { SendMessageDto } from './dto/gateway.message';
/* ignore - prettier */
@WebSocketGateway()
@Injectable()
export class MyGateway implements OnModuleInit {
  constructor(
    private readonly deviceService: DeviceService,
    private readonly mqttService: MqttBrokerService
  ){}
  @WebSocketServer()
  server: Server;
  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id);
      console.log('connected');
    });
  }

  @SubscribeMessage('newMessage')
  onNewMessage(@Body() data: any) {
    console.log('Nhận tin nhắn mới:', data);
    this.server.emit('onMessage', data);
  }
  @SubscribeMessage('subscribe_sensor')
  async handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() sensorId: string,
  ) {
    const room = `sensor_${sensorId}`;
    await client.join(room);
    console.log(`Client ${client.id} joined room: ${room}`);
  }
 


  @SubscribeMessage('subscribe_room')
  async handleSubscribeForRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    const room = `room_${roomId}`;
    await client.join(room);
    console.log(`Client ${client.id} joined room: ${room}`);
  }

  @SubscribeMessage('unsubscribe_room')
  async handleUnSubscribeForRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    console.log(`Client ${client.id} leave room: ${roomId}`);
    await client.leave(`room_${roomId}`);
  }

  emitRoomData(roomId: string, payload: any) {
    console.log("emit data")
    this.server.to(`room_${roomId}`).emit('room_update', payload);
  }
   

  @SubscribeMessage('unsubscribe_sensor')
  async handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() sensorId: string,
  ) {
    await client.leave(`sensor_${sensorId}`);
  }
  emitSensorData(sensorId: string, payload: any) {
    this.server.to(`sensor_${sensorId}`).emit('sensor_update', payload);
  }

  @SubscribeMessage('messageFromMobile')
async onMessageFromPhone(
  @MessageBody() data: SendMessageDto[], 
  @ConnectedSocket() client: Socket,
) {
  console.log('Nhận danh sách tin nhắn:', data);

  // 1. Gom nhóm các item theo roomId
  // Kết quả: { "room1": [item1, item2], "room2": [item3] }
    const groupedByRoom = data.reduce(
      (acc, rawItem) => {
        const item =
          typeof rawItem === 'string' ? JSON.parse(rawItem) : rawItem;
    const roomId = item.roomId;

        if (roomId) {
          if (!acc[roomId]) acc[roomId] = [];
          acc[roomId].push(item);
        }
    return acc;
      },
      {} as Record<string, any[]>,
    );

  // 2. Xử lý logic nghiệp vụ và Emit theo từng nhóm
  const roomIds = Object.keys(groupedByRoom);

  await Promise.all(
    roomIds.map(async (roomId) => {
      const itemsInRoom = groupedByRoom[roomId];

      // Xử lý Database & MQTT cho từng item trong room này
      for (const item of itemsInRoom) {
        // Gửi MQTT (Nếu là thiết bị)
        if (item.kind === 'DEVICE') {
          this.mqttService.publish(`devices`, item);
          
          // Ghi Database
            await this.deviceService.updateAutomation(
              {
                id: item.id,
                status: item.status,
                value: item.value,
          }, "");
        }
      }

      // 3. Emit cho tất cả client trong roomId này (trừ người gửi)
      // Sử dụng to(roomId) để hướng mục tiêu chính xác
        client.to(`room_${roomId}`).emit('room_update', itemsInRoom);
      
      console.log(`Đã phát dữ liệu cho phòng: ${roomId}`, itemsInRoom);
    }),
  );
}
}
