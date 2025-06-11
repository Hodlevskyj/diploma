'use client'

import {
	ArrowBigLeft,
	ArrowUpCircleIcon,
	BarChartIcon,
	CameraIcon,
	Dumbbell,
	FileCodeIcon,
	FileTextIcon,
	Notebook,
} from 'lucide-react'
import * as React from 'react'

import { NavMain } from '@/components/nav-main'
import { NavSecondary } from '@/components/nav-secondary'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar'

const data = {
	navMain: [
		{
			title: 'Вправи',
			url: '/admin/exercises',
			icon: Dumbbell,
		},
		{
			title: 'Статистика',
			url: '/admin/dashboard',
			icon: BarChartIcon,
		},
		{
			title: 'Плани',
			url: '/admin/plans',
			icon: Notebook,
		},
		{
			title: 'Повернутися назад',
			url: '/dashboard',
			icon: ArrowBigLeft,
		},
	],
	navClouds: [
		{
			title: 'Capture',
			icon: CameraIcon,
			isActive: true,
			url: '#',
			items: [
				{
					title: 'Active Proposals',
					url: '#',
				},
				{
					title: 'Archived',
					url: '#',
				},
			],
		},
		{
			title: 'Proposal',
			icon: FileTextIcon,
			url: '#',
			items: [
				{
					title: 'Active Proposals',
					url: '#',
				},
				{
					title: 'Archived',
					url: '#',
				},
			],
		},
		{
			title: 'Prompts',
			icon: FileCodeIcon,
			url: '#',
			items: [
				{
					title: 'Active Proposals',
					url: '#',
				},
				{
					title: 'Archived',
					url: '#',
				},
			],
		},
	],
	navSecondary: [
		// {
		// 	title: 'Settings',
		// 	url: '#',
		// 	icon: SettingsIcon,
		// },
		// {
		// 	title: 'Get Help',
		// 	url: '#',
		// 	icon: HelpCircleIcon,
		// },
		// {
		// 	title: 'Search',
		// 	url: '#',
		// 	icon: SearchIcon,
		// },
	],
	// documents: [
	// {
	// 	name: 'Data Library',
	// 	url: '#',
	// 	icon: DatabaseIcon,
	// },
	// {
	// 	name: 'Reports',
	// 	url: '#',
	// 	icon: ClipboardListIcon,
	// },
	// {
	// 	name: 'Word Assistant',
	// 	url: '#',
	// 	icon: FileIcon,
	// },
	// ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible='offcanvas' {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							asChild
							className='data-[slot=sidebar-menu-button]:!p-1.5'
						>
							<a href='#'>
								<ArrowUpCircleIcon className='h-5 w-5' />
								<span className='text-base font-semibold'>FitnessApp</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent className='mt-4'>
				{' '}
				{/* Додайте відступ зверху */}
				<NavMain items={data.navMain} />
				<NavSecondary items={data.navSecondary} className='mt-auto' />
			</SidebarContent>
			<SidebarFooter>{/* <NavUser user={data.user} /> */}</SidebarFooter>
		</Sidebar>
	)
}
