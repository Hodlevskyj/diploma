'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Header() {
	const { user, logout } = useAuth()
	const [loading, setLoading] = useState(true)
	const router = useRouter()

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/session`,
					{
						credentials: 'include',
					}
				)

				if (!response.ok) {
					throw new Error('Not authenticated')
				}

				setLoading(false)
			} catch (error) {
				router.push('/login')
			}
		}

		checkAuth()
	}, [router])

	if (loading) {
		return <div>Loading...</div>
	}

	const handleBackToDashboard = () => {
		router.push('/dashboard')
	}

	return (
		<header className='w-full border-b bg-card sticky top-0 z-50'>
			<div className='container flex h-16 items-center justify-between px-4 md:px-6'>
				<h1 className='text-xl font-bold'>FitnessApp</h1>
				<div className='flex items-center gap-4'>
					<span>{user?.email}</span>
					<Button variant='destructive' onClick={() => logout()}>
						Logout
					</Button>
				</div>
			</div>
		</header>
	)
}
