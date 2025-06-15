import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export enum GoalType {
  LOSE_WEIGHT = 'LOSE_WEIGHT',
  GAIN_MUSCLE = 'GAIN_MUSCLE',
  STAY_ACTIVE = 'STAY_ACTIVE',
}

export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum EquipmentType {
  NONE = 'NONE',
  MINIMAL = 'MINIMAL',
  HOME_GYM = 'HOME_GYM',
  FULL_GYM = 'FULL_GYM',
}

export class CreateWorkoutPlanDto {
  name: string;
  description?: string;
  fitnessGoal?: string;
}

export class UpdateWorkoutPlanDto {
  name?: string;
  description?: string;
  fitnessGoal?: string;
}

// export class GeneratePlanDto {
//   fitnessGoal: GoalType;
//   daysPerWeek: number;
// }

export class GeneratePlanDto {
  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsEnum(GoalType)
  fitnessGoal: GoalType;

  @IsNumber()
  @Min(1)
  @Max(7)
  daysPerWeek: number;

  @IsOptional()
  @IsNumber()
  preferredDuration?: number; // в хвилинах

  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficultyLevel?: DifficultyLevel = DifficultyLevel.INTERMEDIATE;

  @IsOptional()
  @IsEnum(EquipmentType)
  equipmentType?: EquipmentType = EquipmentType.MINIMAL;

  @IsOptional()
  startDate?: Date;
}

export class CreateWorkoutDayDto {
  dayNumber: number;
  name?: string;
}

export class CreateWorkoutPlanExerciseDto {
  exerciseId: number;
  order: number;
  reps?: number;
  duration?: number;
  restDuration?: number;
}

export class CalendarQueryDto {
  @Type(() => Number)
  @IsInt({ message: 'Month must be an integer' })
  @Min(1, { message: 'Month must be at least 1' })
  @Max(12, { message: 'Month must be at most 12' })
  month: number;

  @Type(() => Number)
  @IsInt({ message: 'Year must be an integer' })
  @Min(2000, { message: 'Year must be at least 2000' })
  @Max(2100, { message: 'Year must be at most 2100' })
  year: number;
}
