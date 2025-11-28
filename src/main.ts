import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // ESP32 có thể gửi từ mạng khác
  const port = process.env.PORT || 3000;

  await app.listen(port, '0.0.0.0');
  console.log('Server NestJS chạy tại http://localhost:3000');
}
bootstrap().catch((err) => console.error('Server failed to start', err));
