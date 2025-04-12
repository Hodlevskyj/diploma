'use client'

import Activities from '@/components/activity/Activities'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
	// const { user, loading, logout } = useAuth()
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

	const handleBackToLogin = () => {
		router.push('/login')
	}

	const handleProfile = () => {
		router.push('/profile')
	}

	return (
		<div className='min-h-screen bg-gray-100'>
			<nav className='bg-white shadow'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex justify-between h-16'>
						<div className='flex items-center'>
							<h1 className='text-xl font-bold'>Dashboard</h1>
						</div>
						<div className='flex items-center'>
							<button
								onClick={() => logout()}
								className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'
							>
								Logout
							</button>
						</div>
					</div>
				</div>
			</nav>

			<main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
				<div className='px-4 py-6 sm:px-0'>
					<div className='border-4 border-dashed border-gray-200 rounded-lg p-4'>
						{user && (
							<>
								<h2 className='text-lg font-semibold'>Welcome, {user.name}!</h2>
								<p className='mt-2'>Email: {user.email}</p>
							</>
						)}
					</div>
				</div>
			</main>
			<Activities />
		</div>
	)
}
