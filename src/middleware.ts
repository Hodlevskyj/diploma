import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Захищені маршрути
const protectedRoutes = ['/dashboard', '/profile']
// Маршрути, до яких можуть заходити тільки неавторизовані користувачі
const authRoutes = ['/login', '/register', '/verify-email']

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl
	const token = request.cookies.get('access_token')
	const isAuthenticated = !!token

	let userData = null
	if (isAuthenticated) {
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/profile`,
				{
					method: 'GET',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' },
				}
			)

			if (res.ok) {
				userData = await res.json()
			}
		} catch (error) {
			console.error('Failed to fetch user profile:', error)
		}
	}

	// Якщо користувач авторизований і намагається зайти на /login або /register → редирект на /dashboard
	if (isAuthenticated && authRoutes.includes(pathname)) {
		return NextResponse.redirect(new URL('/dashboard', request.url))
	}

	// Якщо користувач не авторизований і намагається отримати доступ до захищених сторінок → редирект на /login
	if (!isAuthenticated && protectedRoutes.includes(pathname)) {
		return NextResponse.redirect(new URL('/login', request.url))
	}

	if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
		return NextResponse.redirect(new URL('/login', request.url))
	}

	return NextResponse.next()
}

// Визначаємо, для яких маршрутів буде викликатися middleware
export const config = {
	// matcher: [...protectedRoutes, ...authRoutes, '/setup', 'dashboard/:path*'],
	matcher: [...protectedRoutes, ...authRoutes, 'dashboard/:path*'],
}
