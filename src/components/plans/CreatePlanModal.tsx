import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogFooter,
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
import { useState } from 'react'
import { toast } from 'sonner'

export type CreatePlanModalProps = {
	isOpen: boolean
	onClose: () => void
	onPlanCreated: () => void
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

	const resetForm = () => {
		setName('')
		setDescription('')
		setFitnessGoal('')
	}

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
				throw new Error('Помилка створення плану')
			}

			const plan = await response.json()
			toast.success('План успішно створено!')
			resetForm()
			onPlanCreated()
			onClose()
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
				<form onSubmit={handleSubmit}>
					<div className='grid gap-4 py-4'>
						<div className='grid grid-cols-4 items-center gap-4'>
							<Label htmlFor='name' className='text-right'>
								Назва
							</Label>
							<Input
								id='name'
								value={name}
								onChange={e => setName(e.target.value)}
								className='col-span-3'
								required
							/>
						</div>
						<div className='grid grid-cols-4 items-center gap-4'>
							<Label htmlFor='description' className='text-right'>
								Опис
							</Label>
							<Textarea
								id='description'
								value={description}
								onChange={e => setDescription(e.target.value)}
								className='col-span-3'
							/>
						</div>
						<div className='grid grid-cols-4 items-center gap-4'>
							<Label htmlFor='goal' className='text-right'>
								Мета
							</Label>
							<Select value={fitnessGoal} onValueChange={setFitnessGoal}>
								<SelectTrigger className='col-span-3'>
									<SelectValue placeholder='Виберіть мету тренувань' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='LOSE_WEIGHT'>Схуднення</SelectItem>
									<SelectItem value='GAIN_MUSCLE'>
										Набір м'язової маси
									</SelectItem>
									<SelectItem value='STAY_ACTIVE'>
										Підтримка активності
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button type='button' variant='outline' onClick={onClose}>
							Скасувати
						</Button>
						<Button type='submit' disabled={loading}>
							{loading ? 'Створення...' : 'Створити план'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
