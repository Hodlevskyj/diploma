import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePlanDto } from './dto/createPlan.dto';
import {
  CreateWorkoutDayDto,
  CreateWorkoutPlanExerciseDto,
  GeneratePlanDto,
} from './dto/generatePlan.dto';
import { UpdatePlanDto } from './dto/updatePlan.dto';

@Injectable()
export class PlanExerciseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreatePlanDto) {
    if (!userId) throw new Error('User ID is required');
    return this.prisma.workoutPlan.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.workoutPlan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number) {
    const plan = await this.prisma.workoutPlan.findFirst({
      where: { id, userId },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    });
    if (!plan) throw new NotFoundException('Workout plan not found');
    return plan;
  }

  async updatePlan(id: number, userId: number, dto: UpdatePlanDto) {
    await this.findOne(id, userId);
    return this.prisma.workoutPlan.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    return this.prisma.workoutPlan.delete({
      where: { id },
    });
  }

  async addExerciseToPlan(
    planId: number,
    userId: number,
    dto: {
      exerciseId: number;
      order: number;
      reps?: number;
      duration?: number;
      restDuration?: number;
    },
  ) {
    const plan = await this.findOne(planId, userId);
    if (!plan) throw new NotFoundException('Workout plan not found');

    return this.prisma.workoutPlanExercise.create({
      data: {
        ...dto,
        workoutPlanId: planId,
      },
    });
  }

  async removeExerciseFromPlan(
    planId: number,
    exerciseId: number,
    userId: number,
  ) {
    const plan = await this.findOne(planId, userId);
    if (!plan) throw new NotFoundException('Workout plan not found');

    return this.prisma.workoutPlanExercise.deleteMany({
      where: {
        workoutPlanId: planId,
        id: exerciseId,
      },
    });
  }

  async updateExerciseInPlan(
    planId: number,
    exerciseId: number,
    userId: number,
    dto: {
      order: number;
      reps?: number;
      duration?: number;
      restDuration?: number;
    },
  ) {
    const plan = await this.findOne(planId, userId);
    if (!plan) throw new NotFoundException('Workout plan not found');

    return this.prisma.workoutPlanExercise.update({
      where: { id: exerciseId, workoutPlanId: planId },
      data: dto,
    });
  }

  async completePlan(
    planId: number,
    userId: number,
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
  ) {
    //зберігаємо всі trackedExercises
    for (const ex of body.trackedExercises) {
      await this.prisma.trackedExercise.create({
        data: {
          userId,
          exerciseId: ex.exerciseId,
          type: ex.type,
          value: ex.value,
          targetValue: ex.targetValue,
          completed: ex.completed,
          pauseCount: ex.pauseCount,
          resetCount: ex.resetCount,
          workoutPlanId: planId,
          completedAt: new Date(),
        },
      });
    }
    await this.prisma.workoutPlan.update({
      where: { id: planId },
      data: { status: body.status },
    });
    return { success: true };
  }

  async getPlanProgress(planId: number, userId: number) {
    return this.prisma.trackedExercise.findMany({
      where: {
        workoutPlanId: planId,
        userId,
      },
      orderBy: { completedAt: 'desc' },
      include: { exercise: true },
    });
  }

  async savePartialProgress(
    planId: number,
    userId: number,
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
  ) {
    for (const ex of body.trackedExercises) {
      await this.prisma.trackedExercise.create({
        data: {
          userId,
          exerciseId: ex.exerciseId,
          type: ex.type,
          value: ex.value,
          targetValue: ex.targetValue,
          completed: ex.completed,
          pauseCount: ex.pauseCount,
          resetCount: ex.resetCount,
          workoutPlanId: planId,
          completedAt: new Date(),
        },
      });
    }
    return { success: true };
  }

  async generatePlan(userId: number, dto: GeneratePlanDto) {
    const plan = await this.prisma.workoutPlan.create({
      data: {
        userId,
        name: `Авто-план (${dto.fitnessGoal})`,
        fitnessGoal: dto.fitnessGoal,
        status: 'IN_PROGRESS',
        WorkoutDay: {
          create: Array.from({ length: dto.daysPerWeek }).map((_, i) => ({
            dayNumber: i + 1,
            name: `День ${i + 1}`,
            exercises: {
              create: [],
            },
          })),
        },
      },
      include: {
        WorkoutDay: {
          include: { exercises: true },
        },
      },
    });
    return plan;
  }

  async createDay(userId: number, planId: number, dto: CreateWorkoutDayDto) {
    return this.prisma.workoutDay.create({
      data: {
        workoutPlanId: planId,
        ...dto,
      },
    });
  }

  async deleteDay(userId: number, planId: number, dayId: number) {
    return this.prisma.workoutDay.delete({
      where: { id: dayId },
    });
  }

  async addExerciseToDay(
    userId: number,
    planId: number,
    dayId: number,
    dto: CreateWorkoutPlanExerciseDto,
  ) {
    return this.prisma.workoutPlanExercise.create({
      data: {
        workoutPlanId: planId,
        workoutDayId: dayId,
        ...dto,
      },
    });
  }

  async removeExerciseFromDay(
    userId: number,
    planId: number,
    dayId: number,
    exerciseId: number,
  ) {
    return this.prisma.workoutPlanExercise.deleteMany({
      where: {
        workoutPlanId: planId,
        workoutDayId: dayId,
        exerciseId,
      },
    });
  }
}
