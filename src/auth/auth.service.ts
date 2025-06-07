import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { GoalType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import { firstValueFrom } from 'rxjs';
import { ActivitiesService } from '../activities/activities.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma.service';

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

interface StravaAthlete {
  id: number;
  username: string | null;
  firstname: string;
  lastname: string;
  city: string;
  state: string;
  country: string;
  sex: string;
  profile: string;
  created_at: string;
  updated_at: string;
}

interface StravaTokenResponse {
  token_type: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
  athlete: StravaAthlete;
}

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configureService: ConfigService,
    private cloudinaryService: CloudinaryService,
    private readonly httpService: HttpService,
    private readonly activitiesService: ActivitiesService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  public generateToken(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  public setCookies(res: Response, tokens: Tokens): void {
    res.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 60 хвилин
    });

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/auth/refresh', // Обмежити доступ тільки для endpoint оновлення токена
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
        goal: null,
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

  // async login(email: string, password: string, res: Response) {
  //   const user = await this.prisma.user.findUnique({ where: { email } });
  //   if (!user)
  //     throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);

  //   const isPasswordValid = await bcrypt.compare(password, user.password);
  //   if (!isPasswordValid)
  //     throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);

  //   const tokens = this.generateToken(user);

  //   res.cookie('access_token', tokens.access_token, { httpOnly: true });
  //   res.cookie('refresh_token', tokens.refresh_token, { httpOnly: true });

  //   return {
  //     message: 'Login successful',
  //     isSetupComplete: user.isSetupComplete,
  //   };
  // }

  async login(email: string, password: string, res: Response) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user)
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);

    const tokens = this.generateToken(user);
    this.setCookies(res, tokens);

    return {
      message: 'Login successful',
      isSetupComplete: user.isSetupComplete,
    };
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
            goal: null,
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
        id: true,
        name: true,
        email: true,
        role: true,
        picture: true,
        createdAt: true,
        height: true,
        weight: true,
        age: true,
        goal: true,
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

  async updateProfile(userId: number, name: string, pictureUrl?: string) {
    console.log('Updating user in database:', { userId, name, pictureUrl });

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name,
        ...(pictureUrl && { picture: pictureUrl }),
      },
    });
  }

  async updateFitnessData(
    userId: number,
    data: { height: number; weight: number; age: number; goal: string },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        height: Number(data.height),
        weight: Number(data.weight),
        age: Number(data.age),
        goal: data.goal ? (data.goal.toUpperCase() as GoalType) : undefined,
        isSetupComplete: true,
      },
    });
  }

  async setupProfile(
    userId: number,
    data: { height: number; weight: number; age: number; goal: string },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        height: Number(data.height),
        weight: Number(data.weight),
        age: Number(data.age),
        goal: data.goal.toUpperCase() as GoalType,
        isSetupComplete: true,
      },
    });
  }

  async exchangeCodeForToken(code: string): Promise<{ access_token: string }> {
    if (!code) {
      throw new HttpException('Code is missing', HttpStatus.BAD_REQUEST);
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post('https://www.strava.com/oauth/token', null, {
          params: {
            client_id: process.env.STRAVA_CLIENT_ID,
            client_secret: process.env.STRAVA_CLIENT_SECRET,
            code: code,
            grant_type: 'authorization_code',
          },
        }),
      );

      return { access_token: response.data.access_token };
    } catch (error) {
      console.error(
        'Strava token exchange failed:',
        error.response?.data || error.message,
      );
      throw new HttpException(
        'Failed to exchange code',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async handleStravaAuth(stravaData: StravaTokenResponse) {
    const { athlete } = stravaData;
    let { access_token, refresh_token, expires_at } = stravaData;

    // конвертуємо expires_at в Date та додаємо буферний час
    let tokenExpiration = new Date(expires_at * 1000);
    const now = new Date();

    // оновлення токена, якщо термін дії закінчиться через 10хвилин
    if (tokenExpiration.getTime() - now.getTime() < 10 * 60 * 1000) {
      const newTokens = await this.refreshStravaToken(refresh_token);
      access_token = newTokens.access_token;
      refresh_token = newTokens.refresh_token;
      tokenExpiration = new Date(newTokens.expires_at * 1000);
    }

    const user = await this.prisma.user.upsert({
      where: { stravaId: athlete.id },
      update: {
        stravaAccessToken: access_token,
        stravaRefreshToken: refresh_token,
        stravaTokenExpires: tokenExpiration,
        name: `${athlete.firstname} ${athlete.lastname}`,
        picture: athlete.profile,
      },
      create: {
        stravaId: athlete.id,
        stravaAccessToken: access_token,
        stravaRefreshToken: refresh_token,
        stravaTokenExpires: tokenExpiration,
        name: `${athlete.firstname} ${athlete.lastname}`,
        picture: athlete.profile,
        email: `strava_${athlete.id}@example.com`,
        role: 'USER',
        password: '',
        goal: null,
        isVerified: true,
      },
    });

    await this.activitiesService.syncUserActivities(user.id);
    return user;
  }

  private async refreshStravaToken(refreshToken: string) {
    const response = await firstValueFrom(
      this.httpService.post<StravaTokenResponse>(
        'https://www.strava.com/oauth/token',
        {
          client_id: process.env.STRAVA_CLIENT_ID,
          client_secret: process.env.STRAVA_CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        },
      ),
    );

    return response.data;
  }
}
