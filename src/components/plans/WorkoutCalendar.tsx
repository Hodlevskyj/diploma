import axios from 'axios'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale'
import {
	Calendar,
	Check,
	ChevronLeft,
	ChevronRight,
	Dumbbell,
	Trophy,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Progress } from '../ui/progress'

interface Workout {
	id: number
	name: string
	isCompleted: boolean
}

interface CalendarDay {
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

interface CalendarData {
	month: number
	year: number
	days: CalendarDay[]
}

export function WorkoutCalendar({ userId }: { userId?: number }) {
	const [date, setDate] = useState(new Date())
	const [calendarData, setCalendarData] = useState<CalendarData | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null)
	const [isDialogOpen, setIsDialogOpen] = useState(false)

	const month = date.getMonth() + 1
	const year = date.getFullYear()

	useEffect(() => {
		const fetchCalendar = async () => {
			setLoading(true)
			setError(null)
			try {
				const response = await axios.get(
					`http://localhost:4000/dashboard/plans/calendar/${month}/${year}`,
					{
						withCredentials: true,
					}
				)
				setCalendarData(response.data)
			} catch (err: unknown) {
				const errorMessage =
					err instanceof Error ? err.message : 'Failed to fetch calendar'
				setError(errorMessage)
			} finally {
				setLoading(false)
			}
		}
		fetchCalendar()
	}, [month, year])

	const handlePrevMonth = () => {
		const newDate = new Date(date)
		newDate.setMonth(date.getMonth() - 1)
		setDate(newDate)
	}

	const handleNextMonth = () => {
		const newDate = new Date(date)
		newDate.setMonth(date.getMonth() + 1)
		setDate(newDate)
	}

	const handleMarkDayComplete = async (planId: number, dayId: number) => {
		try {
			const response = await axios.patch(
				`http://localhost:4000/dashboard/plans/day/${planId}/${dayId}/complete`,
				{},
				{
					withCredentials: true,
				}
			)
			if (response.data.success) {
				setCalendarData(prev => {
					if (!prev) return prev
					return {
						...prev,
						days: prev.days.map(day =>
							day.workouts.some(w => w.dayId === dayId && w.planId === planId)
								? {
										...day,
										workouts: day.workouts.map(w =>
											w.dayId === dayId && w.planId === planId
												? { ...w, isCompleted: true }
												: w
										),
								  }
								: day
						),
					}
				})
				if (
					selectedDay &&
					selectedDay.workouts.some(
						w => w.dayId === dayId && w.planId === planId
					)
				) {
					setSelectedDay(prev => {
						if (!prev) return prev
						return {
							...prev,
							workouts: prev.workouts.map(w =>
								w.dayId === dayId && w.planId === planId
									? { ...w, isCompleted: true }
									: w
							),
						}
					})
				}
			}
		} catch (err: unknown) {
			setError('Failed to mark day as completed')
		}
	}

	const handleDayClick = (dayData: CalendarDay) => {
		if (dayData.hasWorkouts) {
			setSelectedDay(dayData)
			setIsDialogOpen(true)
		}
	}

	const renderDay = (day: number) => {
		if (!calendarData?.days) {
			return (
				<div className='h-20 flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors rounded-md cursor-pointer'>
					<span className='text-sm font-medium'>{day}</span>
				</div>
			)
		}

		const dayData = calendarData.days.find(d => d.day === day)
		const today = new Date()
		const isToday =
			today.getDate() === day &&
			today.getMonth() === month - 1 &&
			today.getFullYear() === year

		if (!dayData || !dayData.hasWorkouts) {
			return (
				<div
					className={`h-20 flex items-center justify-center transition-colors rounded-md cursor-pointer ${
						isToday
							? 'bg-primary/10 border border-primary/20 text-primary font-semibold'
							: 'text-muted-foreground hover:bg-muted/50'
					}`}
				>
					<span className='text-sm font-medium'>{day}</span>
				</div>
			)
		}

		const completedWorkouts = dayData.workouts.filter(w => w.isCompleted).length
		const totalWorkouts = dayData.workouts.length
		const completionPercentage =
			totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0

		return (
			<div
				onClick={() => handleDayClick(dayData)}
				className={`h-20 p-2 transition-all duration-200 rounded-md border cursor-pointer hover:shadow-sm ${
					isToday
						? 'border-primary bg-primary/5 hover:bg-primary/10'
						: completedWorkouts === totalWorkouts
						? 'border-green-200 bg-green-50 hover:bg-green-100'
						: 'border-orange-200 bg-orange-50 hover:bg-orange-100'
				}`}
			>
				<div className='flex flex-col h-full justify-between'>
					<div className='flex items-center justify-between'>
						<span
							className={`text-sm font-semibold ${
								isToday
									? 'text-primary'
									: completedWorkouts === totalWorkouts
									? 'text-green-700'
									: 'text-orange-700'
							}`}
						>
							{day}
						</span>
						{completedWorkouts === totalWorkouts && (
							<Check className='h-3 w-3 text-green-600' />
						)}
					</div>

					<div className='space-y-1'>
						<div className='flex items-center gap-1'>
							<Dumbbell className='h-3 w-3 text-muted-foreground' />
							<span className='text-xs text-muted-foreground'>
								{completedWorkouts}/{totalWorkouts}
							</span>
						</div>
						<Progress value={completionPercentage} className='h-1' />
					</div>
				</div>
			</div>
		)
	}

