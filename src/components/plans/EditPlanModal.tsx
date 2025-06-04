import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { useEffect, useState } from 'react'

interface EditPlanModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	plan: {
		id: number
		name: string
		description?: string | null
	} | null
	onSubmit: (data: { name: string; description?: string }) => Promise<void>
	isSaving?: boolean
}

export function EditPlanModal({
	open,
	onOpenChange,
	plan,
	onSubmit,
	isSaving = false,
}: EditPlanModalProps) {
	const [name, setName] = useState('')
	const [description, setDescription] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [validationError, setValidationError] = useState<string | null>(null)

	useEffect(() => {
		if (plan && open) {
			setName(plan.name)
			setDescription(plan.description ?? '')
			setError(null)
			setValidationError(null)
		}
	}, [plan, open])

	const validate = () => {
		if (!name.trim()) {
			setValidationError('Введіть назву плану')
			return false
		}
		setValidationError(null)
		return true
	}

	const handleSave = async () => {
		if (!validate() || !plan) return
		setError(null)
		try {
			await onSubmit({ name: name.trim(), description: description.trim() })
			onOpenChange(false)
		} catch (e: any) {
			setError(e.message || 'Помилка збереження')
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Редагувати план</DialogTitle>
				</DialogHeader>
				{error && <div className='text-red-500 mb-2'>{error}</div>}
				{validationError && (
					<div className='text-red-500 mb-2'>{validationError}</div>
				)}
				<div className='space-y-2'>
					<div>
						<label className='block mb-1'>Назва плану</label>
						<input
							className='w-full border rounded px-2 py-1'
							value={name}
							onChange={e => setName(e.target.value)}
							disabled={isSaving}
							required
						/>
					</div>
					<div>
						<label className='block mb-1'>Опис</label>
						<textarea
							className='w-full border rounded px-2 py-1'
							value={description}
							onChange={e => setDescription(e.target.value)}
							disabled={isSaving}
							rows={3}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button
						variant='outline'
						onClick={() => onOpenChange(false)}
						disabled={isSaving}
					>
						Скасувати
					</Button>
					<Button onClick={handleSave} disabled={isSaving}>
						{isSaving ? 'Збереження...' : 'Зберегти'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
