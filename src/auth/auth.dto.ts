import { GoalType } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
export class RegisterDto {
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;
}

export class UpdateFitnessDto {
  @IsOptional()
  @IsInt()
  height: number;

  @IsOptional()
  @IsInt()
  weight: number;

  @IsOptional()
  @IsInt()
  age: number;

  @IsOptional()
  @IsEnum(GoalType)
  goal: GoalType;
}
