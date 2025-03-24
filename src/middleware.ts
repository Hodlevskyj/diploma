// import type { NextRequest } from 'next/server'
// import { NextResponse } from 'next/server'

// // Маршрути, що вимагають автентифікації
// const protectedRoutes = ['/dashboard', '/profile', '/settings']
// // Маршрути для неавтентифікованих користувачів
// const authRoutes = ['/login', '/register', '/verify-email']

// export async function middleware(request: NextRequest) {
// 	const { pathname } = request.nextUrl

// 	// Отримуємо токен з cookies
// 	const token = request.cookies.get('access_token')
// 	const isAuthenticated = !!token

// 	// Якщо користувач авторизований і намагається отримати доступ до auth routes
// 	if (isAuthenticated && authRoutes.includes(pathname)) {
// 		return NextResponse.redirect(new URL('/dashboard', request.url))
// 	}

// 	// Якщо користувач не авторизований і намагається отримати доступ до protected routes
// 	if (!isAuthenticated && protectedRoutes.includes(pathname)) {
// 		return NextResponse.redirect(new URL('/login', request.url))
// 	}

// 	return NextResponse.next()
// }

// // Визначаємо, для яких маршрутів буде викликатися middleware
// export const config = {
// 	matcher: [...protectedRoutes, ...authRoutes],
// }

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Захищені маршрути
const protectedRoutes = ['/dashboard', '/profile', '/settings']
// Маршрути, до яких можуть заходити тільки неавторизовані користувачі
const authRoutes = ['/login', '/register', '/verify-email']

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl
	const token = request.cookies.get('access_token')
	const isAuthenticated = !!token

	// Якщо користувач авторизований, отримуємо його дані
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

	// Якщо користувач авторизований, але не завершив налаштування профілю → редирект на /setup
	if (
		isAuthenticated &&
		userData &&
		!userData.isSetupComplete &&
		pathname !== '/setup'
	) {
		return NextResponse.redirect(new URL('/setup', request.url))
	}

	return NextResponse.next()
}

// Визначаємо, для яких маршрутів буде викликатися middleware
export const config = {
	matcher: [...protectedRoutes, ...authRoutes, '/setup'],
}
