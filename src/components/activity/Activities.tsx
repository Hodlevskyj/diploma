'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
	Activity,
	Award,
	CalendarDays,
	Clock,
	MapPin,
	TrendingUp,
	Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import {
	Bar,
	BarChart,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'
import StravaMap from './StravaMap'

interface ActivityType {
	count: number
	distance: number
	duration: number
	calories: number
}

interface ActivityStats {
	totalDistance: number
	totalDuration: number
	totalCalories: number
	activityCount: number
	averageDistance: number
	byType: Record<string, ActivityType>
	monthlyProgress?: { month: string; distance: number }[]
}

interface Activity {
	id: number
	name: string
	distance: number
	duration: number
	polyline?: string
	startDate: string
	date?: string
	calories?: number
	type?: string
	speed?: number
}

export default function Activities() {
	const [activities, setActivities] = useState<Activity[]>([])
	const [stats, setStats] = useState<ActivityStats | null>(null)
	const [selectedPeriod, setSelectedPeriod] = useState('week')
	const [darkMode, setDarkMode] = useState(false)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true)
			setError(null)

			try {
				const [activitiesRes, statsRes] = await Promise.all([
					fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/activities`, {
						credentials: 'include',
						headers: {
							'Content-Type': 'application/json',
						},
					}),
					fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/stats`, {
						credentials: 'include',
						headers: {
							'Content-Type': 'application/json',
						},
					}),
				])

				if (!activitiesRes.ok || !statsRes.ok) {
					throw new Error('Failed to fetch data')
				}

				const [activitiesData, statsData] = await Promise.all([
					activitiesRes.json(),
					statsRes.json(),
				])

				console.log('Activities data:', activitiesData)
				console.log('Stats data:', statsData)

				const enhancedActivities = activitiesData.map((activity: Activity) => ({
					...activity,
					speed: activity.distance / (activity.duration / 3600) || 0,
					calories: activity.calories || Math.round(activity.distance * 0.063),
					date: activity.startDate,
				}))

				const parsedStats: ActivityStats = {
					totalDistance: parseFloat(statsData.totalDistance) || 0,
					totalDuration: parseInt(statsData.totalDuration, 10) || 0,
					totalCalories:
						parseInt(statsData.totalCalories, 10) ||
						calculateTotalCalories(enhancedActivities),
					activityCount: parseInt(statsData.activityCount, 10) || 0,
					averageDistance: parseFloat(statsData.averageDistance) || 0,
					byType: Object.entries(statsData.byType || {}).reduce(
						(acc, [key, value]) => {
							const typeValue = (value as Partial<ActivityType>) || {}
							acc[key] = {
								count: parseInt(String(typeValue.count || 0), 10),
								distance: parseFloat(String(typeValue.distance || 0)),
								duration: parseInt(String(typeValue.duration || 0), 10),
								calories: parseInt(String(typeValue.calories || 0), 10),
							}
							return acc
						},
						{} as Record<string, ActivityType>
					),
				}

				setActivities(enhancedActivities)
				setStats(parsedStats)
			} catch (error) {
				console.error('Error fetching data:', error)
				setError('Не вдалося завантажити дані. Спробуйте пізніше.')
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [selectedPeriod])

	const formatDuration = (seconds?: number) => {
		if (!seconds || isNaN(seconds)) return '—'
		const hours = Math.floor(seconds / 3600)
		const minutes = Math.floor((seconds % 3600) / 60)
		return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
	}

	const formatDistance = (meters: number) => {
		if (!meters || isNaN(meters)) return '0.0'
		return (meters / 1000).toFixed(1)
	}

	const formatSpeed = (speed: number) => {
		return speed?.toFixed(1) || '—'
	}

	const formatDate = (dateString?: string) => {
		if (!dateString) return '—'
		try {
			const date = new Date(dateString)
			if (isNaN(date.getTime())) return '—'

			return date.toLocaleDateString('uk-UA', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			})
		} catch (error) {
			console.error('Error formatting date:', error)
			return '—'
		}
	}

	const getActivityIcon = (type?: string) => {
		switch (type?.toLowerCase()) {
			case 'run':
				return <Activity className='h-4 w-4' />
			case 'bike':
				return <TrendingUp className='h-4 w-4' />
			case 'swim':
				return <Zap className='h-4 w-4' />
			case 'walk':
				return <Activity className='h-4 w-4' />
			default:
				return <Activity className='h-4 w-4' />
		}
	}

	const getActivityColor = (type?: string) => {
		switch (type?.toLowerCase()) {
			case 'run':
				return 'bg-orange-500'
			case 'bike':
				return 'bg-blue-500'
			case 'swim':
				return 'bg-cyan-500'
			case 'walk':
				return 'bg-green-500'
			default:
				return 'bg-gray-500'
		}
	}

	// Chart data
	const pieData = stats?.byType
		? Object.entries(stats.byType).map(([type, { count }]) => ({
				name: type,
				value: count,
		  }))
		: []

	const barData = stats?.byType
		? Object.entries(stats.byType).map(([type, { distance }]) => ({
				name: type,
				distance: parseFloat((distance / 1000).toFixed(2)),
		  }))
		: []

	const weeklyData = activities
		.filter(a => {
			if (!a.date) return false
			const activityDate = new Date(a.date)
			const weekAgo = new Date()
			weekAgo.setDate(weekAgo.getDate() - 7)
			return activityDate >= weekAgo
		})
		.map(activity => ({
			day: new Date(activity.date!).toLocaleDateString('uk-UA', {
				weekday: 'short',
			}),
			distance: parseFloat(formatDistance(activity.distance)),
			calories: stats?.totalCalories || 0,
			duration: activity.duration / 60,
		}))
		.reverse()

	const calculateTotalCalories = (activities: Activity[]) => {
		return activities.reduce((total, activity) => {
			//0.063 калорії на метр для ходьби/бігу
			const estimatedCalories = Math.round(activity.distance * 0.063)
			return total + (activity.calories || estimatedCalories)
		}, 0)
	}

	const totalWeeklyDistance =
		activities
			.filter(a => {
				if (!a.date) return false
				const activityDate = new Date(a.date)
				const weekAgo = new Date()
				weekAgo.setDate(weekAgo.getDate() - 7)
				return activityDate >= weekAgo
			})
			.reduce((sum, activity) => sum + activity.distance, 0) / 1000
	const weeklyGoal = 50
	const goalProgress = Math.min((totalWeeklyDistance / weeklyGoal) * 100, 100)

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50'>
				<Card className='w-96'>
					<CardContent className='flex items-center justify-center p-8'>
						<div className='flex items-center space-x-4'>
							<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500'></div>
							<span className='text-lg font-medium'>Завантаження...</span>
						</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	if (error) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50'>
				<Card className='w-96'>
					<CardContent className='p-8 text-center'>
						<div className='text-red-500 text-xl mb-4'>⚠️</div>
						<div className='text-red-600 font-medium'>{error}</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50'>
			<div className='max-w-7xl mx-auto px-4 py-8'>
				{/* Stats Overview */}
				{stats && (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
						<Card className='bg-gradient-to-br from-orange-500 to-red-500 text-white border-0'>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium opacity-90'>
									Сумарна дистанція
								</CardTitle>
								<MapPin className='h-4 w-4 opacity-90' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>
									{stats.totalDistance} km
								</div>
							</CardContent>
						</Card>

						<Card className='bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0'>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium opacity-90'>
									Всього часу
								</CardTitle>
								<Clock className='h-4 w-4 opacity-90' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{stats.totalDuration}</div>
								<p className='text-xs opacity-90'>
									{stats.activityCount} завершенні активності
								</p>
							</CardContent>
						</Card>

						<Card className='bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0'>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium opacity-90'>
									Спалені калорії
								</CardTitle>
								<Zap className='h-4 w-4 opacity-90' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>
									{stats.totalCalories?.toLocaleString() || '0'}
								</div>
								<p className='text-xs opacity-90'>
									Avg:{' '}
									{stats.activityCount > 0
										? Math.round(
												(stats.totalCalories || 0) / stats.activityCount
										  )
										: 0}{' '}
									на активність
								</p>
							</CardContent>
						</Card>
					</div>
				)}

				<Tabs defaultValue='progress' className='mb-8'>
					<TabsList className='grid w-full grid-cols-3'>
						<TabsTrigger value='progress'>Прогрес</TabsTrigger>
						<TabsTrigger value='breakdown'>Розподіл діяльності</TabsTrigger>
						<TabsTrigger value='distance'>Аналіз відстані</TabsTrigger>
					</TabsList>

					<TabsContent value='breakdown' className='mt-6'>
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Award className='h-5 w-5' />
									Тип діяльності
								</CardTitle>
							</CardHeader>
							<CardContent>
								{pieData.length > 0 && (
									<ResponsiveContainer width='100%' height={300}>
										<PieChart>
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
														fill={
															['#f97316', '#06b6d4', '#10b981', '#8b5cf6'][
																index % 4
															]
														}
													/>
												))}
											</Pie>
											<Tooltip />
										</PieChart>
									</ResponsiveContainer>
								)}
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value='distance' className='mt-6'>
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<MapPin className='h-5 w-5' />
									Відстань за типом діяльності
								</CardTitle>
							</CardHeader>
							<CardContent>
								{barData.length > 0 && (
									<ResponsiveContainer width='100%' height={300}>
										<BarChart data={barData}>
											<XAxis dataKey='name' />
											<YAxis />
											<Tooltip />
											<Bar dataKey='distance' fill='#f97316' />
										</BarChart>
									</ResponsiveContainer>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				{/* Activities List */}
				<Card className='relative z-0'>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<Activity className='h-5 w-5' />
							Нежодавня активність
						</CardTitle>
					</CardHeader>
					<CardContent>
						{activities.length > 0 ? (
							<div className='space-y-4'>
								{activities.map(activity => (
									<Card
										key={activity.id}
										className='hover:shadow-md transition-shadow'
									>
										<CardContent className='p-4'>
											<div className='flex items-start justify-between'>
												<div className='flex items-start space-x-4'>
													<div
														className={`p-2 rounded-lg ${getActivityColor(
															activity.type
														)}`}
													>
														{getActivityIcon(activity.type)}
														<div className='text-white text-xs mt-1 text-center'>
															{activity.type}
														</div>
													</div>
													<div className='flex-1'>
														<h3 className='font-semibold text-lg mb-2'>
															{activity.name || 'Unnamed Activity'}
														</h3>
														<div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
															<div className='flex items-center gap-2'>
																<MapPin className='h-4 w-4 text-gray-500' />
																<span>
																	{formatDistance(activity.distance)} km
																</span>
															</div>
															<div className='flex items-center gap-2'>
																<Clock className='h-4 w-4 text-gray-500' />
																<span>{formatDuration(activity.duration)}</span>
															</div>
															<div className='flex items-center gap-2'>
																<Zap className='h-4 w-4 text-gray-500' />
																<span>{activity.calories || 0} cal</span>
															</div>
															<div className='flex items-center gap-2'>
																<CalendarDays className='h-4 w-4 text-gray-500' />
																<span>{formatDate(activity.startDate)}</span>
															</div>
														</div>
													</div>
												</div>
											</div>
											{activity.polyline ? (
												<div className='mt-4 bg-gray-100 rounded-lg p-4 relative z-10'>
													<StravaMap summaryPolyline={activity.polyline} />
												</div>
											) : (
												<div className='mt-4 text-center text-gray-400 text-sm'>
													Route map not available
												</div>
											)}
										</CardContent>
									</Card>
								))}
							</div>
						) : (
							<div className='text-center py-8'>
								<Activity className='h-12 w-12 text-gray-400 mx-auto mb-4' />
								<p className='text-gray-500'>No activities found</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
