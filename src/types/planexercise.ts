export type ExerciseCategory = {
	id: number
	name: string
	createdAt: string
	updatedAt: string
}

export type Exercise = {
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

export type WorkoutPlanExercise = {
	id: number
	workoutPlanId: number
	exerciseId: number
	order: number
	reps?: number | null
	duration?: number | null
	restDuration?: number | null
	exercise: Exercise
}

export interface PlanExercise {
	id: number
	exerciseId: number
	exercise: Exercise
	order: number
	reps?: number
	duration?: number // в секундах
	restDuration?: number // в секундах
}

export interface WorkoutDay {
	id: number
	dayNumber: number
	name?: string
	exercises: PlanExercise[]
}

export interface WorkoutPlan {
	id: number
	name: string
	description?: string
	fitnessGoal?: GoalType
	status: PlanStatus
	createdAt: string
	updatedAt: string
	exercises: WorkoutPlanExercise[]
	WorkoutDay?: WorkoutDay[]
	progress?: {
		total: number
		completed: number
		percentage: number
	}
}

export interface TrackedExercise {
	id: number
	exerciseId: number
	workoutPlanId: number
	completed: boolean
	reps?: number
	duration?: number
	completedAt: string
	exercise: Exercise
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

export interface PlanExercise {
	id: number
	exerciseId: number
	order: number
	reps?: number
	duration?: number
	restDuration?: number
	exercise: Exercise
}

export interface WorkoutDay {
	id: number
	dayNumber: number
	name?: string
	exercises: PlanExercise[]
}

export interface Plan {
	id: number
	name: string
	description: string
	fitnessGoal: GoalType
	status: PlanStatus
	exercises: PlanExercise[]
	WorkoutDay?: WorkoutDay[]
	createdAt: string
	updatedAt: string
}

export interface UpdatePlanDto {
	name?: string
	description?: string
	fitnessGoal?: GoalType
	status?: PlanStatus
}

export interface CreatePlanDto {
	name: string
	description: string
	fitnessGoal: GoalType
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
