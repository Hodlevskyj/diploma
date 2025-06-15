'use client'

import { WorkoutCalendar } from '@/components/plans/WorkoutCalendar'
import { DashboardShell } from '@/components/shell'
import { useAuth } from '@/context/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function CalendarPage() {
	const { user } = useAuth()

	return (
		<DashboardShell>
			<div className='flex items-center justify-between p-5'>
				<div>
					<h1 className='text-2xl font-bold tracking-tight'>
						Календар тренувань
					</h1>
					<p className='text-muted-foreground'>
						Переглядайте та відмічайте виконані тренування
					</p>
				</div>
			</div>
			<div className='mt-6'>
				<QueryClientProvider client={queryClient}>
					<WorkoutCalendar userId={user?.id} />
				</QueryClientProvider>
			</div>
		</DashboardShell>
	)
}
