import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ActivitiesService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async syncUserActivities(userId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.stravaAccessToken) {
      throw new Error('No Strava token for user');
    }

    const response = await firstValueFrom(
      this.httpService.get('https://www.strava.com/api/v3/athlete/activities', {
        headers: {
          Authorization: `Bearer ${user.stravaAccessToken}`,
        },
        params: {
          per_page: 10,
          page: 1,
        },
      }),
    );

    const activities = response.data;

    for (const activity of activities) {
      await this.prisma.activity.upsert({
        where: { stravaId: String(activity.id) },
        update: {
          name: activity.name,
          distance: activity.distance,
          duration: activity.elapsed_time,
          type: activity.type,
          startDate: new Date(activity.start_date),
          polyline: activity.map?.summary_polyline ?? null,
          calories: activity.calories ?? null,
          averageSpeed: activity.average_speed ?? null,
          maxSpeed: activity.max_speed ?? null,
          totalElevationGain: activity.total_elevation_gain ?? null,
          averageHeartrate: activity.average_heartrate ?? null,
        },
        create: {
          stravaId: String(activity.id),
          userId,
          name: activity.name,
          distance: activity.distance,
          duration: activity.elapsed_time,
          type: activity.type,
          startDate: new Date(activity.start_date),
          polyline: activity.map?.summary_polyline ?? null,
          calories: activity.calories ?? null,
          averageSpeed: activity.average_speed ?? null,
          maxSpeed: activity.max_speed ?? null,
          totalElevationGain: activity.total_elevation_gain ?? null,
          averageHeartrate: activity.average_heartrate ?? null,
        },
      });
    }
  }

  async getUserActivities(userId: number) {
    return this.prisma.activity.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
    });
  }

  async getUserStats(userId: number) {
    const activities = await this.prisma.activity.findMany({
      where: { userId },
    });

    const totalDistance = activities.reduce(
      (sum, a) => sum + (a.distance || 0),
      0,
    );
    const totalDuration = activities.reduce(
      (sum, a) => sum + (a.duration || 0),
      0,
    );
    const totalCalories = activities.reduce(
      (sum, a) => sum + (a.calories || 0),
      0,
    );
    const activityCount = activities.length;

    const byType = activities.reduce((acc, a) => {
      acc[a.type] = acc[a.type] || { count: 0, distance: 0 };
      acc[a.type].count += 1;
      acc[a.type].distance += a.distance || 0;
      return acc;
    }, {});

    return {
      totalDistance: (totalDistance / 1000).toFixed(2),
      totalDuration: Math.round(totalDuration / 60),
      totalCalories,
      activityCount,
      averageDistance: activityCount
        ? (totalDistance / 1000 / activityCount).toFixed(2)
        : 0,
      byType,
    };
  }
}
