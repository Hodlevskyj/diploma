'use client'

import { FavoriteButton } from '@/components/button/FavoriteButton'
import { CreatePlanModal } from '@/components/plans/CreatePlanModal'
import { PlanCard } from '@/components/plans/PlanCard'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { checkIfPlanIsFavorite, getPlans, removePlan } from '@/lib/api'
import { Calendar, Dumbbell, Plus, Target, Trash2, Wand2 } from 'lucide-react'
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
	const [showCreateModal, setShowCreateModal] = useState(false)
	const [currentPage, setCurrentPage] = useState(1)
	const [deletingPlanId, setDeletingPlanId] = useState<number | null>(null)
	const itemsPerPage = 9

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

	// Функція для відкриття модального вікна створення плану
	const openCreateModal = () => {
		setShowCreateModal(true)
	}

	// Функція для видалення плану
	const handleDeletePlan = async (planId: number) => {
		try {
			setDeletingPlanId(planId)
			await removePlan(planId)
			setPlans(prev => {
				const newPlans = prev.filter(plan => plan.id !== planId)
				const totalPages = Math.ceil((prev.length - 1) / itemsPerPage)
				if (currentPage > totalPages && currentPage > 1) {
					setCurrentPage(prev => prev - 1)
				}
				return newPlans
			})
			setFavoriteIds(prev => prev.filter(id => id !== planId))
			toast.success('План успішно видалено')
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : 'Помилка видалення плану'
			setError(errorMessage)
			toast.error('Помилка', { description: errorMessage })
		} finally {
			setDeletingPlanId(null)
		}
	}

	// Логіка пагінації
	const indexOfLastItem = currentPage * itemsPerPage
	const indexOfFirstItem = indexOfLastItem - itemsPerPage
	const currentPlans = plans.slice(indexOfFirstItem, indexOfLastItem)
	const totalPages = Math.ceil(plans.length / itemsPerPage)

	const paginate = (pageNumber: number) => setCurrentPage(pageNumber)
	const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages))
	const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1))

	if (loading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-background via-muted/50 to-background'>
				<div className='container mx-auto py-8 space-y-8'>
					{/* Header Skeleton */}
					<div className='text-center space-y-4 py-16'>
						<Skeleton className='h-4 w-32 mx-auto' />
						<Skeleton className='h-12 w-96 mx-auto' />
						<Skeleton className='h-6 w-80 mx-auto' />
						<div className='flex gap-4 justify-center pt-4'>
							<Skeleton className='h-12 w-48' />
							<Skeleton className='h-12 w-48' />
						</div>
					</div>

					{/* Stats Skeleton */}
					<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
						{[...Array(3)].map((_, i) => (
							<Card key={i}>
								<CardContent className='p-6'>
									<div className='flex items-center gap-4'>
										<Skeleton className='h-12 w-12 rounded-xl' />
										<div className='space-y-2'>
											<Skeleton className='h-8 w-12' />
											<Skeleton className='h-4 w-24' />
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-background via-muted/50 to-background'>
				<div className='container mx-auto py-8'>
					<Alert variant='destructive' className='max-w-md mx-auto'>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-background via-muted/50 to-background'>
			{/* Hero Section */}
			<div className='relative overflow-hidden'>
				<div className='absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10' />
				<div className='absolute inset-0'>
					<div className='absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-bounce opacity-60' />
					<div className='absolute top-32 right-20 w-16 h-16 bg-primary/5 rounded-full blur-lg animate-pulse opacity-40' />
					<div className='absolute bottom-20 left-1/3 w-24 h-24 bg-primary/5 rounded-full blur-2xl animate-bounce opacity-50' />
				</div>

				<div className='relative container mx-auto px-4 py-16'>
					<div className='text-center space-y-6'>
						<div className='flex flex-col sm:flex-row gap-4 justify-center pt-4'>
							<Button
								onClick={openCreateModal}
								size='lg'
								className='gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1'
							>
								<Plus className='w-5 h-5' />
								Створити власний план
							</Button>
							<Button
								variant='outline'
								size='lg'
								asChild
								className='gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1'
							>
								<Link href='/dashboard/plans/generate-plan'>
									<Wand2 className='w-5 h-5' />
									Згенерувати план
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Stats Section */}
			<div className='container mx-auto px-4 -mt-8 relative z-10'>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-2xl mx-auto'>
					<Card className='hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-primary/20'>
						<CardContent className='p-6'>
							<div className='flex items-center gap-4'>
								<div className='w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center'>
									<Target className='w-6 h-6 text-primary' />
								</div>
								<div>
									<p className='text-2xl font-bold'>{plans.length}</p>
									<p className='text-sm text-muted-foreground'>
										Активних планів
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-orange-200'>
						<CardContent className='p-6'>
							<div className='flex items-center gap-4'>
								<div className='w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center'>
									<Calendar className='w-6 h-6 text-orange-600' />
								</div>
								<div>
									<p className='text-2xl font-bold'>{favoriteIds.length}</p>
									<p className='text-sm text-muted-foreground'>
										Улюблених планів
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Main Content */}
			<div className='container mx-auto px-4 pb-16'>
				{plans.length === 0 ? (
					<Card className='max-w-2xl mx-auto'>
						<CardContent className='text-center py-16 px-8'>
							<div className='space-y-6'>
								<div className='w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto'>
									<Dumbbell className='w-12 h-12 text-primary' />
								</div>

								<div className='space-y-3'>
									<h3 className='text-2xl font-bold'>
										Час почати тренуватися!
									</h3>
									<p className='text-muted-foreground leading-relaxed'>
										У вас ще немає планів тренувань. Створіть свій перший план.
									</p>
								</div>

								<div className='flex flex-col sm:flex-row gap-4 justify-center pt-4'>
									<Button
										onClick={openCreateModal}
										size='lg'
										className='gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1'
									>
										<Plus className='w-5 h-5' />
										Створити власний план
									</Button>
									<Button
										variant='outline'
										size='lg'
										asChild
										className='gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1'
									>
										<Link href='/dashboard/plans/generate-plan'>
											<Wand2 className='w-5 h-5' />
											Згенерувати план
										</Link>
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				) : (
					<div className='space-y-8'>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
							{currentPlans.map((plan, index) => (
								<div
									key={plan.id}
									className='transform transition-all duration-300 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-4'
									style={{
										animationDelay: `${index * 100}ms`,
										animationFillMode: 'both',
									}}
								>
									<PlanCard
										id={plan.id}
										name={plan.name}
										description={plan.description}
										fitnessGoal={plan.fitnessGoal}
										isFavorite={favoriteIds.includes(plan.id)}
										onFavoriteChange={handleFavoriteChange}
									>
										<div className='flex gap-2'>
											<FavoriteButton
												planId={plan.id}
												initialState={favoriteIds.includes(plan.id)}
												onChange={isFav => handleFavoriteChange(plan.id, isFav)}
											/>

											{/* Стилізована кнопка видалення з AlertDialog */}
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button
														variant='outline'
														size='icon'
														className='h-10 w-10 border-destructive/20 hover:border-destructive hover:bg-destructive/10 hover:text-destructive transition-all duration-200 group'
														disabled={deletingPlanId === plan.id}
													>
														<Trash2 className='w-4 h-4 group-hover:scale-110 transition-transform duration-200' />
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle className='flex items-center gap-2'>
															<Trash2 className='w-5 h-5 text-destructive' />
															Видалити план?
														</AlertDialogTitle>
														<AlertDialogDescription>
															Ви впевнені, що хочете видалити план "{plan.name}
															"? Цю дію неможливо скасувати, і всі дані
															пов'язані з цим планом будуть втрачені назавжди.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel className='hover:bg-muted/50'>
															Скасувати
														</AlertDialogCancel>
														<AlertDialogAction
															onClick={() => handleDeletePlan(plan.id)}
															className='bg-destructive hover:bg-destructive/90 text-destructive-foreground'
															disabled={deletingPlanId === plan.id}
														>
															{deletingPlanId === plan.id ? (
																<div className='flex items-center gap-2'>
																	<div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
																	Видалення...
																</div>
															) : (
																<div className='flex items-center gap-2'>
																	<Trash2 className='w-4 h-4' />
																	Видалити
																</div>
															)}
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</div>
									</PlanCard>
								</div>
							))}
						</div>

						{/* Pagination Controls */}
						<div className='flex justify-center items-center gap-4 mt-4'>
							<Button
								variant='outline'
								onClick={prevPage}
								disabled={currentPage === 1}
								className='gap-2'
							>
								Попередня
							</Button>
							{Array.from({ length: totalPages }, (_, i) => i + 1).map(
								number => (
									<Button
										key={number}
										variant={currentPage === number ? 'default' : 'outline'}
										onClick={() => paginate(number)}
										className='w-10 h-10'
									>
										{number}
									</Button>
								)
							)}
							<Button
								variant='outline'
								onClick={nextPage}
								disabled={currentPage === totalPages}
								className='gap-2'
							>
								Наступна
							</Button>
						</div>
					</div>
				)}
			</div>

			{/* Модальне вікно створення плану */}
			<CreatePlanModal
				isOpen={showCreateModal}
				onClose={() => setShowCreateModal(false)}
				onPlanCreated={() => {
					setCurrentPage(1) // Скидаємо на першу сторінку після створення плану
					window.location.reload()
				}}
			/>
		</div>
	)
}
