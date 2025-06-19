'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function VerifyEmail() {
	const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
		'loading'
	)
	const [message, setMessage] = useState('')
	const router = useRouter()
	const searchParams = useSearchParams()
	const token = searchParams.get('token')

	useEffect(() => {
		const verifyEmail = async () => {
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify-email?token=${token}`,
					{
						method: 'GET',
						credentials: 'include',
					}
				)

				const data = await response.json()

				if (response.ok) {
					setStatus('success')
					setMessage('Пошта підтверджено успішно!')
					setTimeout(() => router.push('/login'), 3000)
				} else {
					setStatus('error')
					setMessage(data.message || 'Помилка верифікації')
				}
			} catch (error) {
				setStatus('error')
				setMessage('Помилка верифікації')
			}
		}

		if (token) {
			verifyEmail()
		} else {
			setStatus('error')
			setMessage('Invalid verification link')
		}
	}, [token, router])

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4'>
			<div className='max-w-md w-full space-y-8 text-center'>
				{status === 'loading' && (
					<div>
						<h2 className='text-2xl font-bold text-gray-900'>
							Перевірка пошти...
						</h2>
					</div>
				)}

				{status === 'success' && (
					<div>
						<h2 className='text-2xl font-bold text-green-600'>{message}</h2>
						<p className='mt-2 text-gray-600'>
							Перенаправлення на сторінку логіну...
						</p>
					</div>
				)}

				{status === 'error' && (
					<div>
						<h2 className='text-2xl font-bold text-red-600'>{message}</h2>
						<button
							onClick={() => router.push('/login')}
							className='mt-4 text-indigo-600 hover:text-indigo-500'
						>
							Перейти на логін
						</button>
					</div>
				)}
			</div>
		</div>
	)
}
