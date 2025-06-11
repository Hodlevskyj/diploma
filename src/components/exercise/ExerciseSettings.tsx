import { useState } from 'react'
import { Exercise, ExerciseProgress } from '../../types/planexercise'

interface ExerciseSettingsProps {
	exercise: Exercise

	onSettingsChange: (settings: ExerciseProgress) => void
}

const ExerciseSettings = ({
	exercise,
	onSettingsChange,
}: ExerciseSettingsProps) => {
	const [settingsType, setSettingsType] = useState<'reps' | 'time'>(
		exercise.duration ? 'time' : 'reps'
	)
	const handleTypeChange = (type: 'reps' | 'time') => {
		setSettingsType(type)
		console.log('Setting type to:', type)
		onSettingsChange({
			type,
			targetValue: type === 'reps' ? 5 : 15,
			currentValue: 0,
			isActive: false,
		})
	}
	const handleValueChange = (value: number) => {
		onSettingsChange({
			type: settingsType,
			targetValue: value,
			currentValue: 0,
			isActive: false,
		})
	}

	return (
		<div className='mt-4 p-4 bg-gray-50 rounded-lg'>
			<div className='mb-4'>
				<label className='block text-sm font-medium mb-2'>
					Оберіть тип вправи:
				</label>
				<div className='flex gap-4'>
					<button
						onClick={() => handleTypeChange('reps')}
						className={`px-4 py-2 rounded ${
							settingsType === 'reps' ? 'bg-blue-500 text-white' : 'bg-gray-200'
						}`}
					>
						Повторення
					</button>
					<button
						onClick={() => handleTypeChange('time')}
						className={`px-4 py-2 rounded ${
							settingsType === 'time' ? 'bg-blue-500 text-white' : 'bg-gray-200'
						}`}
					>
						Час
					</button>
				</div>
			</div>

			{settingsType === 'reps' ? (
				<div className='mb-4'>
					<label className='block text-sm font-medium mb-2'>
						Кількість повторень:
					</label>
					<select
						onChange={e => handleValueChange(Number(e.target.value))}
						className='w-full p-2 border rounded'
						defaultValue={10}
					>
						{[5, 8, 10, 12, 15, 20].map(value => (
							<option key={value} value={value}>
								{value} повторень
							</option>
						))}
					</select>
				</div>
			) : (
				<div className='mb-4'>
					<label className='block text-sm font-medium mb-2'>
						Тривалість (секунди):
					</label>
					<select
						onChange={e => handleValueChange(Number(e.target.value))}
						className='w-full p-2 border rounded'
						defaultValue={60}
					>
						{[15, 30, 45, 60, 90].map(value => (
							<option key={value} value={value}>
								{value} секунд
							</option>
						))}
					</select>
				</div>
			)}
		</div>
	)
}

export default ExerciseSettings
