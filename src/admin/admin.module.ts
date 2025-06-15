import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma.module';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ExerciseService } from '../exercise/exercise.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [UserModule, PrismaModule],
  controllers: [AdminController],
  providers: [ExerciseService, PrismaService, UserService],
})
export class AdminModule {}
