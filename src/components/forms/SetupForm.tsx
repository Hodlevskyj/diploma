'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Setup() {
	const [formData, setFormData] = useState({
		height: '',
		weight: '',
		age: '',
		goal: '',
	})
	const [error, setError] = useState('')
	const router = useRouter()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')

		const res = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/setup`,
			{
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					height: Number(formData.height),
					weight: Number(formData.weight),
					age: Number(formData.age),
					goal: formData.goal,
					isSetupComplete: true,
				}),
			}
		)

		if (res.ok) {
			router.push('/dashboard')
		} else {
			setError('Failed to save data')
		}
	}

	return (
		<div className='container mx-auto p-4'>
			<h2 className='text-2xl font-bold mb-4'>Complete Your Profile</h2>
			{error && <p className='text-red-500'>{error}</p>}
			<form onSubmit={handleSubmit} className='space-y-4'>
				<input
					type='number'
					placeholder='Height (cm)'
					onChange={e => setFormData({ ...formData, height: e.target.value })}
					required
				/>
				<input
					type='number'
					placeholder='Weight (kg)'
					onChange={e => setFormData({ ...formData, weight: e.target.value })}
					required
				/>
				<input
					type='number'
					placeholder='Age'
					onChange={e => setFormData({ ...formData, age: e.target.value })}
					required
				/>
				<select
					onChange={e => setFormData({ ...formData, goal: e.target.value })}
					required
				>
					<option value=''>Select Goal</option>
					<option value='LOSE_WEIGHT'>Lose Weight</option>
					<option value='GAIN_MUSCLE'>Gain Muscle</option>
					<option value='STAY_ACTIVE'>Stay Active</option>
				</select>
				<button type='submit'>Save & Continue</button>
			</form>
		</div>
	)
}
