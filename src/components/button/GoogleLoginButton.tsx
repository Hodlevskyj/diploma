'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const GoogleLoginButton = () => {
	const router = useRouter()

	const handleLogin = () => {
		window.location.href = 'http://localhost:4000/auth/google'
	}

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search)
		const token = urlParams.get('token')
		console.log('token from url:', token)
		if (token) {
			localStorage.setItem('token', token)
			router.push('/dashboard')
		}
	}, [router])

	return <button onClick={handleLogin}>Login with Google</button>
}

export default GoogleLoginButton
