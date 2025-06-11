'use client'

import { FavoriteButton } from '@/components/button/FavoriteButton'
import { PlanCard } from '@/components/plans/PlanCard'
import { Button } from '@/components/ui/button'
import { checkIfPlanIsFavorite, getPlans } from '@/lib/api'
import { Loader2, Plus } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Plan {
	id: number
	name: string
	description: string | null
	fitnessGoal: string | null
	status: string
	createdAt: string
}

export default function PlansPage() {
	const [plans, setPlans] = useState<Plan[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [favoriteIds, setFavoriteIds] = useState<number[]>([])

	useEffect(() => {
		const fetchPlans = async () => {
			try {
				setLoading(true)
				const data = await getPlans()
				setPlans(data)

				// Отримуємо статус улюбленого для кожного плану
				const favoriteStatuses = await Promise.all(
					data.map(async (plan: any) => {
						const isFavorite = await checkIfPlanIsFavorite(plan.id)
						return { id: plan.id, isFavorite }
					})
				)

				// Фільтруємо тільки улюблені плани
				const favoriteIds = favoriteStatuses
					.filter(status => status.isFavorite)
					.map(status => status.id)

				setFavoriteIds(favoriteIds)
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : 'Помилка завантаження планів'
				setError(errorMessage)
				toast.error('Помилка', { description: errorMessage })
			} finally {
				setLoading(false)
			}
		}

		fetchPlans()
	}, [])

	const handleFavoriteChange = (planId: number, isFavorite: boolean) => {
		if (isFavorite) {
			setFavoriteIds(prev => [...prev, planId])
		} else {
			setFavoriteIds(prev => prev.filter(id => id !== planId))
		}
	}

	if (loading) {
		return (
			<div className='container mx-auto py-8 flex justify-center items-center min-h-[50vh]'>
				<Loader2 className='h-8 w-8 animate-spin text-primary' />
			</div>
		)
	}

	if (error) {
		return (
			<div className='container mx-auto py-8'>
				<div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
					<p>{error}</p>
				</div>
			</div>
		)
	}

	return (
		<div className='container mx-auto py-8'>
			<div className='flex justify-between items-center mb-8'>
				<h1 className='text-3xl font-bold'>Мої плани тренувань</h1>
				<div className='flex gap-4'>
					<Link href='/dashboard/plans/generate-plan'>
						<Button>
							<Plus className='mr-2 h-4 w-4' />
							Створити новий план
						</Button>
					</Link>
				</div>
			</div>

			{plans.length === 0 ? (
				<div className='text-center py-12'>
					<p className='text-muted-foreground mb-4'>
						У вас ще немає планів тренувань
					</p>
					<Link href='/dashboard/plans/generate-plan'>
						<Button>Створити перший план</Button>
					</Link>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{plans.map(plan => (
						<PlanCard
							key={plan.id}
							id={plan.id}
							name={plan.name}
							description={plan.description}
							fitnessGoal={plan.fitnessGoal}
							isFavorite={favoriteIds.includes(plan.id)}
							onFavoriteChange={handleFavoriteChange}
						>
							<FavoriteButton
								planId={plan.id}
								initialState={favoriteIds.includes(plan.id)}
								onChange={isFav => handleFavoriteChange(plan.id, isFav)}
							/>
						</PlanCard>
					))}
				</div>
			)}
		</div>
	)
}
