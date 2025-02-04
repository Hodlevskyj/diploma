'use client'
import { useState } from 'react'

export default function LoginForm() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

	const handleLogin = async () => {
		try {
			const response = await fetch(`${API_BASE_URL}/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, password }),
			})
			const data = await response.json()
			if (data.token) {
				localStorage.setItem('token', data.token)
				alert('Login successful')
			} else {
				alert('Login failed')
			}
		} catch (error) {
			console.error('Login error:', error)
			alert('Login error')
		}
	}

	return (
		<div>
			<h1>Login</h1>
			<input
				type='email'
				placeholder='Email'
				value={email}
				onChange={e => setEmail(e.target.value)}
			/>
			<input
				type='password'
				placeholder='Password'
				value={password}
				onChange={e => setPassword(e.target.value)}
			/>
			<button onClick={handleLogin}>Login</button>
		</div>
	)
}
