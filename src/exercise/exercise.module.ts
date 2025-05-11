import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ExerciseController } from './exercise.controller';
import { ExerciseService } from './exercise.service';

@Module({
  imports: [HttpModule],
  controllers: [ExerciseController],
  providers: [ExerciseService, PrismaService],
  exports: [ExerciseService],
})
export class ExerciseModule {}
