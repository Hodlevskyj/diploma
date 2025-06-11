// // 'use client'
// // import { Button } from '@/components/ui/button'
// // import {
// // 	Dialog,
// // 	DialogContent,
// // 	DialogFooter,
// // 	DialogHeader,
// // 	DialogTitle,
// // 	DialogTrigger,
// // } from '@/components/ui/dialog'
// // import { Input } from '@/components/ui/input'
// // import { createPlan } from '@/lib/api'
// // import { useState } from 'react'

// // type Props = {
// // 	onCreated: () => void
// // }

// // export function CreatePlanModal({ onCreated }: Props) {
// // 	const [open, setOpen] = useState(false)
// // 	const [form, setForm] = useState({ name: '', description: '' })
// // 	const [loading, setLoading] = useState(false)

// // 	const handleSubmit = async (e: React.FormEvent) => {
// // 		e.preventDefault()
// // 		setLoading(true)
// // 		try {
// // 			await createPlan(form)
// // 			setForm({ name: '', description: '' })
// // 			setOpen(false)
// // 			onCreated()
// // 		} catch {
// // 			alert('Помилка створення плану')
// // 		} finally {
// // 			setLoading(false)
// // 		}
// // 	}

// // 	return (
// // 		<Dialog open={open} onOpenChange={setOpen}>
// // 			<DialogTrigger asChild>
// // 				<Button>Створити план</Button>
// // 			</DialogTrigger>
// // 			<DialogContent>
// // 				<DialogHeader>
// // 					<DialogTitle>Новий план тренувань</DialogTitle>
// // 				</DialogHeader>
// // 				<form onSubmit={handleSubmit} className='space-y-4'>
// // 					<Input
// // 						placeholder='Назва'
// // 						value={form.name}
// // 						onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
// // 						required
// // 					/>
// // 					<Input
// // 						placeholder='Опис'
// // 						value={form.description}
// // 						onChange={e =>
// // 							setForm(f => ({ ...f, description: e.target.value }))
// // 						}
// // 					/>
// // 					<DialogFooter>
// // 						<Button type='submit' disabled={loading}>
// // 							{loading ? 'Створення...' : 'Створити'}
// // 						</Button>
// // 					</DialogFooter>
// // 				</form>
// // 			</DialogContent>
// // 		</Dialog>
// // 	)
// // }

// import { Button } from '@/components/ui/button'
// import {
// 	Dialog,
// 	DialogContent,
// 	DialogHeader,
// 	DialogTitle,
// } from '@/components/ui/dialog'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import {
// 	Select,
// 	SelectContent,
// 	SelectItem,
// 	SelectTrigger,
// 	SelectValue,
// } from '@/components/ui/select'
// import { Textarea } from '@/components/ui/textarea'
// import { useState } from 'react'
// import { toast } from 'sonner'

// interface CreatePlanModalProps {
// 	isOpen: boolean
// 	onClose: () => void
// 	onPlanCreated: (newPlan: any) => void
// }

// export function CreatePlanModal({
// 	isOpen,
// 	onClose,
// 	onPlanCreated,
// }: CreatePlanModalProps) {
// 	const [name, setName] = useState('')
// 	const [description, setDescription] = useState('')
// 	const [fitnessGoal, setFitnessGoal] = useState('')
// 	const [loading, setLoading] = useState(false)

// 	const handleSubmit = async (e: React.FormEvent) => {
// 		e.preventDefault()

// 		if (!name.trim()) {
// 			toast.error("Назва плану обов'язкова")
// 			return
// 		}

// 		setLoading(true)

// 		try {
// 			const response = await fetch(
// 				`${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/plans`,
// 				{
// 					method: 'POST',
// 					headers: {
// 						'Content-Type': 'application/json',
// 					},
// 					body: JSON.stringify({
// 						name,
// 						description,
// 						fitnessGoal,
// 					}),
// 					credentials: 'include',
// 				}
// 			)

// 			if (!response.ok) {
// 				throw new Error('Failed to create plan')
// 			}

// 			const newPlan = await response.json()
// 			onPlanCreated(newPlan)
// 			toast.success('План успішно створено')

// 			// Скидаємо форму
// 			setName('')
// 			setDescription('')
// 			setFitnessGoal('')
// 		} catch (error) {
// 			console.error('Error creating plan:', error)
// 			toast.error('Не вдалося створити план')
// 		} finally {
// 			setLoading(false)
// 		}
// 	}

// 	return (
// 		<Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
// 			<DialogContent className='sm:max-w-[425px]'>
// 				<DialogHeader>
// 					<DialogTitle>Створити новий план тренувань</DialogTitle>
// 				</DialogHeader>

