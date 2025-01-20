'use client'

import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

export default function RegisterForm() {
	const router = useRouter()
	const [formData, setFormData] = useState({
		name: '',
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
			const res = await fetch(`${apiUrl}/auth/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			})

			if (!res.ok) {
				const errorData = await res.json()
				throw new Error(errorData.message || 'Failed to register')
			}

			const data = await res.json()
			localStorage.setItem('email', formData.email)
			alert(data.message)
			router.push('/verify')
		} catch (err: any) {
			setError(err.message || 'Error registering user.')
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
			{error && <p className='error'>{error}</p>}
			<button type='submit'>Register</button>
		</form>
	)
}
