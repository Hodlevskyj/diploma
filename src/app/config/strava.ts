export const STRAVA_CONFIG = {
	clientId: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID ?? '',
	redirectUri: process.env.NEXT_PUBLIC_STRAVA_REDIRECT_URI ?? '',
	scope: 'read,activity:read_all',
} as const

export type StravaConfig = typeof STRAVA_CONFIG
