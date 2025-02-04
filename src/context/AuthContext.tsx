'use client'

import { createContext, useEffect, useState } from 'react'

interface AuthContextType {
	user: any
	login: (email: string, password: string) => Promise<void>
	googleLogin: (googleData: any) => Promise<void>
	logout: () => void
}

export const AuthContext = createContext<AuthContextType>({
	user: null,
	login: async () => {},
	googleLogin: async () => {},
	logout: () => {},
})

export const AuthProvider = ({ children }: any) => {
	const [user, setUser] = useState(null)

	useEffect(() => {
		const storedUser = localStorage.getItem('user')
		if (storedUser) setUser(JSON.parse(storedUser))
	}, [])

	const login = async (email: string, password: string) => {
		const res = await fetch(
			`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
			}
		)

		if (!res.ok) throw new Error('Invalid credentials')
		const data = await res.json()
		localStorage.setItem('user', JSON.stringify(data))
		setUser(data)
	}

	const googleLogin = async (googleData: any) => {
		const res = await fetch(
			`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(googleData),
			}
		)

		if (!res.ok) throw new Error('Google login failed')
		const data = await res.json()
		localStorage.setItem('user', JSON.stringify(data))
		setUser(data)
	}

	const logout = () => {
		localStorage.removeItem('user')
		setUser(null)
	}

	return (
		<AuthContext.Provider value={{ user, login, googleLogin, logout }}>
			{children}
		</AuthContext.Provider>
	)
}
