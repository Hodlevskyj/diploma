import { NextResponse } from 'next/server'

export async function GET(req: Request) {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
	const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'

	const { searchParams } = new URL(req.url)
	const code = searchParams.get('code')

	if (!code) {
		const errorUrl = new URL('/login', baseUrl)
		errorUrl.searchParams.set('error', 'no_code')
		return NextResponse.redirect(errorUrl.toString())
	}

	try {
		console.log('Exchanging code with API:', code)

		const response = await fetch(`${apiUrl}/auth/strava`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ code }),
		})

		if (!response.ok) {
			console.error('API error:', response.status, await response.text())
			throw new Error(`API returned ${response.status}`)
		}

		const data = await response.json()
		console.log('API response:', { hasToken: !!data.access_token })

		const redirectUrl = new URL('/dashboard', baseUrl)
		const redirectResponse = NextResponse.redirect(redirectUrl.toString())

		redirectResponse.cookies.set({
			name: 'access_token',
			value: data.access_token,
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60, // 1 hour
		})

		return redirectResponse
	} catch (error) {
		console.error('Authentication error:', error)
		const errorUrl = new URL('/login', baseUrl)
		errorUrl.searchParams.set('error', 'auth_failed')
		return NextResponse.redirect(errorUrl.toString())
	}
}
