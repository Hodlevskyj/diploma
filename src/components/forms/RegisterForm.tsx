'use client'

import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import GoogleLoginButton from '../button/GoogleLoginButton'
import StravaLoginButton from '../button/StravaLoginButton'

export default function RegisterForm({
	className,
	...props
}: React.ComponentProps<'div'>) {
	const router = useRouter()
	// useAuthRedirect()
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
	})
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const [verificationSent, setVerificationSent] = useState(false)

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
			<div
				className={cn(
					'flex flex-col gap-6 items-center justify-center min-h-screen',
					className
				)}
				{...props}
			>
				<Card className='w-full max-w-md'>
					<CardHeader className='text-center'>
						<CardTitle className='text-2xl'>Перевірте вашу пошту</CardTitle>
						<CardDescription>
							Ми надіслали лист для перевірки вашої пошти {formData.email}.
							<br />
							Будь ласка, перевірте свою поштову скриньку та натисніть
							посилання, щоб підтвердити свій обліковий запис.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='text-center text-sm text-gray-500'>
							Не отримав підтвердження?{' '}
							<button
								onClick={() => setVerificationSent(false)}
								className='text-indigo-600 hover:text-indigo-500 underline'
							>
								Спробувати знову
							</button>
						</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div
			className={cn(
				'flex flex-col gap-6 items-center justify-center min-h-screen',
				className
			)}
			{...props}
		>
			<Card className='w-full max-w-md'>
				<CardHeader className='text-center'>
					<CardTitle className='text-2xl'>Створити акаунт</CardTitle>
				</CardHeader>
				<CardContent>
					<form className='grid gap-6' onSubmit={handleSubmit}>
						{error && (
							<div className='bg-red-50 text-red-500 p-3 rounded text-sm'>
								{error}
							</div>
						)}
						<div className='flex flex-col gap-4'>
							<GoogleLoginButton />
							<StravaLoginButton />
						</div>
						<div className='relative text-center text-sm my-2'>
							<span className='bg-card px-2 relative z-10'>Або продовжи з</span>
							<div className='absolute left-0 right-0 top-1/2 border-t border-border -z-0'></div>
						</div>
						<div className='grid gap-4'>
							<div className='grid gap-2'>
								<Label htmlFor='name'>Ім'я</Label>
								<Input
									id='name'
									type='text'
									placeholder='Ваше ім&#39;я'
									required
									value={formData.name}
									onChange={e =>
										setFormData({ ...formData, name: e.target.value })
									}
									disabled={loading}
								/>
							</div>
							<div className='grid gap-2'>
								<Label htmlFor='email'>Пошта</Label>
								<Input
									id='email'
									type='email'
									placeholder='m@example.com'
									required
									value={formData.email}
									onChange={e =>
										setFormData({ ...formData, email: e.target.value })
									}
									disabled={loading}
								/>
							</div>
							<div className='grid gap-2'>
								<Label htmlFor='password'>Пароль</Label>
								<Input
									id='password'
									type='password'
									placeholder='Пароль'
									required
									value={formData.password}
									onChange={e =>
										setFormData({ ...formData, password: e.target.value })
									}
									disabled={loading}
								/>
							</div>
							<Button type='submit' className='w-full' disabled={loading}>
								{loading ? 'Створення акаунту...' : 'Створити акаунт'}
							</Button>
						</div>
						<div className='text-center text-sm'>
							Вже маєте акаунт?{' '}
							<Link
								href='/login'
								className='underline underline-offset-4 text-indigo-600 hover:text-indigo-500'
							>
								Увійти
							</Link>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
