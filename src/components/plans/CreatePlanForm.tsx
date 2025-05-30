import { FC, useState } from 'react'
import { GoalType } from '../../types/plan'

interface CreatePlanFormProps {
	onSubmit: (data: {
		name: string
		description: string
		fitnessGoal: GoalType
	}) => void
	onCancel: () => void
	loading: boolean
}

const CreatePlanForm: FC<CreatePlanFormProps> = ({
	onSubmit,
	onCancel,
	loading,
}) => {
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		fitnessGoal: GoalType.LOSE_WEIGHT,
	})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			console.log('Відправка форми з даними:', formData)
			await onSubmit(formData)
		} catch (error) {
			console.error('Помилка при відправці форми:', error)
		}
	}

	return (
		<form onSubmit={handleSubmit} className='space-y-4'>
			<div>
				<label className='block text-sm font-medium text-gray-700'>
					Назва плану
				</label>
				<input
					type='text'
					value={formData.name}
					onChange={e => setFormData({ ...formData, name: e.target.value })}
					className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
					required
					disabled={loading}
				/>
			</div>
			<div>
				<label className='block text-sm font-medium text-gray-700'>Опис</label>
				<textarea
					value={formData.description}
					onChange={e =>
						setFormData({ ...formData, description: e.target.value })
					}
					className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
					rows={3}
					required
					disabled={loading}
				/>
			</div>
			<div>
				<label className='block text-sm font-medium text-gray-700'>Ціль</label>
				<select
					value={formData.fitnessGoal}
					onChange={e =>
						setFormData({
							...formData,
							fitnessGoal: e.target.value as GoalType,
						})
					}
					className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
					disabled={loading}
				>
					{Object.values(GoalType).map(goal => (
						<option key={goal} value={goal}>
							{goal.replace('_', ' ')}
						</option>
					))}
				</select>
			</div>
			<div className='flex justify-end space-x-2'>
				<button
					type='button'
					onClick={onCancel}
					className='px-4 py-2 border rounded-md hover:bg-gray-50'
					disabled={loading}
				>
					Скасувати
				</button>
				<button
					type='submit'
					className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
					disabled={loading}
				>
					{loading ? 'Створюємо...' : 'Створити план'}
				</button>
			</div>
		</form>
	)
}

export default CreatePlanForm
