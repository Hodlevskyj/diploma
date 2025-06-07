import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExerciseService } from '../exercise/exercise.service';
import { CreateExerciseDto } from '../planexercise/plansexercise.dto';
import { PrismaService } from '../prisma.service';
import { AdminGuard } from './admin.guard';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly exerciseService: ExerciseService,
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  @Get()
  getRoot(@Request() req) {
    console.log('Reached /admin endpoint with user:', req.user);
    return 'admin root';
  }

  @Post('exercises')
  async createExercise(@Body() dto: CreateExerciseDto, @Request() req) {
    return this.exerciseService.createExercise(req.user.id, dto);
  }

  @Get('users/count')
  async getUserCount() {
    const count = await this.prisma.user.count();
    return { count };
  }

  @Get('users')
  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
  }

  @Delete(':id')
  async deleteUserById(@Param('id', ParseIntPipe) id: number, @Request() req) {
    if (req.user.id === id) {
      throw new ForbiddenException(
        'Адміністратор не може видалити свій обліковий запис',
      );
    }

    return this.userService.deleteUser(id);
  }

  @Post('users/:id/role')
  async updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: Role,
    @Request() req,
  ) {
    if (req.user.id === id) {
      throw new ForbiddenException('Адміністратор не може змінити свою роль');
    }

    return this.userService.updateUserRole(id, role);
  }
}
