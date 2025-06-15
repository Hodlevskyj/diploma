'use client'

import { createContext, useContext, useState } from 'react'

export interface User {
	id: number
	email: string
	name: string | null
	role: 'USER' | 'ADMIN'
	createdAt?: string
}

const AdminContext = createContext<{
	users: User[]
	usersLoading: boolean
	usersError: string | null
}>({ users: [], usersLoading: true, usersError: null })

export function AdminProvider({ children }: { children: React.ReactNode }) {
	const [users, setUsers] = useState<User[]>([])
	const [usersLoading, setUsersLoading] = useState(true)
	const [usersError, setUsersError] = useState<string | null>(null)

	return (
		<AdminContext.Provider value={{ users, usersLoading, usersError }}>
			{children}
		</AdminContext.Provider>
	)
}

export const useAdmin = () => useContext(AdminContext)
