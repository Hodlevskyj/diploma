'use client'

import { useState } from 'react'
import { STRAVA_CONFIG } from '../../app/config/strava'

export default function StravaLoginButton() {
	const [isLoading, setIsLoading] = useState(false)

	const handleStravaLogin = () => {
		setIsLoading(true)

		const params = new URLSearchParams({
			client_id: STRAVA_CONFIG.clientId!,
			response_type: 'code',
			redirect_uri: STRAVA_CONFIG.redirectUri,
			approval_prompt: 'force',
			scope: STRAVA_CONFIG.scope,
		})

		const authUrl = `https://www.strava.com/oauth/authorize?${params.toString()}`
		window.location.href = authUrl
	}

	return (
		<button
			onClick={handleStravaLogin}
			disabled={isLoading}
			className='bg-[#FC4C02] text-white px-4 py-2 rounded flex items-center gap-2'
		>
			{isLoading ? 'Connecting...' : 'Connect with Strava'}
		</button>
	)
}
