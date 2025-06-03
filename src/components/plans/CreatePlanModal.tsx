'use client'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { createPlan } from '@/lib/api'
import { useState } from 'react'

type Props = {
	onCreated: () => void
}

export function CreatePlanModal({ onCreated }: Props) {
	const [open, setOpen] = useState(false)
	const [form, setForm] = useState({ name: '', description: '' })
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		try {
			await createPlan(form)
			setForm({ name: '', description: '' })
			setOpen(false)
			onCreated()
		} catch {
			alert('Помилка створення плану')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Створити план</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Новий план тренувань</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<Input
						placeholder='Назва'
						value={form.name}
						onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
						required
					/>
					<Input
						placeholder='Опис'
						value={form.description}
						onChange={e =>
							setForm(f => ({ ...f, description: e.target.value }))
						}
					/>
					<DialogFooter>
						<Button type='submit' disabled={loading}>
							{loading ? 'Створення...' : 'Створити'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
