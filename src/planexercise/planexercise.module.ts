import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PlansExerciseController } from './planexercise.contoller';
import { PlanExerciseService } from './planexercise.service';

@Module({
  imports: [HttpModule],
  controllers: [PlansExerciseController],
  providers: [PlanExerciseService, PrismaService],
  exports: [PlanExerciseService],
})
export class PlanExerciseModule {}
