import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlanDto } from './dto/createPlan.dto';
import { UpdatePlanDto } from './dto/updatePlan.dto';

@Injectable()
export class PlanExerciseService {
  logger: any;
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createPlanDto: CreatePlanDto) {
    return this.prisma.workoutPlan.create({
      data: {
        ...createPlanDto,
        userId,
        status: 'IN_PROGRESS',
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.workoutPlan.findMany({
      where: { userId },
      include: {
        WorkoutDay: {
          include: {
            exercises: {
              include: {
                exercise: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number) {
    const plan = await this.prisma.workoutPlan.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        WorkoutDay: {
          include: {
            exercises: {
              include: {
                exercise: true,
              },
            },
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`План з ID ${id} не знайдено`);
    }

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

    // Знаходимо перший день тренування або створюємо новий, якщо немає днів
    let workoutDayId: number;

    if (plan.WorkoutDay && plan.WorkoutDay.length > 0) {
      workoutDayId = plan.WorkoutDay[0].id;
    } else {
      // Створюємо новий день тренування
      const newDay = await this.prisma.workoutDay.create({
        data: {
          workoutPlanId: planId,
          dayNumber: 1,
          name: 'День 1',
        },
      });
      workoutDayId = newDay.id;
    }

    return this.prisma.workoutPlanExercise.create({
      data: {
        exerciseId: dto.exerciseId,
        order: dto.order,
        reps: dto.reps,
        duration: dto.duration,
        restDuration: dto.restDuration,
        workoutPlanId: planId,
        workoutDayId: workoutDayId,
        isCompleted: false,
      },
    });
  }
  async getPlanExercises(planId: number, userId: number) {
    // Перевіряємо, чи існує план і чи належить він користувачу
    const plan = await this.findOne(planId, userId);
    if (!plan) throw new NotFoundException('Workout plan not found');

    // Отримуємо всі вправи для цього плану
    const exercises = await this.prisma.workoutPlanExercise.findMany({
      where: {
        workoutPlanId: planId,
      },
      include: {
        exercise: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return exercises;
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

  async getCalendar(userId: number, month: number, year: number) {
    console.log(
      'Fetching calendar for user:',
      userId,
      'month:',
      month,
      'year:',
      year,
    );

    const plans = await this.prisma.workoutPlan.findMany({
      where: { userId, status: 'IN_PROGRESS' },
      include: {
        WorkoutDay: {
          where: {
            scheduledDate: {
              gte: new Date(year, month - 1, 1),
              lt: new Date(year, month, 1),
            },
          },
          include: { exercises: { include: { exercise: true } } },
        },
      },
    });

    if (!plans.length) {
      const daysInMonth = new Date(year, month, 0).getDate();
      return {
        month,
        year,
        days: Array.from({ length: daysInMonth }, (_, i) => ({
          day: i + 1,
          hasWorkouts: false,
          workouts: [],
        })),
      };
    }

    const calendarDays = [];
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayWorkouts = plans.flatMap((plan) =>
        plan.WorkoutDay.filter((wd) => {
          const wdDate = new Date(wd.scheduledDate || date);
          return (
            wdDate.getDate() === day &&
            wdDate.getMonth() === month - 1 &&
            wdDate.getFullYear() === year
          );
        }).map((wd) => ({
          planId: plan.id,
          dayId: wd.id,
          dayName: wd.name || `Day ${wd.dayNumber}`,
          isCompleted: wd.isCompleted ?? false,
          exercises: wd.exercises.map((e) => ({
            id: e.id,
            name: e.exercise.name,
            isCompleted: e.isCompleted ?? false,
          })),
        })),
      );

      calendarDays.push({
        day,
        hasWorkouts: dayWorkouts.length > 0,
        workouts: dayWorkouts,
      });
    }

    return { month, year, days: calendarDays };
  }

  async markDayAsCompleted(userId: number, planId: number, dayId: number) {
    console.log(
      'Marking day as completed - user:',
      userId,
      'planId:',
      planId,
      'dayId:',
      dayId,
    );
    await this.prisma.workoutDay.update({
      where: { id: dayId, workoutPlanId: planId, workoutPlan: { userId } },
      data: { isCompleted: true, completedAt: new Date() },
    });
  }

  async getWorkoutCalendar(userId: number, month: number, year: number) {
    console.log(
      'Service: Processing calendar request - userId:',
      userId,
      'month:',
      month,
      'year:',
      year,
    );

    const plans = await this.prisma.workoutPlan.findMany({
      where: { userId, status: 'IN_PROGRESS' },
      include: {
        WorkoutDay: {
          where: {
            scheduledDate: {
              gte: new Date(year, month - 1, 1),
              lt: new Date(year, month, 1),
            },
          },
          include: { exercises: { include: { exercise: true } } },
        },
      },
    });

    if (!plans.length) {
      const daysInMonth = new Date(year, month, 0).getDate();
      return {
        month,
        year,
        days: Array.from({ length: daysInMonth }, (_, i) => ({
          day: i + 1,
          hasWorkouts: false,
          workouts: [],
        })),
      };
    }

    const calendarDays = [];
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayWorkouts = plans.flatMap((plan) =>
        plan.WorkoutDay.filter((wd) => {
          const wdDate = new Date(wd.scheduledDate || date);
          return (
            wdDate.getDate() === day &&
            wdDate.getMonth() === month - 1 &&
            wdDate.getFullYear() === year
          );
        }).map((wd) => ({
          planId: plan.id,
          planName: plan.name,
          dayId: wd.id,
          dayName: wd.name || `Day ${wd.dayNumber}`,
          isCompleted: wd.isCompleted ?? false,
          completedAt: wd.completedAt,
          exercisesCount: wd.exercises.length,
          completedExercisesCount: wd.exercises.filter(
            (e) => e.isCompleted ?? false,
          ).length,
        })),
      );

      calendarDays.push({
        day,
        hasWorkouts: dayWorkouts.length > 0,
        workouts: dayWorkouts,
      });
    }

    return { month, year, days: calendarDays };
  }

  async markExerciseAsCompleted(
    planId: number,
    exerciseId: number,
    userId: number,
  ) {
    const plan = await this.prisma.workoutPlan.findUnique({
      where: { id: planId, userId },
      include: { WorkoutDay: { include: { exercises: true } } },
    });
    if (!plan) throw new NotFoundException('Plan not found');
    const exercise = plan.WorkoutDay.flatMap((d) => d.exercises).find(
      (e) => e.id === exerciseId,
    );
    if (!exercise) throw new NotFoundException('Exercise not found');
    return this.prisma.workoutPlanExercise.update({
      where: { id: exerciseId },
      data: { isCompleted: true, completedAt: new Date() },
    });
  }
  private calculateDayDate(startDate: Date, dayNumber: number): Date {
    const date = new Date(startDate);

    // Додаємо (dayNumber - 1) днів до початкової дати
    // Віднімаємо 1, бо перший день (dayNumber = 1) має бути в день startDate
    date.setDate(date.getDate() + (dayNumber - 1));

    return date;
  }

  async generatePlan(
    userId: number,
    dto: { daysPerWeek: number; fitnessGoal: string; startDate?: Date },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const plan = await this.prisma.workoutPlan.create({
      data: {
        userId,
        name: `Plan for ${user.goal || dto.fitnessGoal}`,
        fitnessGoal: user.goal || dto.fitnessGoal,
        startDate: dto.startDate || new Date(),
        status: 'IN_PROGRESS',
      },
    });

    // Отримуємо вправи з включеним exerciseCategory
    const exercises = await this.prisma.exercise.findMany({
      include: { exerciseCategory: true },
    });
    console.log('Total exercises fetched:', exercises.length);

    // Фільтрація вправ залежно від цілі
    let targetExercises = exercises.filter((e) => {
      const category = e.exerciseCategory?.name || '';
      const muscleGroup = e.muscleGroup?.toLowerCase() || '';

      return (
        (dto.fitnessGoal === 'LOSE_WEIGHT' &&
          (category === 'Cardio' ||
            ['ноги', 'грудь', 'спина'].some((mg) =>
              muscleGroup.includes(mg.toLowerCase()),
            ))) ||
        (dto.fitnessGoal === 'GAIN_MUSCLE' &&
          ['грудь', 'спина', 'ноги', 'плечі', 'руки'].some((mg) =>
            muscleGroup.includes(mg.toLowerCase()),
          )) ||
        (dto.fitnessGoal === 'STAY_ACTIVE' &&
          (category === 'Flexibility' ||
            ['ноги', 'корисний суглоб', 'руки'].some((mg) =>
              muscleGroup.includes(mg.toLowerCase()),
            )))
      );
    });
    console.log('Filtered exercises for goal:', targetExercises.length);

    if (targetExercises.length === 0) {
      throw new Error('No exercises found for the specified fitness goal.');
    }

    const intensity = 1.0; // Базова інтенсивність
    const exercisesPerDay = 3; // Кількість вправ на день

    // Генерація днів тренувань з випадковим вибором вправ
    const workoutDays = Array.from({ length: dto.daysPerWeek }, (_, i) => {
      const dayNumber = i + 1;
      const dayName = `Day ${dayNumber}`;
      const scheduledDate = this.calculateDayDate(
        dto.startDate || new Date(),
        dayNumber,
      );

      // Випадковий вибір вправ для дня
      const dayExercises = this.getRandomExercises(
        targetExercises,
        exercisesPerDay,
      );

      return {
        dayNumber,
        name: dayName,
        scheduledDate,
        exercises: {
          createMany: {
            data: dayExercises.map((e, idx) =>
              this.configureExerciseParams(e, idx, dto.fitnessGoal, intensity),
            ),
          },
        },
      };
    });

    for (const day of workoutDays) {
      const createdDay = await this.prisma.workoutDay.create({
        data: {
          workoutPlanId: plan.id,
          dayNumber: day.dayNumber,
          name: day.name,
          scheduledDate: day.scheduledDate,
        },
      });
      await this.prisma.workoutPlanExercise.createMany({
        data: day.exercises.createMany.data.map((ex) => ({
          ...ex,
          workoutPlanId: plan.id,
          workoutDayId: createdDay.id,
        })),
      });
    }

    return this.prisma.workoutPlan.findUnique({
      where: { id: plan.id },
      include: {
        WorkoutDay: { include: { exercises: { include: { exercise: true } } } },
      },
    });
  }

  private configureExerciseParams(
    exercise: any,
    index: number,
    goal: string,
    intensity: number,
  ) {
    if (!exercise || !exercise.id) {
      console.error('Invalid exercise object:', exercise);
      throw new Error('Invalid exercise data');
    }

    // Базові параметри
    const result = {
      exerciseId: exercise.id,
      order: index + 1,
      reps: null,
      duration: null,
      restDuration: null,
    };

    // Налаштовуємо параметри залежно від типу вправи
    if (exercise.exerciseCategory?.name === 'Cardio') {
      // Для кардіо встановлюємо тривалість
      result.duration =
        goal === 'LOSE_WEIGHT'
          ? Math.round(intensity * 60) // Більше для схуднення
          : Math.round(intensity * 30); // Менше для інших цілей
    } else {
      // Для силових вправ встановлюємо повторення
      result.reps = this.calculateReps(intensity, exercise.muscleGroup);
    }

    // Встановлюємо час відпочинку
    result.restDuration = this.calculateRestDuration(intensity, goal);

    return result;
  }

  private calculateReps(intensity: number, muscleGroup: string): number {
    // Базова кількість повторень
    let baseReps = 10;

    // Модифікуємо залежно від групи м'язів
    if (['chest', 'back', 'legs'].includes(muscleGroup)) {
      baseReps = 8; // Менше повторень для великих груп м'язів
    } else if (['arms', 'shoulders'].includes(muscleGroup)) {
      baseReps = 12; // Більше повторень для малих груп м'язів
    } else if (muscleGroup === 'core') {
      baseReps = 15; // Найбільше для кору
    }

    // Модифікуємо залежно від інтенсивності
    return Math.round(baseReps * intensity);
  }

  private calculateRestDuration(intensity: number, goal: string): number {
    // Базовий час відпочинку в секундах
    let baseRest = 60;

    // Модифікуємо залежно від цілі
    if (goal === 'LOSE_WEIGHT') {
      baseRest = 45; // Менше відпочинку для схуднення
    } else if (goal === 'GAIN_MUSCLE') {
      baseRest = 90; // Більше відпочинку для набору маси
    }

    // Модифікуємо залежно від інтенсивності
    return Math.round(baseRest * intensity);
  }

  private getRandomExercises(exercises: any[], count: number): any[] {
    if (!exercises || exercises.length === 0) {
      console.warn('Немає доступних вправ для вибору');
      return [];
    }

    // Якщо вправ менше, ніж потрібно, повертаємо всі доступні
    if (exercises.length <= count) {
      console.log(`Доступно лише ${exercises.length} вправ, повертаємо всі`);
      return [...exercises];
    }

    // Перемішуємо масив вправ
    const shuffled = [...exercises].sort(() => 0.5 - Math.random());

    // Повертаємо потрібну кількість вправ
    return shuffled.slice(0, count);
  }
}
