'use client'

import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginForm() {
	const { login } = useAuth()
	const router = useRouter()
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	})
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setLoading(true)

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include',
					body: JSON.stringify(formData),
				}
			)

			const data = await response.json()

			if (!response.ok) {
				if (data.message === 'Email not verified') {
					setError(
						'Please verify your email first. Check your inbox for the verification link.'
					)
				} else {
					throw new Error(data.message)
				}
				return
			}

			await login(formData.email, formData.password)
			router.push('/dashboard')
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Login failed')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-md w-full space-y-8'>
				<div>
					<h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
						Sign in to your account
					</h2>
				</div>
				<form className='mt-8 space-y-6' onSubmit={handleSubmit}>
					{error && (
						<div className='bg-red-50 text-red-500 p-3 rounded'>{error}</div>
					)}
					<div className='rounded-md shadow-sm space-y-4'>
						<input
							type='email'
							required
							className='appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
							placeholder='Email address'
							value={formData.email}
							onChange={e =>
								setFormData({ ...formData, email: e.target.value })
							}
						/>
						<input
							type='password'
							required
							className='appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
							placeholder='Password'
							value={formData.password}
							onChange={e =>
								setFormData({ ...formData, password: e.target.value })
							}
						/>
					</div>

					<div>
						<button
							type='submit'
							disabled={loading}
							className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
								loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
							}`}
						>
							{loading ? 'Signing in...' : 'Sign in'}
						</button>
					</div>

					<div className='text-sm text-center'>
						<Link
							href='/register'
							className='text-indigo-600 hover:text-indigo-500'
						>
							Don't have an account? Sign up
						</Link>
					</div>
				</form>
			</div>
		</div>
	)
}
