import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserFirestoreService } from './firestore.userservice';
import { EmailService } from './email.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config/dist';
@Module({
  imports: [
    ConfigModule, // 👈 đảm bảo có
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  providers: [UserFirestoreService, AuthService, EmailService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
