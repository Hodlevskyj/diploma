import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ExerciseService } from './exercise.service';

@Controller('exercises')
export class ExerciseController {
  constructor(private exerciseService: ExerciseService) {}

  @Post('sync')
  async syncExercises() {
    return this.exerciseService.syncExercisesFromWger();
  }

  @Get()
  async getAll(
    @Query('muscleGroup') muscleGroup?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.exerciseService.getExercises({
      muscleGroup,
      category,
      search,
      page,
      limit,
    });
  }

  @Get(':id')
  async getById(@Param('id') id: number) {
    try {
      return this.exerciseService.getExerciseById(Number(id));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Exercise with ID ${id} not found`);
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() data: { videoUrl?: string; difficulty?: string },
  ) {
    return this.exerciseService.updateExercise(id, data);
  }
}
