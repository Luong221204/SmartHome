import { Body, Injectable, OnModuleInit } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
/* ignore - prettier */
@WebSocketGateway()
@Injectable()
export class MyGateway implements OnModuleInit {
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
}
