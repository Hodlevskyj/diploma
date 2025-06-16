'use client'

import GoogleLoginButton from '@/components/button/GoogleLoginButton'
import StravaLoginButton from '@/components/button/StravaLoginButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
	Activity,
	ArrowRight,
	Loader2,
	Target,
	TrendingUp,
	Zap,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface UserProfile {
	name: string
	picture?: string
	email: string
	height?: number
	weight?: number
	age?: number
	goal?: string
}

export default function Home() {
	const router = useRouter()
	const [user, setUser] = useState<UserProfile | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function fetchUser() {
			// Перевіряємо чи налаштований API URL
			if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
				console.warn('API_BASE_URL not configured')
				setLoading(false)
				return
			}

			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/profile`,
					{
						credentials: 'include',
					}
				)

				// Перевіряємо статус відповіді без викидання помилки
				if (res.ok) {
					const data: UserProfile = await res.json()
					setUser(data)
					// Не перенаправляємо автоматично - дозволяємо користувачу побачити головну сторінку
				} else if (res.status === 401 || res.status === 403) {
					// Користувач не авторизований
					setUser(null)
				} else {
					// Інші помилки сервера
					console.warn(`Server responded with status: ${res.status}`)
					setUser(null)
				}
			} catch (error) {
				// Помилки мережі або інші критичні помилки
				if (error instanceof TypeError && error.message.includes('fetch')) {
					console.warn('Network error or server unavailable')
				} else {
					console.error('Unexpected error:', error)
				}
				setUser(null)
			} finally {
				setLoading(false)
			}
		}
		fetchUser()
	}, [router])

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-background'>
				<div className='flex flex-col items-center space-y-4'>
					<Loader2 className='h-8 w-8 animate-spin text-primary' />
					<p className='text-sm text-muted-foreground'>Завантаження...</p>
				</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-background'>
			{/* Hero Section */}
			<section className='relative'>
				<div className='absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/5' />
				<div className='relative'>
					<div className='container mx-auto px-4 py-24 lg:py-32'>
						<div className='max-w-4xl mx-auto text-center space-y-8'>
							<Badge variant='secondary' className='mb-4'>
								<Zap className='w-3 h-3 mr-1' />
								Нова версія доступна
							</Badge>

							<h1 className='text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter'>
								<span className='bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent'>
									Fitness Tracker
								</span>
							</h1>

							{user ? (
								<div className='space-y-4'>
									<p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
										Вітаємо повернення,{' '}
										<span className='font-semibold text-foreground'>
											{user.name.split(' ')[0]}
										</span>
										! Готові продовжити свій фітнес-шлях?
									</p>
									<Button
										size='lg'
										onClick={() => router.push('/dashboard')}
										className='group'
									>
										Перейти до панелі
										<ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
									</Button>
								</div>
							) : (
								<div className='space-y-6'>
									<p className='text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
										Підключайтеся до Google та Strava для відстеження ваших
										спортивних досягнень та досягнення нових висот у фітнесі
									</p>

									{/* Login Cards */}
									<div className='grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mt-12'>
										<Card className='group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 hover:border-primary/20'>
											<CardHeader className='space-y-3'>
												<div className='flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto group-hover:bg-primary/20 transition-colors'>
													<svg
														className='w-6 h-6 text-primary'
														viewBox='0 0 24 24'
													>
														<path
															fill='currentColor'
															d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
														/>
														<path
															fill='currentColor'
															d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
														/>
														<path
															fill='currentColor'
															d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
														/>
														<path
															fill='currentColor'
															d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
														/>
													</svg>
												</div>
												<CardTitle className='text-center'>
													Google Account
												</CardTitle>
												<CardDescription className='text-center'>
													Швидкий вхід через Google аккаунт
												</CardDescription>
											</CardHeader>
											<CardContent>
												<GoogleLoginButton />
											</CardContent>
										</Card>

										<Card className='group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 hover:border-[#FC4C02]/20'>
											<CardHeader className='space-y-3'>
												<div className='flex items-center justify-center w-12 h-12 rounded-full bg-[#FC4C02]/10 mx-auto group-hover:bg-[#FC4C02]/20 transition-colors'>
													<svg
														className='w-6 h-6 text-[#FC4C02]'
														viewBox='0 0 24 24'
													>
														<path
															fill='currentColor'
															d='M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7 14.171h4.172'
														/>
													</svg>
												</div>
												<CardTitle className='text-center'>
													Strava Integration
												</CardTitle>
												<CardDescription className='text-center'>
													Синхронізація з вашими тренуваннями
												</CardDescription>
											</CardHeader>
											<CardContent>
												<StravaLoginButton />
											</CardContent>
										</Card>
									</div>

									<Separator className='max-w-xs mx-auto' />

									{/* Alternative Login Options */}
									<div className='flex flex-col sm:flex-row gap-3 justify-center items-center'>
										<Button
											variant='outline'
											size='lg'
											onClick={() => router.push('/auth/login')}
											className='min-w-[140px]'
										>
											Увійти
										</Button>
										<Button
											size='lg'
											onClick={() => router.push('/auth/register')}
											className='min-w-[140px]'
										>
											Зареєструватися
										</Button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className='py-20 bg-muted/30'>
				<div className='container mx-auto px-4'>
					<div className='max-w-6xl mx-auto'>
						<div className='text-center mb-16'>
							<h2 className='text-3xl md:text-4xl font-bold mb-4'>
								Ваші можливості
							</h2>
							<p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
								Потужні інструменти для досягнення ваших фітнес-цілей
							</p>
						</div>

						<div className='grid md:grid-cols-3 gap-8'>
							<Card className='group hover:shadow-lg transition-all duration-300 border-0 bg-background/60 backdrop-blur-sm'>
								<CardHeader className='text-center space-y-4'>
									<div className='flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto group-hover:bg-primary/20 transition-colors'>
										<TrendingUp className='w-8 h-8 text-primary' />
									</div>
									<CardTitle className='text-xl'>Детальна Аналітика</CardTitle>
								</CardHeader>
								<CardContent>
									<p className='text-muted-foreground text-center leading-relaxed'>
										Глибокий аналіз ваших тренувань з візуалізацією прогресу та
										персональними рекомендаціями
									</p>
								</CardContent>
							</Card>

							<Card className='group hover:shadow-lg transition-all duration-300 border-0 bg-background/60 backdrop-blur-sm'>
								<CardHeader className='text-center space-y-4'>
									<div className='flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mx-auto group-hover:bg-secondary/20 transition-colors'>
										<Target className='w-8 h-8 text-secondary' />
									</div>
									<CardTitle className='text-xl'>Розумні Цілі</CardTitle>
								</CardHeader>
								<CardContent>
									<p className='text-muted-foreground text-center leading-relaxed'>
										Встановлюйте та відстежуйте персональні цілі з автоматичним
										коригуванням на основі вашого прогресу
									</p>
								</CardContent>
							</Card>

							<Card className='group hover:shadow-lg transition-all duration-300 border-0 bg-background/60 backdrop-blur-sm'>
								<CardHeader className='text-center space-y-4'>
									<div className='flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mx-auto group-hover:bg-green-500/20 transition-colors'>
										<Activity className='w-8 h-8 text-green-500' />
									</div>
									<CardTitle className='text-xl'>Активність 24/7</CardTitle>
								</CardHeader>
								<CardContent>
									<p className='text-muted-foreground text-center leading-relaxed'>
										Безперервне відстеження активності з інтеграцією популярних
										фітнес-додатків та пристроїв
									</p>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className='border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
				<div className='container mx-auto px-4 py-12'>
					<div className='max-w-6xl mx-auto'>
						<div className='flex flex-col md:flex-row justify-between items-center gap-6'>
							<div className='flex items-center space-x-2'>
								<Activity className='w-6 h-6 text-primary' />
								<span className='font-bold text-lg'>Fitness Tracker</span>
							</div>

							<div className='text-sm text-muted-foreground text-center md:text-right'>
								<p>© 2025 Fitness Tracker. Всі права захищені.</p>
							</div>
						</div>
					</div>
				</div>
			</footer>
		</div>
	)
}
