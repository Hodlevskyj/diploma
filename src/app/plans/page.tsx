'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { getPlans, removePlan } from '@/lib/api'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CreatePlanModal } from '../../components/plans/CreatePlanModal'

type Plan = {
	id: number
	name: string
	description?: string
	status: string
	createdAt: string
}

export default function PlansPage() {
	const [plans, setPlans] = useState<Plan[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [deleteId, setDeleteId] = useState<number | null>(null)
	const [deleting, setDeleting] = useState(false)

	const fetchPlans = () => {
		setLoading(true)
		getPlans()
			.then(data => (Array.isArray(data) ? setPlans(data) : setPlans([])))
			.catch(err => setError(err.message))
			.finally(() => setLoading(false))
	}

	useEffect(() => {
		fetchPlans()
	}, [])

	const handleDelete = async () => {
		if (deleteId == null) return
		setDeleting(true)
		try {
			await removePlan(deleteId)
			setDeleteId(null)
			fetchPlans()
		} catch {
			alert('Помилка видалення плану')
		} finally {
			setDeleting(false)
		}
	}

	if (loading) return <div>Завантаження...</div>
	if (error) return <div>Помилка: {error}</div>

	return (
		<div className='max-w-2xl mx-auto py-8'>
			<div className='flex justify-between items-center mb-6'>
				<h1 className='text-2xl font-bold'>Плани тренувань</h1>
				<CreatePlanModal onCreated={fetchPlans} />
			</div>
			{plans.length === 0 ? (
				<p>Планів ще немає.</p>
			) : (
				<div className='grid gap-4'>
					{plans.map(plan => (
						<Card key={plan.id}>
							<CardHeader>
								<CardTitle>{plan.name}</CardTitle>
							</CardHeader>
							<CardContent>
								<div>{plan.description || 'Без опису'}</div>
								<div className='text-sm text-muted-foreground'>
									Статус: {plan.status} <br />
									Дата створення:{' '}
									{new Date(plan.createdAt).toLocaleDateString()}
								</div>
								<div className='flex gap-2 mt-4'>
									<Link href={`/plans/${plan.id}`}>
										<Button variant='outline'>Деталі</Button>
									</Link>
									<Button
										variant='destructive'
										onClick={() => setDeleteId(plan.id)}
									>
										Видалити
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Модалка підтвердження видалення */}
			<Dialog
				open={deleteId !== null}
				onOpenChange={open => !open && setDeleteId(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Підтвердження видалення</DialogTitle>
					</DialogHeader>
					<div>Ви дійсно хочете видалити цей план?</div>
					<DialogFooter>
						<Button variant='outline' onClick={() => setDeleteId(null)}>
							Скасувати
						</Button>
						<Button
							variant='destructive'
							onClick={handleDelete}
							disabled={deleting}
						>
							{deleting ? 'Видалення...' : 'Видалити'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
