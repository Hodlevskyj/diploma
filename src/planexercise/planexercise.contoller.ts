import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PlanExerciseService } from './planexercise.service';
import {
  AddExerciseToPlanDto,
  CreatePlanDto,
  UpdateExerciseInPlanDto,
  UpdatePlanDto,
} from './plansexercise.dto';

@Controller('plans')
@UseGuards(JwtAuthGuard)
export class PlansExerciseController {
  constructor(private readonly plansService: PlanExerciseService) {}

  @Get()
  async findAll(@Request() req) {
    console.log('User ID from request:', req.user?.userId);
    return this.plansService.findAll(req.user.userId);
  }
  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    try {
      const plan = await this.plansService.findOne(
        req.user.userId,
        parseInt(id),
      );
      return {
        success: true,
        data: plan,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Помилка завантаження плану',
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(@Request() req, @Body() createPlanDto: CreatePlanDto) {
    try {
      console.log('Request body:', createPlanDto);
      console.log('User from request:', req.user);

      if (!req.user?.userId) {
        throw new HttpException('User ID is missing', HttpStatus.UNAUTHORIZED);
      }

      const plan = await this.plansService.create(
        req.user.userId,
        createPlanDto,
      );
      return plan;
    } catch (error) {
      console.error('Controller error:', error);
      throw new HttpException(
        error.message || 'Failed to create plan',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updatePlanDto: UpdatePlanDto,
  ) {
    return this.plansService.update(
      req.user.userId,
      parseInt(id),
      updatePlanDto,
    );
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    return this.plansService.remove(req.user.userId, parseInt(id));
  }

  @Post(':id/exercises')
  async addExerciseToPlan(
    @Request() req,
    @Param('id') planId: string,
    @Body() addExerciseDto: AddExerciseToPlanDto,
  ) {
    return this.plansService.addExerciseToPlan(
      req.user.userId,
      parseInt(planId),
      addExerciseDto,
    );
  }

  @Put(':id/exercises/:exerciseId')
  async updateExerciseInPlan(
    @Request() req,
    @Param('id') planId: string,
    @Param('exerciseId') exerciseId: string,
    @Body() updateExerciseDto: UpdateExerciseInPlanDto,
  ) {
    return this.plansService.updateExerciseInPlan(
      req.user.userId,
      parseInt(planId),
      parseInt(exerciseId),
      updateExerciseDto,
    );
  }

  @Delete(':id/exercises/:exerciseId')
  async removeExerciseFromPlan(
    @Request() req,
    @Param('id') planId: string,
    @Param('exerciseId') exerciseId: string,
  ) {
    return this.plansService.removeExerciseFromPlan(
      req.user.userId,
      parseInt(planId),
      parseInt(exerciseId),
    );
  }
}
