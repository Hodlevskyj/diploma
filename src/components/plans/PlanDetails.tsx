'use client'

import { Button } from '@/components/ui/button'
import {
	addExerciseToPlan,
	getPlan,
	removeExerciseFromPlan,
	updateExerciseInPlan,
	updatePlan,
} from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { WorkoutPlan, WorkoutPlanExercise } from '../../types/planexercise'
import { EditExerciseInPlanModal } from '../exercise/EditExerciseInPlanModal'
import { AddExerciseToPlanModal } from './AddExerciseToPlanModal'
import { EditPlanModal } from './EditPlanModal'

type PlanDetailsProps = {
	plan: WorkoutPlan
	onStatusChange: (status: string) => void
	onEdit: () => void
	onAddExercise: (data: any) => void
	onEditExercise: (exercise: WorkoutPlanExercise) => void
	onDeleteExercise: (exerciseId: number) => void
	isUpdating: boolean
	isAddingExercise: boolean
	isDeletingExercise: boolean
}

export default function PlanDetails({
	plan,
	onStatusChange,
	onEdit,
	onAddExercise,
	onEditExercise,
	onDeleteExercise,
	isUpdating,
	isAddingExercise,
	isDeletingExercise,
}: PlanDetailsProps) {
	const [addExerciseOpen, setAddExerciseOpen] = useState(false)
	const [editExercise, setEditExercise] = useState<WorkoutPlanExercise | null>(
		null
	)
	const [loading, setLoading] = useState(false)
	const [planState, setPlanState] = useState<WorkoutPlan>(plan)
	const [error, setError] = useState<string | null>(null)
	const [deletingId, setDeletingId] = useState<number | null>(null)
	const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

	const [editOpen, setEditOpen] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const router = useRouter()

	const exercises = useMemo(() => {
		console.log('Аналізуємо структуру плану для отримання вправ:', planState)

		// Перевіряємо, чи є вправи безпосередньо в плані
		if (Array.isArray(planState.exercises) && planState.exercises.length > 0) {
			console.log('Знайдено вправи безпосередньо в плані:', planState.exercises)
			return planState.exercises.slice().sort((a, b) => a.order - b.order)
		}

		// Перевіряємо, чи є вправи в WorkoutDay
		if (
			Array.isArray(planState.WorkoutDay) &&
			planState.WorkoutDay.length > 0
		) {
			console.log('Знайдено дні тренувань:', planState.WorkoutDay)
			const allExercises = planState.WorkoutDay.flatMap(day =>
				Array.isArray(day.exercises) ? day.exercises : []
			)
			console.log('Вправи з днів тренувань:', allExercises)
			return allExercises.sort((a, b) => a.order - b.order)
		}

		if (planState.id) {
			fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/plans/${planState.id}/exercises`,
				{
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json',
					},
				}
			)
				.then(res => res.json())
				.then(data => {
					console.log('Отримані вправи через додатковий API запит:', data)
					if (Array.isArray(data) && data.length > 0) {
						setExercisesFromApi(data.sort((a, b) => a.order - b.order))
					}
				})
				.catch(err => console.error('Помилка отримання вправ:', err))
		}

		return []
	}, [planState])

	const [exercisesFromApi, setExercisesFromApi] = useState<any[]>([])

	const displayExercises = exercises.length > 0 ? exercises : exercisesFromApi

	const fetchPlan = async () => {
		setLoading(true)
		setError(null)
		try {
			const data = await getPlan(plan.id)
			console.log('Отримані дані плану: ', data)
			setPlanState(data)
		} catch (e: any) {
			setError(e.message || 'Не вдалося оновити план')
		} finally {
			setLoading(false)
		}
	}

	const handleAddExercise = async (exerciseData: any) => {
		setLoading(true)
		setError(null)
		try {
			console.log('Додаємо вправу:', exerciseData, 'до плану:', plan.id)
			const result = await addExerciseToPlan(plan.id, exerciseData)
			console.log('Результат додавання вправи:', result)
			await fetchPlan()
			setAddExerciseOpen(false)
		} catch (e: any) {
			console.error('Помилка додавання вправи:', e)
			setError(e.message || 'Помилка додавання вправи')
		} finally {
			setLoading(false)
		}
	}

	const handleDeleteExercise = async (exerciseId: number) => {
		setDeletingId(exerciseId)
		setError(null)
		try {
			await removeExerciseFromPlan(plan.id, exerciseId)
			await fetchPlan()
		} catch (e: any) {
			setError(e.message || 'Помилка видалення вправи')
		} finally {
			setDeletingId(null)
		}
	}

	const handleEditExercise = (exercise: WorkoutPlanExercise) => {
		setEditExercise(exercise)
	}

	const handleEditExerciseSubmit = async (data: {
		order: number
		reps?: number
		duration?: number
		restDuration?: number
	}) => {
		setLoading(true)
		setError(null)
		try {
			await updateExerciseInPlan(plan.id, editExercise!.id, data)
			await fetchPlan()
			setEditExercise(null)
		} catch (e: any) {
			setError(e.message || 'Помилка редагування вправи')
		} finally {
			setLoading(false)
		}
	}

	const handleSavePlan = async (data: {
		name: string
		description?: string
	}) => {
		setIsSaving(true)
		try {
			await updatePlan(planState.id, data)
			await fetchPlan()
			setEditOpen(false)
		} finally {
			setIsSaving(false)
		}
	}
	const butRun = () => {
		router.push(`/dashboard/plans/${planState.id}/run`)
	}

	return (
		<div className='max-w-2xl mx-auto'>
			<div className='flex justify-between items-center mb-4'>
				<h2 className='text-2xl font-bold'>{planState.name}</h2>
				<div className='flex gap-4'>
					<Button onClick={() => setEditOpen(true)}>Редагувати план</Button>
					<Button onClick={() => butRun()}>Виконати план</Button>
				</div>
			</div>
			<div className='mb-2 text-muted-foreground'>{planState.description}</div>
			<div className='mb-4'>
				<span className='font-semibold'>Статус:</span> {planState.status}
			</div>
			<Button onClick={() => setAddExerciseOpen(true)} className='mb-4'>
				Додати вправу
			</Button>
			<AddExerciseToPlanModal
				planId={plan.id}
				open={addExerciseOpen}
				onOpenChange={setAddExerciseOpen}
				onSubmit={handleAddExercise}
				onAdded={() => {}}
			/>
			{editExercise && (
				<EditExerciseInPlanModal
					open={!!editExercise}
					onOpenChange={open => !open && setEditExercise(null)}
					exercise={editExercise}
					onSubmit={handleEditExerciseSubmit}
				/>
			)}
			<EditPlanModal
				open={editOpen}
				onOpenChange={setEditOpen}
				plan={planState}
				onSubmit={handleSavePlan}
				isSaving={isSaving}
			/>
			{error && <div className='text-red-500 mb-2'>{error}</div>}
			<h3 className='text-xl font-semibold mb-2'>Вправи у плані</h3>

			{loading ? (
				<div className='text-muted-foreground'>Оновлення...</div>
			) : displayExercises.length === 0 ? (
				<div className='text-muted-foreground'>Вправ ще немає.</div>
			) : (
				<ul className='space-y-2'>
					{displayExercises.map(ex => (
						<li
							key={ex.id}
							className='border rounded p-2 flex justify-between items-center'
						>
							<div>
								<div className='font-semibold'>
									{ex.exercise?.name ?? ex.exerciseName ?? 'Невідома вправа'}
								</div>
								<div className='text-sm text-muted-foreground'>
									Порядок: {ex.order} |{' '}
									{ex.reps && ex.reps > 0
										? `Повторення: ${ex.reps}`
										: ex.duration && ex.duration > 0
										? `Тривалість: ${ex.duration} сек`
										: '—'}
									{' | '}
									Відпочинок: {ex.restDuration} сек
								</div>
							</div>
							<div className='flex gap-2'>
								<Button
									size='sm'
									variant='outline'
									onClick={() => handleEditExercise(ex)}
								>
									Редагувати
								</Button>
								<Button
									size='sm'
									variant='destructive'
									onClick={() => setConfirmDeleteId(ex.id)}
									disabled={isDeletingExercise || deletingId === ex.id}
								>
									{deletingId === ex.id ? 'Видаляється...' : 'Видалити'}
								</Button>
							</div>
						</li>
					))}
				</ul>
			)}
			{/* Модалка підтвердження видалення */}
			{confirmDeleteId !== null && (
				<div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50'>
					<div className='bg-white rounded shadow-lg p-6 max-w-xs w-full'>
						<div className='mb-4 text-center'>
							<p className='font-semibold mb-2'>Підтвердіть видалення</p>
							<p>Ви дійсно хочете видалити цю вправу з плану?</p>
						</div>
						<div className='flex justify-end gap-2'>
							<Button
								variant='outline'
								onClick={() => setConfirmDeleteId(null)}
								disabled={isDeletingExercise}
							>
								Скасувати
							</Button>
							<Button
								variant='destructive'
								onClick={async () => {
									await handleDeleteExercise(confirmDeleteId!)
									setConfirmDeleteId(null)
								}}
								disabled={isDeletingExercise}
							>
								Видалити
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
