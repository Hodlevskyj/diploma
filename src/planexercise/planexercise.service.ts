import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  AddExerciseToPlanDto,
  CreatePlanDto,
  UpdateExerciseInPlanDto,
  UpdatePlanDto,
} from './plansexercise.dto';

@Injectable()
export class PlanExerciseService {
  [x: string]: any;
  constructor(private prisma: PrismaService) {}

  async findOne(userId: number, planId: number) {
    const plan = await this.prisma.workoutPlan.findFirst({
      where: {
        id: planId,
        userId: userId,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('План не знайдено');
    }

    return plan;
  }

  async findAll(userId: number) {
    return this.prisma.workoutPlan.findMany({
      where: { userId },
      include: { exercises: { include: { exercise: true } } },
    });
  }

  async create(userId: number, createPlanDto: CreatePlanDto) {
    try {
      console.log('Creating plan with data:', { userId, createPlanDto });

      // Перевірка валідності userId
      if (!userId || isNaN(userId)) {
        throw new NotFoundException('User ID is invalid or not provided');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const plan = await this.prisma.workoutPlan.create({
        data: {
          name: createPlanDto.name,
          description: createPlanDto.description,
          fitnessGoal: createPlanDto.fitnessGoal || 'LOSE_WEIGHT',
          status: 'IN_PROGRESS',
          user: {
            connect: {
              id: userId,
            },
          },
        },
        include: {
          user: true,
          exercises: true,
        },
      });

      console.log('Plan created successfully:', plan);
      return plan;
    } catch (error) {
      console.error('Error creating plan:', error);
      throw new Error(`Failed to create plan: ${error.message}`);
    }
  }

  async update(userId: number, id: number, updatePlanDto: UpdatePlanDto) {
    const plan = await this.prisma.workoutPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('План не знайдено');
    }

    if (plan.userId !== userId) {
      throw new ForbiddenException('Немає доступу до цього плану');
    }

    return this.prisma.workoutPlan.update({
      where: { id },
      data: {
        name: updatePlanDto.name,
        description: updatePlanDto.description,
        fitnessGoal: updatePlanDto.fitnessGoal,
        status: updatePlanDto.status,
      },
    });
  }

  async remove(userId: number, id: number) {
    const plan = await this.prisma.workoutPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException('План не знайдено');
    }

    if (plan.userId !== userId) {
      throw new ForbiddenException('Немає доступу до цього плану');
    }

    await this.prisma.workoutPlan.delete({
      where: { id },
    });
    return;
  }

  async addExerciseToPlan(
    userId: number,
    planId: number,
    addExerciseDto: AddExerciseToPlanDto,
  ) {
    const plan = await this.prisma.workoutPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('План не знайдено');
    }

    if (plan.userId !== userId) {
      throw new ForbiddenException('Немає доступу до цього плану');
    }

    const exercise = await this.prisma.exercise.findUnique({
      where: { id: addExerciseDto.exerciseId },
    });

    if (!exercise) {
      throw new NotFoundException('Вправу не знайдено');
    }

    return this.prisma.workoutPlanExercise.create({
      data: {
        workoutPlanId: planId,
        exerciseId: addExerciseDto.exerciseId,
        order: addExerciseDto.order,
        reps: addExerciseDto.reps ?? 0,
        duration: addExerciseDto.duration ?? 0,
        restDuration: addExerciseDto.restDuration ?? 0,
      },
    });
  }

  async updateExerciseInPlan(
    userId: number,
    planId: number,
    exerciseId: number,
    updateExerciseDto: UpdateExerciseInPlanDto,
  ) {
    const plan = await this.prisma.workoutPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('План не знайдено');
    }

    if (plan.userId !== userId) {
      throw new ForbiddenException('Немає доступу до цього плану');
    }

    const workoutPlanExercise =
      await this.prisma.workoutPlanExercise.findUnique({
        where: { id: exerciseId, workoutPlanId: planId },
      });

    if (!workoutPlanExercise) {
      throw new NotFoundException('Вправу в плані не знайдено');
    }

    return this.prisma.workoutPlanExercise.update({
      where: { id: exerciseId },
      data: {
        reps: updateExerciseDto.reps,
        duration: updateExerciseDto.duration,
        restDuration: updateExerciseDto.restDuration,
        order: updateExerciseDto.order,
      },
    });
  }

  async removeExerciseFromPlan(
    userId: number,
    planId: number,
    exerciseId: number,
  ) {
    const plan = await this.prisma.workoutPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('План не знайдено');
    }

    if (plan.userId !== userId) {
      throw new ForbiddenException('Немає доступу до цього плану');
    }

    const workoutPlanExercise =
      await this.prisma.workoutPlanExercise.findUnique({
        where: { id: exerciseId, workoutPlanId: planId },
      });

    if (!workoutPlanExercise) {
      throw new NotFoundException('Вправу в плані не знайдено');
    }

    await this.prisma.workoutPlanExercise.delete({
      where: { id: exerciseId },
    });
    return;
  }
}
