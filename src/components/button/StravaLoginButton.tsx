'use client'

import { Button } from '@/components/ui/button'
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
		<Button
			onClick={handleStravaLogin}
			disabled={isLoading}
			className='bg-[#FC4C02] hover:bg-[#FC4C02]/90 text-white flex items-center gap-2'
		>
			<svg className='w-5 h-5' viewBox='0 0 24 24' fill='currentColor'>
				<path d='M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7 13.828h4.917' />
			</svg>
			{isLoading ? 'Підключення...' : 'Підключитися через Strava'}
		</Button>
	)
}
