import { FC } from 'react'
import { PlanExercise } from '../../types/plan'

interface ExerciseListProps {
	exercises: PlanExercise[]
	onEdit: (exercise: PlanExercise) => void
	onDelete: (exerciseId: number) => void
}

const ExerciseList: FC<ExerciseListProps> = ({
	exercises,
	onEdit,
	onDelete,
}) => {
	return (
		<div>
			<h2 className='text-xl font-bold mb-4'>Вправи</h2>
			{exercises.length === 0 ? (
				<p className='text-gray-500'>Немає вправ</p>
			) : (
				exercises.map(exercise => (
					<div key={exercise.id} className='border-b py-4 last:border-b-0'>
						<div className='flex justify-between items-start'>
							<div>
								<h3 className='font-medium'>{exercise.exercise.name}</h3>
								<div className='text-sm text-gray-600 mt-1'>
									{exercise.reps !== undefined && exercise.reps > 0 && (
										<span>Повторень: {exercise.reps} | </span>
									)}
									{exercise.duration !== undefined && exercise.duration > 0 && (
										<span>Тривалість: {exercise.duration}с | </span>
									)}
									{exercise.restDuration !== undefined &&
										exercise.restDuration > 0 && (
											<span>Відпочинок: {exercise.restDuration}с</span>
										)}
								</div>
							</div>
							<div className='flex space-x-2'>
								<button
									onClick={() => onEdit(exercise)}
									className='text-blue-500 hover:text-blue-700'
								>
									Редагувати
								</button>
								<button
									onClick={() => onDelete(exercise.id)}
									className='text-red-500 hover:text-red-700'
								>
									Видалити
								</button>
							</div>
						</div>
					</div>
				))
			)}
		</div>
	)
}

export default ExerciseList
