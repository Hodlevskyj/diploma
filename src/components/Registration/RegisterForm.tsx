'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RegisterForm() {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
	})
	const [error, setError] = useState('')
	const router = useRouter()

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value })
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			const res = await fetch('/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			})

			if (!res.ok) throw new Error('Failed to register')
			router.push('/verify')
		} catch (err: any) {
			setError(err.message)
		}
	}

	return (
		<form onSubmit={handleSubmit}>
			<input
				type='text'
				name='name'
				placeholder='Name'
				onChange={handleChange}
			/>
			<input
				type='email'
				name='email'
				placeholder='Email'
				onChange={handleChange}
			/>
			<input
				type='password'
				name='password'
				placeholder='Password'
				onChange={handleChange}
			/>
			{error && <p>{error}</p>}
			<button type='submit'>Register</button>
		</form>
	)
}
