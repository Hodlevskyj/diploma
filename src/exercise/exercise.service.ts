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
          // Витягування перекладу для language=2
          const englishTranslation = wgerExercise.translations.find(
            (translation: any) => translation.language === 2,
          );

          // Перевірка наявності name
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
    return this.prisma.exercise.findMany({
      where: {
        muscleGroup: muscleGroup || undefined,
        category: category || undefined,
        name: search ? { contains: search, mode: 'insensitive' } : undefined,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: 'asc' },
    } as Prisma.ExerciseFindManyArgs);
  }

  async getExerciseById(id: number) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id },
    } as Prisma.ExerciseFindUniqueArgs);
    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }
    return exercise;
  }

  async updateExercise(
    id: number,
    data: { videoUrl?: string; difficulty?: string },
  ) {
    return this.prisma.exercise.update({
      where: { id },
      data,
    } as Prisma.ExerciseUpdateArgs);
  }
}
