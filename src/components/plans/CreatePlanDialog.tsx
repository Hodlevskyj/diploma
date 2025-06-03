import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CreatePlanDto, GoalType } from '@/types/workout'
import { useState } from 'react'

interface CreatePlanDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSubmit: (data: CreatePlanDto) => Promise<void>
	isSubmitting: boolean
}

export function CreatePlanDialog({
	open,
	onOpenChange,
	onSubmit,
	isSubmitting,
}: CreatePlanDialogProps) {
	const [formData, setFormData] = useState<CreatePlanDto>({
		name: '',
		description: '',
		fitnessGoal: undefined,
	})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		await onSubmit(formData)
		setFormData({ name: '', description: '', fitnessGoal: undefined })
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Створити новий план</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className='space-y-4'>
					<div>
						<label htmlFor='name' className='block text-sm font-medium mb-1'>
							Назва плану
						</label>
						<Input
							id='name'
							value={formData.name}
							onChange={e => setFormData({ ...formData, name: e.target.value })}
							required
						/>
					</div>

					<div>
						<label
							htmlFor='description'
							className='block text-sm font-medium mb-1'
						>
							Опис
						</label>
						<Textarea
							id='description'
							value={formData.description}
							onChange={e =>
								setFormData({ ...formData, description: e.target.value })
							}
						/>
					</div>

					<div>
						<label htmlFor='goal' className='block text-sm font-medium mb-1'>
							Мета
						</label>
						<Select
							value={formData.fitnessGoal}
							onValueChange={value =>
								setFormData({ ...formData, fitnessGoal: value as GoalType })
							}
						>
							<option value=''>Виберіть мету</option>
							{Object.values(GoalType).map(goal => (
								<option key={goal} value={goal}>
									{goal === GoalType.LOSE_WEIGHT
										? 'Схуднення'
										: goal === GoalType.GAIN_MUSCLE
										? 'Набір маси'
										: 'Підтримка форми'}
								</option>
							))}
						</Select>
					</div>

					<div className='flex justify-end gap-2'>
						<Button
							type='button'
							variant='outline'
							onClick={() => onOpenChange(false)}
						>
							Скасувати
						</Button>
						<Button type='submit' disabled={isSubmitting}>
							{isSubmitting ? 'Створення...' : 'Створити'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}
