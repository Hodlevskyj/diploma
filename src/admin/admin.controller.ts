import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExerciseService } from '../exercise/exercise.service';
import { CreateExerciseDto } from '../planexercise/plansexercise.dto';
import { PrismaService } from '../prisma.service';
import { AdminGuard } from './admin.guard';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly exerciseService: ExerciseService,
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  @Get()
  getRoot(@Request() req) {
    console.log('Reached /admin endpoint with user:', req.user);
    return 'admin root';
  }

  @Post('exercises')
  async createExercise(@Body() dto: CreateExerciseDto, @Request() req) {
    return this.exerciseService.createExercise(req.user.userId, dto);
  }

  @Get('exercises')
  async getExercises() {
    return this.exerciseService.getAllExercises();
  }

  @Put('exercises/:id')
  async updateExercise(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateExerciseDto,
  ) {
    return this.exerciseService.updateExercise(id, dto);
  }

  @Delete('exercises/:id')
  async deleteExercise(@Param('id', ParseIntPipe) id: number) {
    return this.exerciseService.deleteExercise(id);
  }

  @Get('categories')
  async getCategories() {
    return this.exerciseService.getCategories();
  }

  @Get('users/count')
  async getUserCount() {
    const count = await this.prisma.user.count();
    return { count };
  }

  @Get('users')
  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
  }

  @Delete(':id')
  async deleteUserById(@Param('id', ParseIntPipe) id: number, @Request() req) {
    if (req.user.userId === id) {
      throw new ForbiddenException(
        'Адміністратор не може видалити свій обліковий запис',
      );
    }

    return this.userService.deleteUser(id);
  }

  @Post('users/:id/role')
  async updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: Role,
    @Request() req,
  ) {
    if (req.user.userId === id) {
      throw new ForbiddenException('Адміністратор не може змінити свою роль');
    }

    return this.userService.updateUserRole(id, role);
  }

  @Get('plans')
  async getAllPlans() {
    return this.prisma.workoutPlan.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('plans/:id')
  async getPlanById(@Param('id', ParseIntPipe) id: number) {
    const plan = await this.prisma.workoutPlan.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        WorkoutDay: {
          include: {
            exercises: {
              include: {
                exercise: true,
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { dayNumber: 'asc' },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`План з ID ${id} не знайдено`);
    }

    return plan;
  }

  @Delete('plans/:id')
  async deletePlan(@Param('id', ParseIntPipe) id: number) {
    try {
      // Спочатку видаляємо пов'язані записи
      await this.prisma.workoutPlanExercise.deleteMany({
        where: {
          workoutDay: {
            workoutPlanId: id,
          },
        },
      });

      await this.prisma.workoutDay.deleteMany({
        where: {
          workoutPlanId: id,
        },
      });

      await this.prisma.favoritePlan.deleteMany({
        where: {
          planId: id,
        },
      });

      // Тепер видаляємо сам план
      await this.prisma.workoutPlan.delete({
        where: { id },
      });

      return { success: true, message: 'План успішно видалено' };
    } catch (error) {
      throw new InternalServerErrorException('Помилка видалення плану');
    }
  }
}
