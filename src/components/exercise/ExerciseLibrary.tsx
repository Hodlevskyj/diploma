'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
	Activity,
	ChevronLeft,
	ChevronRight,
	Dumbbell,
	Filter,
	Heart,
	Pizza,
	Search,
	Target,
	TrendingUp,
	Zap,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { ExerciseCard } from './ExerciseCard'

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
	isTimeBased?: boolean
}

export default function ExerciseLibrary() {
	const { user, loading: authLoading } = useAuth()
	const [exercises, setExercises] = useState<Exercise[]>([])
	const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([])
	const [searchTerm, setSearchTerm] = useState('')
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
	const [favoriteIds, setFavoriteIds] = useState<number[]>([])
	const [currentPage, setCurrentPage] = useState(1)
	const itemsPerPage = 9

	// Отримання вправ один раз при змінні компонента
	useEffect(() => {
		const fetchExercises = async () => {
			if (!user) return

			try {
				setLoading(true)
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/exercises`,
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

		setFilteredExercises(result)
		setCurrentPage(1) // Скидаємо на першу сторінку при зміні фільтрів
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

	const handleFavoriteChange = (exerciseId: number, isFavorite: boolean) => {
		setFavoriteIds(prev =>
			isFavorite ? [...prev, exerciseId] : prev.filter(id => id !== exerciseId)
		)
	}

	// Пагінація
	const indexOfLastItem = currentPage * itemsPerPage
	const indexOfFirstItem = indexOfLastItem - itemsPerPage
	const currentExercises = filteredExercises.slice(
		indexOfFirstItem,
		indexOfLastItem
	)
	const totalPages = Math.ceil(filteredExercises.length / itemsPerPage)

	const paginate = (pageNumber: number) => setCurrentPage(pageNumber)
	const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages))
	const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1))

	// Статистика
	const cardioCount = exercises.filter(
		ex => ex.exerciseCategory?.name === 'Cardio'
	).length
	const strengthCount = exercises.filter(
		ex => ex.exerciseCategory?.name === 'Strength'
	).length
	const stretchingCount = exercises.filter(
		ex => ex.exerciseCategory?.name === 'Stretching'
	).length
	const absCount = exercises.filter(
		ex => ex.exerciseCategory?.name === 'Abs'
	).length
	const armsount = exercises.filter(
		ex => ex.exerciseCategory?.name === 'Arms'
	).length

	if (authLoading || loading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-background via-muted/50 to-background'>
				<div className='container mx-auto py-8 space-y-8'>
					{/* Header Skeleton */}
					<div className='text-center space-y-4 py-16'>
						<Skeleton className='h-4 w-32 mx-auto' />
						<Skeleton className='h-12 w-96 mx-auto' />
						<Skeleton className='h-6 w-80 mx-auto' />
					</div>

					{/* Stats Skeleton */}
					<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
						{[...Array(3)].map((_, i) => (
							<Card key={i}>
								<CardContent className='p-6'>
									<div className='flex items-center gap-4'>
										<Skeleton className='h-12 w-12 rounded-xl' />
										<div className='space-y-2'>
											<Skeleton className='h-8 w-12' />
											<Skeleton className='h-4 w-24' />
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					{/* Search and Filters Skeleton */}
					<Card>
						<CardContent className='p-6 space-y-4'>
							<Skeleton className='h-10 w-full max-w-md' />
							<div className='flex gap-2 flex-wrap'>
								{[...Array(4)].map((_, i) => (
									<Skeleton key={i} className='h-10 w-24' />
								))}
							</div>
						</CardContent>
					</Card>

					{/* Exercise Cards Skeleton */}
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{[...Array(6)].map((_, i) => (
							<Card key={i}>
								<CardContent className='p-6 space-y-4'>
									<Skeleton className='h-6 w-3/4' />
									<Skeleton className='h-4 w-1/2' />
									<Skeleton className='h-4 w-2/3' />
									<Skeleton className='h-10 w-full' />
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-background via-muted/50 to-background'>
				<div className='container mx-auto py-8'>
					<Alert variant='destructive' className='max-w-md mx-auto'>
						<AlertDescription>Помилка: {error}</AlertDescription>
					</Alert>
				</div>
			</div>
		)
	}

	if (!user) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-background via-muted/50 to-background'>
				<div className='container mx-auto py-8'>
					<Alert className='max-w-md mx-auto'>
						<AlertDescription>
							Будь ласка, увійдіть для перегляду вправ.
						</AlertDescription>
					</Alert>
				</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-background via-muted/50 to-background mt-9'>
			{/* Stats Section */}
			<div className='container mx-auto px-4 -mt-8 relative z-10'>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-12'>
					<Card className='hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-red-200'>
						<CardContent className='p-6'>
							<div className='flex items-center gap-4'>
								<div className='w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center'>
									<Activity className='w-6 h-6 text-red-600' />
								</div>
								<div>
									<p className='text-2xl font-bold'>{cardioCount}</p>
									<p className='text-sm text-muted-foreground'>Кардіо вправи</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-blue-200'>
						<CardContent className='p-6'>
							<div className='flex items-center gap-4'>
								<div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center'>
									<Dumbbell className='w-6 h-6 text-blue-600' />
								</div>
								<div>
									<p className='text-2xl font-bold'>{strengthCount}</p>
									<p className='text-sm text-muted-foreground'>Силові вправи</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-green-200'>
						<CardContent className='p-6'>
							<div className='flex items-center gap-4'>
								<div className='w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center'>
									<Zap className='w-6 h-6 text-green-600' />
								</div>
								<div>
									<p className='text-2xl font-bold'>{stretchingCount}</p>
									<p className='text-sm text-muted-foreground'>Розтяжка</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-violet-200'>
						<CardContent className='p-6'>
							<div className='flex items-center gap-4'>
								<div className='w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center'>
									<Dumbbell className='w-6 h-6 text-violet-600' />
								</div>
								<div>
									<p className='text-2xl font-bold'>{armsount}</p>
									<p className='text-sm text-muted-foreground'>Руки</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-orange-200'>
						<CardContent className='p-6'>
							<div className='flex items-center gap-4'>
								<div className='w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center'>
									<Pizza className='w-6 h-6 text-orange-600' />
								</div>
								<div>
									<p className='text-2xl font-bold'>{absCount}</p>
									<p className='text-sm text-muted-foreground'>Прес</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Search and Filter Section */}
			<div className='container mx-auto px-4 pb-8'>
				<Card className='mb-8'>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Search className='w-5 h-5' />
							Пошук та фільтри
						</CardTitle>
						<CardDescription>
							Знайдіть потрібні вправи за назвою або категорією
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-6'>
						{/* Search Input */}
						<div className='relative max-w-md'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
							<Input
								type='text'
								value={searchTerm}
								onChange={handleSearchChange}
								placeholder='Пошук вправ...'
								className='pl-10'
							/>
						</div>

						<Separator />

						{/* Category Filters */}
						<div className='space-y-4'>
							<div className='flex items-center gap-2'>
								<Filter className='w-4 h-4 text-muted-foreground' />
								<span className='text-sm font-medium'>Категорії:</span>
							</div>
							<div className='flex gap-2 flex-wrap'>
								<Button
									variant={selectedCategory === null ? 'default' : 'outline'}
									onClick={() => handleCategoryFilter(null)}
									className='gap-2'
								>
									<Target className='w-4 h-4' />
									Показати всі
								</Button>

								<Button
									variant={
										selectedCategory === 'Cardio' ? 'default' : 'outline'
									}
									onClick={() => handleCategoryFilter('Cardio')}
									className='gap-2'
								>
									<Activity className='w-4 h-4' />
									Кардіо
								</Button>

								<Button
									variant={
										selectedCategory === 'Strength' ? 'default' : 'outline'
									}
									onClick={() => handleCategoryFilter('Strength')}
									className='gap-2'
								>
									<Dumbbell className='w-4 h-4' />
									Силові тренування
								</Button>

								<Button
									variant={selectedCategory === 'Arms' ? 'default' : 'outline'}
									onClick={() => handleCategoryFilter('Arms')}
									className='gap-2'
								>
									<Dumbbell className='w-4 h-4' />
									Руки
								</Button>

								<Button
									variant={
										selectedCategory === 'Stretching' ? 'default' : 'outline'
									}
									onClick={() => handleCategoryFilter('Stretching')}
									className='gap-2'
								>
									<Zap className='w-4 h-4' />
									Розтяжка
								</Button>

								<Button
									variant={selectedCategory === 'Abs' ? 'default' : 'outline'}
									onClick={() => handleCategoryFilter('Abs')}
									className='gap-2'
								>
									<Pizza className='w-4 h-4' />
									Прес
								</Button>
							</div>
						</div>

						{/* Results Count */}
						<div className='flex items-center justify-between'>
							<Badge variant='secondary' className='gap-2'>
								<TrendingUp className='w-4 h-4' />
								Знайдено: {filteredExercises.length} вправ
							</Badge>
							{favoriteIds.length > 0 && (
								<Badge variant='outline' className='gap-2'>
									<Heart className='w-4 h-4 text-red-500' />
									Улюблених: {favoriteIds.length}
								</Badge>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Exercise Grid */}
				{filteredExercises.length > 0 ? (
					<div className='space-y-8'>
						<div className='text-center space-y-2'>
							<h2 className='text-2xl md:text-3xl font-bold'>
								{selectedCategory ? `${selectedCategory} вправи` : 'Всі вправи'}
							</h2>
							<p className='text-muted-foreground'>
								Оберіть вправи для створення власного тренування
							</p>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
							{currentExercises.map((exercise, index) => (
								<div
									key={exercise.id}
									className='transform transition-all duration-300 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-4'
									style={{
										animationDelay: `${index * 50}ms`,
										animationFillMode: 'both',
									}}
								>
									<ExerciseCard
										exercise={exercise}
										isFavorite={favoriteIds.includes(exercise.id)}
										// onFavoriteChange={isFav =>
										// 	handleFavoriteChange(exercise.id, isFav)
										// }
									/>
								</div>
							))}
						</div>

						{/* Pagination Controls */}
						<div className='flex justify-center items-center gap-4 mt-4'>
							<Button
								variant='outline'
								onClick={prevPage}
								disabled={currentPage === 1}
								className='gap-2'
							>
								<ChevronLeft className='w-4 h-4' />
								Попередня
							</Button>
							{Array.from({ length: totalPages }, (_, i) => i + 1).map(
								number => (
									<Button
										key={number}
										variant={currentPage === number ? 'default' : 'outline'}
										onClick={() => paginate(number)}
										className='w-10 h-10'
									>
										{number}
									</Button>
								)
							)}
							<Button
								variant='outline'
								onClick={nextPage}
								disabled={currentPage === totalPages}
								className='gap-2'
							>
								Наступна
								<ChevronRight className='w-4 h-4' />
							</Button>
						</div>
					</div>
				) : (
					<Card className='max-w-2xl mx-auto'>
						<CardContent className='text-center py-16 px-8'>
							<div className='space-y-6'>
								<div className='w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto'>
									<Search className='w-12 h-12 text-muted-foreground' />
								</div>

								<div className='space-y-3'>
									<h3 className='text-2xl font-bold'>Вправи не знайдено</h3>
									<p className='text-muted-foreground leading-relaxed'>
										Спробуйте змінити пошуковий запит або оберіть іншу категорію
									</p>
								</div>

								<Button
									onClick={() => {
										setSearchTerm('')
										setSelectedCategory(null)
									}}
									className='gap-2'
								>
									<Target className='w-4 h-4' />
									Скинути фільтри
								</Button>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	)
}
