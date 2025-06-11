import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import FavoritePlanService from './favorite.service';

@Controller('dashboard/plans/favorites')
export class FavoritePlanController {
  private readonly logger = new Logger(FavoritePlanController.name);

  constructor(private readonly favoriteService: FavoritePlanService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getFavorites(@Request() req) {
    try {
      this.logger.log(`Fetching favorites for user: ${req.user?.userId}`);
      this.logger.log(`User object: ${JSON.stringify(req.user)}`);

      if (!req.user || !req.user.userId) {
        this.logger.error('No user or userId found in request');
        throw new HttpException(
          'User not authenticated',
          HttpStatus.UNAUTHORIZED,
        );
      }

      this.logger.log(`User ID type: ${typeof req.user.userId}`);
      this.logger.log(`User ID value: ${req.user.userId}`);

      let userId;
      if (typeof req.user.userId === 'string') {
        userId = parseInt(req.user.userId, 10);
        this.logger.log(`Parsed userId from string: ${userId}`);
      } else {
        userId = req.user.userId;
        this.logger.log(`Using userId as is: ${userId}`);
      }

      if (isNaN(userId)) {
        this.logger.error(`Invalid userId after parsing: ${userId}`);
        throw new HttpException(
          'Invalid user ID format',
          HttpStatus.BAD_REQUEST,
        );
      }

      const favorites = await this.favoriteService.getFavoritePlans(userId);
      this.logger.log(`Successfully fetched ${favorites.length} favorites`);
      return favorites;
    } catch (error) {
      this.logger.error(`Error fetching favorites: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to fetch favorites',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':planId')
  @UseGuards(JwtAuthGuard)
  async addFavorite(@Request() req, @Param('planId') planId: string) {
    try {
      this.logger.log(
        `Adding plan ${planId} to favorites for user: ${req.user?.userId}`,
      );

      if (!req.user || !req.user.userId) {
        throw new HttpException(
          'User not authenticated',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const userIdRaw = req.user.userId;
      let userId: number;

      if (typeof userIdRaw === 'string') {
        userId = parseInt(userIdRaw, 10);
      } else if (typeof userIdRaw === 'number') {
        userId = userIdRaw;
      } else {
        throw new HttpException(
          'Invalid user ID format',
          HttpStatus.BAD_REQUEST,
        );
      }

      const planIdNum = parseInt(planId, 10);

      if (isNaN(userId) || userId <= 0 || isNaN(planIdNum) || planIdNum <= 0) {
        this.logger.error(`Invalid IDs: userId=${userId}, planId=${planIdNum}`);
        throw new HttpException('Invalid ID format', HttpStatus.BAD_REQUEST);
      }

      return await this.favoriteService.addFavoritePlan(userId, planIdNum);
    } catch (error) {
      this.logger.error(`Error adding favorite: ${error.message}`, error.stack);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        error.message || 'Failed to add favorite',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':planId')
  @UseGuards(JwtAuthGuard)
  async removeFavorite(@Request() req, @Param('planId') planId: string) {
    try {
      this.logger.log(
        `Removing plan ${planId} from favorites for user: ${req.user?.userId}`,
      );

      if (!req.user || !req.user.userId) {
        throw new HttpException(
          'User not authenticated',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const userIdRaw = req.user.userId;
      let userId: number;

      if (typeof userIdRaw === 'string') {
        userId = parseInt(userIdRaw, 10);
      } else if (typeof userIdRaw === 'number') {
        userId = userIdRaw;
      } else {
        throw new HttpException(
          'Invalid user ID format',
          HttpStatus.BAD_REQUEST,
        );
      }

      const planIdNum = parseInt(planId, 10);

      if (isNaN(userId) || userId <= 0 || isNaN(planIdNum) || planIdNum <= 0) {
        this.logger.error(`Invalid IDs: userId=${userId}, planId=${planIdNum}`);
        throw new HttpException('Invalid ID format', HttpStatus.BAD_REQUEST);
      }

      return await this.favoriteService.removeFavoritePlan(userId, planIdNum);
    } catch (error) {
      this.logger.error(
        `Error removing favorite: ${error.message}`,
        error.stack,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        error.message || 'Failed to remove favorite',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':planId/check')
  @UseGuards(JwtAuthGuard)
  async checkFavorite(@Request() req, @Param('planId') planId: string) {
    try {
      this.logger.log(
        `Checking if plan ${planId} is favorite for user: ${req.user?.userId}`,
      );

      if (!req.user || !req.user.userId) {
        throw new HttpException(
          'User not authenticated',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const userIdRaw = req.user.userId;
      let userId: number;

      if (typeof userIdRaw === 'string') {
        userId = parseInt(userIdRaw, 10);
      } else if (typeof userIdRaw === 'number') {
        userId = userIdRaw;
      } else {
        throw new HttpException(
          'Invalid user ID format',
          HttpStatus.BAD_REQUEST,
        );
      }

      const planIdNum = parseInt(planId, 10);

      if (isNaN(userId) || userId <= 0 || isNaN(planIdNum) || planIdNum <= 0) {
        this.logger.error(`Invalid IDs: userId=${userId}, planId=${planIdNum}`);
        throw new HttpException('Invalid ID format', HttpStatus.BAD_REQUEST);
      }

      return await this.favoriteService.isFavoritePlan(userId, planIdNum);
    } catch (error) {
      this.logger.error(
        `Error checking favorite status: ${error.message}`,
        error.stack,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        error.message || 'Failed to check favorite status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
