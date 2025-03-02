export interface User {
	id: number
	email: string
	name: string
	isVerified: boolean
}

export interface AuthResponse {
	message: string
	user?: User
}
