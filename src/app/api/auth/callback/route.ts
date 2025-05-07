import { NextResponse } from 'next/server'

export async function GET(req: Request) {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
	const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'

	const { searchParams } = new URL(req.url)
	const code = searchParams.get('code')

	if (!code) {
		return NextResponse.redirect(
			new URL('/login?error=no_code', baseUrl).toString()
		)
	}

	try {
		console.log('Exchanging Strava code:', code)

		const response = await fetch(`${apiUrl}/auth/strava`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ code }),
			cache: 'no-store',
		})

		const responseText = await response.text()
		console.log('API Response:', response.status, responseText)

		if (!response.ok) {
			throw new Error(`API error: ${response.status} ${responseText}`)
		}

		const data = JSON.parse(responseText)

		// Create redirect response
		const redirectUrl = new URL('/dashboard', baseUrl)
		const redirectResponse = NextResponse.redirect(redirectUrl.toString())

		// Set auth token cookie
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
		return NextResponse.redirect(
			new URL('/login?error=auth_failed', baseUrl).toString()
		)
	}
}
