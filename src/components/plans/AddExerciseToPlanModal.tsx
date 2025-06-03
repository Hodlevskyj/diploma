import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { useEffect, useState } from 'react'

interface AddExerciseToPlanModalProps {
	planId: number
	open: boolean
	onOpenChange: (open: boolean) => void
	onSubmit: (exerciseData: any) => Promise<void>
	onAdded: () => void
}

interface Exercise {
	id: number
	name: string
}

export function AddExerciseToPlanModal({
	planId,
	open,
	onOpenChange,
	onAdded,
	onSubmit,
}: AddExerciseToPlanModalProps) {
	const [exercises, setExercises] = useState<Exercise[]>([])
	const [exerciseId, setExerciseId] = useState<number | null>(null)
	const [order, setOrder] = useState<number>(1)
	const [reps, setReps] = useState<number>(0)
	const [duration, setDuration] = useState<number>(0)
	const [restDuration, setRestDuration] = useState<number>(0)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [validationError, setValidationError] = useState<string | null>(null)

	useEffect(() => {
		if (open) {
			import('@/lib/api').then(({ getExercises }) => {
				getExercises()
					.then(setExercises)
					.catch(() => setError('Не вдалося завантажити вправи'))
			})
		}
	}, [open])

	// Валідація: тільки одне з полів (reps або duration) і хоча б одне > 0
	const validate = () => {
		if (!exerciseId) {
			setValidationError('Оберіть вправу')
			return false
		}
		if ((reps > 0 && duration > 0) || (reps === 0 && duration === 0)) {
			setValidationError(
				'Вкажіть або повторення, або тривалість (одне з двох, і більше 0)'
			)
			return false
		}
		setValidationError(null)
		return true
	}

	const handleRepsChange = (value: number) => {
		setReps(value)
		if (value > 0) setDuration(0)
	}
	const handleDurationChange = (value: number) => {
		setDuration(value)
		if (value > 0) setReps(0)
	}

	const handleAdd = async () => {
		if (!validate()) return
		setLoading(true)
		setError(null)
		try {
			await onSubmit({
				exerciseId,
				order,
				reps,
				duration,
				restDuration,
			})
			onAdded()
			onOpenChange(false)
			setExerciseId(null)
			setOrder(1)
			setReps(0)
			setDuration(0)
			setRestDuration(0)
		} catch (e: any) {
			setError(e.message || 'Помилка додавання вправи')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Додати вправу до плану</DialogTitle>
				</DialogHeader>
				{error && <div className='text-red-500 mb-2'>{error}</div>}
				{validationError && (
					<div className='text-red-500 mb-2'>{validationError}</div>
				)}
				<div className='space-y-2'>
					<div>
						<label className='block mb-1'>Вправа</label>
						<select
							className='w-full border rounded px-2 py-1'
							value={exerciseId ?? ''}
							onChange={e => setExerciseId(Number(e.target.value))}
						>
							<option value='' disabled>
								Оберіть вправу
							</option>
							{exercises.map(ex => (
								<option key={ex.id} value={ex.id}>
									{ex.name}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className='block mb-1'>Порядок</label>
						<input
							type='number'
							className='w-full border rounded px-2 py-1'
							value={order}
							min={1}
							onChange={e => setOrder(Number(e.target.value))}
						/>
					</div>
					<div>
						<label className='block mb-1'>Повторення (reps)</label>
						<input
							type='number'
							className='w-full border rounded px-2 py-1'
							value={reps}
							min={0}
							onChange={e => handleRepsChange(Number(e.target.value))}
							disabled={duration > 0}
						/>
					</div>
					<div>
						<label className='block mb-1'>Тривалість (секунди)</label>
						<input
							type='number'
							className='w-full border rounded px-2 py-1'
							value={duration}
							min={0}
							onChange={e => handleDurationChange(Number(e.target.value))}
							disabled={reps > 0}
						/>
					</div>
					<div>
						<label className='block mb-1'>Відпочинок (секунди)</label>
						<input
							type='number'
							className='w-full border rounded px-2 py-1'
							value={restDuration}
							min={0}
							onChange={e => setRestDuration(Number(e.target.value))}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button
						variant='outline'
						onClick={() => onOpenChange(false)}
						disabled={loading}
					>
						Скасувати
					</Button>
					<Button onClick={handleAdd} disabled={loading || !exerciseId}>
						{loading ? 'Додається...' : 'Додати'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
