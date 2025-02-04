import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: { name: string; email: string; password: string },
  ) {
    const { name, email, password } = body;
    try {
      return await this.authService.register(name, email, password);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('verify')
  async verify(@Body() body: { email: string; code: string }) {
    const { email, code } = body;
    try {
      return await this.authService.verifyCode(email, code);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    try {
      return await this.authService.login(email, password);
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
      const result = await this.authService.googleLogin(req);
      if (typeof result === 'string') {
        return res.redirect(`http://localhost:3000/error?message=${result}`);
      }
      console.log('Generated token:', result.token);
      return res.redirect(
        `http://localhost:3000/dashboard?token=${result.token}`,
      );
    } catch (error) {
      return res.redirect(
        `http://localhost:3000/error?message=${error.message}`,
      );
    }
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async profile(@Req() req: AuthenticatedRequest) {
    return this.authService.getProfile(req.user.userId);
  }

  @Get('current-user')
  @UseGuards(AuthGuard('jwt'))
  async getCurrentUser(@Req() req: AuthenticatedRequest) {
    return { email: req.user.email };
  }
}
