import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExerciseService } from './exercise.service';

@Controller('exercises')
export class ExerciseController {
  constructor(private exerciseService: ExerciseService) {}

  @Post('sync')
  async syncExercises() {
    return this.exerciseService.syncExercisesFromWger;
  }

  @Get()
  async getAll(
    @Query('muscleGroup') muscleGroup?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.exerciseService.getExercises({
      muscleGroup,
      category,
      search,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(@Param('id') id: string) {
    return this.exerciseService.getExerciseById(Number(id));
  }

  @Post('plan')
  @UseGuards(JwtAuthGuard)
  async createWorkoutPlan(
    @Body()
    body: {
      userId: number;
      fitnessGoal: string;
      exerciseIds: number[];
    },
  ) {
    return this.exerciseService.createOrUpdateWorkoutPlan(
      body.userId,
      body.fitnessGoal,
      body.exerciseIds,
    );
  }

  @Get('plan/:userId')
  @UseGuards(JwtAuthGuard)
  async getWorkoutPlans(@Param('userId') userId: string) {
    return this.exerciseService.getWorkoutPlans(Number(userId));
  }

  @Put('plan/:workoutPlanId')
  @UseGuards(JwtAuthGuard)
  async updateWorkoutPlan(
    @Param('workoutPlanId') workoutPlanId: string,
    @Body() body: { exerciseIds: number[] },
  ) {
    return this.exerciseService.updateWorkoutPlan(
      Number(workoutPlanId),
      body.exerciseIds,
    );
  }

  @Post('track')
  @UseGuards(JwtAuthGuard)
  async trackExerciseCompletion(
    @Body() body: { userId: number; exerciseId: number; duration: number },
  ) {
    return this.exerciseService.trackExerciseCompletion(
      body.userId,
      body.exerciseId,
      body.duration,
    );
  }

  @Get('stats/:userId')
  @UseGuards(JwtAuthGuard)
  async getWorkoutStats(
    @Param('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.exerciseService.getWorkoutStats(
      Number(userId),
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
