import { HttpService } from '@nestjs/axios';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Put,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma.service';
import { AuthenticatedRequest } from '../types/express';
import { RegisterDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('register')
  async register(
    @Body(new ValidationPipe()) body: RegisterDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.authService.register(
        body.name,
        body.email,
        body.password,
      );
      return res.json(result);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    try {
      return await this.authService.verifyEmailToken(token);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res() res: Response,
  ) {
    try {
      await this.authService.login(body.email, body.password, res);
      return res.json({ message: 'Login successful' });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    try {
      const result = await this.authService.googleLogin(req, res);
      setTimeout(() => {
        res.redirect('http://localhost:3000/dashboard');
      }, 1000);
    } catch (error) {
      return res.redirect(
        `http://localhost:3000/error?message=${encodeURIComponent(error.message)}`,
      );
    }
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async profile(@Req() req: AuthenticatedRequest) {
    const user = await this.authService.getProfile(req.user.userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  @Get('current-user')
  @UseGuards(AuthGuard('jwt'))
  async getCurrentUser(@Req() req: AuthenticatedRequest) {
    const user = await this.authService.getProfile(req.user.userId);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
    });

    return res.json({ message: 'Logout successful' });
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const payload = this.authService.verifyToken(refreshToken);
      const user = await this.prisma.user.findUnique({
        where: { id: Number(payload.sub) },
      });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const tokens = this.authService.generateToken(user);
      this.authService.setCookies(res, tokens);
      return res.json({
        message: 'Token refreshed',
        access_token: tokens.access_token,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Get('session')
  async getSession(@Req() req: Request) {
    const token = req.cookies['access_token'];
    if (!token) {
      return { message: 'No session found' };
    }
    try {
      const user = this.authService.verifyToken(token);
      return { user };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  @Put('update-profile')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('picture'))
  async updateProfile(
    @Req() req,
    @Body() body: { name: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    console.log('Received update request:', {
      userId: req.user.userId,
      name: body.name,
      file,
    });

    let pictureUrl = undefined;

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(file);
      pictureUrl = uploadResult.secure_url;
    }

    return this.authService.updateProfile(
      req.user.userId,
      body.name,
      pictureUrl,
    );
  }

  @Put('update-fitness-data')
  @UseGuards(AuthGuard('jwt'))
  async updateFitnessData(
    @Req() req: AuthenticatedRequest,
    @Body() body: { height: number; weight: number; age: number; goal: string },
  ) {
    return this.authService.updateFitnessData(req.user.userId, body);
  }

  @Put('setup')
  @UseGuards(AuthGuard('jwt'))
  async setup(
    @Req() req: AuthenticatedRequest,
    @Body() body: { height: number; weight: number; age: number; goal: string },
  ) {
    return this.authService.setupProfile(req.user.userId, body);
  }

  @Post('strava')
  async exchangeStravaCode(@Body('code') code: string) {
    try {
      console.log('Received Strava code:', code);

      const response = await firstValueFrom(
        this.httpService.post('https://www.strava.com/oauth/token', {
          client_id: this.configService.get('STRAVA_CLIENT_ID'),
          client_secret: this.configService.get('STRAVA_CLIENT_SECRET'),
          code,
          grant_type: 'authorization_code',
        }),
      );

      console.log('Strava API response:', response.data);

      const user = await this.authService.handleStravaAuth(response.data);
      const tokens = await this.authService.generateToken(user);

      return { access_token: tokens.access_token };
    } catch (error) {
      console.error(
        'Strava token exchange error:',
        error.response?.data || error.message,
      );
      throw new HttpException(
        'Failed to authenticate with Strava',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
