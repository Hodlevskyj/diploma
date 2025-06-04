import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import ExerciseCounter from './ExerciseCounter'
import ExerciseTimer from './ExerciseTimer'

interface ExerciseStepProps {
	exercise: {
		id: number
		name: string
		description?: string
		videoUrl?: string
		type?: 'reps' | 'time'
		reps?: number
		duration?: number
		restDuration?: number
	}
	onComplete: (result: {
		type: 'reps' | 'time'
		value: number
		targetValue: number
		completed: boolean
		pauseCount: number
		resetCount: number
	}) => void
}

export default function ExerciseStep({
	exercise,
	onComplete,
}: ExerciseStepProps) {
	const type: 'reps' | 'time' =
		exercise.type || (exercise.duration ? 'time' : 'reps')
	const targetValue =
		type === 'time' ? exercise.duration || 0 : exercise.reps || 0

	// Стан для лічильника/таймера
	const [isRunning, setIsRunning] = useState(false)
	const [isPaused, setIsPaused] = useState(false)
	const [pauseCount, setPauseCount] = useState(0)
	const [resetCount, setResetCount] = useState(0)
	const [currentValue, setCurrentValue] = useState(0)
	const [remainingTime, setRemainingTime] = useState(targetValue)
	const [finished, setFinished] = useState(false)

	// Таймер для типу 'time'
	useEffect(() => {
		let timer: NodeJS.Timeout | null = null
		if (type === 'time' && isRunning && !isPaused && remainingTime > 0) {
			timer = setInterval(() => {
				setRemainingTime(prev => {
					if (prev <= 1) {
						setIsRunning(false)
						setFinished(true)
						return 0
					}
					return prev - 1
				})
			}, 1000)
		}
		return () => {
			if (timer) clearInterval(timer)
		}
	}, [isRunning, isPaused, remainingTime, type])

	// Автоматичне завершення для таймера
	useEffect(() => {
		if (type === 'time' && finished) {
			handleFinish()
		}
	}, [finished])

	// Обробники для ExerciseTimer
	const handlePause = () => {
		setIsPaused(true)
		setPauseCount(p => p + 1)
	}
	const handleResume = () => setIsPaused(false)
	const handleReset = () => {
		setIsRunning(false)
		setIsPaused(false)
		setFinished(false)
		setCurrentValue(0)
		setRemainingTime(targetValue)
		setResetCount(r => r + 1)
	}

	// Обробники для ExerciseCounter
	const handleIncrement = () => {
		setCurrentValue(v => Math.min(v + 1, targetValue))
	}
	const handleDecrement = () => {
		setCurrentValue(v => Math.max(v - 1, 0))
	}

	const handleStart = () => {
		setIsRunning(true)
		setIsPaused(false)
		setFinished(false)
		setPauseCount(0)
		setResetCount(0)
		setCurrentValue(0)
		setRemainingTime(targetValue)
	}

	const handleFinish = () => {
		setIsRunning(false)
		setIsPaused(false)
		setFinished(true)
		onComplete({
			type,
			value: type === 'time' ? targetValue : currentValue,
			targetValue,
			completed:
				type === 'time' ? remainingTime === 0 : currentValue >= targetValue,
			pauseCount,
			resetCount,
		})
	}

	return (
		<div className='p-6 border rounded-lg shadow bg-white'>
			<h2 className='text-xl font-bold mb-2'>{exercise.name}</h2>
			{exercise.description && (
				<p className='mb-2 text-gray-700'>{exercise.description}</p>
			)}
			{exercise.videoUrl && (
				<div className='mb-4'>
					<video src={exercise.videoUrl} controls width='100%' />
				</div>
			)}

			<div className='mb-4'>
				{type === 'time' ? (
					<ExerciseTimer
						targetValue={targetValue}
						remainingTime={remainingTime}
						isRunning={isRunning}
						isPaused={isPaused}
						onPause={handlePause}
						onResume={handleResume}
						onReset={handleReset}
					/>
				) : (
					<ExerciseCounter
						target={targetValue}
						current={currentValue}
						onIncrement={handleIncrement}
						onDecrement={handleDecrement}
					/>
				)}
			</div>

			<div className='flex gap-2 mt-4'>
				{!isRunning && <Button onClick={handleStart}>Почати</Button>}
				{isRunning && type === 'reps' && (
					<Button variant='destructive' onClick={handleFinish}>
						Завершити
					</Button>
				)}
				<Button variant='outline' onClick={handleReset}>
					Скинути
				</Button>
			</div>
		</div>
	)
}
