import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WorkoutDay, WorkoutPlan } from '@/types/planexercise'
import { Clock, Dumbbell, Play } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface PlanDayViewProps {
	plan: WorkoutPlan
	onCompleteExercise?: (exerciseId: number) => void
}

export function PlanDayView({ plan, onCompleteExercise }: PlanDayViewProps) {
	const [activeDay, setActiveDay] = useState<string>(
		plan.WorkoutDay && plan.WorkoutDay.length > 0
			? String(plan.WorkoutDay[0].dayNumber)
			: '1'
	)

	// Сортуємо дні за номером
	const sortedDays = [...(plan.WorkoutDay || [])].sort(
		(a, b) => a.dayNumber - b.dayNumber
	)

	if (!sortedDays.length) {
		return (
			<Card>
				<CardContent className='pt-6'>
					<p className='text-center text-muted-foreground'>
						У цьому плані ще немає днів тренування
					</p>
				</CardContent>
			</Card>
		)
	}

	// Функція для розрахунку загальної тривалості тренування
	const calculateTotalDuration = (day: WorkoutDay) => {
		return day.exercises.reduce((total, ex) => {
			const exerciseDuration = ex.duration || 0
			const restDuration = ex.restDuration || 0
			return total + exerciseDuration + restDuration
		}, 0)
	}

	// Форматування тривалості в хвилини
	const formatDuration = (seconds: number) => {
		const minutes = Math.round(seconds / 60)
		return `${minutes} хв`
	}

	return (
		<div className='space-y-4'>
			<Tabs value={activeDay} onValueChange={setActiveDay} className='w-full'>
				<TabsList className='mb-4 w-full justify-start overflow-x-auto'>
					{sortedDays.map(day => (
						<TabsTrigger key={day.dayNumber} value={String(day.dayNumber)}>
							{day.name || `День ${day.dayNumber}`}
						</TabsTrigger>
					))}
				</TabsList>

				{sortedDays.map(day => (
					<TabsContent key={day.dayNumber} value={String(day.dayNumber)}>
						<Card>
							<CardHeader>
								<div className='flex items-center justify-between'>
									<CardTitle>{day.name || `День ${day.dayNumber}`}</CardTitle>
									<div className='flex items-center text-sm text-muted-foreground'>
										<Clock className='mr-1 h-4 w-4' />
										{formatDuration(calculateTotalDuration(day))}
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									{day.exercises.length === 0 ? (
										<p className='text-center text-muted-foreground py-4'>
											На цей день ще не додано вправ
										</p>
									) : (
										day.exercises
											.sort((a, b) => a.order - b.order)
											.map(exercise => (
												<div
													key={exercise.id}
													className='flex items-center justify-between p-4 border rounded-lg'
												>
													<div className='flex items-center gap-4'>
														<div className='bg-primary/10 p-3 rounded-full'>
															<Dumbbell className='h-5 w-5 text-primary' />
														</div>
														<div>
															<h3 className='font-medium'>
																{exercise.exercise?.name || 'Вправа'}
															</h3>
															<div className='flex flex-wrap gap-2 mt-1'>
																{exercise.reps && (
																	<span className='text-xs bg-secondary/20 px-2 py-1 rounded'>
																		{exercise.reps} повторень
																	</span>
																)}
																{exercise.duration && (
																	<span className='text-xs bg-secondary/20 px-2 py-1 rounded flex items-center'>
																		<Clock className='h-3 w-3 mr-1' />
																		{Math.round(exercise.duration / 60)} хв
																	</span>
																)}
																{exercise.restDuration && (
																	<span className='text-xs bg-secondary/20 px-2 py-1 rounded'>
																		Відпочинок: {exercise.restDuration} сек
																	</span>
																)}
															</div>
														</div>
													</div>
													<div className='flex gap-2'>
														{onCompleteExercise && (
															<Button
																variant='outline'
																size='sm'
																onClick={() =>
																	onCompleteExercise(exercise.exerciseId)
																}
															>
																Виконано
															</Button>
														)}
													</div>
												</div>
											))
									)}
								</div>

								<div className='mt-6 flex justify-end'>
									<Link href={`/dashboard/plans/${plan.id}/run`}>
										<Button className='flex items-center'>
											<Play className='mr-2 h-4 w-4' />
											Почати тренування
										</Button>
									</Link>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				))}
			</Tabs>
		</div>
	)
}
