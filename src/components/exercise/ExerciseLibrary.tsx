'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import CategoryButton from '../button/CategoryButton'

interface ExerciseCategory {
	id: number
	name: string
}

interface Exercise {
	id: number
	name: string
	muscleGroup: string
	exerciseCategory: ExerciseCategory
	equipment?: string
	isTimeBased?: boolean // true для вправ на час, false для повторень
}

export default function ExerciseLibrary() {
	const { user, loading: authLoading } = useAuth()
	const [exercises, setExercises] = useState<Exercise[]>([])
	const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
	const [searchTerm, setSearchTerm] = useState('')
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

	// Отримання вправ один раз при змінні компонента
	useEffect(() => {
		const fetchExercises = async () => {
			if (!user) return

			try {
				setLoading(true)
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_BASE_URL}/exercises`,
					{ credentials: 'include' }
				)

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`)
				}

				const data = await response.json()
				setExercises(data)
				setFilteredExercises(data) // Ініціалізація з усіма вправами
			} catch (err) {
				setError(
					err instanceof Error ? err.message : 'An unexpected error occurred'
				)
			} finally {
				setLoading(false)
			}
		}

		if (!authLoading && user) fetchExercises()
	}, [user, authLoading])

	// Фільтрація вправ на основі пошуку та категорії
	const filterExercises = useCallback(() => {
		let result = [...exercises]

		// Застосування фільтру пошуку
		if (searchTerm) {
			result = result.filter(exercise =>
				exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
			)
		}

		// Застосування фільтру категорії
		if (selectedCategory) {
			result = result.filter(
				exercise => exercise.exerciseCategory?.name === selectedCategory
			)
		}

		// сортування за назвою
		result.sort((a, b) => a.name.localeCompare(b.name))

		setFilteredExercises(result) // Ініціалізація з усіма вправами
	}, [exercises, searchTerm, selectedCategory])

	// Застосування фільтрів при зміні пошуку або категорії
	useEffect(() => {
		filterExercises()
	}, [filterExercises, searchTerm, selectedCategory])

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value)
	}

	const handleCategoryFilter = (category: string | null) => {
		setSelectedCategory(category)
	}

	if (authLoading || loading) return <p>Завантаження вправ...</p>
	if (error) return <p>Помилка: {error}</p>
	if (!user) return <p>Будь ласка, увійдіть для перегляду вправ.</p>

	return (
		<div className='p-4 max-w-7xl mx-auto'>
			<h2 className='text-2xl font-bold mb-4'>Бібліотека вправ</h2>

			<div className='flex flex-wrap gap-4 mb-6'>
				<input
					type='text'
					value={searchTerm}
					onChange={handleSearchChange}
					placeholder='Пошук вправ...'
					className='border p-2 rounded'
				/>
				<div className='flex gap-2'>
					<CategoryButton
						category={null}
						selectedCategory={selectedCategory}
						onClick={() => handleCategoryFilter(null)}
					>
						Показати всі
					</CategoryButton>

					<CategoryButton
						category='Cardio'
						selectedCategory={selectedCategory}
						onClick={() => handleCategoryFilter('Cardio')}
					>
						Кардіо
					</CategoryButton>

					<CategoryButton
						category='Strength'
						selectedCategory={selectedCategory}
						onClick={() => handleCategoryFilter('Strength')}
					>
						Силові тренування
					</CategoryButton>

					<CategoryButton
						category='Stretching'
						selectedCategory={selectedCategory}
						onClick={() => handleCategoryFilter('Stretching')}
					>
						Розтяжка
					</CategoryButton>
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
				{filteredExercises.length > 0 ? (
					filteredExercises.map(exercise => (
						<div key={exercise.id} className='bg-white p-4 rounded shadow'>
							<h3 className='text-lg font-semibold'>{exercise.name}</h3>
							<p>М'язова група: {exercise.muscleGroup}</p>
							<p>Категорія: {exercise.exerciseCategory?.name}</p>
							{exercise.equipment && <p>Обладнання: {exercise.equipment}</p>}
							<Link
								href={`/exercises/${exercise.id}`}
								className='text-blue-500 hover:underline'
							>
								Дивитись деталі
							</Link>
						</div>
					))
				) : (
					<p>Вправи не знайдено.</p>
				)}
			</div>
		</div>
	)
}
