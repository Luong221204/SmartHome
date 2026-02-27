import { Controller, Post, Body, UseGuards, Get, Req, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { ForgotDto } from './dtos/forgot.dto';
import { ResetDto } from './dtos/reset.dto';
import { JwtAuthGuard } from '../common/decorators/guards/jwt-auth.guard';
import { OptDto } from './dtos/reset-after-forgot.dto';
import { Not } from 'typeorm';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) { }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    if (dto.password !== dto.confirmPassword)
      throw new BadRequestException(
        'Mật khẩu và xác nhận mật khẩu không khớp!',
      );
    return this.auth.register(dto.name, dto.email, dto.password);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    console.log('Login attempt for email:', dto.email);
    const user = await this.auth.validateUser(dto.email, dto.password);
    if (!user) throw new NotFoundException('Email hoặc mật khẩu không đúng!');
    return this.auth.login(user);
  }

  @Post('forgot')
  async forgot(@Body() dto: ForgotDto) {
    return this.auth.generateOtpReset(dto.email);
  }

  @Post('reset')
  async reset(@Body() dto: ResetDto) {
    return this.auth.resetPassword(dto.token, dto.newPassword);
  }

  @Post('reset-after-forgot')
  async resetAfterForgot(@Body() dto: OptDto) {
    return this.auth.verifyOtpAndResetPassword(
      dto.email,
      dto.otp,
      dto.newPassword,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() user) {
    return user.user;
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') token: string) {
    return this.auth.refreshToken(token);
  }
}