import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma.service';

interface GoogleLoginResult {
  token: string;
  message: string;
}

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

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    console.log('Verification code:', verificationCode);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isVerified: false,
        verificationCode,
      },
    });

    console.log('User created:', user);

    const mailOptions = {
      from: process.env.USER,
      to: email,
      subject: 'Email Verification',
      text: `Your verification code is ${verificationCode}`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('OTP sent successfully via email');
      return {
        token: this.generateToken(user),
        message: 'Registration successful. Please verify your email.',
      };
    } catch (error) {
      console.error(`Failed to send OTP via email: ${error.message}`);
      throw new Error('Failed to send OTP via email');
    }
  }

  async verifyCode(email: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    console.log('Stored verificationCode:', user.verificationCode);
    console.log('Received code:', code);

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
      throw new Error('Invalid password or email.');
    }

    return this.generateToken(user);
  }

  async forgotPassword(email: string) {}

  async resetPassword(email: string, password: string) {}

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {}

  async googleLogin(req): Promise<GoogleLoginResult | string> {
    if (!req.user) {
      return 'No user from google';
    }
    const { email, firstName, lastName } = req.user.user;

    if (!email || !firstName || !lastName) {
      throw new Error('Invalid user data from Google');
    }

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name: `${firstName} ${lastName}`,
          password: '',
          isVerified: true,
        },
      });
    }
    return {
      message: 'Login successful',
      token: this.generateToken(user),
    };
  }

  async getProfile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        role: true,
      },
    });
  }

  private generateToken(user) {
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    );
    return token;
  }

  async updateProfile(userId: number, data: { name?: string }) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
      },
    });
    return updatedUser;
  }
}
