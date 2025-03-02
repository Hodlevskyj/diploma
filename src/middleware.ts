import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Маршрути, що вимагають автентифікації
const protectedRoutes = ['/dashboard', '/profile', '/settings']
// Маршрути для неавтентифікованих користувачів
const authRoutes = ['/login', '/register', '/verify-email']

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl

	// Отримуємо токен з cookies
	const token = request.cookies.get('access_token')
	const isAuthenticated = !!token

	// Якщо користувач авторизований і намагається отримати доступ до auth routes
	if (isAuthenticated && authRoutes.includes(pathname)) {
		return NextResponse.redirect(new URL('/dashboard', request.url))
	}

	// Якщо користувач не авторизований і намагається отримати доступ до protected routes
	if (!isAuthenticated && protectedRoutes.includes(pathname)) {
		return NextResponse.redirect(new URL('/login', request.url))
	}

	return NextResponse.next()
}

// Визначаємо, для яких маршрутів буде викликатися middleware
export const config = {
	matcher: [...protectedRoutes, ...authRoutes],
}
