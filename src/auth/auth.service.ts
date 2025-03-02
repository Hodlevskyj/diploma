import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma.service';

// interface GoogleLoginResult {
//   token: string;
//   message: string;
// }

// interface Tokens {
//   access_token: string;
//   refresh_token: string;
// }

// interface GoogleLoginResult {
//   message: string;
//   tokens: {
//     access_token: string;
//     refresh_token: string;
//   };
// }

interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
}

interface Tokens {
  access_token: string;
  refresh_token: string;
}

interface AuthResponse {
  message: string;
  tokens?: Tokens;
}

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configureService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  private generateToken(user: any) {
    const payload = { sub: user.id, email: user.email };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  private setCookies(res: Response, tokens: Tokens): void {
    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/auth/refresh', // Restrict to refresh endpoint
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

    // Створюємо унікальний токен для верифікації
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isVerified: false,
        verificationToken,
      },
    });

    // Формуємо URL для верифікації
    const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}`;

    // HTML шаблон листа
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Our App!</h2>
        <p>Hello ${name},</p>
        <p>Thank you for registering. Please verify your email by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p>${verificationUrl}</p>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Our App - Verify Your Email',
      html: htmlContent,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return {
        message:
          'Registration successful. Please check your email to verify your account.',
      };
    } catch (error) {
      throw new Error('Failed to send verification email');
    }
  }
  async verifyEmailToken(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new Error('Invalid verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null, // Очищаємо токен після верифікації
      },
    });

    return { message: 'Email verified successfully' };
  }

  async login(email: string, password: string, res: Response) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.generateToken(user);

    // Set cookies
    this.setCookies(res, tokens);

    return { message: 'Login successful' };
  }

  async forgotPassword(email: string) {}

  async resetPassword(email: string, password: string) {}

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {}

  async googleLogin(req, res: Response): Promise<{ message: string }> {
    if (!req.user) {
      throw new UnauthorizedException('No user from google');
    }

    const { email, firstName, lastName, picture } = req.user;

    try {
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
            picture,
          },
        });

        console.log('Created new user:', user);
      } else {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            picture: picture || user.picture,
          },
        });

        console.log('Updated existing user:', user);
      }

      const tokens = this.generateToken(user);
      this.setCookies(res, tokens);

      return { message: 'Login successful' };
    } catch (error) {
      console.error('Google login error:', error);
      throw new Error('Failed to process Google login');
    }
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

  verifyToken(token: string) {
    try {
      return jwt.verify(token, this.configureService.get('JWT_SECRET'));
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
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
