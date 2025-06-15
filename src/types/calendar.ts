export interface Workout {
	id: number
	name: string
	isCompleted: boolean
}

export interface CalendarDay {
	day: number
	hasWorkouts: boolean
	workouts: {
		planId: number
		dayId: number
		dayName: string
		isCompleted: boolean
		exercises: Workout[]
	}[]
}

export interface CalendarData {
	month: number
	year: number
	days: CalendarDay[]
}
