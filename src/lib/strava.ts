import { StravaTokenResponse } from '@/types/strava'

export async function exchangeStravaCode(
	code: string
): Promise<StravaTokenResponse> {
	const response = await fetch('https://www.strava.com/oauth/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			client_id: process.env.STRAVA_CLIENT_ID,
			client_secret: process.env.STRAVA_CLIENT_SECRET,
			code,
			grant_type: 'authorization_code',
		}),
	})

	if (!response.ok) {
		throw new Error('Failed to exchange Strava code')
	}

	return response.json()
}
