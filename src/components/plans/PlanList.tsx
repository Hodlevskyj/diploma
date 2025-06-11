import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { WorkoutPlan } from '@/types/planexercise'
import Link from 'next/link'

interface PlanListProps {
	plans: WorkoutPlan[]
	onDelete: (id: number) => void
	isDeleting: boolean
}

export function PlanList({ plans, onDelete, isDeleting }: PlanListProps) {
	if (plans.length === 0) {
		return (
			<div className='text-center py-8 text-gray-500'>
				Немає створених планів
			</div>
		)
	}

	return (
		<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
			{plans.map(plan => (
				<Card key={plan.id} className='p-6'>
					<h3 className='text-xl font-semibold mb-2'>{plan.name}</h3>
					<p className='text-gray-600 mb-4'>{plan.description}</p>

					<div className='flex gap-2 mb-4'>
						<span className='px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm'>
							{plan.status}
						</span>
						{plan.fitnessGoal && (
							<span className='px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm'>
								{plan.fitnessGoal}
							</span>
						)}
					</div>

					<div className='text-sm text-gray-500 mb-4'>
						<p>Створено: {formatDate(plan.createdAt)}</p>
						<p>Вправ: {plan.exercises.length}</p>
					</div>

					<div className='flex justify-between'>
						<Link href={`/dashboard/plans/${plan.id}`}>
							<Button variant='outline'>Деталі</Button>
						</Link>
						<Button
							variant='destructive'
							onClick={() => onDelete(plan.id)}
							disabled={isDeleting}
						>
							{isDeleting ? 'Видалення...' : 'Видалити'}
						</Button>
					</div>
				</Card>
			))}
		</div>
	)
}
