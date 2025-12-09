import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }

  async sendResetPasswordMail(to: string, code: string) {
    await this.transporter.sendMail({
      from: `"SmartHome" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Mã reset mật khẩu SmartHome',
      html: `<p>Mã đặt lại mật khẩu của bạn là:</p>
           <h2>${code}</h2>
           <p>Mã có hiệu lực 10 phút.</p>`,
    });
  }
}
