'use client'

import {
	AudioWaveform,
	Blocks,
	Calendar,
	Command,
	Home,
	Inbox,
	MessageCircleQuestion,
	Search,
	Settings2,
	Sparkles,
	Trash2,
} from 'lucide-react'
import * as React from 'react'

import { NavFavorites } from '@/components/nav-favorites'
import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import { NavWorkspaces } from '@/components/nav-workspaces'
import { TeamSwitcher } from '@/components/team-switcher'
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarRail,
} from '@/components/ui/sidebar'

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
	navMain: [
		{
			title: 'Search',
			url: '#',
			icon: Search,
		},
		{
			title: 'Ask AI',
			url: '#',
			icon: Sparkles,
		},
		{
			title: 'Home',
			url: '#',
			icon: Home,
			isActive: true,
		},
		{
			title: 'Inbox',
			url: '#',
			icon: Inbox,
			badge: '10',
		},
	],
	navSecondary: [
		{
			title: 'Calendar',
			url: '#',
			icon: Calendar,
		},
		{
			title: 'Settings',
			url: '#',
			icon: Settings2,
		},
		{
			title: 'Templates',
			url: '#',
			icon: Blocks,
		},
		{
			title: 'Trash',
			url: '#',
			icon: Trash2,
		},
		{
			title: 'Help',
			url: '#',
			icon: MessageCircleQuestion,
		},
	],
	favorites: [
		{
			name: 'Exercises',
			url: '/dashboard/exercises',
			emoji: '🏋️',
		},
		{
			name: 'Plans',
			url: '/dashboard/plans',
			emoji: '🍳',
		},
		{
			name: 'Activity',
			url: '/activity',
			emoji: '🏃',
		},
		{
			name: 'Book Notes & Reading List',
			url: '#',
			emoji: '📚',
		},
		{
			name: 'Sustainable Gardening Tips & Plant Care',
			url: '#',
			emoji: '🌱',
		},
		{
			name: 'Language Learning Progress & Resources',
			url: '#',
			emoji: '🗣️',
		},
		{
			name: 'Home Renovation Ideas & Budget Tracker',
			url: '#',
			emoji: '🏠',
		},
		{
			name: 'Personal Finance & Investment Portfolio',
			url: '#',
			emoji: '💰',
		},
		{
			name: 'Movie & TV Show Watchlist with Reviews',
			url: '#',
			emoji: '🎬',
		},
		{
			name: 'Daily Habit Tracker & Goal Setting',
			url: '#',
			emoji: '✅',
		},
	],
	workspaces: [
		{
			name: 'Personal Life Management',
			emoji: '🏠',
			pages: [
				{
					name: 'Daily Journal & Reflection',
					url: '#',
					emoji: '📔',
				},
				{
					name: 'Health & Wellness Tracker',
					url: '#',
					emoji: '🍏',
				},
				{
					name: 'Personal Growth & Learning Goals',
					url: '#',
					emoji: '🌟',
				},
			],
		},
		{
			name: 'Professional Development',
			emoji: '💼',
			pages: [
				{
					name: 'Career Objectives & Milestones',
					url: '#',
					emoji: '🎯',
				},
				{
					name: 'Skill Acquisition & Training Log',
					url: '#',
					emoji: '🧠',
				},
				{
					name: 'Networking Contacts & Events',
					url: '#',
					emoji: '🤝',
				},
			],
		},
		{
			name: 'Creative Projects',
			emoji: '🎨',
			pages: [
				{
					name: 'Writing Ideas & Story Outlines',
					url: '#',
					emoji: '✍️',
				},
				{
					name: 'Art & Design Portfolio',
					url: '#',
					emoji: '🖼️',
				},
				{
					name: 'Music Composition & Practice Log',
					url: '#',
					emoji: '🎵',
				},
			],
		},
		{
			name: 'Home Management',
			emoji: '🏡',
			pages: [
				{
					name: 'Household Budget & Expense Tracking',
					url: '#',
					emoji: '💰',
				},
				{
					name: 'Home Maintenance Schedule & Tasks',
					url: '#',
					emoji: '🔧',
				},
				{
					name: 'Family Calendar & Event Planning',
					url: '#',
					emoji: '📅',
				},
			],
		},
		{
			name: 'Travel & Adventure',
			emoji: '🧳',
			pages: [
				{
					name: 'Trip Planning & Itineraries',
					url: '#',
					emoji: '🗺️',
				},
				{
					name: 'Travel Bucket List & Inspiration',
					url: '#',
					emoji: '🌎',
				},
				{
					name: 'Travel Journal & Photo Gallery',
					url: '#',
					emoji: '📸',
				},
			],
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

	// Отримання даних профілю при завантаженні компонента, якщо профіль не передано
	// Отримання даних профілю при завантаженні компонента, якщо профіль не передано
	React.useEffect(() => {
		if (!userProfile) {
			async function fetchUserProfile() {
				try {
					setLoading(true)
					// Перевіряємо, чи правильно встановлено URL API
					const apiUrl =
						process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'
					console.log('Fetching profile from:', apiUrl)

					const res = await fetch(`${apiUrl}/auth/profile`, {
						credentials: 'include',
						headers: {
							'Content-Type': 'application/json',
							// Додаємо заголовок для CORS, якщо потрібно
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
				<NavMain items={data.navMain} />
			</SidebarHeader>
			<SidebarContent>
				<NavFavorites favorites={data.favorites} />
				<NavWorkspaces workspaces={data.workspaces} />
				<NavSecondary items={data.navSecondary} className='mt-auto' />
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	)
}
