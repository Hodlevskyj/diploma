'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function VerifyForm() {
	const [formData, setFormData] = useState({ email: '', code: '' })
	const [error, setError] = useState('')
	const router = useRouter()

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value })
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			const res = await fetch('/auth/verify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			})

			if (!res.ok) throw new Error('Failed to verify code')
			router.push('/success')
		} catch (err: any) {
			setError(err.message)
		}
	}

	return (
		<form onSubmit={handleSubmit}>
			<input
				type='email'
				name='email'
				placeholder='Email'
				onChange={handleChange}
			/>
			<input
				type='text'
				name='code'
				placeholder='Verification Code'
				onChange={handleChange}
			/>
			{error && <p>{error}</p>}
			<button type='submit'>Verify</button>
		</form>
	)
}
