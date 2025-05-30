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

export interface Exercise {
	id: number
	name: string
	description?: string
	category?: string
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
	description: string
	fitnessGoal: GoalType
	status: PlanStatus
	exercises: PlanExercise[]
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
