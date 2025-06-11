import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PlanExerciseService } from 'src/planexercise/planexercise.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import FavoriteService from '../favorites/favorite.service';
import { GeneratePlanDto } from '../planexercise/dto/generatePlan.dto';
import { CreateExerciseDto } from '../planexercise/plansexercise.dto';
import { ExerciseService } from './exercise.service';

@Controller('dashboard/exercises')
export class ExerciseController {
  constructor(
    private exerciseService: ExerciseService,
    private favoriteService: FavoriteService,
    private planExerciseService: PlanExerciseService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createExercise(@Request() req, @Body() dto: CreateExerciseDto) {
    const userId = req.user.userId;
    return this.exerciseService.createExercise(userId, dto);
  }

  @Get()
  async getAllExercises(@Query('category') category?: string) {
    return this.exerciseService.getAllExercises(category);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getUserStats(@Request() req) {
    const userId = req.user.userId;
    return this.exerciseService.getUserStats(userId);
  }

  @Get(':id')
  async getExerciseById(@Param('id', ParseIntPipe) id: number) {
    return this.exerciseService.getExerciseById(id);
  }

  @Post('track')
  @UseGuards(JwtAuthGuard)
  async trackProgress(
    @Body()
    data: {
      userId: number;
      exerciseId: number;
      type: 'reps' | 'time';
      value: number;
      targetValue: number;
      completed: boolean;
      pauseCount: number;
      resetCount: number;
      workoutPlanId?: number;
    },
  ) {
    return this.exerciseService.trackProgress(data);
  }

  @Get('progress/:userId')
  @UseGuards(JwtAuthGuard)
  async getUserProgress(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.exerciseService.getUserProgress(userId, startDate, endDate);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateExercise(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    data: {
      name?: string;
      muscleGroup?: string;
      exerciseCategoryId?: number;
      difficulty?: string;
      videoUrl?: string;
      description?: string;
      equipment?: string;
      duration?: number;
      reps?: number;
      restDuration?: number;
      calories?: number;
      intensity?: string;
    },
  ) {
    return this.exerciseService.updateExercise(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteExercise(@Param('id', ParseIntPipe) id: number) {
    return this.exerciseService.deleteExercise(id);
  }

  @Get('categories')
  async getCategories() {
    return this.exerciseService.getCategories();
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard)
  async createCategory(@Body() data: { name: string }) {
    return this.exerciseService.createCategory(data.name);
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generatePlan(@Body() dto: GeneratePlanDto, @Request() req) {
    const userId = req.user.userId;
    return this.planExerciseService.generatePlan(userId, dto);
  }
}
