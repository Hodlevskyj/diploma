'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function RegisterForm() {
	const router = useRouter()
	useAuthRedirect()
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
	})
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const [verificationSent, setVerificationSent] = useState(false)

	const handleGoogleLogin = () => {
		window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google`
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setLoading(true)

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include',
					body: JSON.stringify(formData),
				}
			)

			if (!response.ok) {
				const data = await response.json()
				throw new Error(data.message)
			}

			setVerificationSent(true)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Registration failed')
		} finally {
			setLoading(false)
		}
	}

	if (verificationSent) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
				<div className='max-w-md w-full space-y-8'>
					<div className='text-center'>
						<h2 className='text-3xl font-extrabold text-gray-900'>
							Check your email
						</h2>
						<p className='mt-2 text-sm text-gray-600'>
							We've sent a verification link to {formData.email}.<br />
							Please check your inbox and click the link to verify your account.
						</p>
						<p className='mt-4 text-sm text-gray-500'>
							Didn't receive the email?{' '}
							<button
								onClick={() => setVerificationSent(false)}
								className='text-indigo-600 hover:text-indigo-500'
							>
								Try again
							</button>
						</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-md w-full space-y-8'>
				<div>
					<h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
						Create your account
					</h2>
				</div>
				<form className='mt-8 space-y-6' onSubmit={handleSubmit}>
					{error && (
						<div className='bg-red-50 text-red-500 p-3 rounded'>{error}</div>
					)}
					<div className='rounded-md shadow-sm space-y-4'>
						<input
							type='text'
							required
							className='appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
							placeholder='Full name'
							value={formData.name}
							onChange={e => setFormData({ ...formData, name: e.target.value })}
						/>
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

					<button
						type='button'
						onClick={handleGoogleLogin}
						className='w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
					>
						<img
							className='h-5 w-5 mr-2'
							src='https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg'
							alt='Google logo'
						/>
						Sign up with Google
					</button>

					<div>
						<button
							type='submit'
							disabled={loading}
							className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
								loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
							}`}
						>
							{loading ? 'Creating account...' : 'Create account'}
						</button>
					</div>

					<div className='text-sm text-center'>
						<Link
							href='/login'
							className='text-indigo-600 hover:text-indigo-500'
						>
							Already have an account? Sign in
						</Link>
					</div>
				</form>
			</div>
		</div>
	)
}
