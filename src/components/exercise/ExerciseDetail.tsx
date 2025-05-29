'use client'

import { debounce } from 'lodash'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import ReactPlayer from 'react-player'
import { toast, ToastContainer } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import {
	Exercise,
	ExerciseProgress,
	TrackedExercise,
} from '../../types/exercise'
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

	const router = useRouter()
	const playerRef = useRef<ReactPlayer>(null)

	const [progress, setProgress] = useState<ExerciseProgress>({
		type: 'reps',
		targetValue: 10,
		currentValue: 0,
		isActive: false,
	})

	// завантаження даних вправи та історії прогресу
	useEffect(() => {
		const fetchExercise = async () => {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_API_BASE_URL}/exercises/${id}`,
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
					`${process.env.NEXT_PUBLIC_API_BASE_URL}/exercises/progress/${user.id}`,
					{ credentials: 'include' }
				)
				if (!res.ok) throw new Error('Не вдалося завантажити історію прогресу')
				const data = await res.json()
				setProgressHistory(data)
			} catch (err: any) {
				console.error('Error fetching progress history:', err)
			}
		}

		if (!authLoading && user) {
			fetchExercise()
			fetchProgressHistory()
		}
	}, [id, authLoading, user])

	// логіка таймеру (тільки для type === 'time')
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
						// коли залишається 1 секунда або менше, встановлюємо 0 і зупиняємо таймер
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
		setProgress(prev => ({ ...prev, currentValue: 0 }))
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
				completed = true // якщо таймер дійшов до кінця, вправа завершена
			} else {
				// Для повторень
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
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/exercises/track`,
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
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/exercises/progress/${user.id}`,
				{ credentials: 'include' }
			)
			if (!historyRes.ok) {
				throw new Error('Не вдалося оновити історію прогресу')
			}
			const updatedHistory = await historyRes.json()
			setProgressHistory(updatedHistory)
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

	if (authLoading || loading) return <p>Завантаження...</p>
	if (error) return <p>Помилка: {error}</p>
	if (!user) return <p>Увійдіть, щоб переглянути вправу</p>

	return (
		<div className='p-6 max-w-4xl mx-auto'>
			<ToastContainer position='top-center' />
			<h1 className='text-2xl font-bold mb-4'>{exercise?.name}</h1>
			<p className='text-gray-700 mb-4'>{exercise?.description}</p>
			{exercise?.equipment && (
				<p className='text-sm text-gray-500 mb-4'>
					<span className='font-semibold'>Обладнання:</span>{' '}
					{exercise.equipment}
				</p>
			)}
			{exercise?.muscleGroup && (
				<p className='text-sm text-gray-500 mb-4'>
					<span className='font-semibold'>М'язова група:</span>{' '}
					{exercise.muscleGroup}
				</p>
			)}
			{exercise?.difficulty && (
				<p className='text-sm text-gray-500 mb-4'>
					<span className='font-semibold'>Складність:</span>{' '}
					{exercise.difficulty}
				</p>
			)}
			{exercise?.duration && (
				<p className='text-sm text-gray-500 mb-4'>
					<span className='font-semibold'>Тривалість:</span> {exercise.duration}{' '}
					секунд
				</p>
			)}
			{exercise?.reps && (
				<p className='text-sm text-gray-500 mb-4'>
					<span className='font-semibold'>Повторення:</span> {exercise.reps}
				</p>
			)}
			{exercise?.restDuration && (
				<p className='text-sm text-gray-500 mb-4'>
					<span className='font-semibold'>Час відпочинку:</span>{' '}
					{exercise.restDuration} секунд
				</p>
			)}
			{exercise?.calories && (
				<p className='text-sm text-gray-500 mb-4'>
					<span className='font-semibold'>Калорії:</span> {exercise.calories}{' '}
					ккал
				</p>
			)}
			{exercise?.intensity && (
				<p className='text-sm text-gray-500 mb-4'>
					<span className='font-semibold'>Інтенсивність:</span>{' '}
					{exercise.intensity}
				</p>
			)}

			{exercise?.videoUrl && (
				<ReactPlayer
					ref={playerRef}
					url={exercise.videoUrl}
					width='100%'
					height='360px'
					controls
					playing={isRunning && !isPaused && progress.type === 'time'}
				/>
			)}

			{exercise && (
				<ExerciseSettings
					exercise={exercise}
					onSettingsChange={handleSettingsChange}
				/>
			)}

			<div className='my-6'>
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
								currentValue: Math.min(prev.currentValue + 1, prev.targetValue),
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

				<div className='flex gap-4 mt-4'>
					<button
						onClick={handleStart}
						disabled={isRunning}
						className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50'
					>
						Почати
					</button>
					<button
						onClick={debouncedHandleStop}
						disabled={
							isSaving ||
							(progress.type === 'time'
								? !isRunning && !isFinished
								: progress.currentValue === 0)
						}
						className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50'
					>
						Завершити
					</button>
				</div>
			</div>

			<div className='my-6'>
				<h2 className='text-xl font-semibold mb-4'>Історія прогресу</h2>
				{progressHistory.length > 0 ? (
					<ul className='space-y-2'>
						{progressHistory.map(entry => (
							<li key={entry.id} className='p-2 bg-gray-100 rounded'>
								<p>
									<span className='font-semibold'>Дата:</span>{' '}
									{new Date(entry.completedAt).toLocaleString('uk-UA')}
								</p>
								<p>
									<span className='font-semibold'>Тип:</span>{' '}
									{entry.type === 'reps' ? 'Повторення' : 'Час'}
								</p>
								<p>
									<span className='font-semibold'>Значення:</span> {entry.value}{' '}
									/ {entry.targetValue}{' '}
									{entry.type === 'reps' ? 'повторень' : 'секунд'}
								</p>
								<p>
									<span className='font-semibold'>Статус:</span>{' '}
									{entry.completed ? 'Завершено' : 'Не завершено'}
								</p>
								<p>
									<span className='font-semibold'>Паузи:</span>{' '}
									{entry.pauseCount}
								</p>
								<p>
									<span className='font-semibold'>Скидання:</span>{' '}
									{entry.resetCount}
								</p>
							</li>
						))}
					</ul>
				) : (
					<p>Історія прогресу відсутня.</p>
				)}
			</div>

			<button
				onClick={() => router.push('/exercises')}
				className='mt-6 text-sm underline text-gray-600 hover:text-black'
			>
				← Назад до бібліотеки
			</button>
		</div>
	)
}
