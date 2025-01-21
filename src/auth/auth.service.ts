import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;
  constructor(private prisma: PrismaService) {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    });
  }

  async register(name: string, email: string, password: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 0);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isVerified: false,
        verificationCode: otp,
      },
    });

    const mailOptions = {
      from: process.env.USER,
      to: email,
      subject: 'Email Verification',
      text: `Your verification code is ${otp}`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('OTP sent successfully via email');
      return { message: 'Registration successful. Please verify your email.' };
    } catch (error) {
      console.error(`Failed to send OTP via email: ${error.message}`);
      throw new Error('Failed to send OTP via email');
    }
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

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error('User not found.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password.');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h',
      },
    );

    return { token, message: 'Login successful' };
  }
}
