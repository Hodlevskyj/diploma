'use client'

import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

export default function VerifyForm() {
	const router = useRouter()
	const [formData, setFormData] = useState({
		otp: '',
	})
	const [error, setError] = useState('')

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value })
	}

	const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			const email = localStorage.getItem('email')
			if (!email) throw new Error('Email not found')

			const res = await fetch(`${apiUrl}/auth/verify`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, code: formData.otp }),
			})
			console.log(res)

			// if (!res.ok) throw new Error('Failed to verify OTP')
			// router.push('/success')
			const data = await res.json()
			if (res.ok) {
				localStorage.setItem('token', data.token) // Зберігаємо токен у localStorage
				alert('Verification successful')
				router.push('/success') // Перенаправлення на сторінку успіху
			} else {
				setError(data.message || 'Verification failed')
			}
		} catch (err) {
			setError('Error verifying OTP.')
		}
	}

	return (
		<form onSubmit={handleSubmit}>
			<input
				type='text'
				name='otp'
				placeholder='Enter OTP'
				onChange={handleChange}
			/>
			{error && <p className='error'>{error}</p>}
			<button type='submit'>Verify</button>
		</form>
	)
}
