import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { useEffect, useState } from 'react'

interface EditExerciseInPlanModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	exercise: {
		id: number
		order: number
		reps?: number | null
		duration?: number | null
		restDuration?: number | null
		exercise: { name: string }
	}
	onSubmit: (data: {
		order: number
		reps?: number
		duration?: number
		restDuration?: number
	}) => Promise<void>
}

export function EditExerciseInPlanModal({
	open,
	onOpenChange,
	exercise,
	onSubmit,
}: EditExerciseInPlanModalProps) {
	const [order, setOrder] = useState<number>(exercise.order)
	const [reps, setReps] = useState<number>(exercise.reps ?? 0)
	const [duration, setDuration] = useState<number>(exercise.duration ?? 0)
	const [restDuration, setRestDuration] = useState<number>(
		exercise.restDuration ?? 0
	)
	const [loading, setLoading] = useState(false)
	const [validationError, setValidationError] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (open) {
			setOrder(exercise.order)
			setReps(exercise.reps ?? 0)
			setDuration(exercise.duration ?? 0)
			setRestDuration(exercise.restDuration ?? 0)
			setValidationError(null)
			setError(null)
		}
	}, [open, exercise])

	const validate = () => {
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

	const handleEdit = async () => {
		if (!validate()) return
		setLoading(true)
		setError(null)
		try {
			await onSubmit({
				order,
				reps,
				duration,
				restDuration,
			})
			onOpenChange(false)
		} catch (e: any) {
			setError(e.message || 'Помилка редагування вправи')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						Редагувати вправу: {exercise.exercise?.name}
					</DialogTitle>
				</DialogHeader>
				{error && <div className='text-red-500 mb-2'>{error}</div>}
				{validationError && (
					<div className='text-red-500 mb-2'>{validationError}</div>
				)}
				<div className='space-y-2'>
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
					<Button onClick={handleEdit} disabled={loading}>
						{loading ? 'Зберігається...' : 'Зберегти'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
