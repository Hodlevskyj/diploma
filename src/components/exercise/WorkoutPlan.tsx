'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

// Інтерфейси для типізації
interface Exercise {
	id: number
	name: string
	muscleGroup: string
	category: string
	difficulty?: string
	videoUrl?: string
	description?: string
	equipment?: string
}

interface WorkoutPlanExercise {
	id: number
	exerciseId: number
	exercise: Exercise
	order: number
}

interface WorkoutPlan {
	id: number
	userId: number
	name: string
	fitnessGoal: string
	exercises: WorkoutPlanExercise[]
}

export default function WorkoutPlan() {
	const { user, loading: authLoading } = useAuth()
	const [plans, setPlans] = useState<WorkoutPlan[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [fitnessGoal, setFitnessGoal] = useState('')
	const [customExercises, setCustomExercises] = useState<number[]>([])
	const [availableExercises, setAvailableExercises] = useState<Exercise[]>([])

	useEffect(() => {
		const fetchData = async () => {
			if (!user) {
				setError('User not authenticated')
				setLoading(false)
				return
			}
			try {
				const [plansResponse, exercisesResponse] = await Promise.all([
					fetch(
						`${process.env.NEXT_PUBLIC_API_BASE_URL}/exercises/plan/${user.id}`,
						{
							credentials: 'include',
						}
					),
					fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/exercises`, {
						credentials: 'include',
					}),
				])
				if (!plansResponse.ok) throw new Error('Failed to fetch plans')
				if (!exercisesResponse.ok) throw new Error('Failed to fetch exercises')
				const plansData = await plansResponse.json()
				const exercisesData = await exercisesResponse.json()
				setPlans(plansData)
				setAvailableExercises(exercisesData)
			} catch (err) {
				setError(
					err instanceof Error ? err.message : 'An unexpected error occurred'
				)
			} finally {
				setLoading(false)
			}
		}

		if (!authLoading) fetchData()
	}, [user, authLoading])

	const handleCreatePlan = async () => {
		if (!user) return
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/exercises/plan`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						userId: user.id,
						fitnessGoal,
						exerciseIds: customExercises,
					}),
					credentials: 'include',
				}
			)
			if (!response.ok) throw new Error('Failed to create plan')
			const newPlan = await response.json()
			setPlans([...plans, newPlan])
			setFitnessGoal('')
			setCustomExercises([])
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'An unexpected error occurred'
			)
		}
	}

	const handleUpdatePlan = async (workoutPlanId: number) => {
		if (!user) return
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/exercises/plan/${workoutPlanId}`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						exerciseIds: customExercises,
					}),
					credentials: 'include',
				}
			)
			if (!response.ok) throw new Error('Failed to update plan')
			const updatedPlan = await response.json()
			setPlans(
				plans.map(plan => (plan.id === workoutPlanId ? updatedPlan : plan))
			)
			setCustomExercises([])
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'An unexpected error occurred'
			)
		}
	}

	if (authLoading || loading) return <p>Завантаження планів...</p>
	if (error) return <p>Помилка: {error}</p>

	return (
		<div className='p-4 max-w-7xl mx-auto'>
			<h2 className='text-2xl font-bold mb-4'>Персональні плани тренувань</h2>

			<div className='mb-6'>
				<h3 className='text-xl font-semibold mb-2'>Створити план тренувань</h3>
				<select
					value={fitnessGoal}
					onChange={e => setFitnessGoal(e.target.value)}
					className='border p-2 rounded mb-2'
				>
					<option value=''>Оберіть фітнес-ціль</option>
					<option value='Схуднення'>Схуднення</option>
					<option value='Набір м’язової маси'>Набір м’язової маси</option>
					<option value='Гнучкість'>Гнучкість</option>
				</select>
				<select
					multiple
					value={customExercises.map(String)}
					onChange={e =>
						setCustomExercises(
							Array.from(e.target.selectedOptions, option =>
								Number(option.value)
							)
						)
					}
					className='border p-2 rounded w-full'
				>
					{availableExercises.map((exercise: Exercise) => (
						<option key={exercise.id} value={exercise.id.toString()}>
							{exercise.name}
						</option>
					))}
				</select>
				<button
					onClick={handleCreatePlan}
					className='px-4 py-2 bg-blue-500 text-white rounded mt-2'
				>
					Створити план
				</button>
			</div>

			<div>
				{plans.length > 0 ? (
					plans.map((plan: WorkoutPlan) => (
						<div key={plan.id} className='bg-white p-4 rounded shadow mb-4'>
							<h3 className='text-lg font-semibold'>{plan.name}</h3>
							<p>Ціль: {plan.fitnessGoal}</p>
							<h4 className='font-medium mt-2'>Вправи:</h4>
							<ul>
								{plan.exercises.map((item: WorkoutPlanExercise) => (
									<li key={item.exerciseId}>
										<Link
											href={`/exercises/${item.exerciseId}`}
											className='text-blue-500 hover:underline'
										>
											{item.exercise.name}
										</Link>
									</li>
								))}
							</ul>
							<select
								multiple
								value={customExercises.map(String)}
								onChange={e =>
									setCustomExercises(
										Array.from(e.target.selectedOptions, option =>
											Number(option.value)
										)
									)
								}
								className='border p-2 rounded w-full mt-2'
							>
								{availableExercises.map((exercise: Exercise) => (
									<option key={exercise.id} value={exercise.id}>
										{exercise.name}
									</option>
								))}
							</select>
							<button
								onClick={() => handleUpdatePlan(plan.id)}
								className='px-4 py-2 bg-green-500 text-white rounded mt-2'
							>
								Оновити план
							</button>
						</div>
					))
				) : (
					<p>Плани тренувань відсутні. Створіть новий!</p>
				)}
			</div>
		</div>
	)
}
