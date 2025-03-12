'use client'
import { updateProfile } from '@/api/auth/auth'
import { useEffect, useState } from 'react'

interface User {
	name: string
	picture?: string
}

export default function Profile() {
	const [user, setUser] = useState<User | null>(null)
	const [name, setName] = useState('')
	const [file, setFile] = useState<File | null>(null)
	const [message, setMessage] = useState('')
	const [error, setError] = useState('')
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		async function fetchUser() {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/profile`,
					{
						credentials: 'include',
					}
				)
				if (!res.ok) throw new Error('Failed to fetch user')
				const data: User = await res.json()
				setUser(data)
				setName(data.name)
			} catch (error) {
				setError('Failed to load profile.')
			} finally {
				setIsLoading(false)
			}
		}
		fetchUser()
	}, [])

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.length) {
			setFile(e.target.files[0])
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setMessage('')
		setError('')

		try {
			const updatedUser = await updateProfile(name, file || undefined)
			setMessage('Profile updated successfully!')
			setUser(updatedUser)
			// Clear the file input after successful update
			setFile(null)
			// Reset the file input element
			const fileInput = document.querySelector(
				'input[type="file"]'
			) as HTMLInputElement
			if (fileInput) {
				fileInput.value = ''
			}
		} catch (error) {
			console.error('Update error:', error)
			setError(
				error instanceof Error ? error.message : 'Failed to update profile'
			)
		}
	}

	if (isLoading) {
		return <div>Loading...</div>
	}

	if (error) {
		return <div>{error}</div>
	}

	return (
		<div className='container mx-auto p-4'>
			<h2 className='text-2xl font-bold mb-4'>Profile</h2>
			{message && <p className='text-green-600 mb-4'>{message}</p>}
			{user && (
				<form onSubmit={handleSubmit} className='space-y-4'>
					<div>
						<label className='block mb-2'>Name:</label>
						<input
							type='text'
							value={name}
							onChange={e => setName(e.target.value)}
							className='border p-2 w-full rounded'
							required
						/>
					</div>
					<div>
						<label className='block mb-2'>Profile Picture:</label>
						<input
							type='file'
							accept='image/*'
							onChange={handleFileChange}
							className='block w-full'
						/>
					</div>
					{user.picture && (
						<img
							src={user.picture}
							alt='Profile'
							className='w-20 h-20 rounded-full object-cover'
						/>
					)}
					<button
						type='submit'
						className='bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition'
					>
						Update Profile
					</button>
				</form>
			)}
		</div>
	)
}
