import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExerciseDto } from '../planexercise/plansexercise.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ExerciseService {
  constructor(private prisma: PrismaService) {}

  async createExercise(userId: number, dto: CreateExerciseDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }

    if (dto.exerciseCategoryId) {
      const category = await this.prisma.exerciseCategory.findUnique({
        where: { id: dto.exerciseCategoryId },
      });
      if (!category) {
        throw new NotFoundException('Категорію не знайдено');
      }
    }

    return this.prisma.exercise.create({
      data: {
        name: dto.name,
        muscleGroup: dto.muscleGroup,
        difficulty: dto.difficulty,
        description: dto.description,
        imageUrl: dto.imageUrl,
        videoUrl: dto.videoUrl,
        user: { connect: { id: userId } },
        ...(dto.exerciseCategoryId && {
          exerciseCategory: { connect: { id: dto.exerciseCategoryId } },
        }),
      },
      include: {
        exerciseCategory: true,
        user: true,
      },
    });
  }

  async getExerciseById(id: number) {
    return this.prisma.exercise.findUnique({
      where: { id },
      include: { exerciseCategory: true },
    });
  }

  async getAllExercises(categoryName?: string) {
    return this.prisma.exercise.findMany({
      where: categoryName
        ? { exerciseCategory: { name: categoryName } }
        : undefined,
      include: { exerciseCategory: true },
    });
  }

  async updateExercise(
    id: number,
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
      imageUrl?: string;
    },
  ) {
    // Видаляємо поля, які не можна оновлювати
    const updateData = { ...data };

    // Видаляємо поля, які не повинні бути в запиті оновлення

    return this.prisma.exercise.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteExercise(id: number) {
    return this.prisma.exercise.delete({ where: { id } });
  }

  async getCategories() {
    return this.prisma.exerciseCategory.findMany();
  }

  async createCategory(name: string) {
    return this.prisma.exerciseCategory.create({ data: { name } });
  }

  async trackProgress(data: {
    userId: number;
    exerciseId: number;
    type: 'reps' | 'time';
    value: number;
    targetValue: number;
    completed: boolean;
    pauseCount: number;
    resetCount: number;
    workoutPlanId?: number;
  }) {
    try {
      const progress = await this.prisma.trackedExercise.create({
        data: {
          userId: data.userId,
          exerciseId: data.exerciseId,
          type: data.type,
          value: data.value,
          targetValue: data.targetValue,
          completed: data.completed,
          pauseCount: data.pauseCount,
          resetCount: data.resetCount,
          workoutPlanId: data.workoutPlanId,
          completedAt: new Date(),
        },
      });
      return progress;
    } catch (error: any) {
      throw new Error('Error tracking progress: ' + error.message);
    }
  }

  async getUserProgress(userId: number, startDate?: string, endDate?: string) {
    try {
      const query: any = { userId };
      if (startDate && endDate) {
        query.completedAt = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      return this.prisma.trackedExercise.findMany({
        where: query,
        orderBy: { completedAt: 'desc' },
        include: { exercise: true },
        take: 100,
        skip: 0,
      });
    } catch (error: any) {
      throw new Error('Error fetching progress: ' + error.message);
    }
  }
}
