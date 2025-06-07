'use client'

import Activities from '@/components/activity/Activities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/AuthContext'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface StravaActivity {
	id: number
	name: string
	map: {
		summary_polyline: string
	}
	start_date: string
	distance: number
	type: string
}

const StravaMap = dynamic(() => import('@/components/activity/StravaMap'), {
	ssr: false,
})

export default function ActivityPage() {
	const { user } = useAuth()
	const [loading, setLoading] = useState(true)
	const router = useRouter()
	const [activity, setActivity] = useState<StravaActivity | null>(null)

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
		return (
			<div className='container mx-auto p-4 space-y-4'>
				<Skeleton className='h-8 w-[200px]' />
				<Skeleton className='h-[400px] w-full' />
				<Skeleton className='h-[200px] w-full' />
			</div>
		)
	}

	return (
		<div className='container mx-auto p-4 space-y-6'>
			<Card>
				<CardHeader>
					<CardTitle>Активності</CardTitle>
				</CardHeader>
				<CardContent>
					<Activities />
				</CardContent>
			</Card>
		</div>
	)
}
