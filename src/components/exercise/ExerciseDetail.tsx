'use client'

import { ExerciseType } from '@/types/planexercise'
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

	if (authLoading || loading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center'>
				<div className='text-center'>
					<div className='inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4'></div>
					<p className='text-lg text-gray-600 font-medium'>Завантаження...</p>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center'>
				<div className='bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4 border border-red-100'>
					<div className='text-center'>
						<div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
							<svg
								className='w-8 h-8 text-red-500'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
								/>
							</svg>
						</div>
						<h3 className='text-xl font-semibold text-gray-900 mb-2'>
							Помилка
						</h3>
						<p className='text-gray-600'>{error}</p>
					</div>
				</div>
			</div>
		)
	}

	if (!user) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center'>
				<div className='bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4 border border-blue-100'>
					<div className='text-center'>
						<div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
							<svg
								className='w-8 h-8 text-blue-500'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
								/>
							</svg>
						</div>
						<h3 className='text-xl font-semibold text-gray-900 mb-2'>
							Необхідна авторизація
						</h3>
						<p className='text-gray-600'>Увійдіть, щоб переглянути вправу</p>
					</div>
				</div>
			</div>
		)
	}

	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty?.toLowerCase()) {
			case 'легкий':
			case 'легка':
				return 'bg-green-100 text-green-800 border-green-200'
			case 'середній':
			case 'середня':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200'
			case 'важкий':
			case 'важка':
				return 'bg-red-100 text-red-800 border-red-200'
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200'
		}
	}

	const getIntensityColor = (intensity: string) => {
		switch (intensity?.toLowerCase()) {
			case 'низька':
				return 'bg-blue-100 text-blue-800 border-blue-200'
			case 'помірна':
				return 'bg-orange-100 text-orange-800 border-orange-200'
			case 'висока':
				return 'bg-purple-100 text-purple-800 border-purple-200'
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200'
		}
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50'>
			<ToastContainer
				position='top-center'
				className='!mt-20'
				toastClassName='!rounded-xl !shadow-xl'
			/>

			<div className='max-w-6xl mx-auto px-4 py-8'>
				{/* Header Section */}
				<div className='mb-8'>
					<button
						onClick={() => router.push('/dashboard/exercises')}
						className='inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 mb-6 group'
					>
						<svg
							className='w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M15 19l-7-7 7-7'
							/>
						</svg>
						<span className='font-medium'>Назад до бібліотеки</span>
					</button>

					<div className='bg-white rounded-3xl shadow-xl p-8 border border-gray-100'>
						<div className='flex items-start justify-between mb-6'>
							<div>
								<h1 className='text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
									{exercise?.name}
								</h1>
								<p className='text-lg text-gray-700 leading-relaxed max-w-3xl'>
									{exercise?.description}
								</p>
							</div>
						</div>

						{/* Exercise Info Grid */}
						<div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6'>
							{exercise?.equipment && (
								<div className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200'>
									<div className='flex items-center gap-2 mb-1'>
										<svg
											className='w-4 h-4 text-blue-600'
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
											/>
										</svg>
										<span className='text-xs font-semibold text-blue-700'>
											Обладнання
										</span>
									</div>
									<p className='text-sm font-medium text-blue-800'>
										{exercise.equipment}
									</p>
								</div>
							)}

							{exercise?.muscleGroup && (
								<div className='bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200'>
									<div className='flex items-center gap-2 mb-1'>
										<svg
											className='w-4 h-4 text-green-600'
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
											/>
										</svg>
										<span className='text-xs font-semibold text-green-700'>
											М'язи
										</span>
									</div>
									<p className='text-sm font-medium text-green-800'>
										{exercise.muscleGroup}
									</p>
								</div>
							)}

							{exercise?.difficulty && (
								<div
									className={`rounded-xl p-4 border ${getDifficultyColor(
										exercise.difficulty
									)}`}
								>
									<div className='flex items-center gap-2 mb-1'>
										<svg
											className='w-4 h-4'
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M13 10V3L4 14h7v7l9-11h-7z'
											/>
										</svg>
										<span className='text-xs font-semibold'>Складність</span>
									</div>
									<p className='text-sm font-medium'>{exercise.difficulty}</p>
								</div>
							)}

							{exercise?.duration && (
								<div className='bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200'>
									<div className='flex items-center gap-2 mb-1'>
										<svg
											className='w-4 h-4 text-purple-600'
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
											/>
										</svg>
										<span className='text-xs font-semibold text-purple-700'>
											Тривалість
										</span>
									</div>
									<p className='text-sm font-medium text-purple-800'>
										{exercise.duration} сек
									</p>
								</div>
							)}

							{exercise?.reps && (
								<div className='bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200'>
									<div className='flex items-center gap-2 mb-1'>
										<svg
											className='w-4 h-4 text-orange-600'
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
											/>
										</svg>
										<span className='text-xs font-semibold text-orange-700'>
											Повторення
										</span>
									</div>
									<p className='text-sm font-medium text-orange-800'>
										{exercise.reps}
									</p>
								</div>
							)}

							{exercise?.calories && (
								<div className='bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200'>
									<div className='flex items-center gap-2 mb-1'>
										<svg
											className='w-4 h-4 text-red-600'
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z'
											/>
										</svg>
										<span className='text-xs font-semibold text-red-700'>
											Калорії
										</span>
									</div>
									<p className='text-sm font-medium text-red-800'>
										{exercise.calories} ккал
									</p>
								</div>
							)}
						</div>

						{/* Additional Info */}
						<div className='flex flex-wrap gap-3'>
							{exercise?.intensity && (
								<span
									className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getIntensityColor(
										exercise.intensity
									)}`}
								>
									<svg
										className='w-3 h-3'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M13 10V3L4 14h7v7l9-11h-7z'
										/>
									</svg>
									Інтенсивність: {exercise.intensity}
								</span>
							)}
							{exercise?.restDuration && (
								<span className='inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 border border-indigo-200'>
									<svg
										className='w-3 h-3'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
										/>
									</svg>
									Відпочинок: {exercise.restDuration} сек
								</span>
							)}
						</div>
					</div>
				</div>

				{/* Main Content Grid */}
				<div className='grid lg:grid-cols-3 gap-8'>
					{/* Left Column - Video & Controls */}
					<div className='lg:col-span-2 space-y-6'>
						{/* Video Player */}
						{exercise?.videoUrl && (
							<div className='bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100'>
								<div className='aspect-video'>
									<ReactPlayer
										ref={playerRef}
										url={exercise.videoUrl}
										width='100%'
										height='100%'
										controls
										// playing={isRunning && !isPaused && progress.type === 'time'}
										playing={false}
										className='rounded-t-2xl overflow-hidden'
										onPlay={() => setIsVideoPlaying(true)}
										onPause={() => setIsVideoPlaying(false)}
									/>
								</div>
							</div>
						)}

						{/* Exercise Timer/Counter */}
						<div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
							<h3 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
								<svg
									className='w-5 h-5 text-blue-600'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
									/>
								</svg>
								Прогрес вправи
							</h3>

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
							<div className='flex gap-3 mt-6'>
								<button
									onClick={handleStart}
									disabled={isRunning}
									className='flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100'
								>
									<svg
										className='w-5 h-5'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M5 3l14 9-14 9V3z'
										/>
									</svg>
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
									className='flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold shadow-lg hover:from-red-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100'
								>
									{isSaving ? (
										<>
											<div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
											Збереження...
										</>
									) : (
										<>
											<svg
												className='w-5 h-5'
												fill='none'
												stroke='currentColor'
												viewBox='0 0 24 24'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M5 12h14M12 5l7 7-7 7'
												/>
											</svg>
											Завершити
										</>
									)}
								</button>
							</div>
						</div>
					</div>

					{/* Right Column - Settings & History */}
					<div className='space-y-6'>
						{/* Exercise Settings */}
						{exercise && (
							<div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
								<h3 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
									<svg
										className='w-5 h-5 text-purple-600'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
										/>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
										/>
									</svg>
									Налаштування
								</h3>
								<ExerciseSettings
									exercise={exercise}
									onSettingsChange={handleSettingsChange}
								/>
							</div>
						)}

						{/* Progress History */}
						<div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
							<h3 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
								<svg
									className='w-5 h-5 text-indigo-600'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
									/>
								</svg>
								Історія прогресу
							</h3>

							{progressHistory.length > 0 ? (
								<div className='space-y-3 max-h-96 overflow-y-auto custom-scrollbar'>
									{progressHistory.map((entry, index) => {
										const unit =
											entry.type === ExerciseType.TIME ? 'секунд' : 'повторень'
										const displayValue = `${entry.value} / ${entry.targetValue} ${unit}`
										const completionPercentage =
											(entry.value / entry.targetValue) * 100

										return (
											<div
												key={entry.id}
												className='group bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-purple-50 rounded-xl p-4 border border-gray-200 hover:border-blue-200 transition-all duration-200'
											>
												{/* Date Header */}
												<div className='flex items-center justify-between mb-3'>
													<div className='flex items-center gap-2'>
														<div className='w-2 h-2 bg-blue-500 rounded-full'></div>
														<span className='text-sm font-medium text-gray-900'>
															{new Date(entry.completedAt).toLocaleDateString(
																'uk-UA',
																{
																	day: 'numeric',
																	month: 'short',
																	year: 'numeric',
																}
															)}
														</span>
														<span className='text-xs text-gray-500'>
															{new Date(entry.completedAt).toLocaleTimeString(
																'uk-UA',
																{
																	hour: '2-digit',
																	minute: '2-digit',
																}
															)}
														</span>
													</div>
													<span
														className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
															entry.completed
																? 'bg-green-100 text-green-800 border border-green-200'
																: 'bg-orange-100 text-orange-800 border border-orange-200'
														}`}
													>
														{entry.completed ? (
															<>
																<svg
																	className='w-3 h-3'
																	fill='none'
																	stroke='currentColor'
																	viewBox='0 0 24 24'
																>
																	<path
																		strokeLinecap='round'
																		strokeLinejoin='round'
																		strokeWidth={2}
																		d='M5 13l4 4L19 7'
																	/>
																</svg>
																Завершено
															</>
														) : (
															<>
																<svg
																	className='w-3 h-3'
																	fill='none'
																	stroke='currentColor'
																	viewBox='0 0 24 24'
																>
																	<path
																		strokeLinecap='round'
																		strokeLinejoin='round'
																		strokeWidth={2}
																		d='M12 8v4l3 3'
																	/>
																</svg>
																Не завершено
															</>
														)}
													</span>
												</div>

												{/* Progress Bar */}
												<div className='mb-3'>
													<div className='flex items-center justify-between text-sm mb-1'>
														<span className='font-medium text-gray-700'>
															{displayValue}
														</span>
														<span className='text-gray-500'>
															{Math.round(completionPercentage)}%
														</span>
													</div>
													<div className='w-full bg-gray-200 rounded-full h-2'>
														<div
															className={`h-2 rounded-full transition-all duration-300 ${
																entry.completed
																	? 'bg-gradient-to-r from-green-400 to-green-600'
																	: 'bg-gradient-to-r from-orange-400 to-orange-600'
															}`}
															style={{
																width: `${Math.min(
																	completionPercentage,
																	100
																)}%`,
															}}
														></div>
													</div>
												</div>

												{/* Additional Stats */}
												{entry.pauseCount > 0 && (
													<div className='flex items-center gap-2 text-xs text-gray-600'>
														<svg
															className='w-3 h-3'
															fill='none'
															stroke='currentColor'
															viewBox='0 0 24 24'
														>
															<path
																strokeLinecap='round'
																strokeLinejoin='round'
																strokeWidth={2}
																d='M10 9v6m4-6v6'
															/>
														</svg>
														<span>Паузи: {entry.pauseCount}</span>
													</div>
												)}
											</div>
										)
									})}
								</div>
							) : (
								<div className='text-center py-8'>
									<div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
										<svg
											className='w-8 h-8 text-gray-400'
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
											/>
										</svg>
									</div>
									<h4 className='text-lg font-medium text-gray-900 mb-2'>
										Історія порожня
									</h4>
									<p className='text-gray-500'>
										Почніть виконувати вправу, щоб побачити свій прогрес
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Custom Scrollbar Styles */}
			<style jsx>{`
				.custom-scrollbar::-webkit-scrollbar {
					width: 6px;
				}
				.custom-scrollbar::-webkit-scrollbar-track {
					background: #f1f5f9;
					border-radius: 3px;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb {
					background: #cbd5e1;
					border-radius: 3px;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb:hover {
					background: #94a3b8;
				}
			`}</style>
		</div>
	)
}
