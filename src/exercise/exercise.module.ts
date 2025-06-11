import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PlanExerciseModule } from 'src/planexercise/planexercise.module';
import FavoriteService from '../favorites/favorite.service';
import { ExerciseController } from './exercise.controller';
import { ExerciseService } from './exercise.service';

@Module({
  imports: [HttpModule, PlanExerciseModule],
  controllers: [ExerciseController],
  providers: [ExerciseService, FavoriteService],
  exports: [ExerciseService],
})
export class ExerciseModule {}
