import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { ExerciseService } from '../exercise/exercise.service';
import { PrismaService } from '../prisma.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [UserModule],
  controllers: [AdminController],
  providers: [ExerciseService, PrismaService, UserService],
})
export class AdminModule {}