// 				<form onSubmit={handleSubmit} className='space-y-4 mt-4'>
// 					<div className='space-y-2'>
// 						<Label htmlFor='name'>Назва плану</Label>
// 						<Input
// 							id='name'
// 							value={name}
// 							onChange={e => setName(e.target.value)}
// 							placeholder='Введіть назву плану'
// 							required
// 						/>
// 					</div>

// 					<div className='space-y-2'>
// 						<Label htmlFor='description'>Опис (необов'язково)</Label>
// 						<Textarea
// 							id='description'
// 							value={description}
// 							onChange={e => setDescription(e.target.value)}
// 							placeholder='Опишіть ваш план тренувань'
// 							rows={3}
// 						/>
// 					</div>

// 					<div className='space-y-2'>
// 						<Label htmlFor='fitnessGoal'>Мета тренувань</Label>
// 						<Select value={fitnessGoal} onValueChange={setFitnessGoal}>
// 							<SelectTrigger id='fitnessGoal'>
// 								<SelectValue placeholder='Виберіть мету' />
// 							</SelectTrigger>
// 							<SelectContent>
// 								<SelectItem value='LOSE_WEIGHT'>Схуднення</SelectItem>
// 								<SelectItem value='GAIN_MUSCLE'>Набір м'язової маси</SelectItem>
// 								<SelectItem value='STAY_ACTIVE'>Підтримка форми</SelectItem>
// 								<SelectItem value='GENERAL_FITNESS'>
// 									Загальна фізична підготовка
// 								</SelectItem>
// 							</SelectContent>
// 						</Select>
// 					</div>

// 					<div className='flex justify-end gap-2 pt-4'>
// 						<Button type='button' variant='outline' onClick={onClose}>
// 							Скасувати
// 						</Button>
// 						<Button type='submit' disabled={loading}>
// 							{loading ? 'Створення...' : 'Створити план'}
// 						</Button>
// 					</div>
// 				</form>
// 			</DialogContent>
// 		</Dialog>
// 	)
// }

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { GoalType, WorkoutPlan } from '@/types/planexercise'
import { useState } from 'react'
import { toast } from 'sonner'

interface CreatePlanModalProps {
	isOpen: boolean
	onClose: () => void
	onPlanCreated: (newPlan: WorkoutPlan) => void
}

export function CreatePlanModal({
	isOpen,
	onClose,
	onPlanCreated,
}: CreatePlanModalProps) {
	const [name, setName] = useState('')
	const [description, setDescription] = useState('')
	const [fitnessGoal, setFitnessGoal] = useState<string>('')
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!name.trim()) {
			toast.error("Назва плану обов'язкова")
			return
		}

		setLoading(true)

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/plans`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						name,
						description,
						fitnessGoal: fitnessGoal || undefined,
					}),
					credentials: 'include',
				}
			)

			if (!response.ok) {
				throw new Error('Failed to create plan')
			}

			const newPlan = await response.json()
			onPlanCreated(newPlan)
			toast.success('План успішно створено')

			// Скидаємо форму
			setName('')
			setDescription('')
			setFitnessGoal('')
		} catch (error) {
			console.error('Error creating plan:', error)
			toast.error('Не вдалося створити план')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Створити новий план тренувань</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className='space-y-4 mt-4'>
					<div className='space-y-2'>
						<Label htmlFor='name'>Назва плану</Label>
						<Input
							id='name'
							value={name}
							onChange={e => setName(e.target.value)}
							placeholder='Введіть назву плану'
							required
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='description'>Опис (необов'язково)</Label>
						<Textarea
							id='description'
							value={description}
							onChange={e => setDescription(e.target.value)}
							placeholder='Опишіть ваш план тренувань'
							rows={3}
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='fitnessGoal'>Мета тренувань</Label>
						<Select value={fitnessGoal} onValueChange={setFitnessGoal}>
							<SelectTrigger id='fitnessGoal'>
								<SelectValue placeholder='Виберіть мету' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={GoalType.LOSE_WEIGHT}>Схуднення</SelectItem>
								<SelectItem value={GoalType.GAIN_MUSCLE}>
									Набір м'язової маси
								</SelectItem>
								<SelectItem value={GoalType.STAY_ACTIVE}>
									Підтримка форми
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className='flex justify-end gap-2 pt-4'>
						<Button type='button' variant='outline' onClick={onClose}>
							Скасувати
						</Button>
						<Button type='submit' disabled={loading}>
							{loading ? 'Створення...' : 'Створити план'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
