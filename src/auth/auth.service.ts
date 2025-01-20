import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  private transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });

  async register(name: string, email: string, password: string) {
    // генерація коду
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password,
        isVerified: false,
        verificationCode,
      },
    });

    await this.transporter.sendMail({
      from: `"Fitness tracker" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email to fitness site',
      text: `Your verification code is ${verificationCode}.`,
    });

    return {
      message: 'Registration successful. Verification code sent to email.',
    };
  }

  async verifyCode(email: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.verificationCode !== code) {
      throw new Error('Invalid verification code.');
    }

    await this.prisma.user.update({
      where: { email },
      data: { isVerified: true, verificationCode: null },
    });

    return { message: 'Email verified successfully.' };
  }
}
