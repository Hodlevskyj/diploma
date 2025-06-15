'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ExerciseType } from '@/types/planexercise'
import { debounce } from 'lodash'
import {
	ArrowLeft,
	BarChart3,
	CheckCircle2,
	Clock,
	Coffee,
	Dumbbell,
	Flame,
	Loader2,
	Pause,
	Play,
	RotateCcw,
	Settings,
	Square,
	Target,
	Timer,
	Users,
	XCircle,
	Zap,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import ReactPlayer from 'react-player'
import { toast, ToastContainer } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import {
	Exercise,
	ExerciseProgress,
	TrackedExercise,
} from '../../types/planexercise'
import ExerciseCounter from './ExerciseCounter'
import ExerciseSettings from './ExerciseSettings'
import ExerciseTimer from './ExerciseTimer'

export default function ExerciseDetail({ id }: { id: string }) {
	const { user, loading: authLoading } = useAuth()
	const [exercise, setExercise] = useState<Exercise | null>(null)
	const [progressHistory, setProgressHistory] = useState<TrackedExercise[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const [isRunning, setIsRunning] = useState(false)
	const [isPaused, setIsPaused] = useState(false)
	const [pauseCount, setPauseCount] = useState(0)
	const [resetCount, setResetCount] = useState(0)
	const [isSaving, setIsSaving] = useState(false)
	const [isFinished, setIsFinished] = useState(false)
	const [remainingTime, setRemainingTime] = useState(0)
	const [isFavorite, setIsFavorite] = useState(false)
	const [isVideoPlaying, setIsVideoPlaying] = useState(false)

	const router = useRouter()
	const playerRef = useRef<ReactPlayer>(null)

	const [progress, setProgress] = useState<ExerciseProgress>({
		type: 'reps',
		targetValue: 10,
		currentValue: 0,
		isActive: false,
	})

	useEffect(() => {
		const fetchExercise = async () => {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/exercises/${id}`,
					{ credentials: 'include' }
				)
				if (!res.ok) throw new Error('Не вдалося завантажити вправу')
				const data = await res.json()
				setExercise(data)
				setProgress({
					type: data.duration ? 'time' : 'reps',
					targetValue: data.duration || 10,
					currentValue: 0,
					isActive: false,
				})
				setRemainingTime(data.duration || 0)
			} catch (err: any) {
				setError(err.message)
			} finally {
				setLoading(false)
			}
		}

		const fetchProgressHistory = async () => {
			if (!user) return
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/exercises/progress/${user.id}`,
					{ credentials: 'include' }
				)
				if (!res.ok) throw new Error('Не вдалося завантажити історію прогресу')
				const data = await res.json()
				console.log('Progress History Data:', data)
				const filteredHistory = data.filter(
					(entry: TrackedExercise) => entry.exerciseId === Number(id)
				)
				setProgressHistory(filteredHistory)
			} catch (err: any) {
				console.error('Error fetching progress history:', err)
			}
		}

		if (!authLoading && user) {
			fetchExercise()
			fetchProgressHistory()
		}
	}, [id, authLoading, user])

	useEffect(() => {
		let interval: NodeJS.Timeout
		if (
			isRunning &&
			!isPaused &&
			progress.type === 'time' &&
			remainingTime > 0
		) {
			interval = setInterval(() => {
				setRemainingTime(prev => {
					if (prev <= 1) {
						setIsRunning(false)
						setTimeout(() => {
							debouncedHandleStop()
						}, 100)
						return 0
					}
					return prev - 1
				})
			}, 1000)
		}
		return () => clearInterval(interval)
	}, [isRunning, isPaused, remainingTime, progress.type])

	const handleStart = useCallback(() => {
		setIsRunning(true)
		setIsPaused(false)
		setPauseCount(0)
		setResetCount(0)
		setIsSaving(false)
		setIsFinished(false)
		setRemainingTime(progress.targetValue)
		if (playerRef.current) {
			playerRef.current.seekTo(0)
		}
	}, [progress])

	const handlePause = useCallback(() => {
		setIsPaused(true)
		setPauseCount(prev => prev + 1)
		playerRef.current?.getInternalPlayer()?.pauseVideo?.()
	}, [])

	const handleResume = useCallback(() => {
		setIsPaused(false)
		playerRef.current?.getInternalPlayer()?.playVideo?.()
	}, [])

	const handleReset = useCallback(() => {
		setRemainingTime(progress.targetValue)
		setIsRunning(false)
		setIsPaused(false)
		setIsSaving(false)
		setIsFinished(false)
		setResetCount(prev => prev + 1)
		setProgress((prev: any) => ({ ...prev, currentValue: 0 }))
		if (playerRef.current) {
			playerRef.current.seekTo(0)
		}
	}, [progress])

	const handleStop = useCallback(async () => {
		if (isSaving || !user || isFinished) return

		setIsRunning(false)
		setIsPaused(false)
		setIsSaving(true)
		setIsFinished(true)

		playerRef.current?.getInternalPlayer()?.pauseVideo?.()

		try {
			let elapsedTime: number
			let completed: boolean

			if (progress.type === 'time') {
				elapsedTime = progress.targetValue
				completed = true
			} else {
				elapsedTime = progress.currentValue
				completed = progress.currentValue >= progress.targetValue
			}

			if (!completed && progress.type === 'reps') {
				toast.info('Вправа не завершена. Завершіть усі повторення.')
				setIsFinished(false)
				setIsSaving(false)
				return
			}

			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/exercises/track`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						userId: user.id,
						exerciseId: Number(id),
						type: progress.type,
						value: elapsedTime,
						targetValue: progress.targetValue,
						completed,
						pauseCount,
						resetCount,
					}),
					credentials: 'include',
				}
			)

			if (!res.ok) {
				const errorData = await res.json()
				throw new Error(`Не вдалося зберегти результат: ${errorData.message}`)
			}

			toast.success('Виконання вправи збережено!')

			const historyRes = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/exercises/progress/${user.id}`,
				{ credentials: 'include' }
			)
			if (!historyRes.ok) {
				throw new Error('Не вдалося оновити історію прогресу')
			}
			const updatedHistory = await historyRes.json()
			const filteredHistory = updatedHistory.filter(
				(entry: TrackedExercise) => entry.exerciseId === Number(id)
			)
			setProgressHistory(filteredHistory)
		} catch (err: any) {
			toast.error(`Помилка при збереженні: ${err.message}`)
			console.error('Помилка в handleStop:', err)
		} finally {
			setIsSaving(false)
		}
	}, [
		isSaving,
		user,
		isFinished,
		progress,
		remainingTime,
		id,
		pauseCount,
		resetCount,
	])

	const debouncedHandleStop = useCallback(debounce(handleStop, 500), [
		handleStop,
	])

	const handleSettingsChange = (settings: ExerciseProgress) => {
		setProgress(settings)
		handleReset()
	}

	if (authLoading || loading) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-background'>
				<div className='text-center space-y-4'>
					<Loader2 className='h-8 w-8 animate-spin mx-auto text-primary' />
					<p className='text-muted-foreground'>Завантаження...</p>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-background'>
				<Card className='max-w-md mx-4'>
					<CardContent className='pt-6'>
						<div className='text-center space-y-4'>
							<div className='w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto'>
								<XCircle className='h-6 w-6 text-destructive' />
							</div>
							<div className='space-y-2'>
								<h3 className='font-semibold'>Помилка</h3>
								<p className='text-sm text-muted-foreground'>{error}</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	if (!user) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-background'>
				<Card className='max-w-md mx-4'>
					<CardContent className='pt-6'>
						<div className='text-center space-y-4'>
							<div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto'>
								<Users className='h-6 w-6 text-primary' />
							</div>
							<div className='space-y-2'>
								<h3 className='font-semibold'>Необхідна авторизація</h3>
								<p className='text-sm text-muted-foreground'>
									Увійдіть, щоб переглянути вправу
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	const getDifficultyVariant = (difficulty: string) => {
		switch (difficulty?.toLowerCase()) {
			case 'легкий':
			case 'легка':
				return 'default'
			case 'середній':
			case 'середня':
				return 'secondary'
			case 'важкий':
			case 'важка':
				return 'destructive'
			default:
				return 'outline'
		}
	}

	const getIntensityVariant = (intensity: string) => {
		switch (intensity?.toLowerCase()) {
			case 'низька':
				return 'default'
			case 'помірна':
				return 'secondary'
			case 'висока':
				return 'destructive'
			default:
				return 'outline'
		}
	}

	return (
		<div className='min-h-screen bg-background'>
			<ToastContainer
				position='top-center'
				className='!mt-20'
				toastClassName='!rounded-lg !shadow-lg'
			/>

			<div className='container mx-auto px-4 py-8 max-w-7xl'>
				{/* Header */}
				<div className='mb-8'>
					<Button
						variant='ghost'
						onClick={() => router.push('/dashboard/exercises')}
						className='mb-6 -ml-4'
					>
						<ArrowLeft className='h-4 w-4 mr-2' />
						Назад до бібліотеки
					</Button>

					<Card>
						<CardHeader>
							<div className='space-y-4'>
								<CardTitle className='text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent'>
									{exercise?.name}
								</CardTitle>
								<CardDescription className='text-base leading-relaxed'>
									{exercise?.description}
								</CardDescription>
							</div>
						</CardHeader>
						<CardContent>
							{/* Exercise Stats Grid */}
							<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6'>
								{exercise?.equipment && (
									<div className='bg-blue-50 dark:bg-blue-950/50 rounded-lg p-3 border border-blue-200 dark:border-blue-800'>
										<div className='flex items-center gap-2 mb-1'>
											<Dumbbell className='h-3 w-3 text-blue-600' />
											<span className='text-xs font-medium text-blue-700 dark:text-blue-300'>
												Обладнання
											</span>
										</div>
										<p className='text-sm font-semibold text-blue-900 dark:text-blue-100'>
											{exercise.equipment}
										</p>
									</div>
								)}

								{exercise?.muscleGroup && (
									<div className='bg-green-50 dark:bg-green-950/50 rounded-lg p-3 border border-green-200 dark:border-green-800'>
										<div className='flex items-center gap-2 mb-1'>
											<Target className='h-3 w-3 text-green-600' />
											<span className='text-xs font-medium text-green-700 dark:text-green-300'>
												М'язи
											</span>
										</div>
										<p className='text-sm font-semibold text-green-900 dark:text-green-100'>
											{exercise.muscleGroup}
										</p>
									</div>
								)}

								{exercise?.difficulty && (
									<div className='bg-orange-50 dark:bg-orange-950/50 rounded-lg p-3 border border-orange-200 dark:border-orange-800'>
										<div className='flex items-center gap-2 mb-1'>
											<Zap className='h-3 w-3 text-orange-600' />
											<span className='text-xs font-medium text-orange-700 dark:text-orange-300'>
												Складність
											</span>
										</div>
										<p className='text-sm font-semibold text-orange-900 dark:text-orange-100'>
											{exercise.difficulty}
										</p>
									</div>
								)}

								{exercise?.duration && (
									<div className='bg-purple-50 dark:bg-purple-950/50 rounded-lg p-3 border border-purple-200 dark:border-purple-800'>
										<div className='flex items-center gap-2 mb-1'>
											<Timer className='h-3 w-3 text-purple-600' />
											<span className='text-xs font-medium text-purple-700 dark:text-purple-300'>
												Тривалість
											</span>
										</div>
										<p className='text-sm font-semibold text-purple-900 dark:text-purple-100'>
											{exercise.duration} сек
										</p>
									</div>
								)}

								{exercise?.reps && (
									<div className='bg-indigo-50 dark:bg-indigo-950/50 rounded-lg p-3 border border-indigo-200 dark:border-indigo-800'>
										<div className='flex items-center gap-2 mb-1'>
											<RotateCcw className='h-3 w-3 text-indigo-600' />
											<span className='text-xs font-medium text-indigo-700 dark:text-indigo-300'>
												Повторення
											</span>
										</div>
										<p className='text-sm font-semibold text-indigo-900 dark:text-indigo-100'>
											{exercise.reps}
										</p>
									</div>
								)}

								{exercise?.calories && (
									<div className='bg-red-50 dark:bg-red-950/50 rounded-lg p-3 border border-red-200 dark:border-red-800'>
										<div className='flex items-center gap-2 mb-1'>
											<Flame className='h-3 w-3 text-red-600' />
											<span className='text-xs font-medium text-red-700 dark:text-red-300'>
												Калорії
											</span>
										</div>
										<p className='text-sm font-semibold text-red-900 dark:text-red-100'>
											{exercise.calories} ккал
										</p>
									</div>
								)}
							</div>

							{/* Additional Info */}
							<div className='flex flex-wrap gap-2'>
								{exercise?.intensity && (
									<Badge variant={getIntensityVariant(exercise.intensity)}>
										<Zap className='h-3 w-3 mr-1' />
										Інтенсивність: {exercise.intensity}
									</Badge>
								)}
								{exercise?.restDuration && (
									<Badge variant='outline'>
										<Coffee className='h-3 w-3 mr-1' />
										Відпочинок: {exercise.restDuration} сек
									</Badge>
								)}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Main Content Grid */}
				<div className='grid lg:grid-cols-3 gap-8'>
					{/* Left Column - Video & Controls */}
					<div className='lg:col-span-2 space-y-6'>
						{/* Video Player */}
						{exercise?.videoUrl && (
							<Card>
								<CardContent className='p-0'>
									<div className='aspect-video rounded-lg overflow-hidden'>
										<ReactPlayer
											ref={playerRef}
											url={exercise.videoUrl}
											width='100%'
											height='100%'
											controls
											playing={false}
											onPlay={() => setIsVideoPlaying(true)}
											onPause={() => setIsVideoPlaying(false)}
										/>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Exercise Timer/Counter */}
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<BarChart3 className='h-5 w-5' />
									Прогрес вправи
								</CardTitle>
							</CardHeader>
							<CardContent className='space-y-6'>
								{progress.type === 'time' ? (
									<ExerciseTimer
										targetValue={progress.targetValue}
										remainingTime={remainingTime}
										isRunning={isRunning}
										isPaused={isPaused}
										onPause={handlePause}
										onResume={handleResume}
										onReset={handleReset}
									/>
								) : (
									<ExerciseCounter
										target={progress.targetValue}
										current={progress.currentValue}
										onIncrement={() =>
											setProgress(prev => ({
												...prev,
												currentValue: Math.min(
													prev.currentValue + 1,
													prev.targetValue
												),
											}))
										}
										onDecrement={() =>
											setProgress(prev => ({
												...prev,
												currentValue: Math.max(prev.currentValue - 1, 0),
											}))
										}
									/>
								)}

								{/* Control Buttons */}
								<div className='flex gap-3'>
									<Button
										onClick={handleStart}
										disabled={isRunning}
										className='flex-1'
										size='lg'
									>
										<Play className='h-4 w-4 mr-2' />
										Почати
									</Button>
									<Button
										onClick={debouncedHandleStop}
										disabled={
											isSaving ||
											(progress.type === 'time'
												? !isRunning && !isFinished
												: progress.currentValue === 0)
										}
										variant='destructive'
										className='flex-1'
										size='lg'
									>
										{isSaving ? (
											<>
												<Loader2 className='h-4 w-4 mr-2 animate-spin' />
												Збереження...
											</>
										) : (
											<>
												<Square className='h-4 w-4 mr-2' />
												Завершити
											</>
										)}
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Right Column - Settings & History */}
					<div className='space-y-6'>
						{/* Exercise Settings */}
						{exercise && (
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<Settings className='h-5 w-5' />
										Налаштування
									</CardTitle>
								</CardHeader>
								<CardContent>
									<ExerciseSettings
										exercise={exercise}
										onSettingsChange={handleSettingsChange}
									/>
								</CardContent>
							</Card>
						)}

						{/* Progress History */}
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Clock className='h-5 w-5' />
									Історія прогресу
								</CardTitle>
							</CardHeader>
							<CardContent>
								{progressHistory.length > 0 ? (
									<ScrollArea className='h-96'>
										<div className='space-y-3'>
											{progressHistory.map((entry, index) => {
												const unit =
													entry.type === ExerciseType.TIME
														? 'секунд'
														: 'повторень'
												const displayValue = `${entry.value} / ${entry.targetValue} ${unit}`
												const completionPercentage =
													(entry.value / entry.targetValue) * 100

												return (
													<div
														key={entry.id}
														className='rounded-lg border p-4 space-y-3'
													>
														<div className='flex items-center justify-between'>
															<div className='flex items-center gap-2 text-sm'>
																<div className='w-2 h-2 bg-primary rounded-full' />
																<span className='font-medium'>
																	{new Date(
																		entry.completedAt
																	).toLocaleDateString('uk-UA', {
																		day: 'numeric',
																		month: 'short',
																		year: 'numeric',
																	})}
																</span>
																<span className='text-muted-foreground'>
																	{new Date(
																		entry.completedAt
																	).toLocaleTimeString('uk-UA', {
																		hour: '2-digit',
																		minute: '2-digit',
																	})}
																</span>
															</div>
															<Badge
																variant={
																	entry.completed ? 'default' : 'secondary'
																}
															>
																{entry.completed ? (
																	<>
																		<CheckCircle2 className='h-3 w-3 mr-1' />
																		Завершено
																	</>
																) : (
																	<>
																		<Clock className='h-3 w-3 mr-1' />
																		Не завершено
																	</>
																)}
															</Badge>
														</div>

														<div className='space-y-2'>
															<div className='flex items-center justify-between text-sm'>
																<span className='font-medium'>
																	{displayValue}
																</span>
																<span className='text-muted-foreground'>
																	{Math.round(completionPercentage)}%
																</span>
															</div>
															<Progress
																value={Math.min(completionPercentage, 100)}
																className='h-2'
															/>
														</div>

														{entry.pauseCount > 0 && (
															<div className='flex items-center gap-2 text-xs text-muted-foreground'>
																<Pause className='h-3 w-3' />
																<span>Паузи: {entry.pauseCount}</span>
															</div>
														)}
													</div>
												)
											})}
										</div>
									</ScrollArea>
								) : (
									<div className='text-center py-8 space-y-4'>
										<div className='w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto'>
											<BarChart3 className='h-6 w-6 text-muted-foreground' />
										</div>
										<div className='space-y-2'>
											<h4 className='font-medium'>Історія порожня</h4>
											<p className='text-sm text-muted-foreground'>
												Почніть виконувати вправу, щоб побачити свій прогрес
											</p>
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
}
