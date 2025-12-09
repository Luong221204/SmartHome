import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserFirestoreService } from './firestore.userservice';
import { EmailService } from './email.service';
import * as admin from 'firebase-admin';
import { randomInt } from 'crypto';
import { createHash } from 'crypto';
@Injectable()
export class AuthService {
  constructor(
    private firestoreUsers: UserFirestoreService,
    private jwtService: JwtService,
    private email: EmailService,
  ) { }

  async register(name: string, email: string, password: string) {
    const exists = await this.firestoreUsers.findByEmail(email);
    if (exists) throw new BadRequestException('Email already exists');

    const hash = await bcrypt.hash(password, 10);

    const newUser = await this.firestoreUsers.createUser({
      name,
      email,
      password: hash,
      role: 'user',
      permissions: [],
    });

    return newUser;
  }

  async validateUser(email: string, password: string) {
    const user = await this.firestoreUsers.findByEmail(email);
    if (!user) return null;

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return null;
    console.log('Validated user:', user.email);
    return user;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions ?? [],
    };
    return { ...user, access_token: this.jwtService.sign(payload) };
  }

  async generateOtpReset(email: string) {
    const user = await this.firestoreUsers.findByEmail(email);
    if (!user) return { status: false, message: 'email không tồn tại !' };

    // Tạo OTP gồm 6 chữ số
    const otp = randomInt(100000, 999999).toString();

    // Hash OTP để lưu vào DB
    const hashedOtp = createHash('sha256').update(otp).digest('hex');

    await this.firestoreUsers.updateUser(user.id, {
      resetOtp: hashedOtp,
      resetExpires: Date.now() + 10 * 60 * 1000, // 10 phút
    });

    // Gửi email OTP
    await this.email.sendResetPasswordMail(email, otp);

    return { status: true, code: otp };
  }

  async resetPassword(token: string, newPassword: string) {
    const payload = this.jwtService.verify(token, {
      secret: process.env.JWT_RESET_SECRET,
    });

    const user = await this.firestoreUsers.findByEmail(payload.email);
    if (!user) throw new NotFoundException('User not found');

    if (user.resetToken !== token)
      throw new BadRequestException('Invalid token');
    if (user.resetExpires < Date.now())
      throw new BadRequestException('Expired token');

    const hash = await bcrypt.hash(newPassword, 10);

    await this.firestoreUsers.updateUser(user.id, {
      password: hash,
      resetToken: admin.firestore.FieldValue.delete(),
      resetExpires: admin.firestore.FieldValue.delete(),
    });

    return { message: 'Reset done' };
  }

  async findById(id: string) {
    return this.firestoreUsers.findById(id);
  }

  async verifyOtpAndResetPassword(
    email: string,
    otp: string,
    newPassword: string,
  ) {
    console.log('Verifying OTP for email:', newPassword);
    const user = await this.firestoreUsers.findByEmail(email);
    if (!user) return { message: 'email không tồn tại', status: false };

    if (!user.resetOtp)
      return { message: 'OTP chưa được yêu cầu trước đây ', status: false };

    const hashed = createHash('sha256').update(otp).digest('hex');

    if (hashed !== user.resetOtp)
      return { message: 'OTP không đúng', status: false };

    if (Date.now() > user.resetExpires)
      return { message: 'Thời gian quá hạn', status: false };

    const hash1 = await bcrypt.hash(newPassword, 10);


    // Update mật khẩu mới
    await this.firestoreUsers.updateUser(user.id, {
      password: hash1,
      resetOtp: null,
      resetExpires: null,
    });

    return { message: 'mật khẩu thay đổi thành công ', status: true };
  }

}
