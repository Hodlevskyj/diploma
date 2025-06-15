export enum GoalType {
	LOSE_WEIGHT = 'LOSE_WEIGHT',
	GAIN_MUSCLE = 'GAIN_MUSCLE',
	STAY_ACTIVE = 'STAY_ACTIVE',
}

export enum PlanStatus {
	IN_PROGRESS = 'IN_PROGRESS',
	COMPLETED = 'COMPLETED',
	CANCELLED = 'CANCELLED',
}

export enum ExerciseType {
	REPS = 'REPS',
	TIME = 'TIME',
}

export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
export type EquipmentType = 'NONE' | 'MINIMAL' | 'HOME_GYM' | 'FULL_GYM'

export interface ExerciseCategory {
	id: number
	name: string
	createdAt: string
	updatedAt: string
}

export interface Exercise {
	id: number
	name: string
	muscleGroup: string
	exerciseCategory?: ExerciseCategory | null
	exerciseCategoryId?: number | null
	difficulty?: string | null
	videoUrl?: string | null
	description?: string | null
	equipment?: string | null
	duration?: number | null
	reps?: number | null
	restDuration?: number | null
	calories?: number | null
	intensity?: string | null
	imageUrl?: string | null
	createdAt: string
	updatedAt: string
	userId: number
}

export interface WorkoutPlanExercise {
	id: number
	workoutPlanId: number
	exerciseId: number
	order: number
	reps?: number | null
	duration?: number | null
	restDuration?: number | null
	exercise: Exercise
	workoutDayId?: number | null
}

export interface WorkoutDay {
	id: number
	workoutPlanId: number
	dayNumber: number
	name?: string | null
	exercises: WorkoutPlanExercise[]
}

export interface WorkoutPlan {
	id: number
	userId: number
	name: string
	description?: string | null
	fitnessGoal?: GoalType | null
	status: PlanStatus
	createdAt: string
	updatedAt: string
	WorkoutDay?: WorkoutDay[]
	exercises?: WorkoutPlanExercise[]
	progress?: {
		total: number
		completed: number
		percentage: number
	}
}

// DTO інтерфейси для API запитів
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

export interface CreateExerciseDto {
	name: string
	muscleGroup: string
	description?: string
	difficulty?: string
	equipment?: string
	exerciseCategoryId?: number
	reps?: number
	duration?: number
	restDuration?: number
	imageUrl?: string
	videoUrl?: string
}

export interface GeneratePlanFormData {
	fitnessGoal: GoalType
	daysPerWeek: number
	preferredDuration?: number
	height?: number
	weight?: number
	age?: number
	difficultyLevel: DifficultyLevel
	equipmentType: EquipmentType
}

export interface ExerciseProgress {
	type: ExerciseType | 'reps' | 'time'
	targetValue: number
	currentValue: number
	isActive: boolean
}

export interface TrackedExercise {
	id: number
	userId: number
	exerciseId: number
	type: string
	value: number
	targetValue: number
	completed: boolean
	pauseCount: number
	resetCount: number
	completedAt: string
}

export interface FavoriteExercise {
	id: number
	userId: number
	exerciseId: number
	exercise: Exercise
	createdAt: string
}

export interface FavoritePlan {
	id: number
	userId: number
	planId: number
	plan: {
		id: number
		name: string
		description: string
		fitnessGoal: string
		exercises: Array<{
			id: number
			exercise: {
				id: number
				name: string
				muscleGroup: string
				imageUrl: string
			}
		}>
	}
	createdAt: string
}
