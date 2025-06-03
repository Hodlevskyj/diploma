import { GoalType, PlanStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(GoalType)
  fitnessGoal?: GoalType;

  @IsOptional()
  @IsEnum(PlanStatus)
  status?: PlanStatus;
}
