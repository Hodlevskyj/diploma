import Link from 'next/link'
import { FC } from 'react'
import { Plan } from '../../types/plan'

interface PlanCardProps {
	plan: Plan
	onDelete: () => void
}

const PlanCard: FC<PlanCardProps> = ({ plan, onDelete }) => {
	return (
		<div className='bg-white p-4 rounded-lg shadow hover:shadow-lg transition'>
			<h3 className='text-lg font-bold mb-2'>{plan.name}</h3>
			<p className='text-gray-600 mb-2'>{plan.description}</p>
			<div className='flex items-center gap-2 mb-4'>
				<span className='px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm'>
					{plan.fitnessGoal.replace('_', ' ')}
				</span>
				<span className='px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm'>
					{plan.status.replace('_', ' ')}
				</span>
			</div>
			<div className='flex justify-between'>
				<Link
					href={`/plans/${plan.id}`}
					className='text-blue-500 hover:text-blue-700'
				>
					Деталі
				</Link>
				<button onClick={onDelete} className='text-red-500 hover:text-red-700'>
					Видалити
				</button>
			</div>
		</div>
	)
}

export default PlanCard
