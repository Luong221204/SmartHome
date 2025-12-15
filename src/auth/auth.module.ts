import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserFirestoreService } from './firestore.userservice';
import { EmailService } from './email.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [UserFirestoreService, AuthService, EmailService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
