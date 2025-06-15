'use client'
import { DataTable } from '@/components/data-table'
import { getUsers } from '@/lib/api'
import { useEffect, useState } from 'react'

export interface User {
	id: number
	email: string
	name: string | null
	role: 'USER' | 'ADMIN'
	createdAt?: string
}

const UsersPage = () => {
	const [users, setUsers] = useState<User[]>([])
	const [usersLoading, setUsersLoading] = useState(true)
	const [usersError, setUsersError] = useState<string | null>(null)

	useEffect(() => {
		setUsersLoading(true)
		getUsers()
			.then(setUsers)
			.catch(err => setUsersError(err.message))
			.finally(() => setUsersLoading(false))
	}, [])

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
		<div className='flex flex-1 flex-col p-6'>
			<div className='flex justify-between items-center mb-6'>
				<h1 className='text-2xl font-bold'>Користувачі</h1>
			</div>
			<div className='@container/main flex flex-1 flex-col gap-2'>
				<div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
					<DataTable users={users} />
				</div>
			</div>
		</div>
	)
}

export default UsersPage
