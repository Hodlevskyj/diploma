import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export default class FavoritePlanService {
  private readonly logger = new Logger(FavoritePlanService.name);

  constructor(private prisma: PrismaService) {}

  async getFavoritePlans(userId: number) {
    this.logger.log(`Getting favorite plans for user ${userId}`);

    // Переконуємося, що userId - це число
    const numericUserId = Number(userId);

    if (isNaN(numericUserId)) {
      this.logger.error(`Invalid userId: ${userId}`);
      throw new Error('User ID must be a valid number');
    }

    try {
      const favorites = await this.prisma.favoritePlan.findMany({
        where: { userId: numericUserId },
        include: {
          plan: {
            select: {
              id: true,
              name: true,
              description: true,
              fitnessGoal: true,
            },
          },
        },
      });

      this.logger.log(
        `Found ${favorites.length} favorite plans for user ${numericUserId}`,
      );
      return favorites;
    } catch (error) {
      this.logger.error(`Error getting favorite plans: ${error.message}`);
      throw error;
    }
  }

  async addFavoritePlan(userId: number, planId: number) {
    this.logger.log(`Adding plan ${planId} to favorites for user ${userId}`);

    const numericUserId = Number(userId);
    const numericPlanId = Number(planId);

    if (
      isNaN(numericUserId) ||
      numericUserId <= 0 ||
      isNaN(numericPlanId) ||
      numericPlanId <= 0
    ) {
      this.logger.error(
        `Invalid userId: ${userId} -> ${numericUserId} or planId: ${planId} -> ${numericPlanId}`,
      );
      throw new Error('User ID and Plan ID must be valid positive numbers');
    }

    try {
      const plan = await this.prisma.workoutPlan.findUnique({
        where: { id: numericPlanId },
      });

      if (!plan) {
        this.logger.error(`Plan with ID ${numericPlanId} not found`);
        throw new NotFoundException(`Plan with ID ${numericPlanId} not found`);
      }

      const existingFavorite = await this.prisma.favoritePlan.findFirst({
        where: {
          userId: numericUserId,
          planId: numericPlanId,
        },
      });

      if (existingFavorite) {
        this.logger.log(
          `Plan ${numericPlanId} is already in favorites for user ${numericUserId}`,
        );
        return existingFavorite;
      }

      const favorite = await this.prisma.favoritePlan.create({
        data: {
          userId: numericUserId,
          planId: numericPlanId,
        },
        include: {
          plan: {
            select: {
              id: true,
              name: true,
              description: true,
              fitnessGoal: true,
            },
          },
        },
      });

      this.logger.log(
        `Plan ${numericPlanId} added to favorites for user ${numericUserId}`,
      );
      return favorite;
    } catch (error) {
      this.logger.error(
        `Error adding favorite plan: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async removeFavoritePlan(userId: number, planId: number) {
    this.logger.log(
      `Removing plan ${planId} from favorites for user ${userId}`,
    );

    const numericUserId = Number(userId);
    const numericPlanId = Number(planId);

    if (
      isNaN(numericUserId) ||
      numericUserId <= 0 ||
      isNaN(numericPlanId) ||
      numericPlanId <= 0
    ) {
      this.logger.error(
        `Invalid userId: ${userId} -> ${numericUserId} or planId: ${planId} -> ${numericPlanId}`,
      );
      throw new Error('User ID and Plan ID must be valid positive numbers');
    }

    try {
      // Перевіряємо, чи план в улюблених
      const favorite = await this.prisma.favoritePlan.findFirst({
        where: {
          userId: numericUserId,
          planId: numericPlanId,
        },
      });

      if (!favorite) {
        this.logger.error(
          `Plan ${numericPlanId} is not in favorites for user ${numericUserId}`,
        );
        throw new NotFoundException(
          `Plan with ID ${numericPlanId} is not in favorites`,
        );
      }

      // Видаляємо план з улюблених
      await this.prisma.favoritePlan.delete({
        where: { id: favorite.id },
      });

      this.logger.log(
        `Plan ${numericPlanId} removed from favorites for user ${numericUserId}`,
      );
      return { success: true, message: 'Plan removed from favorites' };
    } catch (error) {
      this.logger.error(
        `Error removing favorite plan: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async isFavoritePlan(userId: number, planId: number) {
    this.logger.log(
      `Checking if plan ${planId} is favorite for user ${userId}`,
    );

    const numericUserId = Number(userId);
    const numericPlanId = Number(planId);

    if (
      isNaN(numericUserId) ||
      numericUserId <= 0 ||
      isNaN(numericPlanId) ||
      numericPlanId <= 0
    ) {
      this.logger.error(
        `Invalid userId: ${userId} -> ${numericUserId} or planId: ${planId} -> ${numericPlanId}`,
      );
      throw new Error('User ID and Plan ID must be valid positive numbers');
    }

    try {
      const favorite = await this.prisma.favoritePlan.findFirst({
        where: {
          userId: numericUserId,
          planId: numericPlanId,
        },
      });

      const isFavorite = !!favorite;
      this.logger.log(
        `Plan ${numericPlanId} is${isFavorite ? '' : ' not'} favorite for user ${numericUserId}`,
      );

      return { isFavorite };
    } catch (error) {
      this.logger.error(
        `Error checking favorite status: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
