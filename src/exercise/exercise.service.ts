import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma.service';
@Injectable()
export class ExerciseService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async syncExercisesFromWger() {
    try {
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await firstValueFrom(
          this.httpService.get('https://wger.de/api/v2/exerciseinfo/', {
            params: { page, limit: 20, language: 2 },
            headers: { Authorization: `Token ${process.env.WGER_API_KEY}` },
          }),
        );

        const { results, next } = response.data;
        hasMore = !!next;
        page++;

        for (const wgerExercise of results) {
          const englishTranslation = wgerExercise.translations.find(
            (translation: any) => translation.language === 2,
          );

          if (!englishTranslation || !englishTranslation.name) {
            console.warn(
              `Skipping exercise with ID ${wgerExercise.id}: no English name found.`,
            );
            continue;
          }

          const muscleResponse = await firstValueFrom(
            this.httpService.get(
              `https://wger.de/api/v2/muscle/${wgerExercise.muscles[0]?.id || 1}/`,
            ),
          );
          const categoryResponse = await firstValueFrom(
            this.httpService.get(
              `https://wger.de/api/v2/exercisecategory/${wgerExercise.category?.id || 1}/`,
            ),
          );

          const muscleGroup = muscleResponse.data.name || 'Unknown';
          const category = categoryResponse.data.name || 'Unknown';

          await this.prisma.exercise.upsert({
            //update + insert
            where: { wgerId: wgerExercise.id },
            update: {
              name: englishTranslation.name,
              muscleGroup,
              category,
              description: englishTranslation.description || null,
              equipment: wgerExercise.equipment?.length
                ? wgerExercise.equipment.map((eq: any) => eq.name).join(', ')
                : null,
            },
            create: {
              wgerId: wgerExercise.id,
              name: englishTranslation.name,
              muscleGroup,
              category,
              description: englishTranslation.description || null,
              equipment: wgerExercise.equipment?.length
                ? wgerExercise.equipment.map((eq: any) => eq.name).join(', ')
                : null,
            },
          } as Prisma.ExerciseUpsertArgs);
        }
      }
      return { message: 'Exercises synced from Wger' };
    } catch (error) {
      console.error('Sync error:', error);
      throw new Error('Failed to sync exercises from Wger');
    }
  }

  async getExercises(filters: {
    muscleGroup?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { muscleGroup, category, search, page = 1, limit = 20 } = filters;

    try {
      const exercises = await this.prisma.exercise.findMany({
        where: {
          muscleGroup: muscleGroup || undefined,
          category: category || undefined,
          name: search
            ? {
                contains: search,
                mode: 'insensitive',
              }
            : undefined,
        },
        skip: (page - 1) * limit,
        take: Number(limit),
        orderBy: { name: 'asc' },
      } as Prisma.ExerciseFindManyArgs);

      return exercises;
    } catch (error) {
      console.error('Error in getExercises:', error);
      throw new Error('Failed to fetch exercises');
    }
  }

  async getExerciseById(id: number) {
    try {
      const exercise = await this.prisma.exercise.findUnique({
        where: { id },
      } as Prisma.ExerciseFindUniqueArgs);
      if (!exercise) {
        throw new NotFoundException(`Exercise with ID ${id} not found`);
      }
      return exercise;
    } catch (error) {
      console.error('Error in getExerciseById:', error);
      throw error;
    }
  }

  async createOrUpdateWorkoutPlan(
    userId: number,
    fitnessGoal: string,
    exerciseIds: number[],
  ) {
    let selectedExerciseIds = exerciseIds;
    if (!exerciseIds.length) {
      let categoryFilter: string;
      switch (fitnessGoal) {
        case 'Схуднення':
          categoryFilter = 'Cardio';
          break;
        case 'Набір м’язової маси':
          categoryFilter = 'Strength';
          break;
        case 'Гнучкість':
          categoryFilter = 'Stretching';
          break;
        default:
          categoryFilter = 'Strength';
      }

      const exercises = await this.prisma.exercise.findMany({
        where: { category: categoryFilter },
        take: 5,
      });
      selectedExerciseIds = exercises.map((exercise) => exercise.id);
    }

    const existingPlan = await this.prisma.workoutPlan.findFirst({
      where: { userId, fitnessGoal },
    });

    if (existingPlan) {
      await this.prisma.workoutPlanExercise.deleteMany({
        where: { workoutPlanId: existingPlan.id },
      });

      await this.prisma.workoutPlan.update({
        where: { id: existingPlan.id },
        data: {
          exercises: {
            create: selectedExerciseIds.map((exerciseId, index) => ({
              exerciseId,
              order: index + 1,
            })),
          },
        },
      });

      return existingPlan;
    } else {
      return await this.prisma.workoutPlan.create({
        data: {
          userId,
          name: `План для ${fitnessGoal}`,
          fitnessGoal,
          exercises: {
            create: selectedExerciseIds.map((exerciseId, index) => ({
              exerciseId,
              order: index + 1,
            })),
          },
        },
      });
    }
  }

  async getWorkoutPlans(userId: number) {
    return await this.prisma.workoutPlan.findMany({
      where: { userId },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async updateWorkoutPlan(workoutPlanId: number, exerciseIds: number[]) {
    const workoutPlan = await this.prisma.workoutPlan.findUnique({
      where: { id: workoutPlanId },
    });
    if (!workoutPlan) {
      throw new NotFoundException(
        `Workout plan with ID ${workoutPlanId} not found`,
      );
    }

    await this.prisma.workoutPlanExercise.deleteMany({
      where: { workoutPlanId },
    });

    await this.prisma.workoutPlan.update({
      where: { id: workoutPlanId },
      data: {
        exercises: {
          create: exerciseIds.map((exerciseId, index) => ({
            exerciseId,
            order: index + 1,
          })),
        },
      },
    });

    return await this.prisma.workoutPlan.findUnique({
      where: { id: workoutPlanId },
      include: { exercises: { include: { exercise: true } } },
    });
  }

  async trackExerciseCompletion(
    userId: number,
    exerciseId: number,
    duration: number,
  ) {
    return await this.prisma.workoutCompletion.create({
      data: {
        userId,
        exerciseId,
        duration,
      },
    });
  }

  async getWorkoutStats(userId: number, startDate?: Date, endDate?: Date) {
    return await this.prisma.workoutCompletion.findMany({
      where: {
        userId,
        completedAt: {
          gte: startDate,
          lte: endDate || new Date(),
        },
      },
      include: { exercise: true },
      orderBy: { completedAt: 'desc' },
    });
  }
}
