'use client'

import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

export default function LoginForm() {
	const router = useRouter()
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	})
	const [error, setError] = useState('')

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value })
	}

	const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			const res = await fetch(`${apiUrl}/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			})

			if (!res.ok) {
				const errorData = await res.json()
				throw new Error(errorData.message || 'Failed to login')
			}

			const data = await res.json()
			localStorage.setItem('token', data.token)
			router.push('/dashboard')
		} catch (err: any) {
			setError(err.message || 'Error logging in.')
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
				type='password'
				name='password'
				placeholder='Password'
				onChange={handleChange}
			/>
			{error && <p className='error'>{error}</p>}
			<button type='submit'>Login</button>
		</form>
	)
}
