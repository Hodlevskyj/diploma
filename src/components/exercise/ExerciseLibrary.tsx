'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function ExerciseLibrary() {
	const { user, loading: authLoading } = useAuth()
	const [exercises, setExercises] = useState([])
	const [filters, setFilters] = useState({
		muscleGroup: '',
		category: '',
		search: '',
		page: 1,
		limit: 20,
	})
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchExercises = async () => {
			try {
				setLoading(true)
				const params = new URLSearchParams({
					muscleGroup: filters.muscleGroup,
					category: filters.category,
					search: filters.search,
					page: filters.page.toString(),
					limit: filters.limit.toString(),
				}).toString()

				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_BASE_URL}/exercises?${params}`,
					{ credentials: 'include' }
				)

				if (!response.ok) {
					const errorText = await response.text()
					throw new Error(
						`HTTP error! status: ${response.status} - ${errorText}`
					)
				}

				const data = await response.json()
				setExercises(data)
			} catch (err) {
				setError(
					err instanceof Error ? err.message : 'An unexpected error occurred'
				)
				console.error('Error fetching exercises:', err)
			} finally {
				setLoading(false)
			}
		}

		if (!authLoading && user) fetchExercises()
	}, [filters, authLoading, user])

	const handleFilterChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 })
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
					name='search'
					value={filters.search}
					onChange={handleFilterChange}
					placeholder='Пошук вправ...'
					className='border p-2 rounded'
				/>
				<select
					name='category'
					value={filters.category}
					onChange={handleFilterChange}
					className='border p-2 rounded'
				>
					<option value=''>Всі категорії</option>
					<option value='Cardio'>Кардіо</option>
					<option value='Strength'>Силові тренування</option>
					<option value='Stretching'>Розтяжка</option>
				</select>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
				{exercises.length > 0 ? (
					exercises.map((exercise: any) => (
						<div key={exercise.id} className='bg-white p-4 rounded shadow'>
							<h3 className='text-lg font-semibold'>{exercise.name}</h3>
							<p>М’язова група: {exercise.muscleGroup}</p>
							<p>Категорія: {exercise.category}</p>
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

			<div className='mt-4 flex justify-between'>
				<button
					onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
					disabled={filters.page === 1}
					className='px-4 py-2 bg-gray-200 rounded disabled:opacity-50'
				>
					Попередня
				</button>
				<button
					onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
					disabled={exercises.length < filters.limit}
					className='px-4 py-2 bg-gray-200 rounded disabled:opacity-50'
				>
					Наступна
				</button>
			</div>
		</div>
	)
}
