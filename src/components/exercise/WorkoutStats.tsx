'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

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

interface WorkoutCompletion {
	id: number
	userId: number
	exerciseId: number
	exercise: Exercise
	completedAt: string
	duration: number
}

export default function WorkoutStats() {
	const { user, loading: authLoading } = useAuth()
	const [stats, setStats] = useState<WorkoutCompletion[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' })

	useEffect(() => {
		const fetchStats = async () => {
			if (!user) {
				setError('User not authenticated')
				setLoading(false)
				return
			}
			try {
				const params = new URLSearchParams({
					startDate: dateRange.startDate,
					endDate: dateRange.endDate,
				}).toString()
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_BASE_URL}/exercises/stats/${user.id}?${params}`,
					{ credentials: 'include' }
				)
				if (!response.ok) throw new Error('Failed to fetch stats')
				const data = await response.json()
				setStats(data)
			} catch (err) {
				setError(
					err instanceof Error ? err.message : 'An unexpected error occurred'
				)
			} finally {
				setLoading(false)
			}
		}

		if (!authLoading) fetchStats()
	}, [user, authLoading, dateRange])

	const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setDateRange({ ...dateRange, [e.target.name]: e.target.value })
	}

	if (authLoading || loading) return <p>Завантаження статистики...</p>
	if (error) return <p>Помилка: {error}</p>

	return (
		<div className='p-4 max-w-7xl mx-auto'>
			<h2 className='text-2xl font-bold mb-4'>Відстеження виконання</h2>

			<div className='mb-6'>
				<h3 className='text-xl font-semibold mb-2'>Фільтр за датою</h3>
				<input
					type='date'
					name='startDate'
					value={dateRange.startDate}
					onChange={handleDateChange}
					className='border p-2 rounded mr-2'
				/>
				<input
					type='date'
					name='endDate'
					value={dateRange.endDate}
					onChange={handleDateChange}
					className='border p-2 rounded'
				/>
			</div>

			<div>
				{stats.length > 0 ? (
					<div>
						<h3 className='text-xl font-semibold mb-2'>
							Статистика виконаних вправ
						</h3>
						<ul>
							{stats.map((completion: WorkoutCompletion) => (
								<li key={completion.id} className='mb-2'>
									<p>Вправа: {completion.exercise.name}</p>
									<p>
										Дата:{' '}
										{new Date(completion.completedAt).toLocaleDateString()}
									</p>
									<p>
										Тривалість: {Math.floor(completion.duration / 60)}:
										{('0' + (completion.duration % 60)).slice(-2)}
									</p>
								</li>
							))}
						</ul>
						<h3 className='text-xl font-semibold mt-6 mb-2'>
							Календар тренувань
						</h3>
						<div className='grid grid-cols-7 gap-2'>
							{Array.from({ length: 31 }, (_, i) => {
								const date = new Date()
								date.setDate(date.getDate() - (date.getDate() - 1) + i)
								const completions = stats.filter(
									c =>
										new Date(c.completedAt).toDateString() ===
										date.toDateString()
								)
								return (
									<div key={i} className='border p-2 text-center'>
										<p>{date.getDate()}</p>
										{completions.length > 0 && (
											<p className='text-green-500'>✓ {completions.length}</p>
										)}
									</div>
								)
							})}
						</div>
					</div>
				) : (
					<p>Немає виконаних вправ за вибраний період.</p>
				)}
			</div>
		</div>
	)
}
