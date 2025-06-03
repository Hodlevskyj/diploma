import { PlanExercise } from '@/types/workout'
import { FC } from 'react'

interface ExerciseListProps {
	exercises: PlanExercise[]
	onEdit?: (exercise: PlanExercise) => void
	onDelete: (exerciseId: number) => void
}

const ExerciseList: FC<ExerciseListProps> = ({
	exercises,
	onEdit,
	onDelete,
}) => (
	<div className='mt-6'>
		<h3 className='text-lg font-semibold mb-2'>Список вправ</h3>
		<ul className='list-disc pl-5'>
			{exercises.map(exercise => (
				<li key={exercise.id} className='mb-2'>
					{exercise.exercise.name} ({exercise.exercise.muscleGroup})
					<div className='flex gap-2 mt-1'>
						{onEdit && (
							<button
								onClick={() => onEdit(exercise)}
								className='text-blue-500'
							>
								Редагувати
							</button>
						)}
						<button
							onClick={() => onDelete(exercise.id)}
							className='text-red-500'
						>
							Видалити
						</button>
					</div>
				</li>
			))}
		</ul>
	</div>
)

export default ExerciseList
