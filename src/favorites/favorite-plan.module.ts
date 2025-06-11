import { Module } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { FavoritePlanController } from './favorite-plan.controller';
import FavoriteService from './favorite.service';

@Module({
  controllers: [FavoritePlanController],
  providers: [FavoriteService, PrismaService],
  exports: [FavoriteService],
})
export class FavoritePlanModule {}
