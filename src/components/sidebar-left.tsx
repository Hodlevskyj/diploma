'use client'

import { AudioWaveform, Command } from 'lucide-react'
import * as React from 'react'

import { TeamSwitcher } from '@/components/team-switcher'
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarRail,
} from '@/components/ui/sidebar'
import { NavFavorites } from './nav-favorites'

interface UserProfile {
	id: number
	name: string
	email: string
	picture?: string
	role?: string
}

// This is sample data.
const data = {
	teams: [
		{
			name: 'Acme Inc',
			logo: Command,
			plan: 'Enterprise',
		},
		{
			name: 'Acme Corp.',
			logo: AudioWaveform,
			plan: 'Startup',
		},
		{
			name: 'Evil Corp.',
			logo: Command,
			plan: 'Free',
		},
	],
	favorites: [
		{
			name: 'Вправи',
			url: '/dashboard/exercises',
			emoji: '🏋️',
		},
		{
			name: 'Тренувальні плани',
			url: '/dashboard/plans',
			emoji: '🍳',
		},
		{
			name: 'Активність',
			url: '/activity',
			emoji: '🏃',
		},
		{
			name: 'Календар',
			url: '/dashboard/plans/calendar',
			emoji: '📅',
		},
	],
}

export function SidebarLeft({
	userProfile,
	...props
}: React.ComponentProps<typeof Sidebar> & {
	userProfile?: UserProfile
}) {
	const [user, setUser] = React.useState<UserProfile | null>(null)
	const [loading, setLoading] = React.useState(!userProfile)
	const [error, setError] = React.useState<string | null>(null)

	React.useEffect(() => {
		if (userProfile) {
			setUser(userProfile)
			setLoading(false)
		}
	}, [userProfile])

	// Отримання даних профілю при завантаженні
	React.useEffect(() => {
		if (!userProfile) {
			async function fetchUserProfile() {
				try {
					setLoading(true)
					const apiUrl =
						process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'
					console.log('Fetching profile from:', apiUrl)

					const res = await fetch(`${apiUrl}/auth/profile`, {
						credentials: 'include',
						headers: {
							'Content-Type': 'application/json',
							'Access-Control-Allow-Origin': '*',
						},
					})

					if (!res.ok) {
						console.error('Profile fetch failed with status:', res.status)
						throw new Error(`Failed to fetch user profile: ${res.status}`)
					}

					const userData = await res.json()
					console.log('Profile data received:', userData)
					setUser(userData)
				} catch (err) {
					console.error('Error fetching user profile:', err)
					setError('Failed to load profile')
				} finally {
					setLoading(false)
				}
			}

			fetchUserProfile()
		}
	}, [userProfile])

	// Підготовка даних для TeamSwitcher компонента
	const userForTeamSwitcher = user
		? {
				name: user.name,
				email: user.email,
				avatar: user.picture || '/avatars/default.jpg',
		  }
		: null
	return (
		<Sidebar className='border-r-0' {...props}>
			<SidebarHeader>
				{loading ? (
					<div className='flex items-center justify-center w-full h-16'>
						<div className='w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin'></div>
					</div>
				) : error ? (
					<div className='flex items-center justify-center w-full h-16 text-red-500 text-sm'>
						{error}
					</div>
				) : (
					<TeamSwitcher teams={data.teams} user={userForTeamSwitcher} />
				)}
			</SidebarHeader>
			<SidebarContent>
				<NavFavorites favorites={data.favorites} />
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	)
}
