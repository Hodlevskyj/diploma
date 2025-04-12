'use client'
import { useEffect, useState } from 'react'

export default function Activities() {
	const [activities, setActivities] = useState([])

	useEffect(() => {
		const fetchActivities = async () => {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/activities`,
				{
					credentials: 'include',
				}
			)

			if (res.ok) {
				const data = await res.json()
				setActivities(data)
			}
		}
		fetchActivities()
	}, [])

	return (
		<div>
			<h2 className='text-2xl font-bold'>Recent Strava Activities</h2>
			<ul className='mt-4 space-y-3'>
				{activities.map((activity: any) => (
					<li key={activity.id} className='bg-white shadow rounded p-4'>
						<p>
							<strong>Name:</strong> {activity.name}
						</p>
						<p>
							<strong>Distance:</strong> {(activity.distance / 1000).toFixed(2)}{' '}
							km
						</p>
						<p>
							<strong>Moving Time:</strong>{' '}
							{Math.round(activity.moving_time / 60)} min
						</p>
					</li>
				))}
			</ul>
		</div>
	)
}
