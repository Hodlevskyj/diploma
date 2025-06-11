'use client'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Textarea } from '@/components/ui/textarea'
import {
	adminDeleteExercise,
	adminGetCategories,
	adminGetExercises,
	adminUpdateExercise,
} from '@/lib/api'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Exercise } from '../../../types/planexercise'

// export type ExerciseCategory = {
// 	id: number
// 	name: string
// 	createdAt: string
// 	updatedAt: string
// }

// export type Exercise = {
// 	id: number
// 	name: string
// 	muscleGroup: string
// 	exerciseCategory?: ExerciseCategory | null
// 	exerciseCategoryId?: number | null
// 	difficulty?: string | null
// 	videoUrl?: string | null
// 	description?: string | null
// 	equipment?: string | null
// 	duration?: number | null
// 	reps?: number | null
// 	restDuration?: number | null
// 	calories?: number | null
// 	intensity?: string | null
// 	imageUrl?: string | null
// 	createdAt: string
// 	updatedAt: string
// 	userId: number
// }
export enum ExerciseCategory {
	STRENGTH = 'STRENGTH',
	CARDIO = 'CARDIO',
	FLEXIBILITY = 'FLEXIBILITY',
	BALANCE = 'BALANCE',
}

// Тип для нової вправи
type NewExercise = {
	name: string
	muscleGroup: string
	difficulty?: string
	videoUrl?: string
	description?: string
	equipment?: string
	exerciseCategoryId?: number | null
	category: string
}

type CategoryType = {
	id: number
	name: string
	createdAt: string
	updatedAt: string
}

