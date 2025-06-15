'use client'
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
import {
	ArrowBigLeft,
	ArrowUpCircleIcon,
	CameraIcon,
	Dumbbell,
	FileCodeIcon,
	FileTextIcon,
	User,
} from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'

const data = {
	navMain: [
		{
			title: 'Вправи',
			url: '/admin/exercises',
			icon: Dumbbell,
		},
		// {
		// 	title: 'Плани',
		// 	url: '/admin/plans',
		// 	icon: Notebook,
		// },
		{
			title: 'Користувачі',
			url: '/admin',
			icon: User,
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
	navSecondary: [],
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
							<Link href='/dashboard'>
								<ArrowUpCircleIcon className='h-5 w-5' />
								<span className='text-base font-semibold'>FitnessApp</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent className='mt-4'>
				<NavMain items={data.navMain} />
				<NavSecondary items={data.navSecondary} className='mt-auto' />
			</SidebarContent>
			<SidebarFooter>{/* <NavUser user={data.user} /> */}</SidebarFooter>
		</Sidebar>
	)
}
