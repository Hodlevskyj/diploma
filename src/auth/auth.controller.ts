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
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { AuthenticatedRequest } from '../types/express';
import { RegisterDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cloudinaryService: CloudinaryService,
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
    return { email: req.user.email };
  }
  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'localhost',
      // sameSite: 'strict',
      sameSite: 'lax',
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'localhost',
      // sameSite: 'strict',
      sameSite: 'lax',
      // path: '/auth/refresh',
    });

    return res.json({ message: 'Logout successful' });
  }

  @Get('session')
  async getSession(@Req() req) {
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
}