	const getMonthStats = () => {
		if (!calendarData?.days) return { completed: 0, total: 0, percentage: 0 }

		const total = calendarData.days.reduce(
			(acc, day) => acc + day.workouts.length,
			0
		)
		const completed = calendarData.days.reduce(
			(acc, day) => acc + day.workouts.filter(w => w.isCompleted).length,
			0
		)

		return {
			completed,
			total,
			percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
		}
	}

	const stats = getMonthStats()

	if (error) {
		return (
			<Card className='w-full border-destructive/20 bg-destructive/5'>
				<CardContent className='p-6'>
					<div className='flex items-center gap-3 text-destructive mb-4'>
						<div className='h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center'>
							<Calendar className='h-5 w-5' />
						</div>
						<div>
							<h3 className='font-semibold'>Помилка завантаження</h3>
							<p className='text-sm text-muted-foreground'>{error}</p>
						</div>
					</div>
					<Button
						onClick={() => window.location.reload()}
						variant='destructive'
					>
						Спробувати ще раз
					</Button>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className='w-full space-y-6'>
			{/* Statistics Card */}
			<Card>
				<CardContent className='p-6'>
					<div className='flex items-center justify-between p-5'>
						<div className='flex items-center gap-4'>
							<div className='h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center'>
								<Trophy className='h-6 w-6 text-primary' />
							</div>
							<div>
								<h3 className='font-semibold text-foreground'>
									Прогрес місяця
								</h3>
								<p className='text-sm text-muted-foreground'>
									Виконано {stats.completed} з {stats.total} тренувань
								</p>
							</div>
						</div>
						<div className='text-right space-y-2'>
							<div className='text-3xl font-bold text-primary'>
								{stats.percentage}%
							</div>
							<Progress value={stats.percentage} className='w-24' />
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Calendar Card */}
			<Card>
				<CardHeader>
					<div className='flex items-center justify-between'>
						<CardTitle className='flex items-center gap-2'>
							<Calendar className='h-5 w-5' />
							Календар тренувань
						</CardTitle>
						<div className='flex items-center space-x-2'>
							<Button variant='outline' size='icon' onClick={handlePrevMonth}>
								<ChevronLeft className='h-4 w-4' />
							</Button>
							<div className='font-semibold min-w-[140px] text-center'>
								{format(date, 'LLLL yyyy', { locale: uk })}
							</div>
							<Button variant='outline' size='icon' onClick={handleNextMonth}>
								<ChevronRight className='h-4 w-4' />
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className='space-y-4'>
							<div className='grid grid-cols-7 gap-2'>
								{Array.from({ length: 42 }, (_, i) => (
									<div
										key={i}
										className='h-20 bg-muted animate-pulse rounded-md'
									></div>
								))}
							</div>
						</div>
					) : (
						<div className='grid grid-cols-7 gap-2'>
							{['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map(dayName => (
								<div
									key={dayName}
									className='text-center py-2 text-sm font-medium text-muted-foreground'
								>
									{dayName}
								</div>
							))}
							{calendarData?.days &&
								Array.from(
									{ length: (new Date(year, month - 1, 1).getDay() + 6) % 7 },
									(_, i) => <div key={`empty-${i}`} className='h-20'></div>
								)}
							{calendarData?.days &&
								calendarData.days.map(day => (
									<div key={day.day}>{renderDay(day.day)}</div>
								))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Day Details Dialog */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle className='flex items-center gap-2'>
							<Calendar className='h-5 w-5' />
							{selectedDay &&
								`${selectedDay.day} ${format(date, 'LLLL yyyy', {
									locale: uk,
								})} `}
						</DialogTitle>
					</DialogHeader>

					{selectedDay && (
						<div className='space-y-4'>
							{selectedDay.workouts.map((workout, workoutIndex) => (
								<Card
									key={`${workout.planId}-${workout.dayId}`}
									className='border-l-4 border-l-primary'
								>
									<CardHeader className='pb-3'>
										<div className='flex items-center justify-between'>
											<CardTitle className='text-lg'>
												{workout.dayName}
											</CardTitle>
											<div className='flex items-center gap-2'>
												<Badge
													variant={
														workout.isCompleted ? 'default' : 'secondary'
													}
												>
													{workout.isCompleted ? 'Виконано' : 'Не виконано'}
												</Badge>
												{!workout.isCompleted && (
													<Button
														size='sm'
														onClick={() =>
															handleMarkDayComplete(
																workout.planId,
																workout.dayId
															)
														}
														className='h-8'
													>
														<Check className='h-4 w-4 mr-1' />
														Відмітити
													</Button>
												)}
											</div>
										</div>
									</CardHeader>
									<CardContent>
										<div className='space-y-2'>
											<h4 className='font-medium text-sm text-muted-foreground mb-3'>
												Вправи (
												{workout.exercises.filter(e => e.isCompleted).length}/
												{workout.exercises.length}):
											</h4>
											{workout.exercises.map(exercise => (
												<div
													key={exercise.id}
													className='flex items-center justify-between p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors'
												>
													<div className='flex items-center gap-3'>
														<div
															className={`h-2 w-2 rounded-full ${
																exercise.isCompleted
																	? 'bg-green-500'
																	: 'bg-orange-400'
															}`}
														/>
														<span className='font-medium'>{exercise.name}</span>
													</div>
													<Badge
														variant={
															exercise.isCompleted ? 'default' : 'outline'
														}
													>
														{exercise.isCompleted ? 'Виконано' : 'Очікує'}
													</Badge>
												</div>
											))}
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	)
}
