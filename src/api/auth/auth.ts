const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const request = async (endpoint: string, options?: RequestInit) => {
	const response = await fetch(`${API_BASE_URL}${endpoint}`, {
		...options,
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			...options?.headers,
		},
	})

	if (!response.ok) {
		throw new Error(`Error: ${response.status}`)
	}

	return response.json()
}

export const login = async (email: string, password: string) => {
	await request('/auth/login', {
		method: 'POST',
		body: JSON.stringify({ email, password }),
	})
}

export const logout = async () => {
	await request('/logout', { method: 'POST' })
}

export const fetchCurrentUser = async () => {
	try {
		return await request('/current-user', { method: 'GET' })
	} catch (error) {
		return null
	}
}
