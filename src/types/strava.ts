export interface StravaTokenResponse {
	token_type: string
	access_token: string
	refresh_token: string
	expires_at: number
	expires_in: number
	athlete: {
		id: number
		username: string
		firstname: string
		lastname: string
	}
}
