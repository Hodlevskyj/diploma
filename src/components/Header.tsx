'use client'
import { useEffect, useState } from 'react'

export default function Header() {
	const [email, setEmail] = useState('')
	const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

	useEffect(() => {
		const token = localStorage.getItem('token')
		if (token) {
			fetch(`${API_BASE_URL}/auth/current-user`, {
				headers: {
					Authorization: `Bearer ${token}`,
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

	return (
		<header>
			<h1>Fitness App</h1>
			{email ? <p>Logged in as: {email}</p> : <p>Not logged in</p>}
		</header>
	)
}
