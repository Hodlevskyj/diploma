import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: { name: string; email: string; password: string }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    return this.prisma.user.create({
      data: {
        ...data,
        role: Role.USER, // роль за замовчуванням - USER
      },
    });
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async verifyUser(email: string) {
    return this.prisma.user.update({
      where: { email },
      data: { isVerified: true },
    });
  }

  async deleteUser(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          Activity: true,
          WorkoutPlan: true,
          WorkoutCompletion: true,
          TrackedExercise: true,
          Exercise: true,
          FavoriteExercise: true,
          FavoritePlan: true,
        },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      if (user.role === Role.ADMIN) {
        throw new Error('Cannot delete admin user');
      }

      // Delete all related data in a transaction
      await this.prisma.$transaction(async (tx) => {
        // Delete favorites first (no dependencies)
        await tx.favoriteExercise.deleteMany({
          where: { userId: id },
        });
        console.log(
          `Deleted ${await tx.favoriteExercise.count({ where: { userId: id } })} favorite exercises`,
        );

        await tx.favoritePlan.deleteMany({
          where: { userId: id },
        });
        console.log(
          `Deleted ${await tx.favoritePlan.count({ where: { userId: id } })} favorite plans`,
        );

        await tx.activity.deleteMany({
          where: { userId: id },
        });
        console.log(
          `Deleted ${await tx.activity.count({ where: { userId: id } })} activities`,
        );

        await tx.trackedExercise.deleteMany({
          where: { userId: id },
        });
        console.log(
          `Deleted ${await tx.trackedExercise.count({ where: { userId: id } })} tracked exercises`,
        );

        await tx.workoutPlanCompletion.deleteMany({
          where: { userId: id },
        });
        console.log(
          `Deleted ${await tx.workoutPlanCompletion.count({ where: { userId: id } })} workout completions`,
        );

        for (const plan of user.WorkoutPlan) {
          await tx.workoutDay.deleteMany({
            where: { workoutPlanId: plan.id },
          });
          console.log(
            `Deleted ${await tx.workoutDay.count({ where: { workoutPlanId: plan.id } })} workout days`,
          );

          await tx.workoutPlanExercise.deleteMany({
            where: { workoutPlanId: plan.id },
          });
          console.log(
            `Deleted ${await tx.workoutPlanExercise.count({ where: { workoutPlanId: plan.id } })} plan exercises`,
          );

          await tx.workoutPlanSchedule.deleteMany({
            where: { workoutPlanId: plan.id },
          });
          console.log(
            `Deleted ${await tx.workoutPlanSchedule.count({ where: { workoutPlanId: plan.id } })} schedules`,
          );
        }

        await tx.workoutPlan.deleteMany({
          where: { userId: id },
        });
        console.log(
          `Deleted ${await tx.workoutPlan.count({ where: { userId: id } })} workout plans`,
        );

        await tx.exercise.deleteMany({
          where: { userId: id },
        });
        console.log(
          `Deleted ${await tx.exercise.count({ where: { userId: id } })} exercises`,
        );

        await tx.user.delete({
          where: { id },
        });
        console.log(`Deleted user with ID ${id}`);
      });

      return { message: 'User deleted successfully' };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async updateUserRole(id: number, role: Role) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }
}
