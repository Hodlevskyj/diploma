'use client'
import { useEffect, useState } from 'react'
import {
	Bar,
	BarChart,
	Cell,
	Pie,
	PieChart,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'
import StravaMap from './StravaMap'

export default function Activities() {
	const [activities, setActivities] = useState([])
	const [stats, setStats] = useState(null)

	useEffect(() => {
		const fetchData = async () => {
			const activitiesRes = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/activities`,
				{
					credentials: 'include',
				}
			)
			const statsRes = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/stats`,
				{
					credentials: 'include',
				}
			)

			if (activitiesRes.ok) {
				const data = await activitiesRes.json()
				setActivities(data)
			}
			if (statsRes.ok) {
				const data = await statsRes.json()
				setStats(data)
			}
		}
		fetchData()
	}, [])

	const formatDuration = (seconds?: number) => {
		if (!seconds || isNaN(seconds)) return '—'
		return `${Math.round(seconds / 60)} min`
	}

	// кругова діаграма
	const pieData = stats?.byType
		? Object.entries(stats.byType).map(([type, { count }]: [string, any]) => ({
				name: type,
				value: count,
		  }))
		: []

	// стовпчикова діаграма
	const barData = stats?.byType
		? Object.entries(stats.byType).map(
				([type, { distance }]: [string, any]) => ({
					name: type,
					distance: (distance / 1000).toFixed(2),
				})
		  )
		: []

	return (
		<div className='p-4'>
			<h2 className='text-2xl font-bold'>Strava Statistics</h2>

			{/* загальна статистика */}
			{stats && (
				<div className='mt-4 bg-white shadow rounded p-4'>
					<h3 className='text-xl font-semibold'>Загальна статистика</h3>
					<p>
						<strong>Загальна дистанція:</strong> {stats.totalDistance} км
					</p>
					<p>
						<strong>Загальний час:</strong> {stats.totalDuration} хв
					</p>
					<p>
						<strong>Спалено калорій:</strong> {stats.totalCalories}
					</p>
					<p>
						<strong>Кількість активностей:</strong> {stats.activityCount}
					</p>
					<p>
						<strong>Середня дистанція:</strong> {stats.averageDistance} км
					</p>
				</div>
			)}

			{/* кругова діаграма */}
			{pieData.length > 0 && (
				<div className='mt-4'>
					<h3 className='text-xl font-semibold'>
						Розподіл за типом активностей
					</h3>
					<PieChart width={400} height={300}>
						<Pie
							data={pieData}
							dataKey='value'
							nameKey='name'
							cx='50%'
							cy='50%'
							outerRadius={100}
							fill='#8884d8'
							label
						>
							{pieData.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={['#ff7300', '#00C49F', '#FFBB28', '#FF8042'][index % 4]}
								/>
							))}
						</Pie>
						<Tooltip />
					</PieChart>
				</div>
			)}

			{/* Стовпчикова діаграма */}
			{barData.length > 0 && (
				<div className='mt-4'>
					<h3 className='text-xl font-semibold'>Дистанція за типом</h3>
					<BarChart width={400} height={300} data={barData}>
						<XAxis dataKey='name' />
						<YAxis />
						<Tooltip />
						<Bar dataKey='distance' fill='#8884d8' />
					</BarChart>
				</div>
			)}

			{/* Список активностей */}
			<h2 className='text-2xl font-bold mt-8'>Recent Strava Activities</h2>
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
							<strong>Moving Time:</strong> {formatDuration(activity.duration)}
						</p>
						{activity.polyline ? (
							<div className='mt-4'>
								<StravaMap summaryPolyline={activity.polyline} />
							</div>
						) : (
							<p className='mt-4 text-gray-500'>Маршрут недоступний</p>
						)}
					</li>
				))}
			</ul>
		</div>
	)
}
