'use client'

import { AuthProvider } from '@/context/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import 'leaflet/dist/leaflet.css'
import { Geist, Geist_Mono } from 'next/font/google'
import { usePathname } from 'next/navigation'
import './globals.css'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

const queryClient = new QueryClient()

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const pathname = usePathname()
	const isAuthPage =
		pathname === '/login' ||
		pathname === '/register' ||
		pathname.startsWith('/dashboard') ||
		pathname.startsWith('/admin')

	return (
		<html lang='en'>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
				suppressHydrationWarning
			>
				<AuthProvider>
					<QueryClientProvider client={queryClient}>
						<main>{children}</main>
					</QueryClientProvider>
				</AuthProvider>
			</body>
		</html>
	)
}
