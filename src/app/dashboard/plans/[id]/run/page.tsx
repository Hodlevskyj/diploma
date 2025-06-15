'use client'
import { Button } from '@/components/ui/button'
import {
	completePlan,
	getPlan,
	getPlanExercises,
	savePartialProgress,
} from '@/lib/api'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ExerciseStep from '../../../../../components/exercise/ExerciseStep'

export default function PlanRunPage() {
	const params = useParams()
	const router = useRouter()
	const planId = Number(params?.id)
	const [plan, setPlan] = useState<any>(null)
	const [planExercises, setPlanExercises] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [step, setStep] = useState(0)
	const [results, setResults] = useState<any[]>([])
	const [isResting, setIsResting] = useState(false)
	const [restTime, setRestTime] = useState(0)
	const [finished, setFinished] = useState(false)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!planId) return
		setLoading(true)

		// Завантажуємо основну інформацію про план
		getPlan(planId)
			.then(data => {
				setPlan(data)

				// Перевіряємо, чи є вправи в плані
				if (
					data.exercises &&
					Array.isArray(data.exercises) &&
					data.exercises.length > 0
				) {
					// Якщо вправи вже є в даних плану, використовуємо їх
					setPlanExercises(
						data.exercises.sort((a: any, b: any) => a.order - b.order)
					)
					setLoading(false)
				} else if (
					data.WorkoutDay &&
					Array.isArray(data.WorkoutDay) &&
					data.WorkoutDay.length > 0
				) {
					// Якщо є дні тренувань, витягуємо вправи з них
					const allExercises = data.WorkoutDay.flatMap((day: any) =>
						day.exercises
							? day.exercises.map((ex: any) => ({
									...ex,
									dayId: day.id,
									dayNumber: day.dayNumber,
							  }))
							: []
					)
					setPlanExercises(
						allExercises.sort((a: any, b: any) => a.order - b.order)
					)
					setLoading(false)
				} else {
					// Якщо вправ немає в основних даних, робимо додатковий запит
					getPlanExercises(planId)
						.then(exercises => {
							setPlanExercises(
								exercises.sort((a: any, b: any) => a.order - b.order)
							)
						})
						.catch(e => setError(e.message))
						.finally(() => setLoading(false))
				}
			})
			.catch(e => {
				setError(e.message)
				setLoading(false)
			})
	}, [planId])

	useEffect(() => {
		return () => {
			if (results.length > 0 && !finished) {
				savePartialProgress(planId, results).catch(() => {})
			}
		}
	}, [results, finished, planId])

	useEffect(() => {
		let timer: NodeJS.Timeout | null = null
		if (isResting && restTime > 0) {
			timer = setTimeout(() => setRestTime(restTime - 1), 1000)
		}
		if (isResting && restTime === 0) {
			setIsResting(false)
			goToNextStep()
		}
		return () => {
			if (timer) clearTimeout(timer)
		}
	}, [isResting, restTime])

	if (loading) return <div className='p-8 text-center'>Завантаження...</div>
	if (error) return <div className='p-8 text-center text-red-500'>{error}</div>
	if (!plan) return <div className='p-8 text-center'>План не знайдено</div>
	if (planExercises.length === 0) {
		return <div className='p-8 text-center'>План не містить вправ</div>
	}

	const currentExercise = planExercises[step]

	const handleExerciseComplete = (result: any) => {
		setResults(prev => [
			...prev,
			{
				...result,
				exerciseId: currentExercise.exerciseId || currentExercise.exercise?.id,
			},
		])
		if (currentExercise.restDuration && currentExercise.restDuration > 0) {
			setIsResting(true)
			setRestTime(currentExercise.restDuration)
		} else {
			goToNextStep()
		}
	}

	const goToNextStep = () => {
		if (step < planExercises.length - 1) {
			setStep(step + 1)
		} else {
			setFinished(true)
		}
	}

	const handleFinishPlan = async () => {
		setSaving(true)
		try {
			await completePlan(planId, results, 'COMPLETED')
			router.push(`/dashboard/plans/${planId}`)
		} catch (e: any) {
			setError(e.message || 'Не вдалося зберегти результат')
		} finally {
			setSaving(false)
		}
	}

	if (finished) {
		return (
			<div className='p-8 text-center'>
				<h2 className='text-2xl font-bold mb-4'>План завершено!</h2>
				<Button onClick={handleFinishPlan} disabled={saving}>
					{saving ? 'Збереження...' : 'Зберегти результат'}
				</Button>
			</div>
		)
	}

	return (
		<div className='max-w-xl mx-auto py-8'>
			<h1 className='text-3xl font-bold mb-6 text-center'>{plan.name}</h1>
			<div className='mb-4 text-center'>
				Крок {step + 1} з {planExercises.length}
			</div>
			{isResting ? (
				<div className='text-center text-lg font-semibold my-8'>
					Відпочинок: {restTime} сек
				</div>
			) : (
				<ExerciseStep
					exercise={{
						...(currentExercise.exercise || {}),
						type: currentExercise.type,
						reps: currentExercise.reps,
						duration: currentExercise.duration,
						restDuration: currentExercise.restDuration,
					}}
					onComplete={handleExerciseComplete}
				/>
			)}
		</div>
	)
}
