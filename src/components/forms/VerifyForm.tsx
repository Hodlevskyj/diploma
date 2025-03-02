'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function VerifyEmailPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
		'loading'
	)
	const [message, setMessage] = useState('')

	useEffect(() => {
		const verifyEmail = async () => {
			const token = searchParams.get('token')

			if (!token) {
				setStatus('error')
				setMessage('Invalid verification link')
				return
			}

			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify-email?token=${token}`,
					{
						method: 'GET',
						credentials: 'include',
					}
				)

				const data = await response.json()

				if (!response.ok) {
					throw new Error(data.message)
				}

				setStatus('success')
				setMessage('Email verified successfully!')

				setTimeout(() => {
					router.push('/dashboard')
				}, 3000)
			} catch (error) {
				setStatus('error')
				setMessage(
					error instanceof Error ? error.message : 'Verification failed'
				)
			}
		}

		verifyEmail()
	}, [router, searchParams])

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50'>
			<div className='max-w-md w-full p-6 bg-white rounded-lg shadow-lg'>
				{status === 'loading' && (
					<div className='text-center'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto'></div>
						<p className='mt-4 text-gray-600'>Verifying your email...</p>
					</div>
				)}

				{status === 'success' && (
					<div className='text-center'>
						<div className='text-green-500 text-5xl mb-4'>✓</div>
						<h2 className='text-2xl font-bold text-gray-900 mb-2'>
							Email Verified!
						</h2>
						<p className='text-gray-600'>{message}</p>
						<p className='text-sm text-gray-500 mt-4'>
							Redirecting to dashboard...
						</p>
					</div>
				)}

				{status === 'error' && (
					<div className='text-center'>
						<div className='text-red-500 text-5xl mb-4'>✕</div>
						<h2 className='text-2xl font-bold text-gray-900 mb-2'>
							Verification Failed
						</h2>
						<p className='text-red-600'>{message}</p>
					</div>
				)}
			</div>
		</div>
	)
}
