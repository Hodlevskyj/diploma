'use client'

import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import GoogleLoginButton from '../button/GoogleLoginButton'
import StravaLoginButton from '../button/StravaLoginButton'

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

export default function LoginForm({
	className,
	...props
}: React.ComponentProps<'div'>) {
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
				if (data.message === 'Пошта не перевірена') {
					setError('Будь ласка перевірте власну пошту.')
				} else {
					throw new Error(data.message)
				}
				return
			}

			await login(formData.email, formData.password)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Login failed')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div>
			<Card className='w-full max-w-md'>
				<CardHeader className='text-center'>
					<CardTitle className='text-2xl'>З поверненням</CardTitle>
					<CardDescription>
						Увійти використовуючи Google або Strava
					</CardDescription>
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
								<div className='flex items-center'>
									<Label htmlFor='password'>Пароль</Label>
								</div>
								<Input
									id='password'
									type='password'
									required
									value={formData.password}
									onChange={e =>
										setFormData({ ...formData, password: e.target.value })
									}
									disabled={loading}
								/>
							</div>
							<Button type='submit' className='w-full' disabled={loading}>
								{loading ? 'Входження...' : 'Вхід'}
							</Button>
						</div>
						<div className='text-center text-sm'>
							Не маєте акаунту?{' '}
							<Link
								href='/register'
								className='underline underline-offset-4 text-indigo-600 hover:text-indigo-500'
							>
								Реєстрація
							</Link>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
