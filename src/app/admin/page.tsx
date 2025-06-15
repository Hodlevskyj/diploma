'use client'
import { AppSidebar } from '@/components/app-sidebar'
import { DataTable } from '@/components/data-table'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { getUsers } from '@/lib/api'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export interface User {
	id: number
	email: string
	name: string | null
	role: 'USER' | 'ADMIN'
	createdAt?: string
}

const AdminPage = () => {
	const [access, setAccess] = useState<'pending' | 'allowed' | 'forbidden'>(
		'pending'
	)
	const [users, setUsers] = useState<User[]>([])
	const [usersLoading, setUsersLoading] = useState(true)
	const [usersError, setUsersError] = useState<string | null>(null)

	// Перевірка доступу
	useEffect(() => {
		fetch('http://localhost:4000/admin', {
			credentials: 'include',
		})
			.then(res => {
				if (res.status === 403) {
					setAccess('forbidden')
				} else if (res.ok) {
					setAccess('allowed')
				} else {
					setAccess('forbidden')
				}
			})
			.catch(() => setAccess('forbidden'))
	}, [])

	useEffect(() => {
		if (access !== 'allowed') return
		setUsersLoading(true)
		getUsers()
			.then(setUsers)
			.catch(err => setUsersError(err.message))
			.finally(() => setUsersLoading(false))
	}, [access])

	if (access === 'pending') {
		return <div className='p-8 text-center'>Перевірка доступу...</div>
	}
	if (access === 'forbidden') {
		return (
			<div className='p-8 text-center text-red-600 font-bold'>
				Доступ лише для адміністратора
				<br />
				<Link
					href='/dashboard'
					className='inline-block mt-2 px-6 py-2 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition'
				>
					Назад
				</Link>
			</div>
		)
	}
	if (usersLoading) {
		return <div className='p-8 text-center'>Завантаження користувачів...</div>
	}
	if (usersError) {
		return (
			<div className='p-8 text-center text-red-600 font-bold'>
				Помилка: {usersError}
			</div>
		)
	}

	return (
		<SidebarProvider>
			<AppSidebar variant='inset' />
			<SidebarInset>
				<SiteHeader />
				<div className='flex flex-1 flex-col'>
					<div className='@container/main flex flex-1 flex-col gap-2'>
						<div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
							<div className='px-4 lg:px-6'></div>
							<DataTable users={users} />
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}

export default AdminPage
