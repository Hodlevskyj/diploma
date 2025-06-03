'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

interface ExerciseCategory {
	id: number
	name: string
}

interface Exercise {
	id: number
	name: string
	muscleGroup?: string
	exerciseCategory?: ExerciseCategory | null
	difficulty?: string
	videoUrl?: string
	description?: string
	equipment?: string
	duration?: number
	reps?: number
	restDuration?: number
	calories?: number
	intensity?: string
}

interface WorkoutPlan {
	id: number
	name: string
	fitnessGoal: string
	weeklyGoal?: number
	exercises: { exerciseId: number; exercise: Exercise }[]
}

export default function WorkoutPlan() {
	const { user, loading: authLoading } = useAuth()
	const [plans, setPlans] = useState<WorkoutPlan[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [fitnessGoal, setFitnessGoal] = useState('')
	const [customExercises, setCustomExercises] = useState<number[]>([])
	const [availableExercises, setAvailableExercises] = useState<Exercise[]>([])
	const [categories, setCategories] = useState<ExerciseCategory[]>([])
	const [selectedCategory, setSelectedCategory] = useState<string>('')
	const [newExercise, setNewExercise] = useState({
		name: '',
		muscleGroup: '',
		exerciseCategoryId: 0,
		difficulty: '',
		videoUrl: '',
		description: '',
		equipment: '',
		duration: 0,
		reps: 0,
		restDuration: 0,
		calories: 0,
		intensity: '',
	})
	const [editExerciseId, setEditExerciseId] = useState<number | null>(null)

	useEffect(() => {
		const fetchData = async () => {
			if (!user) {
				setError('User not authenticated')
				setLoading(false)
				return
			}
			try {
				const [plansResponse, exercisesResponse, categoriesResponse] =
					await Promise.all([
						fetch(
							`${process.env.NEXT_PUBLIC_API_BASE_URL}/exercises/plan/${user.id}`,
							{
								credentials: 'include',
							}
						),
						fetch(
							`${process.env.NEXT_PUBLIC_API_BASE_URL}/exercises?category=${selectedCategory}`,
							{
								credentials: 'include',
							}
						),
						fetch(
							`${process.env.NEXT_PUBLIC_API_BASE_URL}/exercises/categories`,
							{
								credentials: 'include',
							}
						),
					])
				if (!plansResponse.ok) throw new Error('Failed to fetch plans')
				if (!exercisesResponse.ok) throw new Error('Failed to fetch exercises')
				if (!categoriesResponse.ok)
					throw new Error('Failed to fetch categories')
				const plansData = await plansResponse.json()
				const exercisesData = await exercisesResponse.json()
				const categoriesData = await categoriesResponse.json()
				setPlans(plansData)
				setAvailableExercises(exercisesData)
				setCategories(categoriesData)
			} catch (err) {
				setError(
					err instanceof Error ? err.message : 'An unexpected error occurred'
				)
			} finally {
				setLoading(false)
			}
		}

		if (!authLoading) fetchData()
	}, [user, authLoading, selectedCategory])

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
						weeklyGoal: 3,
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

	const handleCreateOrUpdateExercise = async () => {
		if (!user) return
		try {
			const method = editExerciseId ? 'PUT' : 'POST'
			const url = editExerciseId
				? `${process.env.NEXT_PUBLIC_API_BASE_URL}/exercises/${editExerciseId}`
				: `${process.env.NEXT_PUBLIC_API_BASE_URL}/exercises`
			const response = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: newExercise.name,
					muscleGroup: newExercise.muscleGroup,
					exerciseCategoryId: newExercise.exerciseCategoryId || undefined,
					difficulty: newExercise.difficulty || undefined,
					videoUrl: newExercise.videoUrl || undefined,
					description: newExercise.description || undefined,
					equipment: newExercise.equipment || undefined,
					duration: newExercise.duration || undefined,
					reps: newExercise.reps || undefined,
					restDuration: newExercise.restDuration || undefined,
					calories: newExercise.calories || undefined,
					intensity: newExercise.intensity || undefined,
				}),
				credentials: 'include',
			})
			if (!response.ok)
				throw new Error(
					`Failed to ${editExerciseId ? 'update' : 'create'} exercise`
				)
			const updatedExercise = await response.json()
			if (editExerciseId) {
				setAvailableExercises(
					availableExercises.map(ex =>
						ex.id === editExerciseId ? updatedExercise : ex
					)
				)
			} else {
				setAvailableExercises([...availableExercises, updatedExercise])
			}
			setNewExercise({
				name: '',
				muscleGroup: '',
				exerciseCategoryId: 0,
				difficulty: '',
				videoUrl: '',
				description: '',
				equipment: '',
				duration: 0,
				reps: 0,
				restDuration: 0,
				calories: 0,
				intensity: '',
			})
			setEditExerciseId(null)
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'An unexpected error occurred'
			)
		}
	}

	const handleEditExercise = (exercise: Exercise) => {
		setEditExerciseId(exercise.id)
		setNewExercise({
			name: exercise.name,
			muscleGroup: exercise.muscleGroup || '',
			exerciseCategoryId: exercise.exerciseCategory?.id || 0,
			difficulty: exercise.difficulty || '',
			videoUrl: exercise.videoUrl || '',
			description: exercise.description || '',
			equipment: exercise.equipment || '',
			duration: exercise.duration || 0,
			reps: exercise.reps || 0,
			restDuration: exercise.restDuration || 0,
			calories: exercise.calories || 0,
			intensity: exercise.intensity || '',
		})
	}

	const handleDeleteExercise = async (exerciseId: number) => {
		if (!user) return
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/exercises/${exerciseId}`,
				{
					method: 'DELETE',
					credentials: 'include',
				}
			)
			if (!response.ok) throw new Error('Failed to delete exercise')
			setAvailableExercises(
				availableExercises.filter(ex => ex.id !== exerciseId)
			)
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
				<h3 className='text-xl font-semibold mb-2'>Фільтрація вправ</h3>
				<select
					value={selectedCategory}
					onChange={e => setSelectedCategory(e.target.value)}
					className='border p-2 rounded mb-2'
				>
					<option value=''>Всі категорії</option>
					{categories.map(category => (
						<option key={category.id} value={category.name}>
							{category.name}
						</option>
					))}
				</select>
			</div>

			<div className='mb-6'>
				<h3 className='text-xl font-semibold mb-2'>
					{editExerciseId ? 'Редагувати вправу' : 'Додати нову вправу'}
				</h3>
				<input
					type='text'
					placeholder='Назва вправи'
					value={newExercise.name}
					onChange={e =>
						setNewExercise({ ...newExercise, name: e.target.value })
					}
					className='border p-2 rounded mb-2 w-full'
				/>
				<input
					type='text'
					placeholder='М’язова група'
					value={newExercise.muscleGroup}
					onChange={e =>
						setNewExercise({ ...newExercise, muscleGroup: e.target.value })
					}
					className='border p-2 rounded mb-2 w-full'
				/>
				<select
					value={newExercise.exerciseCategoryId}
					onChange={e =>
						setNewExercise({
							...newExercise,
							exerciseCategoryId: Number(e.target.value),
						})
					}
					className='border p-2 rounded mb-2 w-full'
				>
					<option value={0}>Оберіть категорію</option>
					{categories.map(category => (
						<option key={category.id} value={category.id}>
							{category.name}
						</option>
					))}
				</select>
				<input
					type='text'
					placeholder='Складність (Easy, Medium, Hard)'
					value={newExercise.difficulty}
					onChange={e =>
						setNewExercise({ ...newExercise, difficulty: e.target.value })
					}
					className='border p-2 rounded mb-2 w-full'
				/>
				<input
					type='text'
					placeholder='Посилання на YouTube відео'
					value={newExercise.videoUrl}
					onChange={e =>
						setNewExercise({ ...newExercise, videoUrl: e.target.value })
					}
					className='border p-2 rounded mb-2 w-full'
				/>
				<textarea
					placeholder='Опис'
					value={newExercise.description}
					onChange={e =>
						setNewExercise({ ...newExercise, description: e.target.value })
					}
					className='border p-2 rounded mb-2 w-full'
				/>
				<input
					type='text'
					placeholder='Обладнання'
					value={newExercise.equipment}
					onChange={e =>
						setNewExercise({ ...newExercise, equipment: e.target.value })
					}
					className='border p-2 rounded mb-2 w-full'
				/>
				<input
					type='number'
					placeholder='Тривалість (секунди)'
					value={newExercise.duration}
					onChange={e =>
						setNewExercise({ ...newExercise, duration: Number(e.target.value) })
					}
					className='border p-2 rounded mb-2 w-full'
				/>
				<input
					type='number'
					placeholder='Кількість повторень'
					value={newExercise.reps}
					onChange={e =>
						setNewExercise({ ...newExercise, reps: Number(e.target.value) })
					}
					className='border p-2 rounded mb-2 w-full'
				/>
				<input
					type='number'
					placeholder='Час відпочинку (секунди)'
					value={newExercise.restDuration}
					onChange={e =>
						setNewExercise({
							...newExercise,
							restDuration: Number(e.target.value),
						})
					}
					className='border p-2 rounded mb-2 w-full'
				/>
				<input
					type='number'
					placeholder='Калорії'
					value={newExercise.calories}
					onChange={e =>
						setNewExercise({ ...newExercise, calories: Number(e.target.value) })
					}
					className='border p-2 rounded mb-2 w-full'
				/>
				<input
					type='text'
					placeholder='Інтенсивність (Low, Medium, High)'
					value={newExercise.intensity}
					onChange={e =>
						setNewExercise({ ...newExercise, intensity: e.target.value })
					}
					className='border p-2 rounded mb-2 w-full'
				/>
				<button
					onClick={handleCreateOrUpdateExercise}
					className='px-4 py-2 bg-blue-500 text-white rounded mt-2'
				>
					{editExerciseId ? 'Оновити вправу' : 'Додати вправу'}
				</button>
				{editExerciseId && (
					<button
						onClick={() => {
							setEditExerciseId(null)
							setNewExercise({
								name: '',
								muscleGroup: '',
								exerciseCategoryId: 0,
								difficulty: '',
								videoUrl: '',
								description: '',
								equipment: '',
								duration: 0,
								reps: 0,
								restDuration: 0,
								calories: 0,
								intensity: '',
							})
						}}
						className='px-4 py-2 bg-gray-500 text-white rounded mt-2 ml-2'
					>
						Скасувати редагування
					</button>
				)}
			</div>

			<div className='mb-6'>
				<h3 className='text-xl font-semibold mb-2'>Доступні вправи</h3>
				<ul>
					{availableExercises.map(exercise => (
						<li
							key={exercise.id}
							className='flex justify-between items-center mb-2'
						>
							<span>
								{exercise.name} (
								{exercise.exerciseCategory?.name || 'Без категорії'})
							</span>
							<div>
								<button
									onClick={() => handleEditExercise(exercise)}
									className='px-2 py-1 bg-yellow-500 text-white rounded mr-2'
								>
									Редагувати
								</button>
								<button
									onClick={() => handleDeleteExercise(exercise.id)}
									className='px-2 py-1 bg-red-500 text-white rounded'
								>
									Видалити
								</button>
								{exercise.videoUrl && (
									<a
										href={exercise.videoUrl}
										target='_blank'
										rel='noopener noreferrer'
										className='px-2 py-1 bg-green-500 text-white rounded ml-2'
									>
										Відео
									</a>
								)}
							</div>
						</li>
					))}
				</ul>
			</div>

			<div className='mb-6'>
				<h3 className='text-xl font-semibold mb-2'>Створити план тренувань</h3>
				<select
					value={fitnessGoal}
					onChange={e => setFitnessGoal(e.target.value)}
					className='border p-2 rounded mb-2'
				>
					<option value=''>Оберіть фітнес-ціль</option>
					<option value='Lose Belly Fat'>Схуднення живота</option>
					<option value='Muscle Gain'>Набір м’язової маси</option>
					<option value='Flexibility'>Гнучкість</option>
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
						<option key={exercise.id} value={exercise.id}>
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
							<h3 className='text-lg font-semibold'>
								{plan.name || 'Six Pack in 30 Days'}
							</h3>
							<p className='text-gray-600'>Ціль: {plan.fitnessGoal}</p>
							{plan.weeklyGoal && (
								<p className='text-sm text-gray-500'>
									Тижнева мета: 0/{plan.weeklyGoal} тренувань
								</p>
							)}
							<h4 className='font-medium mt-2'>Вправи:</h4>
							<ul>
								{plan.exercises.map((item: any) => (
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
