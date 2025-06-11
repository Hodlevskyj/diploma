import { IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator';

export enum GoalType {
  LOSE_WEIGHT = 'LOSE_WEIGHT',
  GAIN_MUSCLE = 'GAIN_MUSCLE',
  STAY_ACTIVE = 'STAY_ACTIVE',
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
  @IsEnum(GoalType)
  fitnessGoal: GoalType;

  @IsNumber()
  @Min(1)
  @Max(7)
  daysPerWeek: number;

  @IsOptional()
  @IsNumber()
  preferredDuration?: number; // в хвилинах
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
