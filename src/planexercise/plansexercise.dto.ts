import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum GoalType {
  LOSE_WEIGHT = 'LOSE_WEIGHT',
  GAIN_MUSCLE = 'GAIN_MUSCLE',
  STAY_ACTIVE = 'STAY_ACTIVE',
  // FLEXIBILITY = 'FLEXIBILITY',
}

export enum PlanStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsEnum(GoalType)
  fitnessGoal?: GoalType = GoalType.LOSE_WEIGHT;
}

export class UpdatePlanDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(GoalType)
  @IsOptional()
  fitnessGoal?: GoalType;

  @IsOptional()
  @IsEnum(PlanStatus)
  status?: PlanStatus;
}

export class AddExerciseToPlanDto {
  @IsNumber()
  @Min(1)
  exerciseId: number;

  @IsNumber()
  @Min(0)
  order: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  reps?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  duration?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  restDuration?: number;
}

export class UpdateExerciseInPlanDto {
  @IsNumber()
  @IsOptional()
  @Min(0)
  order?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  reps?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  duration?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  restDuration?: number;
}
