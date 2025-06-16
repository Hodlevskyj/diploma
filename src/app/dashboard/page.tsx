'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Dashboard() {
	const [userEmail, setUserEmail] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const router = useRouter()

	useEffect(() => {
		const token = Cookies.get('access_token')
		if (token) {
			fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/current-user`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
				credentials: 'include',
			})
				.then(res => res.json())
				.then(data => {
					setUserEmail(data.email)
					setIsLoading(false)
				})
				.catch(() => setIsLoading(false))
		} else {
			setIsLoading(false)
		}
	}, [])

	const username = userEmail?.split('@')[0]
	const handlerouterpush = () => {
		router.push('/dashboard/plans')
	}

	return (
		<div className='max-w-3xl mx-auto mt-10 px-4'>
			<Card className='mb-6 shadow-xl'>
				<CardHeader>
					<CardTitle className='text-2xl'>
						{isLoading ? (
							<Skeleton className='h-6 w-48' />
						) : userEmail ? (
							<span>
								Вітаємо, <span className='font-semibold'>{username}</span>!
							</span>
						) : (
							'Ласкаво просимо!'
						)}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className='text-muted-foreground'>
						Готові до нових звершень? Оберіть план тренування та вперед!
					</p>
					<Button className='mt-4' onClick={handlerouterpush}>
						Переглянути плани
					</Button>
				</CardContent>
			</Card>
		</div>
	)
}
