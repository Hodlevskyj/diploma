import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedRequest } from '../types/express';
import { ActivitiesService } from './activities.service';

@Controller('activities')
export class ActivitiesController {
  constructor(
    private readonly activitiesService: ActivitiesService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getActivities(@Req() req: AuthenticatedRequest) {
    return this.activitiesService.getUserActivities(req.user.userId);
  }

  @Get('sync-activities')
  @UseGuards(AuthGuard('jwt'))
  async sync(@Req() req: AuthenticatedRequest) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user || !user.stravaAccessToken) {
      throw new HttpException(
        'Strava токен не знайдено',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.activitiesService.syncUserActivities(user.id);
  }

  @Get('stats')
  @UseGuards(AuthGuard('jwt'))
  async getStats(@Req() req: AuthenticatedRequest) {
    return this.activitiesService.getUserStats(req.user.userId);
  }
}