export default function ExercisesPage() {
	const [access, setAccess] = useState<'pending' | 'allowed' | 'forbidden'>(
		'pending'
	)
	const [exercises, setExercises] = useState<Exercise[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
	const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(
		null
	)
	const [isProcessing, setIsProcessing] = useState(false)

	// Стан для нової вправи
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [newExercise, setNewExercise] = useState<NewExercise>({
		name: '',
		muscleGroup: '',
		difficulty: 'Medium',
		description: '',
		category: '',
	})
	const [categories, setCategories] = useState<CategoryType[]>([])

	// Перевірка доступу
	useEffect(() => {
		fetch('http://localhost:4000/admin', {
			credentials: 'include',
		})
			.then(res => {
				if (res.status === 403) {
					setAccess('forbidden')
				} else if (res.ok) {
					setAccess('allowed')
				} else {
					setAccess('forbidden')
				}
			})
			.catch(() => setAccess('forbidden'))
	}, [])

	// Завантаження вправ
	const loadExercises = () => {
		if (access !== 'allowed') return
		setLoading(true)
		adminGetExercises()
			.then(setExercises)
			.catch(err => setError(err.message))
			.finally(() => setLoading(false))
	}

	// Завантаження категорій
	const loadCategories = async () => {
		if (access !== 'allowed') return
		setLoading(true)
		adminGetCategories()
			.then(setCategories)
			.catch(err => setError(err.message))
			.finally(() => setLoading(false))
	}

	useEffect(() => {
		if (access === 'allowed') {
			loadExercises()
			loadCategories()
		}
	}, [access])

	useEffect(() => {
		loadExercises()
	}, [access])

	// Функція оновлення вправи
	const handleUpdateExercise = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!editingExercise) return

		setIsProcessing(true)
		try {
			// Створюємо об'єкт тільки з полями, які можна оновлювати
			const updateData = {
				name: editingExercise.name,
				description: editingExercise.description,
				muscleGroup: editingExercise.muscleGroup,
				difficulty: editingExercise.difficulty,
				videoUrl: editingExercise.videoUrl,
				equipment: editingExercise.equipment,
				duration: editingExercise.duration,
				reps: editingExercise.reps,
				restDuration: editingExercise.restDuration,
				calories: editingExercise.calories,
				intensity: editingExercise.intensity,
				imageUrl: editingExercise.imageUrl,
				exerciseCategoryId: editingExercise.exerciseCategoryId,
			}

			await adminUpdateExercise(editingExercise.id, updateData)
			toast.success('Вправу успішно оновлено')
			setIsEditDialogOpen(false)
			loadExercises() // Перезавантажуємо список вправ
		} catch (error: any) {
			toast.error(error.message || 'Помилка при оновленні вправи')
		} finally {
			setIsProcessing(false)
		}
	}

	// Функція створення нової вправи
	// Функція створення вправи
	const handleCreateExercise = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsProcessing(true)

		try {
			// Знаходимо ID категорії за назвою
			const categoryName = newExercise.category
			const category = categories.find(
				cat => cat.name.toUpperCase() === categoryName
			)

			// Створюємо об'єкт даних для відправки
			const exerciseData = {
				name: newExercise.name,
				muscleGroup: newExercise.muscleGroup,
				difficulty: newExercise.difficulty,
				description: newExercise.description,
				videoUrl: newExercise.videoUrl,
				// Важливо: передаємо ID категорії як число
				exerciseCategoryId: category ? Number(category.id) : undefined,
			}

			console.log('Дані для відправки:', exerciseData)

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/exercises`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
					body: JSON.stringify(exerciseData),
				}
			)

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.message || 'Помилка при створенні вправи')
			}

			toast.success('Вправу успішно створено')
			loadExercises()
			setIsCreateDialogOpen(false)
			setNewExercise({
				name: '',
				muscleGroup: '',
				difficulty: 'Medium',
				description: '',
				category: '',
				exerciseCategoryId: null,
			})
		} catch (error: any) {
			toast.error(error.message)
		} finally {
			setIsProcessing(false)
		}
	}

	// Функція видалення вправи
	const handleDeleteExercise = async () => {
		if (!exerciseToDelete) return

		setIsProcessing(true)
		try {
			await adminDeleteExercise(exerciseToDelete.id)
			toast.success('Вправу успішно видалено')
			setIsDeleteDialogOpen(false)
			loadExercises() // Перезавантажуємо список вправ
		} catch (error: any) {
			toast.error(error.message || 'Помилка при видаленні вправи')
		} finally {
			setIsProcessing(false)
		}
	}

	// Відображення станів завантаження
	if (access === 'pending') {
		return <div className='p-8 text-center'>Перевірка доступу...</div>
	}
	if (access === 'forbidden') {
		return (
			<div className='p-8 text-center text-red-600 font-bold'>
				Доступ лише для адміністратора
			</div>
		)
	}
	if (loading) {
		return <div className='p-8 text-center'>Завантаження вправ...</div>
	}
	if (error) {
		return (
			<div className='p-8 text-center text-red-600 font-bold'>
				Помилка: {error}
			</div>
		)
	}

	return (
		<SidebarProvider>
			<AppSidebar variant='inset' />
			<SidebarInset>
				<SiteHeader />
				<div className='flex flex-1 flex-col p-6'>
					<div className='flex justify-between items-center mb-6'>
						<h1 className='text-2xl font-bold'>Вправи</h1>
						<Button onClick={() => setIsCreateDialogOpen(true)}>
							Додати нову вправу
						</Button>
					</div>
					<div className='grid gap-4'>
						{exercises.length === 0 ? (
							<p>Немає доступних вправ</p>
						) : (
							exercises.map(exercise => (
								<div
									key={exercise.id}
									className='border rounded-lg p-4 flex justify-between items-center'
								>
									<div>
										<h2 className='text-xl font-semibold'>{exercise.name}</h2>
										<p className='text-gray-600'>{exercise.description}</p>
										{exercise.muscleGroup && (
											<p className='text-sm text-gray-500'>
												Група м'язів: {exercise.muscleGroup}
											</p>
										)}
									</div>
									<div className='flex gap-2'>
										<Button
											variant='outline'
											onClick={() => {
												setEditingExercise(exercise)
												setIsEditDialogOpen(true)
											}}
										>
											Редагувати
										</Button>
										<Button
											variant='destructive'
											onClick={() => {
												setExerciseToDelete(exercise)
												setIsDeleteDialogOpen(true)
											}}
										>
											Видалити
										</Button>
									</div>
								</div>
							))
						)}
					</div>
				</div>
			</SidebarInset>

			{/* Діалог створення нової вправи */}
			<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
				<DialogContent className='sm:max-w-[425px]'>
					<DialogHeader>
						<DialogTitle>Додати нову вправу</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleCreateExercise}>
						<div className='grid gap-4 py-4'>
							<div className='grid grid-cols-4 items-center gap-4'>
								<label htmlFor='new-name' className='text-right'>
									Назва
								</label>
								<Input
									id='new-name'
									value={newExercise.name}
									onChange={e =>
										setNewExercise(prev => ({ ...prev, name: e.target.value }))
									}
									className='col-span-3'
									required
								/>
							</div>
							<div className='grid grid-cols-4 items-center gap-4'>
								<label htmlFor='new-description' className='text-right'>
									Опис
								</label>
								<Textarea
									id='new-description'
									value={newExercise.description || ''}
									onChange={e =>
										setNewExercise(prev => ({
											...prev,
											description: e.target.value,
										}))
									}
									className='col-span-3'
								/>
							</div>
							<div className='grid grid-cols-4 items-center gap-4'>
								<label htmlFor='new-muscleGroup' className='text-right'>
									Група м'язів
								</label>
								<Input
									id='new-muscleGroup'
									value={newExercise.muscleGroup}
									onChange={e =>
										setNewExercise(prev => ({
											...prev,
											muscleGroup: e.target.value,
										}))
									}
									className='col-span-3'
									required
								/>
							</div>
							<div className='grid grid-cols-4 items-center gap-4'>
								<label htmlFor='new-difficulty' className='text-right'>
									Складність
								</label>
								<Input
									id='new-difficulty'
									value={newExercise.difficulty || ''}
									onChange={e =>
										setNewExercise(prev => ({
											...prev,
											difficulty: e.target.value,
										}))
									}
									className='col-span-3'
								/>
							</div>
							{/* Селектор категорій */}
							<div className='grid grid-cols-4 items-center gap-4'>
								<label htmlFor='new-category' className='text-right'>
									Категорія
								</label>
								<select
									id='new-category'
									className='col-span-3 p-2 border rounded'
									value={newExercise.category || ''}
									onChange={e => {
										const categoryValue = e.target.value
										console.log('Вибрана категорія:', categoryValue)

										// Знаходимо категорію за назвою
										const category = categories.find(
											cat => cat.name.toUpperCase() === categoryValue
										)

										console.log('Знайдена категорія:', category)

										setNewExercise(prev => ({
											...prev,
											category: categoryValue,
											exerciseCategoryId: category ? category.id : null,
										}))
									}}
								>
									<option value=''>Оберіть категорію</option>
									{categories.map(category => (
										<option
											key={category.id}
											value={category.name.toUpperCase()}
										>
											{category.name}
										</option>
									))}
								</select>
							</div>
							<div className='grid grid-cols-4 items-center gap-4'>
								<label htmlFor='new-videoUrl' className='text-right'>
									URL відео
								</label>
								<Input
									id='new-videoUrl'
									value={newExercise.videoUrl || ''}
									onChange={e =>
										setNewExercise(prev => ({
											...prev,
											videoUrl: e.target.value,
										}))
									}
									className='col-span-3'
								/>
							</div>
						</div>
						<DialogFooter>
							<Button type='submit' disabled={isProcessing}>
								{isProcessing ? 'Створення...' : 'Створити вправу'}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Діалог редагування вправи */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className='sm:max-w-[425px]'>
					<DialogHeader>
						<DialogTitle>Редагувати вправу</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleUpdateExercise}>
						<div className='grid gap-4 py-4'>
							<div className='grid grid-cols-4 items-center gap-4'>
								<label htmlFor='name' className='text-right'>
									Назва
								</label>
								<Input
									id='name'
									value={editingExercise?.name || ''}
									onChange={e =>
										setEditingExercise(prev =>
											prev ? { ...prev, name: e.target.value } : null
										)
									}
									className='col-span-3'
								/>
							</div>
							<div className='grid grid-cols-4 items-center gap-4'>
								<label htmlFor='description' className='text-right'>
									Опис
								</label>
								<Textarea
									id='description'
									value={editingExercise?.description || ''}
									onChange={e =>
										setEditingExercise(prev =>
											prev ? { ...prev, description: e.target.value } : null
										)
									}
									className='col-span-3'
								/>
							</div>
							<div className='grid grid-cols-4 items-center gap-4'>
								<label htmlFor='muscleGroup' className='text-right'>
									Група м'язів
								</label>
								<Input
									id='muscleGroup'
									value={editingExercise?.muscleGroup || ''}
									onChange={e =>
										setEditingExercise(prev =>
											prev ? { ...prev, muscleGroup: e.target.value } : null
										)
									}
									className='col-span-3'
								/>
							</div>
							{/* Селектор категорій для редагування */}
							<div className='grid grid-cols-4 items-center gap-4'>
								<label htmlFor='edit-category' className='text-right'>
									Категорія
								</label>
								<select
									id='edit-category'
									className='col-span-3 p-2 border rounded'
									value={
										editingExercise?.exerciseCategory?.name?.toUpperCase() || ''
									}
									// Виправляємо код для селектора редагування вправи
									onChange={e => {
										const categoryValue = e.target.value
										// Знаходимо категорію за назвою
										const category = categories.find(
											cat => cat.name.toUpperCase() === categoryValue
										)

										setEditingExercise(prev => {
											if (!prev) return null

											// Створюємо копію exerciseCategory з правильним типом
											const updatedExerciseCategory = category
												? {
														id: category.id,
														name: category.name,
														createdAt: category.createdAt,
														updatedAt: category.updatedAt,
												  }
												: null

											return {
												...prev,
												exerciseCategory: updatedExerciseCategory,
												exerciseCategoryId: category?.id || null,
											}
										})
									}}
								>
									<option value=''>Оберіть категорію</option>
									{Object.values(ExerciseCategory).map(category => (
										<option key={category} value={category}>
											{category === ExerciseCategory.STRENGTH
												? 'Силові тренування'
												: category === ExerciseCategory.CARDIO
												? 'Кардіо'
												: category === ExerciseCategory.FLEXIBILITY
												? 'Розтяжка'
												: category === ExerciseCategory.BALANCE
												? 'Баланс'
												: category}
										</option>
									))}
								</select>
							</div>
						</div>
						<DialogFooter>
							<Button type='submit' disabled={isProcessing}>
								{isProcessing ? 'Збереження...' : 'Зберегти зміни'}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Діалог підтвердження видалення */}
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent className='sm:max-w-[425px]'>
					<DialogHeader>
						<DialogTitle>Підтвердження видалення</DialogTitle>
					</DialogHeader>
					<div className='py-4'>
						<p>
							Ви впевнені, що хочете видалити вправу "{exerciseToDelete?.name}"?
						</p>
					</div>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => setIsDeleteDialogOpen(false)}
						>
							Скасувати
						</Button>
						<Button
							variant='destructive'
							onClick={handleDeleteExercise}
							disabled={isProcessing}
						>
							{isProcessing ? 'Видалення...' : 'Видалити'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</SidebarProvider>
	)
}

// 'use client'
// import { Button } from '@/components/ui/button'
// import { adminGetCategories, adminGetExercises } from '@/lib/api'
// import { useEffect, useState } from 'react'
// import { Exercise } from '../../../types/planexercise'

// type NewExercise = {
// 	name: string
// 	muscleGroup: string
// 	difficulty?: string
// 	videoUrl?: string
// 	description?: string
// 	equipment?: string
// 	exerciseCategoryId?: number | null
// 	category: string
// }

// type CategoryType = {
// 	id: number
// 	name: string
// 	createdAt: string
// 	updatedAt: string
// }

// export default function ExercisesPage() {
// 	const [exercises, setExercises] = useState<Exercise[]>([])
// 	const [loading, setLoading] = useState(true)
// 	const [error, setError] = useState<string | null>(null)
// 	const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
// 	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
// 	const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(
// 		null
// 	)
// 	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
// 	const [isProcessing, setIsProcessing] = useState(false)
// 	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
// 	const [newExercise, setNewExercise] = useState<NewExercise>({
// 		name: '',
// 		muscleGroup: '',
// 		difficulty: 'Medium',
// 		description: '',
// 		category: '',
// 	})
// 	const [categories, setCategories] = useState<CategoryType[]>([])

// 	// Завантаження вправ
// 	const loadExercises = () => {
// 		setLoading(true)
// 		adminGetExercises()
// 			.then(setExercises)
// 			.catch(err => setError(err.message))
// 			.finally(() => setLoading(false))
// 	}

// 	// Завантаження категорій
// 	const loadCategories = async () => {
// 		setLoading(true)
// 		adminGetCategories()
// 			.then(setCategories)
// 			.catch(err => setError(err.message))
// 			.finally(() => setLoading(false))
// 	}

// 	useEffect(() => {
// 		loadExercises()
// 		loadCategories()
// 	}, [])

// 	// Функція оновлення вправи
// 	const handleUpdateExercise = async (e: React.FormEvent) => {
// 		// Код функції залишається без змін
// 	}

// 	// Функція створення вправи
// 	const handleCreateExercise = async (e: React.FormEvent) => {
// 		// Код функції залишається без змін
// 	}

// 	// Функція видалення вправи
// 	const handleDeleteExercise = async () => {
// 		// Код функції залишається без змін
// 	}

// 	// Відображення станів завантаження
// 	if (loading) {
// 		return <div className='p-8 text-center'>Завантаження вправ...</div>
// 	}
// 	if (error) {
// 		return (
// 			<div className='p-8 text-center text-red-600 font-bold'>
// 				Помилка: {error}
// 			</div>
// 		)
// 	}

// 	return (
// 		<div className='flex flex-1 flex-col p-6'>
// 			<div className='flex justify-between items-center mb-6'>
// 				<h1 className='text-2xl font-bold'>Вправи</h1>
// 				<Button onClick={() => setIsCreateDialogOpen(true)}>
// 					Додати нову вправу
// 				</Button>
// 			</div>

// 			{/* Решта коду залишається без змін */}
// 		</div>
// 	)
// }
