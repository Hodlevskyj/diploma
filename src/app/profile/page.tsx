'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const ProfilePage = () => {
	const router = useRouter()
	const [userData, setUserData] = useState({
		name: '',
		email: '',
		avatar: '',
	})
	const [error, setError] = useState('')

	useEffect(() => {
		const fetchUserData = async () => {
			const token = localStorage.getItem('token')
			if (!token) {
				router.push('/login')
				return
			}

			const apiUrl =
				process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'
			const res = await fetch(`${apiUrl}/auth/profile`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			})

			const data = await res.json()
			if (res.ok) {
				setUserData({
					name: data.name,
					email: data.email,
					avatar: data.avatar,
				})
			} else {
				setError(data.message || 'Failed to fetch user data')
			}
		}

		fetchUserData()
	}, [router])

	const handleUpdateProfile = () => {
		router.push('/update-profile')
	}

	return (
		<div>
			<h1>Profile</h1>
			<h2>Name: {userData.name}</h2>
			<p>Email: {userData.email}</p>
			<p>
				Avatar: <img src={userData.avatar} alt='Avatar' />
			</p>
			{error && <p style={{ color: 'red' }}>{error}</p>}
			<button onClick={handleUpdateProfile}>Update Profile</button>
		</div>
	)
}

export default ProfilePage
