'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import useAuthRedirect from '../../hooks/useAuthRedirect'

const LoginForm = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
	const router = useRouter()
	useAuthRedirect()

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
			console.log('Login Response:', data)

			const token = data.token || data.result?.token

			if (response.ok && typeof token === 'string') {
				localStorage.setItem('token', token)
				alert('Login successful')
				router.push('/dashboard')
			} else {
				alert(`Login failed: ${data.message || 'Invalid credentials'}`)
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

export default LoginForm
