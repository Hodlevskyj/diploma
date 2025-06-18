export enum Role {
	USER = 'USER',
	PREMIUM = 'PREMIUM',
	ADMIN = 'ADMIN',
}

export enum GoalType {
	LOSE_WEIGHT = 'LOSE_WEIGHT',
	GAIN_MUSCLE = 'GAIN_MUSCLE',
	STAY_ACTIVE = 'STAY_ACTIVE',
}

export enum ExerciseType {
	REPS = 'REPS',
	TIME = 'TIME',
}

export enum PlanStatus {
	IN_PROGRESS = 'IN_PROGRESS',
	COMPLETED = 'COMPLETED',
	CANCELLED = 'CANCELLED',
}

export interface User {
	id: number
	name: string
	email: string
	role: Role
	isVerified: boolean
	picture?: string
	height?: number
	weight?: number
	age?: number
	goal?: GoalType
	createdAt: string
	updatedAt: string
}

export interface Exercise {
	id: number
	name: string
	muscleGroup: string
	exerciseCategoryId?: number
	exerciseCategory?: ExerciseCategory
	difficulty?: string
	videoUrl?: string
	description?: string
	equipment?: string
	duration?: number
	reps?: number
	restDuration?: number
	calories?: number
	intensity?: string
	imageUrl?: string
	userId: number
	user: User
	createdAt: string
	updatedAt: string
}
export interface PlanExercise {
	id: number
	exerciseId: number
	order: number
	reps?: number
	duration?: number
	restDuration?: number
	exercise: Exercise
}
export interface Plan {
	id: number
	name: string
	description?: string
	fitnessGoal?: GoalType
	status: PlanStatus
	exercises: PlanExercise[]
	createdAt: string
	updatedAt: string
}
export interface ExerciseCategory {
	id: number
	name: string
	exercises: Exercise[]
	createdAt: string
	updatedAt: string
}

export interface WorkoutPlan {
	id: number
	userId: number
	user: User
	name: string
	description?: string
	fitnessGoal?: GoalType
	status: PlanStatus
	exercises: WorkoutPlanExercise[]
	completions: WorkoutPlanCompletion[]
	schedules: WorkoutPlanSchedule[]
	trackedExercises: TrackedExercise[]
	createdAt: string
	updatedAt: string
}

export interface WorkoutPlanExercise {
	id: number
	workoutPlanId: number
	exerciseId: number
	workoutPlan: WorkoutPlan
	exercise: Exercise
	order: number
	reps?: number
	duration?: number
	restDuration?: number
}

export interface TrackedExercise {
	id: number
	userId: number
	user: User
	exerciseId: number
	exercise: Exercise
	type: ExerciseType
	value: number
	targetValue: number
	completed: boolean
	pauseCount: number
	resetCount: number
	completedAt: string
	workoutPlan?: WorkoutPlan
	workoutPlanId?: number
}

export interface WorkoutPlanCompletion {
	id: number
	workoutPlanId: number
	workoutPlan: WorkoutPlan
	userId: number
	user: User
	completedAt: string
	exercise?: Exercise
	exerciseId?: number
}

export interface WorkoutPlanSchedule {
	id: number
	workoutPlanId: number
	workoutPlan: WorkoutPlan
	date: string
}
export interface CreateWorkoutPlanDto {
	name: string
	description?: string
	fitnessGoal?: GoalType
	exercises?: {
		exerciseId: number
		order: number
		reps?: number
		duration?: number
		restDuration?: number
	}[]
}

export interface UpdateWorkoutPlanDto {
	name?: string
	description?: string
	fitnessGoal?: GoalType
	status?: PlanStatus
}

export interface CreateExerciseDto {
	name: string
	muscleGroup: string
	exerciseCategoryId?: number
	difficulty?: string
	description?: string
	equipment?: string
	videoUrl?: string
	imageUrl?: string
	reps?: number
	duration?: number
	restDuration?: number
	calories?: number
	intensity?: string
}

export interface CreateTrackedExerciseDto {
	exerciseId: number
	type: ExerciseType
	targetValue: number
	workoutPlanId?: number
}

export interface CreatePlanDto {
	name: string
	description?: string
	fitnessGoal?: GoalType
}

export interface UpdatePlanDto {
	name?: string
	description?: string
	fitnessGoal?: GoalType
	status?: PlanStatus
}
export interface AddExerciseDto {
	exerciseId: number
	order: number
	reps?: number
	duration?: number
	restDuration?: number
}

export interface ExerciseProgress {
	type: ExerciseType | 'reps' | 'time'
	targetValue: number
	currentValue: number
	isActive: boolean
}
