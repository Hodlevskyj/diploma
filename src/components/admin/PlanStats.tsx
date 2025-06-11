import { Plan } from '@/app/admin/plans/page'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PlanStatsProps {
	plans: Plan[]
}

export function PlanStats({ plans }: PlanStatsProps) {
	// Підрахунок статистики
	const totalPlans = plans.length
	const activePlans = plans.filter(p => p.status === 'ACTIVE').length
	const completedPlans = plans.filter(p => p.status === 'COMPLETED').length
	const uniqueUsers = new Set(plans.map(p => p.userId)).size

	// Підрахунок за цілями
	const goalCounts: Record<string, number> = {}
	plans.forEach(plan => {
		if (plan.fitnessGoal) {
			goalCounts[plan.fitnessGoal] = (goalCounts[plan.fitnessGoal] || 0) + 1
		}
	})

	return (
		<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
			<Card>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<CardTitle className='text-sm font-medium'>Всього планів</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold'>{totalPlans}</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<CardTitle className='text-sm font-medium'>Завершені плани</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold'>{completedPlans}</div>
					<p className='text-xs text-muted-foreground'>
						{totalPlans > 0
							? Math.round((completedPlans / totalPlans) * 100)
							: 0}
						% від загальної кількості
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
					<CardTitle className='text-sm font-medium'>
						Унікальні користувачі
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold'>{uniqueUsers}</div>
				</CardContent>
			</Card>
		</div>
	)
}
