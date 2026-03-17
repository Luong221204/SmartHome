import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
      transform: true, // Chuyển dữ liệu từ Android thành instance của SendMessageDto
      whitelist: true,
      forbidNonWhitelisted: false, // Để tránh lỗi nếu Android gửi thừa trường
    }),
  );
  app.enableCors(); // ESP32 có thể gửi từ mạng khác
  const port = process.env.PORT || 3000;
  /*app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      url: 'mqtt://localhost:1883',
    },
  });
  await app.startAllMicroservices();*/
  await app.listen(port, '0.0.0.0');
  console.log('Server NestJS chạy tại http://localhost:3000');

}
bootstrap().catch((err) => console.error('Server failed to start', err));
