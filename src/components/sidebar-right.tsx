'use client'
import { Plus } from 'lucide-react'
import * as React from 'react'

import { DatePicker } from '@/components/date-picker'
import { NavUser } from '@/components/nav-user'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from '@/components/ui/sidebar'

interface UserProfile {
	id: number
	name: string
	email: string
	picture: string
	role: string
}

// This is sample data.
const data = {
	user: {
		name: 'shadcn',
		email: 'm@example.com',
		avatar: '/avatars/shadcn.jpg',
	},
	calendars: [
		{
			name: 'My Calendars',
			items: ['Personal', 'Work', 'Family'],
		},
		{
			name: 'Favorites',
			items: ['Holidays', 'Birthdays'],
		},
		{
			name: 'Other',
			items: ['Travel', 'Reminders', 'Deadlines'],
		},
	],
}

export function SidebarRight({
	...props
}: React.ComponentProps<typeof Sidebar>) {
	const [user, setUser] = React.useState<UserProfile | null>(null)
	const [loading, setLoading] = React.useState(true)
	const [error, setError] = React.useState<string | null>(null)

	// Отримання даних профілю при завантаженні компонента
	React.useEffect(() => {
		async function fetchUserProfile() {
			try {
				setLoading(true)
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/profile`,
					{
						credentials: 'include',
					}
				)

				if (!res.ok) {
					throw new Error('Failed to fetch user profile')
				}

				const userData = await res.json()
				setUser(userData)
			} catch (err) {
				console.error('Error fetching user profile:', err)
				setError('Failed to load profile')
			} finally {
				setLoading(false)
			}
		}

		fetchUserProfile()
	}, [])

	// Підготовка даних для NavUser компонента
	const userForNav = user
		? {
				name: user.name,
				email: user.email,
				avatar: user.picture || '/avatars/default.jpg', // Використовуємо аватар за замовчуванням, якщо немає picture
		  }
		: {
				name: 'Loading...',
				email: '',
				avatar: '/avatars/default.jpg',
		  }
	return (
		<Sidebar
			collapsible='none'
			className='sticky hidden lg:flex top-0 h-svh border-l'
			{...props}
		>
			<SidebarHeader className='h-16 border-b border-sidebar-border'>
				{loading ? (
					<div className='flex items-center justify-center w-full h-full'>
						<div className='w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin'></div>
					</div>
				) : error ? (
					<div className='flex items-center justify-center w-full h-full text-red-500 text-sm'>
						{error}
					</div>
				) : (
					<NavUser user={userForNav} />
				)}
			</SidebarHeader>
			<SidebarContent>
				<DatePicker />
				<SidebarSeparator className='mx-0' />
				{/* <Calendars calendars={calendarsData} /> */}
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton>
							<Plus />
							<span>New Calendar</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	)
}
