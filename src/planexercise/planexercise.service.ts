import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePlanDto } from './dto/createPlan.dto';
import { GeneratePlanDto } from './dto/generatePlan.dto';
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

  async updatePlan(id: number, updatePlanDto: UpdatePlanDto, userId: number) {
    console.log(
      `Service: Updating plan ${id} for user ${userId} with data:`,
      updatePlanDto,
    );

    // Перевіряємо, чи існує план
    const plan = await this.prisma.workoutPlan.findFirst({
      where: {
        id,
      },
    });

    if (!plan) {
      console.log(`Plan ${id} not found`);
      throw new NotFoundException(`План з ID ${id} не знайдено`);
    }

    // Перевіряємо, чи належить план користувачу
    if (plan.userId !== userId) {
      console.log(
        `Plan ${id} does not belong to user ${userId}, it belongs to user ${plan.userId}`,
      );
      throw new ForbiddenException(`План не належить користувачу`);
    }

    try {
      const updatedPlan = await this.prisma.workoutPlan.update({
        where: { id },
        data: updatePlanDto,
      });
      console.log(`Plan ${id} updated successfully`);
      return updatedPlan;
    } catch (error) {
      console.error(`Error updating plan ${id}:`, error);
      throw error;
    }
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

  async getPlanProgress(userId: number, planId: number) {
    // Отримуємо всі відстежені вправи для цього плану
    const trackedExercises = await this.prisma.trackedExercise.findMany({
      where: {
        userId,
        workoutPlanId: planId,
      },
      include: {
        exercise: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    // Отримуємо загальну кількість вправ у плані
    const plan = await this.prisma.workoutPlan.findUnique({
      where: { id: planId },
      include: {
        WorkoutDay: {
          include: {
            exercises: true,
          },
        },
      },
    });

    // Рахуємо загальну кількість вправ у плані
    const totalExercises = plan.WorkoutDay.reduce(
      (sum, day) => sum + day.exercises.length,
      0,
    );

    // Рахуємо кількість виконаних вправ
    const completedExercises = trackedExercises.filter(
      (ex) => ex.completed,
    ).length;

    // Рахуємо прогрес у відсотках
    const progressPercentage =
      totalExercises > 0
        ? Math.round((completedExercises / totalExercises) * 100)
        : 0;

    return {
      trackedExercises,
      progress: {
        total: totalExercises,
        completed: completedExercises,
        percentage: progressPercentage,
      },
    };
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
    // Отримуємо дані користувача
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { height: true, weight: true, goal: true, age: true },
    });

    if (!user) throw new NotFoundException('Користувача не знайдено');

    //індекс тіла
    const bmi =
      user.weight && user.height
        ? user.weight / Math.pow(user.height / 100, 2)
        : null;

    // Отримуємо всі вправи
    const allExercises = await this.prisma.exercise.findMany({
      include: { exerciseCategory: true },
    });

    // Створюємо план
    const plan = await this.prisma.workoutPlan.create({
      data: {
        userId,
        name: `Персональний план (${user.goal || dto.fitnessGoal})`,
        fitnessGoal: user.goal || dto.fitnessGoal,
        status: 'IN_PROGRESS',
        WorkoutDay: {
          create: this.generateWorkoutDays(
            dto.daysPerWeek,
            allExercises,
            user.goal || dto.fitnessGoal,
            bmi,
            user.age,
          ),
        },
      },
      include: {
        WorkoutDay: {
          include: { exercises: { include: { exercise: true } } },
        },
      },
    });

    return plan;
  }

  private generateWorkoutDays(
    daysPerWeek: number,
    exercises: any[],
    goal: string,
    bmi: number | null,
    age: number | null,
  ) {
    // Групуємо вправи за групами м'язів
    const exercisesByMuscleGroup = this.groupExercisesByMuscleGroup(exercises);

    // Визначаємо розподіл днів за типами тренувань
    const workoutSchedule = this.createWorkoutSchedule(daysPerWeek, goal);

    return workoutSchedule.map((dayType, index) => ({
      dayNumber: index + 1,
      name: `День ${index + 1}: ${this.getDayName(dayType)}`,
      exercises: {
        create: this.selectExercisesForDay(
          dayType,
          exercisesByMuscleGroup,
          goal,
          bmi,
          age,
        ),
      },
    }));
  }

  private groupExercisesByMuscleGroup(exercises: any[]) {
    const groups = {
      cardio: [],
      chest: [],
      back: [],
      legs: [],
      arms: [],
      shoulders: [],
      core: [],
      fullBody: [],
    };

    exercises.forEach((exercise) => {
      const muscleGroup = exercise.muscleGroup.toLowerCase();
      if (muscleGroup.includes('cardio')) groups.cardio.push(exercise);
      else if (muscleGroup.includes('chest')) groups.chest.push(exercise);
      else if (muscleGroup.includes('back')) groups.back.push(exercise);
      else if (muscleGroup.includes('leg')) groups.legs.push(exercise);
      else if (
        muscleGroup.includes('arm') ||
        muscleGroup.includes('bicep') ||
        muscleGroup.includes('tricep')
      )
        groups.arms.push(exercise);
      else if (muscleGroup.includes('shoulder'))
        groups.shoulders.push(exercise);
      else if (muscleGroup.includes('core') || muscleGroup.includes('abs'))
        groups.core.push(exercise);
      else groups.fullBody.push(exercise);
    });

    return groups;
  }

  private createWorkoutSchedule(daysPerWeek: number, goal: string) {
    // Розподіл типів тренувань залежно від цілі
    if (goal === 'LOSE_WEIGHT') {
      // Для схуднення: більше кардіо та повного тіла
      return Array(daysPerWeek)
        .fill(0)
        .map((_, i) => {
          if (i % 3 === 0) return 'cardio';
          if (i % 3 === 1) return 'fullBody';
          return ['legs', 'upper', 'core'][Math.floor(Math.random() * 3)];
        });
    } else if (goal === 'GAIN_MUSCLE') {
      // Для набору м'язової маси: розподіл за групами м'язів
      const schedule = [
        'chest',
        'back',
        'legs',
        'shoulders',
        'arms',
        'rest',
        'rest',
      ];
      return Array(daysPerWeek)
        .fill(0)
        .map((_, i) => schedule[i % 7]);
    } else {
      // Для підтримки форми: змішаний підхід
      const schedule = [
        'cardio',
        'upper',
        'lower',
        'fullBody',
        'core',
        'rest',
        'rest',
      ];
      return Array(daysPerWeek)
        .fill(0)
        .map((_, i) => schedule[i % 7]);
    }
  }

  private getDayName(dayType: string): string {
    const names = {
      cardio: 'Кардіо',
      chest: 'Груди',
      back: 'Спина',
      legs: 'Ноги',
      arms: 'Руки',
      shoulders: 'Плечі',
      core: 'Прес',
      fullBody: 'Все тіло',
      upper: 'Верхня частина',
      lower: 'Нижня частина',
      rest: 'Відпочинок',
    };
    return names[dayType] || dayType;
  }

  private selectExercisesForDay(
    dayType: string,
    exercisesByGroup: any,
    goal: string,
    bmi: number | null,
    age: number | null,
  ) {
    // Визначаємо інтенсивність на основі BMI та віку
    const intensity = this.determineIntensity(bmi, age);

    // Кількість вправ залежно від типу дня та інтенсивності
    const exerciseCount =
      dayType === 'rest'
        ? 0
        : dayType === 'cardio'
          ? 3
          : intensity === 'high'
            ? 6
            : intensity === 'medium'
              ? 5
              : 4;

    if (dayType === 'rest') return [];

    let selectedExercises = [];

    // Вибираємо вправи залежно від типу дня
    if (dayType === 'cardio') {
      selectedExercises = this.getRandomExercises(
        exercisesByGroup.cardio,
        exerciseCount,
      );
    } else if (dayType === 'fullBody') {
      selectedExercises = [
        ...this.getRandomExercises(exercisesByGroup.chest, 1),
        ...this.getRandomExercises(exercisesByGroup.back, 1),
        ...this.getRandomExercises(exercisesByGroup.legs, 1),
        ...this.getRandomExercises(exercisesByGroup.core, 1),
      ];
    } else if (dayType === 'upper') {
      selectedExercises = [
        ...this.getRandomExercises(exercisesByGroup.chest, 2),
        ...this.getRandomExercises(exercisesByGroup.back, 2),
        ...this.getRandomExercises(exercisesByGroup.arms, 1),
      ];
    } else if (dayType === 'lower') {
      selectedExercises = [
        ...this.getRandomExercises(exercisesByGroup.legs, 4),
        ...this.getRandomExercises(exercisesByGroup.core, 1),
      ];
    } else {
      // Для конкретної групи м'язів
      selectedExercises = this.getRandomExercises(
        exercisesByGroup[dayType] || [],
        exerciseCount,
      );
    }

    // Налаштовуємо параметри вправ залежно від цілі та інтенсивності
    return selectedExercises.map((exercise, index) =>
      this.configureExerciseParams(exercise, index, goal, intensity),
    );
  }

  private getRandomExercises(exercises: any[], count: number) {
    if (!exercises || exercises.length === 0) return [];

    // Перемішуємо масив вправ
    const shuffled = [...exercises].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  private determineIntensity(
    bmi: number | null,
    age: number | null,
  ): 'low' | 'medium' | 'high' {
    if (!bmi || !age) return 'medium';

    // Визначаємо інтенсивність на основі BMI та віку
    if (age > 50) return 'low';
    if (age > 30 && bmi > 30) return 'low';
    if (age > 30 && bmi < 20) return 'low';
    if (bmi > 35) return 'low';
    if (bmi > 30 || bmi < 18.5) return 'medium';
    return 'high';
  }

  private configureExerciseParams(
    exercise: any,
    order: number,
    goal: string,
    intensity: string,
  ) {
    // Базові параметри
    const params: any = {
      exerciseId: exercise.id,
      order: order,
    };

    // Налаштовуємо параметри залежно від типу вправи
    const isCardio = exercise.muscleGroup.toLowerCase().includes('cardio');

    if (isCardio) {
      // Для кардіо вправ
      params.duration =
        intensity === 'high' ? 600 : intensity === 'medium' ? 480 : 300; // в секундах
      params.restDuration =
        intensity === 'high' ? 60 : intensity === 'medium' ? 90 : 120;
    } else {
      // Для силових вправ
      if (goal === 'LOSE_WEIGHT') {
        params.reps =
          intensity === 'high' ? 15 : intensity === 'medium' ? 12 : 10;
        params.restDuration =
          intensity === 'high' ? 30 : intensity === 'medium' ? 45 : 60;
      } else if (goal === 'GAIN_MUSCLE') {
        params.reps =
          intensity === 'high' ? 10 : intensity === 'medium' ? 8 : 6;
        params.restDuration =
          intensity === 'high' ? 90 : intensity === 'medium' ? 120 : 150;
      } else {
        params.reps = 12;
        params.restDuration = 60;
      }
    }

    return params;
  }
}
