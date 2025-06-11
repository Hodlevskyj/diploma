import { Module } from '@nestjs/common';
import { ActivitiesModule } from './activities/activities.module';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ExerciseModule } from './exercise/exercise.module';
import { FavoritePlanModule } from './favorites/favorite-plan.module';
import { PlanExerciseModule } from './planexercise/planexercise.module';
import { PrismaModule } from './prisma.module';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    CloudinaryModule,
    ActivitiesModule,
    ExerciseModule,
    PlanExerciseModule,
    FavoritePlanModule,
    AdminModule,
  ],
  controllers: [AppController, UserController],
  providers: [AppService],
})
export class AppModule {}
