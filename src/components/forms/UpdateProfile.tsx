'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const UpdateProfile = () => {
	const router = useRouter()
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		avatar: '',
	})
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value })
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			const token = localStorage.getItem('token')
			if (!token) throw new Error('Token not found')

			const apiUrl =
				process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'
			const res = await fetch(`${apiUrl}/auth/update-profile`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(formData),
			})

			const data = await res.json()
			if (res.ok) {
				setSuccess('Profile updated successfully')
				router.push('/profile')
			} else {
				setError(data.message || 'Profile update failed')
			}
		} catch (error) {
			console.error('Profile update error:', error)
			setError('Profile update error')
		}
	}

	return (
		<div>
			<h1>Update Profile</h1>
			<form onSubmit={handleSubmit}>
				<div>
					<label>Name:</label>
					<input
						type='text'
						name='name'
						value={formData.name}
						onChange={handleChange}
					/>
				</div>
				<div>
					<label>Email:</label>
					<input
						type='email'
						name='email'
						value={formData.email}
						onChange={handleChange}
					/>
				</div>
				<div>
					<label>Password:</label>
					<input
						type='password'
						name='password'
						value={formData.password}
						onChange={handleChange}
					/>
				</div>
				<div>
					<label>Avatar URL:</label>
					<input
						type='text'
						name='avatar'
						value={formData.avatar}
						onChange={handleChange}
					/>
				</div>
				{error && <p style={{ color: 'red' }}>{error}</p>}
				{success && <p style={{ color: 'green' }}>{success}</p>}
				<button type='submit'>Update Profile</button>
			</form>
		</div>
	)
}

export default UpdateProfile
