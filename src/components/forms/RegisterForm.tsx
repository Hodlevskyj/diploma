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
import useAuthRedirect from '@/hooks/useAuthRedirect'
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
	useAuthRedirect()
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
						<CardTitle className='text-2xl'>Check your email</CardTitle>
						<CardDescription>
							We've sent a verification link to {formData.email}.<br />
							Please check your inbox and click the link to verify your account.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='text-center text-sm text-gray-500'>
							Didn't receive the email?{' '}
							<button
								onClick={() => setVerificationSent(false)}
								className='text-indigo-600 hover:text-indigo-500 underline'
							>
								Try again
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
					<CardTitle className='text-2xl'>Create your account</CardTitle>
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
							<span className='bg-card px-2 relative z-10'>
								Or continue with
							</span>
							<div className='absolute left-0 right-0 top-1/2 border-t border-border -z-0'></div>
						</div>
						<div className='grid gap-4'>
							<div className='grid gap-2'>
								<Label htmlFor='name'>Full name</Label>
								<Input
									id='name'
									type='text'
									placeholder='Your name'
									required
									value={formData.name}
									onChange={e =>
										setFormData({ ...formData, name: e.target.value })
									}
									disabled={loading}
								/>
							</div>
							<div className='grid gap-2'>
								<Label htmlFor='email'>Email</Label>
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
								<Label htmlFor='password'>Password</Label>
								<Input
									id='password'
									type='password'
									placeholder='Password'
									required
									value={formData.password}
									onChange={e =>
										setFormData({ ...formData, password: e.target.value })
									}
									disabled={loading}
								/>
							</div>
							<Button type='submit' className='w-full' disabled={loading}>
								{loading ? 'Creating account...' : 'Create account'}
							</Button>
						</div>
						<div className='text-center text-sm'>
							Already have an account?{' '}
							<Link
								href='/login'
								className='underline underline-offset-4 text-indigo-600 hover:text-indigo-500'
							>
								Sign in
							</Link>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
