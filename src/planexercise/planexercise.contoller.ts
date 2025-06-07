import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePlanDto } from './dto/createPlan.dto';
import {
  CreateWorkoutDayDto,
  CreateWorkoutPlanExerciseDto,
  GeneratePlanDto,
} from './dto/generatePlan.dto';
import { PlanExerciseService } from './planexercise.service';
import { UpdatePlanDto } from './plansexercise.dto';

@Controller('plans')
@UseGuards(JwtAuthGuard)
export class PlansExerciseController {
  constructor(private readonly workoutPlanService: PlanExerciseService) {}

  @Post()
  create(@Body() dto: CreatePlanDto, @Request() req) {
    const userId = req.user.userId;
    return this.workoutPlanService.create(userId, dto);
  }

  @Get()
  findAll(@Request() req) {
    const userId = req.user.userId;
    return this.workoutPlanService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.userId;
    return this.workoutPlanService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePlanDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.workoutPlanService.updatePlan(id, userId, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.userId;
    return this.workoutPlanService.remove(id, userId);
  }

  @Post(':id/exercises')
  addExerciseToPlan(
    @Param('id', ParseIntPipe) planId: number,
    @Body()
    dto: {
      exerciseId: number;
      order: number;
      reps?: number;
      duration?: number;
      restDuration?: number;
    },
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.workoutPlanService.addExerciseToPlan(planId, userId, dto);
  }

  @Delete(':plandId/exercises/:exerciseId')
  async removeExerciseFromPlan(
    @Param('plandId', ParseIntPipe) planId: number,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.workoutPlanService.removeExerciseFromPlan(
      planId,
      exerciseId,
      userId,
    );
  }
  @Patch(':planId/exercises/:exerciseId')
  async updateExerciseInPlan(
    @Param('planId', ParseIntPipe) planId: number,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
    @Body()
    dto: {
      order: number;
      reps?: number;
      duration?: number;
      restDuration?: number;
    },
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.workoutPlanService.updateExerciseInPlan(
      planId,
      exerciseId,
      userId,
      dto,
    );
  }

  @Post(':id/complete')
  async completePlan(
    @Param('id', ParseIntPipe) planId: number,
    @Body()
    body: {
      trackedExercises: {
        exerciseId: number;
        type: 'reps' | 'time';
        value: number;
        targetValue: number;
        completed: boolean;
        pauseCount: number;
        resetCount: number;
      }[];
      status: 'COMPLETED' | 'CANCELLED';
    },
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.workoutPlanService.completePlan(planId, userId, body);
  }

  //історія виконання плану
  @Get(':id/progress/:userId')
  async getPlanProgress(
    @Param('id', ParseIntPipe) planId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.workoutPlanService.getPlanProgress(planId, userId);
  }

  //збереження проміжного прогресу
  @Post(':id/progress')
  async savePartialProgress(
    @Param('id', ParseIntPipe) planId: number,
    @Body()
    body: {
      trackedExercises: {
        exerciseId: number;
        type: 'reps' | 'time';
        value: number;
        targetValue: number;
        completed: boolean;
        pauseCount: number;
        resetCount: number;
      }[];
    },
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.workoutPlanService.savePartialProgress(planId, userId, body);
  }

  @Post('generate')
  async generatePlan(@Body() dto: GeneratePlanDto, @Request() req) {
    const userId = req.user.userId;
    return this.workoutPlanService.generatePlan(userId, dto);
  }
  @Get()
  async getPlans(@Request() req) {
    const userId = req.user.userId;
    return this.workoutPlanService.findAll(userId);
  }

  @Post(':planId/days')
  async createDay(
    @Param('planId', ParseIntPipe) planId: number,
    @Body() dto: CreateWorkoutDayDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.workoutPlanService.createDay(userId, planId, dto);
  }

  @Delete(':planId/days/:dayId')
  async deleteDay(
    @Param('planId', ParseIntPipe) planId: number,
    @Param('dayId', ParseIntPipe) dayId: number,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.workoutPlanService.deleteDay(userId, planId, dayId);
  }

  @Post(':planId/days/:dayId/exercises')
  async addExerciseToDay(
    @Param('planId', ParseIntPipe) planId: number,
    @Param('dayId', ParseIntPipe) dayId: number,
    @Body() dto: CreateWorkoutPlanExerciseDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.workoutPlanService.addExerciseToDay(userId, planId, dayId, dto);
  }

  @Delete(':planId/days/:dayId/exercises/:exerciseId')
  async removeExerciseFromDay(
    @Param('planId', ParseIntPipe) planId: number,
    @Param('dayId', ParseIntPipe) dayId: number,
    @Param('exerciseId', ParseIntPipe) exerciseId: number,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.workoutPlanService.removeExerciseFromDay(
      userId,
      planId,
      dayId,
      exerciseId,
    );
  }
}
