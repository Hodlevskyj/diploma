'use client'

import { useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useState } from 'react'

interface User {
	id: number
	email: string
	name: string
}

interface AuthContextType {
	user: User | null
	loading: boolean
	login: (email: string, password: string) => Promise<void>
	logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)
	const router = useRouter()

	useEffect(() => {
		checkAuth()
	}, [])

	const checkAuth = async () => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/current-user`,
				{
					credentials: 'include',
					headers: {
						'Cache-Control': 'no-cache',
						Pragma: 'no-cache',
					},
				}
			)

			if (response.ok) {
				const userData = await response.json()
				setUser(userData)
			} else {
				setUser(null)
			}
		} catch (error) {
			console.error('Auth check failed:', error)
			setUser(null)
		} finally {
			setLoading(false)
		}
	}

	const login = async (email: string, password: string) => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include',
					body: JSON.stringify({ email, password }),
				}
			)

			if (!response.ok) {
				const errorText = await response.text()
				throw new Error(`Login failed: ${errorText}`)
			}

			await checkAuth()
			router.push('/dashboard')
		} catch (error) {
			console.error('Login error:', error)
			throw error
		}
	}

	const logout = async () => {
		try {
			await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
				method: 'POST',
				credentials: 'include',
			})
			setUser(null)
			router.push('/login')
		} catch (error) {
			console.error('Logout error:', error)
		}
	}

	return (
		<AuthContext.Provider value={{ user, loading, login, logout }}>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuth = () => {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}
