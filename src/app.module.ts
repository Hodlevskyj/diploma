import { Module } from '@nestjs/common';
import { ActivitiesModule } from './activities/activities.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { PrismaModule } from './prisma.module';
import { PrismaService } from './prisma.service';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    CloudinaryModule,
    ActivitiesModule,
  ],
  controllers: [AppController, UserController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
