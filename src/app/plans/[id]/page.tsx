'use client'

import { getPlan } from '@/lib/api'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import PlanDetails from '../../../components/plans/PlanDetails'
import type { WorkoutPlan } from '../../../types/planexercise'

export default function PlanDetailsPage() {
	const params = useParams()
	const id = params?.id

	const [plan, setPlan] = useState<WorkoutPlan | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!id) return
		setLoading(true)
		getPlan(Number(id))
			.then(setPlan)
			.catch(err => setError(err.message))
			.finally(() => setLoading(false))
	}, [id])

	if (loading) return <div>Завантаження...</div>
	if (error) return <div>Помилка: {error}</div>
	if (!plan) return <div>План не знайдено</div>

	return (
		<PlanDetails
			plan={plan}
			onStatusChange={() => {}}
			onEdit={() => {}}
			onAddExercise={() => {}}
			onEditExercise={() => {}}
			onDeleteExercise={() => {}}
			isUpdating={false}
			isAddingExercise={false}
			isDeletingExercise={false}
		/>
	)
}
