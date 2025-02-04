'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const Dashboard = () => {
	const [email, setEmail] = useState('')
	const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
	const router = useRouter()

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search)
		const token = urlParams.get('token')
		if (token) {
			localStorage.setItem('token', token)
			router.replace('/dashboard')
		}
	}, [router])

	useEffect(() => {
		const storedToken = localStorage.getItem('token')
		if (storedToken) {
			fetch(`${API_BASE_URL}/auth/current-user`, {
				headers: {
					Authorization: `Bearer ${storedToken}`,
				},
			})
				.then(res => res.json())
				.then(data => {
					if (data.email) {
						setEmail(data.email)
					}
				})
				.catch(() => {
					setEmail('')
				})
		}
	}, [API_BASE_URL])

	const handleLogout = () => {
		localStorage.removeItem('token')
		router.push('/login')
	}

	return (
		<div>
			<h1>Dashboard</h1>
			{email ? (
				<>
					<p>Logged in as: {email}</p>
					<button onClick={handleLogout}>Logout</button>
				</>
			) : (
				<p>Not logged in</p>
			)}
		</div>
	)
}

export default Dashboard
