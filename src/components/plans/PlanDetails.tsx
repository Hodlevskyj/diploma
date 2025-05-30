import { FC, useState } from 'react'
import { AddExerciseDto, Plan, PlanStatus } from '../../types/plan'
import ExerciseList from './ExerciseList'

interface PlanDetailsProps {
	plan: Plan
	onStatusChange: (status: PlanStatus) => void
	onEdit?: () => void
	onAddExercise: (data: AddExerciseDto) => void
	onEditExercise: (exercise: any) => void
	onDeleteExercise: (exerciseId: number) => void
	isUpdating?: boolean
	isAddingExercise?: boolean
	isDeletingExercise?: boolean
}

const PlanDetails: FC<PlanDetailsProps> = ({
	plan,
	onStatusChange,
	onEdit,
	onAddExercise,
	onEditExercise,
	onDeleteExercise,
	isAddingExercise,
}) => {
	const [showAddExerciseForm, setShowAddExerciseForm] = useState(false)
	const [exerciseData, setExerciseData] = useState<AddExerciseDto>({
		exerciseId: 0,
		order: 0,
		reps: 0,
		duration: 0,
		restDuration: 0,
	})

	const handleAddExercise = () => {
		if (exerciseData.exerciseId === 0) {
			alert('Будь ласка, виберіть вправу')
			return
		}
		onAddExercise(exerciseData)
		setShowAddExerciseForm(false)
		setExerciseData({
			exerciseId: 0,
			order: 0,
			reps: 0,
			duration: 0,
			restDuration: 0,
		})
	}

	return (
		<div className='bg-white p-6 rounded-lg shadow-md'>
			<div className='flex justify-between items-start mb-6'>
				<div>
					<h1 className='text-2xl font-bold mb-2'>{plan.name}</h1>
					<p className='text-gray-600'>{plan.description}</p>
				</div>
				{onEdit && (
					<button
						onClick={onEdit}
						className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
					>
						Редагувати
					</button>
				)}
			</div>
			<div className='mb-6'>
				<div className='flex items-center gap-4'>
					<span className='font-medium'>Статус:</span>
					<select
						value={plan.status}
						onChange={e => onStatusChange(e.target.value as PlanStatus)}
						className='rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
					>
						{Object.values(PlanStatus).map(status => (
							<option key={status} value={status}>
								{status.replace('_', ' ')}
							</option>
						))}
					</select>
				</div>
			</div>
			<div className='mb-4'>
				<button
					onClick={() => setShowAddExerciseForm(true)}
					className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600'
					disabled={isAddingExercise}
				>
					{isAddingExercise ? 'Додавання...' : 'Додати вправу'}
				</button>
			</div>
			{showAddExerciseForm && (
				<div className='mb-4 p-4 border rounded-lg'>
					<h3 className='text-lg font-semibold mb-2'>Додати нову вправу</h3>
					<div className='flex flex-col gap-2'>
						<input
							type='number'
							placeholder='ID вправи'
							value={exerciseData.exerciseId}
							onChange={e =>
								setExerciseData({
									...exerciseData,
									exerciseId: Number(e.target.value),
								})
							}
							className='border rounded p-2'
						/>
						<input
							type='number'
							placeholder='Порядок'
							value={exerciseData.order}
							onChange={e =>
								setExerciseData({
									...exerciseData,
									order: Number(e.target.value),
								})
							}
							className='border rounded p-2'
						/>
						<input
							type='number'
							placeholder='Кількість повторів'
							value={exerciseData.reps || ''}
							onChange={e =>
								setExerciseData({
									...exerciseData,
									reps: Number(e.target.value),
								})
							}
							className='border rounded p-2'
						/>
						<input
							type='number'
							placeholder='Тривалість (сек)'
							value={exerciseData.duration || ''}
							onChange={e =>
								setExerciseData({
									...exerciseData,
									duration: Number(e.target.value),
								})
							}
							className='border rounded p-2'
						/>
						<input
							type='number'
							placeholder='Тривалість відпочинку (сек)'
							value={exerciseData.restDuration || ''}
							onChange={e =>
								setExerciseData({
									...exerciseData,
									restDuration: Number(e.target.value),
								})
							}
							className='border rounded p-2'
						/>
						<div className='flex gap-2'>
							<button
								onClick={handleAddExercise}
								className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600'
							>
								Підтвердити
							</button>
							<button
								onClick={() => setShowAddExerciseForm(false)}
								className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600'
							>
								Скасувати
							</button>
						</div>
					</div>
				</div>
			)}
			<ExerciseList
				exercises={plan.exercises}
				onEdit={onEditExercise}
				onDelete={onDeleteExercise}
			/>
		</div>
	)
}

export default PlanDetails
