'use client'
import { PlanStats } from '@/components/admin/PlanStats'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { getAdminPlans, removePlan } from '@/lib/api'
import { useEffect, useState } from 'react'

export interface Plan {
	id: number
	name: string
	description?: string
	status: string
	fitnessGoal?: string
	userId: number
	createdAt: string
	user?: {
		name: string
		email: string
	}
}

const AdminPlansPage = () => {
	const [access, setAccess] = useState<'pending' | 'allowed' | 'forbidden'>(
		'pending'
	)
	const [plans, setPlans] = useState<Plan[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [deleteId, setDeleteId] = useState<number | null>(null)
	const [deleting, setDeleting] = useState(false)

	useEffect(() => {
		fetch('http://localhost:4000/admin', {
			credentials: 'include',
		})
			.then(res => {
				if (res.status === 403) {
					setAccess('forbidden')
				} else if (res.ok) {
					setAccess('allowed')
				} else {
					setAccess('forbidden')
				}
			})
			.catch(() => setAccess('forbidden'))
	}, [])

	const fetchPlans = async () => {
		setLoading(true)
		try {
			const data = await getAdminPlans()
			setPlans(Array.isArray(data) ? data : [])
			setError(null)
		} catch (err: any) {
			setError(err.message || 'Помилка завантаження планів')
		} finally {
			setLoading(false)
		}
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
		} catch (err) {
			setError('Помилка видалення плану')
		} finally {
			setDeleting(false)
		}
	}

	return (
		<SidebarProvider>
			<AppSidebar variant='inset' />
			<SidebarInset>
				<SiteHeader />
				<div className='flex flex-1 flex-col p-6'>
					<div className='flex justify-between items-center mb-6'>
						<h1 className='text-2xl font-bold'>Плани тренувань</h1>
					</div>

					{loading ? (
						<div className='text-center py-8'>Завантаження планів...</div>
					) : error ? (
						<div className='text-center py-8 text-red-600'>{error}</div>
					) : (
						<>
							{/* Додайте статистику */}
							<div className='mb-6'>
								<PlanStats plans={plans} />
							</div>

							{plans.length === 0 ? (
								<div className='text-center py-8'>Планів ще немає.</div>
							) : (
								<div className='grid gap-4'>{/* Таблиця планів */}</div>
							)}
						</>
					)}

					{/* Модальне вікно підтвердження видалення */}
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}

export default AdminPlansPage
