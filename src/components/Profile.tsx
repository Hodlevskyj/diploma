// 'use client'
// import { updateProfile } from '@/api/auth/auth'
// import {
// 	ArrowLeft,
// 	Camera,
// 	Check,
// 	Edit3,
// 	Loader2,
// 	UserCircle,
// 	X,
// } from 'lucide-react'
// import { useRouter } from 'next/navigation'
// import { useEffect, useState } from 'react'

// interface UserProfile {
// 	name: string
// 	picture?: string
// 	email: string
// 	height?: number
// 	weight?: number
// 	age?: number
// 	goal?: string
// }

// interface UserStats {
// 	totalWorkouts: number
// 	completedExercises: number
// 	totalPlans: number
// 	totalTime: number
// }

// export default function Profile() {
// 	const [user, setUser] = useState<UserProfile | null>(null)
// 	const [name, setName] = useState('')
// 	const [file, setFile] = useState<File | null>(null)
// 	const [preview, setPreview] = useState<string | null>(null)
// 	const [message, setMessage] = useState('')
// 	const [error, setError] = useState('')
// 	const [isLoading, setIsLoading] = useState(true)
// 	const [isUpdating, setIsUpdating] = useState(false)
// 	const [isEditing, setIsEditing] = useState(false)
// 	const [stats, setStats] = useState({
// 		totalWorkouts: 0,
// 		completedExercises: 0,
// 		totalPlans: 0,
// 		totalTime: 0,
// 	})
// 	const [plans, setPlans] = useState([])
// 	const [isLoadingPlans, setIsLoadingPlans] = useState(false)
// 	const router = useRouter()

// 	// Додаємо завантаження планів в useEffect
// 	useEffect(() => {
// 		async function fetchUserPlans() {
// 			if (!user) return

// 			setIsLoadingPlans(true)
// 			try {
// 				const res = await fetch(
// 					`${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/plans`,
// 					{
// 						credentials: 'include',
// 					}
// 				)
// 				if (res.ok) {
// 					const plansData = await res.json()
// 					setPlans(plansData.slice(0, 3)) // Беремо тільки 3 останніх плани
// 				}
// 			} catch (error) {
// 				console.error('Failed to load user plans:', error)
// 			} finally {
// 				setIsLoadingPlans(false)
// 			}
// 		}

// 		if (user) {
// 			fetchUserPlans()
// 		}
// 	}, [user])

// 	useEffect(() => {
// 		async function fetchUserStats() {
// 			if (!user) return

// 			try {
// 				const res = await fetch(
// 					`${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/exercises/stats`,
// 					{ credentials: 'include' }
// 				)
// 				if (res.ok) {
// 					const statsData = await res.json()
// 					setStats(statsData)
// 				}
// 			} catch (err) {
// 				console.error('Failed to load user stats:', err)
// 			}
// 		}
// 		if (user) {
// 			fetchUserStats()
// 		}
// 	}, [user])

// 	useEffect(() => {
// 		async function fetchUser() {
// 			try {
// 				const res = await fetch(
// 					`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/profile`,
// 					{
// 						credentials: 'include',
// 					}
// 				)
// 				if (!res.ok) throw new Error('Failed to fetch user')
// 				const data: UserProfile = await res.json()
// 				setUser(data)
// 				setName(data.name)
// 			} catch (error) {
// 				setError('Failed to load profile.')
// 			} finally {
// 				setIsLoading(false)
// 			}
// 		}
// 		fetchUser()
// 	}, [])

// 	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// 		if (e.target.files?.length) {
// 			const selectedFile = e.target.files[0]
// 			setFile(selectedFile)

// 			// Create preview
// 			const reader = new FileReader()
// 			reader.onload = e => {
// 				setPreview(e.target?.result as string)
// 			}
// 			reader.readAsDataURL(selectedFile)
// 		}
// 	}

// 	const handleSubmit = async (e: React.FormEvent) => {
// 		e.preventDefault()
// 		setMessage('')
// 		setError('')
// 		setIsUpdating(true)

// 		try {
// 			const updatedUser = await updateProfile(name, file || undefined)
// 			setMessage('Profile updated successfully!')
// 			setUser(updatedUser)
// 			setFile(null)
// 			setPreview(null)
// 			setIsEditing(false)

// 			// Reset file input
// 			const fileInput = document.querySelector(
// 				'input[type="file"]'
// 			) as HTMLInputElement
// 			if (fileInput) {
// 				fileInput.value = ''
// 			}

// 			// Clear success message after 3 seconds
// 			setTimeout(() => setMessage(''), 3000)
// 		} catch (error) {
// 			console.error('Update error:', error)
// 			setError(
// 				error instanceof Error ? error.message : 'Failed to update profile'
// 			)
// 		} finally {
// 			setIsUpdating(false)
// 		}
// 	}

// 	const handleCancel = () => {
// 		setIsEditing(false)
// 		setName(user?.name || '')
// 		setFile(null)
// 		setPreview(null)
// 		setError('')
// 		setMessage('')

// 		const fileInput = document.querySelector(
// 			'input[type="file"]'
// 		) as HTMLInputElement
// 		if (fileInput) {
// 			fileInput.value = ''
// 		}
// 	}

// 	if (isLoading) {
// 		return (
// 			<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center'>
// 				<div className='flex flex-col items-center space-y-4'>
// 					<Loader2 className='w-8 h-8 animate-spin text-blue-600' />
// 					<p className='text-gray-600 animate-pulse'>Loading your profile...</p>
// 				</div>
// 			</div>
// 		)
// 	}

// 	if (error && !user) {
// 		return (
// 			<div className='min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center'>
// 				<div className='bg-white rounded-xl shadow-lg p-8 max-w-md mx-4 border border-red-100'>
// 					<div className='flex items-center space-x-3 text-red-600 mb-4'>
// 						<X className='w-6 h-6' />
// 						<h2 className='text-xl font-semibold'>Error</h2>
// 					</div>
// 					<p className='text-gray-700'>{error}</p>
// 				</div>
// 			</div>
// 		)
// 	}

// 	return (
// 		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50'>
// 			<div className='container mx-auto px-4 py-8 max-w-4xl'>
// 				{/* Повідомлення про успіх/помилку */}
// 				{message && (
// 					<div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3 animate-in slide-in-from-top-1 duration-300'>
// 						<Check className='w-5 h-5 text-green-600' />
// 						<p className='text-green-700 font-medium'>{message}</p>
// 					</div>
// 				)}

// 				{error && (
// 					<div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3 animate-in slide-in-from-top-1 duration-300'>
// 						<X className='w-5 h-5 text-red-600' />
// 						<p className='text-red-700 font-medium'>{error}</p>
// 					</div>
// 				)}

// 				{user && (
// 					<div className='bg-white rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm bg-white/90'>
// 						{/* Шапка профілю */}
// 						<div className='bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 text-white relative overflow-hidden'>
// 							<div className='absolute inset-0 bg-white/10 backdrop-blur-sm'></div>
// 							<div className='relative z-10 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8'>
// 								{/* Фото профілю */}
// 								<div className='relative group'>
// 									<div className='w-32 h-32 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl'>
// 										{preview || user.picture ? (
// 											<img
// 												src={preview || user.picture}
// 												alt='Profile'
// 												className='w-full h-full object-cover'
// 											/>
// 										) : (
// 											<div className='w-full h-full bg-white/20 flex items-center justify-center'>
// 												<UserCircle className='w-16 h-16 text-white/60' />
// 											</div>
// 										)}
// 									</div>
// 									{isEditing && (
// 										<label className='absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
// 											<Camera className='w-8 h-8 text-white' />
// 											<input
// 												type='file'
// 												accept='image/*'
// 												onChange={handleFileChange}
// 												className='hidden'
// 											/>
// 										</label>
// 									)}
// 								</div>

// 								{/* Інформація про користувача */}
// 								<div className='text-center md:text-left flex-1'>
// 									<h2 className='text-3xl font-bold mb-2'>{user.name}</h2>
// 									<p className='text-white/80 text-lg mb-4'>{user.email}</p>
// 									<div className='mb-6'>
// 										<button
// 											onClick={() => router.push('/dashboard')}
// 											className='inline-flex items-center gap-2 text-gray-800 hover:text-gray-100 transition-colors duration-200 group'
// 										>
// 											<ArrowLeft className='w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200' />
// 											<span className='font-medium'>
// 												Повернутися до дашборду
// 											</span>
// 										</button>
// 									</div>
// 									{!isEditing && (
// 										<button
// 											onClick={() => setIsEditing(true)}
// 											className='px-6 py-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors duration-200 flex items-center space-x-2 mx-auto md:mx-0'
// 										>
// 											<Edit3 className='w-4 h-4' />
// 											<span>Редагувати профіль</span>
// 										</button>
// 									)}
// 								</div>
// 							</div>
// 						</div>

// 						{/* Вміст профілю */}
// 						<div className='p-8'>
// 							{isEditing ? (
// 								/* Форма редагування */
// 								<form onSubmit={handleSubmit} className='space-y-6'>
// 									<div className='grid md:grid-cols-2 gap-6'>
// 										<div>
// 											<label className='block text-sm font-semibold text-gray-700 mb-2'>
// 												Повне ім'я
// 											</label>
// 											<input
// 												type='text'
// 												value={name}
// 												onChange={e => setName(e.target.value)}
// 												className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
// 												required
// 											/>
// 										</div>

// 										<div>
// 											<label className='block text-sm font-semibold text-gray-700 mb-2'>
// 												Фото профілю
// 											</label>
// 											<input
// 												type='file'
// 												accept='image/*'
// 												onChange={handleFileChange}
// 												className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all duration-200'
// 											/>
// 										</div>
// 									</div>

// 									<div className='flex justify-end space-x-4 pt-6 border-t border-gray-200'>
// 										<button
// 											type='button'
// 											onClick={handleCancel}
// 											className='px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium'
// 										>
// 											Скасувати
// 										</button>
// 										<button
// 											type='submit'
// 											disabled={isUpdating}
// 											className='px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2'
// 										>
// 											{isUpdating ? (
// 												<>
// 													<Loader2 className='w-4 h-4 animate-spin' />
// 													<span>Оновлення...</span>
// 												</>
// 											) : (
// 												<>
// 													<Check className='w-4 h-4' />
// 													<span>Зберегти зміни</span>
// 												</>
// 											)}
// 										</button>
// 									</div>
// 								</form>
// 							) : (
// 								/* Відображення профілю */
// 								<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
// 									{/* Статистика тренувань */}
// 									<div className='space-y-6 md:col-span-2 order-1'>
// 										<h3 className='text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2'>
// 											Статистика тренувань
// 										</h3>

// 										<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
// 											<div className='bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl shadow-sm'>
// 												<p className='text-green-600 text-sm font-medium'>
// 													Завершено вправ
// 												</p>
// 												<p className='text-3xl font-bold text-gray-800'>
// 													{stats.completedExercises}
// 												</p>
// 											</div>

// 											<div className='bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl shadow-sm'>
// 												<p className='text-purple-600 text-sm font-medium'>
// 													Власних планів
// 												</p>
// 												<p className='text-3xl font-bold text-gray-800'>
// 													{stats.totalPlans}
// 												</p>
// 											</div>
// 										</div>
// 									</div>

// 									{/* Особиста інформація */}
// 									<div className='space-y-6 order-2'>
// 										<h3 className='text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2'>
// 											Особиста інформація
// 										</h3>

// 										<div className='space-y-4 bg-gray-50 rounded-xl p-4'>
// 											<div className='flex justify-between items-center py-3 border-b border-gray-100'>
// 												<span className='font-medium text-gray-600'>Ім'я</span>
// 												<span className='text-gray-800'>{user.name}</span>
// 											</div>
// 											<div className='flex justify-between items-center py-3 border-b border-gray-100'>
// 												<span className='font-medium text-gray-600'>Email</span>
// 												<span className='text-gray-800'>{user.email}</span>
// 											</div>
// 											<div className='flex justify-between items-center py-3 border-b border-gray-100'>
// 												<span className='font-medium text-gray-600'>Вік</span>
// 												<span className='text-gray-800'>
// 													{user.age ? `${user.age} років` : 'Не вказано'}
// 												</span>
// 											</div>
// 										</div>
// 									</div>

// 									{/* Фізичні параметри */}
// 									<div className='space-y-6 order-3'>
// 										<h3 className='text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2'>
// 											Фізичні параметри
// 										</h3>

// 										<div className='space-y-4 bg-gray-50 rounded-xl p-4'>
// 											<div className='flex justify-between items-center py-3 border-b border-gray-100'>
// 												<span className='font-medium text-gray-600'>Зріст</span>
// 												<span className='text-gray-800'>
// 													{user.height ? `${user.height} см` : 'Не вказано'}
// 												</span>
// 											</div>
// 											<div className='flex justify-between items-center py-3 border-b border-gray-100'>
// 												<span className='font-medium text-gray-600'>Вага</span>
// 												<span className='text-gray-800'>
// 													{user.weight ? `${user.weight} кг` : 'Не вказано'}
// 												</span>
// 											</div>
// 											<div className='flex justify-between items-center py-3 border-b border-gray-100'>
// 												<span className='font-medium text-gray-600'>Мета</span>
// 												<span className='text-gray-800'>
// 													{user.goal
// 														? user.goal === 'LOSE_WEIGHT'
// 															? 'Схуднення'
// 															: user.goal === 'GAIN_MUSCLE'
// 															? "Набір м'язової маси"
// 															: 'Підтримка форми'
// 														: 'Не вказано'}
// 												</span>
// 											</div>
// 										</div>
// 									</div>

// 									{/* Мої плани тренувань */}
// 									<div className='space-y-6 md:col-span-2 order-4'>
// 										<div className='flex justify-between items-center'>
// 											<h3 className='text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2'>
// 												Мої плани тренувань
// 											</h3>
// 											<a
// 												href='/dashboard/plans'
// 												className='text-blue-600 hover:text-blue-800 text-sm font-medium'
// 											>
// 												Переглянути всі
// 											</a>
// 										</div>

// 										{isLoadingPlans ? (
// 											<div className='flex justify-center py-8'>
// 												<div className='w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin'></div>
// 											</div>
// 										) : plans.length > 0 ? (
// 											<div className='grid md:grid-cols-3 gap-4'>
// 												{plans.map((plan: any) => (
// 													<div
// 														key={plan.id}
// 														className='bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow'
// 													>
// 														<div className='flex justify-between items-start'>
// 															<div>
// 																<h4 className='font-medium text-gray-900'>
// 																	{plan.name}
// 																</h4>
// 																<p className='text-sm text-gray-500'>
// 																	Створено{' '}
// 																	{new Date(
// 																		plan.createdAt
// 																	).toLocaleDateString()}
// 																</p>
// 															</div>
// 															<span
// 																className={`text-xs px-2 py-1 rounded-full font-medium ${
// 																	plan.status === 'COMPLETED'
// 																		? 'bg-green-100 text-green-800'
// 																		: plan.status === 'IN_PROGRESS'
// 																		? 'bg-blue-100 text-blue-800'
// 																		: 'bg-gray-100 text-gray-800'
// 																}`}
// 															>
// 																{plan.status === 'COMPLETED'
// 																	? 'Завершено'
// 																	: plan.status === 'IN_PROGRESS'
// 																	? 'В процесі'
// 																	: 'Скасовано'}
// 															</span>
// 														</div>
// 														<div className='mt-2 flex items-center text-sm text-gray-600'>
// 															<span className='mr-4'>
// 																{plan.exercises?.length || 0} вправ
// 															</span>
// 															<span>
// 																{plan.fitnessGoal === 'LOSE_WEIGHT'
// 																	? 'Схуднення'
// 																	: plan.fitnessGoal === 'GAIN_MUSCLE'
// 																	? "Набір м'язової маси"
// 																	: 'Підтримка форми'}
// 															</span>
// 														</div>
// 														<a
// 															href={`/dashboard/plans/${plan.id}`}
// 															className='mt-3 inline-block text-sm text-blue-600 hover:text-blue-800 font-medium'
// 														>
// 															Переглянути план →
// 														</a>
// 													</div>
// 												))}
// 											</div>
// 										) : (
// 											<div className='text-center py-8 bg-gray-50 rounded-xl'>
// 												<p className='text-gray-500 mb-4'>
// 													У вас ще немає створених планів тренувань
// 												</p>
// 												<a
// 													href='/dashboard/plans/generate-plan'
// 													className='inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors'
// 												>
// 													Створити перший план
// 												</a>
// 											</div>
// 										)}
// 									</div>
// 								</div>
// 							)}
// 						</div>
// 					</div>
// 				)}
// 			</div>
// 		</div>
// 	)
// }

'use client'
import { updateProfile } from '@/api/auth/auth'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
	Activity,
	ArrowLeft,
	Camera,
	Check,
	Edit3,
	Loader2,
	Target,
	Trophy,
	UserCircle,
	X,
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

interface UserStats {
	totalWorkouts: number
	completedExercises: number
	totalPlans: number
	totalTime: number
}

export default function Profile() {
	const [user, setUser] = useState<UserProfile | null>(null)
	const [name, setName] = useState('')
	const [file, setFile] = useState<File | null>(null)
	const [preview, setPreview] = useState<string | null>(null)
	const [message, setMessage] = useState('')
	const [error, setError] = useState('')
	const [isLoading, setIsLoading] = useState(true)
	const [isUpdating, setIsUpdating] = useState(false)
	const [isEditing, setIsEditing] = useState(false)
	const [stats, setStats] = useState({
		totalWorkouts: 0,
		completedExercises: 0,
		totalPlans: 0,
		totalTime: 0,
	})
	const [plans, setPlans] = useState([])
	const [isLoadingPlans, setIsLoadingPlans] = useState(false)
	const router = useRouter()

	// Завантаження планів
	useEffect(() => {
		async function fetchUserPlans() {
			if (!user) return

			setIsLoadingPlans(true)
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/plans`,
					{
						credentials: 'include',
					}
				)
				if (res.ok) {
					const plansData = await res.json()
					setPlans(plansData.slice(0, 3))
				}
			} catch (error) {
				console.error('Failed to load user plans:', error)
			} finally {
				setIsLoadingPlans(false)
			}
		}

		if (user) {
			fetchUserPlans()
		}
	}, [user])

	// Завантаження статистики
	useEffect(() => {
		async function fetchUserStats() {
			if (!user) return

			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/exercises/stats`,
					{ credentials: 'include' }
				)
				if (res.ok) {
					const statsData = await res.json()
					setStats(statsData)
				}
			} catch (err) {
				console.error('Failed to load user stats:', err)
			}
		}
		if (user) {
			fetchUserStats()
		}
	}, [user])

	// Завантаження користувача
	useEffect(() => {
		async function fetchUser() {
			try {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/profile`,
					{
						credentials: 'include',
					}
				)
				if (!res.ok) throw new Error('Failed to fetch user')
				const data: UserProfile = await res.json()
				setUser(data)
				setName(data.name)
			} catch (error) {
				setError('Failed to load profile.')
			} finally {
				setIsLoading(false)
			}
		}
		fetchUser()
	}, [])

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.length) {
			const selectedFile = e.target.files[0]
			setFile(selectedFile)

			const reader = new FileReader()
			reader.onload = e => {
				setPreview(e.target?.result as string)
			}
			reader.readAsDataURL(selectedFile)
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setMessage('')
		setError('')
		setIsUpdating(true)

		try {
			const updatedUser = await updateProfile(name, file || undefined)
			setMessage('Profile updated successfully!')
			setUser(updatedUser)
			setFile(null)
			setPreview(null)
			setIsEditing(false)

			const fileInput = document.querySelector(
				'input[type="file"]'
			) as HTMLInputElement
			if (fileInput) {
				fileInput.value = ''
			}

			setTimeout(() => setMessage(''), 3000)
		} catch (error) {
			console.error('Update error:', error)
			setError(
				error instanceof Error ? error.message : 'Failed to update profile'
			)
		} finally {
			setIsUpdating(false)
		}
	}

	const handleCancel = () => {
		setIsEditing(false)
		setName(user?.name || '')
		setFile(null)
		setPreview(null)
		setError('')
		setMessage('')

		const fileInput = document.querySelector(
			'input[type="file"]'
		) as HTMLInputElement
		if (fileInput) {
			fileInput.value = ''
		}
	}

	const getGoalText = (goal?: string) => {
		switch (goal) {
			case 'LOSE_WEIGHT':
				return 'Схуднення'
			case 'GAIN_MUSCLE':
				return "Набір м'язової маси"
			case 'MAINTAIN':
				return 'Підтримка форми'
			default:
				return 'Не вказано'
		}
	}

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'COMPLETED':
				return (
					<Badge variant='default' className='bg-green-100 text-green-800'>
						Завершено
					</Badge>
				)
			case 'IN_PROGRESS':
				return (
					<Badge variant='default' className='bg-blue-100 text-blue-800'>
						В процесі
					</Badge>
				)
			default:
				return <Badge variant='secondary'>Скасовано</Badge>
		}
	}

	if (isLoading) {
		return (
			<div className='min-h-screen bg-background flex items-center justify-center'>
				<div className='flex flex-col items-center space-y-4'>
					<Loader2 className='w-8 h-8 animate-spin text-primary' />
					<p className='text-muted-foreground'>Loading your profile...</p>
				</div>
			</div>
		)
	}

	if (error && !user) {
		return (
			<div className='min-h-screen bg-background flex items-center justify-center p-4'>
				<Alert className='max-w-md'>
					<X className='h-4 w-4' />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-background'>
			<div className='container mx-auto p-6 max-w-6xl'>
				{/* Повідомлення */}
				{message && (
					<Alert className='mb-6 border-green-200 bg-green-50'>
						<Check className='h-4 w-4' />
						<AlertDescription className='text-green-700'>
							{message}
						</AlertDescription>
					</Alert>
				)}

				{error && (
					<Alert className='mb-6' variant='destructive'>
						<X className='h-4 w-4' />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				{user && (
					<div className='space-y-6'>
						{/* Шапка профілю */}
						<Card className='overflow-hidden'>
							<div className='bg-gradient-to-r from-primary to-primary/80 p-8 text-primary-foreground'>
								<div className='flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8'>
									{/* Аватар */}
									<div className='relative group'>
										<Avatar className='w-32 h-32 border-4 border-primary-foreground/20'>
											<AvatarImage
												src={preview || user.picture}
												alt='Profile picture'
											/>
											<AvatarFallback className='text-2xl'>
												<UserCircle className='w-16 h-16' />
											</AvatarFallback>
										</Avatar>
										{isEditing && (
											<label className='absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
												<Camera className='w-8 h-8 text-white' />
												<input
													type='file'
													accept='image/*'
													onChange={handleFileChange}
													className='hidden'
												/>
											</label>
										)}
									</div>

									{/* Інформація користувача */}
									<div className='text-center md:text-left flex-1'>
										<h1 className='text-3xl font-bold mb-2'>{user.name}</h1>
										<p className='text-primary-foreground/80 text-lg mb-4'>
											{user.email}
										</p>

										<div className='flex flex-col md:flex-row gap-4'>
											<Button
												variant='secondary'
												onClick={() => router.push('/dashboard')}
												className='bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0'
											>
												<ArrowLeft className='w-4 h-4 mr-2' />
												Повернутися до дашборду
											</Button>

											{!isEditing && (
												<Button
													variant='secondary'
													onClick={() => setIsEditing(true)}
													className='bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0'
												>
													<Edit3 className='w-4 h-4 mr-2' />
													Редагувати профіль
												</Button>
											)}
										</div>
									</div>
								</div>
							</div>
						</Card>

						{isEditing ? (
							/* Форма редагування */
							<Card>
								<CardHeader>
									<CardTitle>Редагування профілю</CardTitle>
									<CardDescription>
										Оновіть свою особисту інформацію
									</CardDescription>
								</CardHeader>
								<CardContent>
									<form onSubmit={handleSubmit} className='space-y-6'>
										<div className='grid md:grid-cols-2 gap-6'>
											<div className='space-y-2'>
												<Label htmlFor='name'>Повне ім'я</Label>
												<Input
													id='name'
													type='text'
													value={name}
													onChange={e => setName(e.target.value)}
													required
												/>
											</div>

											<div className='space-y-2'>
												<Label htmlFor='picture'>Фото профілю</Label>
												<Input
													id='picture'
													type='file'
													accept='image/*'
													onChange={handleFileChange}
												/>
											</div>
										</div>

										<Separator />

										<div className='flex justify-end space-x-4'>
											<Button
												type='button'
												variant='outline'
												onClick={handleCancel}
											>
												Скасувати
											</Button>
											<Button type='submit' disabled={isUpdating}>
												{isUpdating ? (
													<>
														<Loader2 className='w-4 h-4 mr-2 animate-spin' />
														Оновлення...
													</>
												) : (
													<>
														<Check className='w-4 h-4 mr-2' />
														Зберегти зміни
													</>
												)}
											</Button>
										</div>
									</form>
								</CardContent>
							</Card>
						) : (
							/* Відображення профілю */
							<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
								{/* Статистика */}
								<div className='lg:col-span-3'>
									<Card>
										<CardHeader>
											<CardTitle className='flex items-center gap-2'>
												<Trophy className='w-5 h-5' />
												Статистика тренувань
											</CardTitle>
										</CardHeader>
										<CardContent>
											<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
												<div className='text-center p-4 bg-green-50 rounded-lg'>
													<Activity className='w-8 h-8 mx-auto mb-2 text-green-600' />
													<p className='text-2xl font-bold text-green-700'>
														{stats.completedExercises}
													</p>
													<p className='text-sm text-green-600'>
														Завершено вправ
													</p>
												</div>

												<div className='text-center p-4 bg-blue-50 rounded-lg'>
													<Target className='w-8 h-8 mx-auto mb-2 text-blue-600' />
													<p className='text-2xl font-bold text-blue-700'>
														{stats.totalPlans}
													</p>
													<p className='text-sm text-blue-600'>
														Власних планів
													</p>
												</div>

												{/* <div className='text-center p-4 bg-purple-50 rounded-lg'>
													<Calendar className='w-8 h-8 mx-auto mb-2 text-purple-600' />
													<p className='text-2xl font-bold text-purple-700'>
														{stats.totalWorkouts}
													</p>
													<p className='text-sm text-purple-600'>Тренувань</p>
												</div> */}

												{/* <div className='text-center p-4 bg-orange-50 rounded-lg'>
													<Loader2 className='w-8 h-8 mx-auto mb-2 text-orange-600' />
													<p className='text-2xl font-bold text-orange-700'>
														{Math.round(stats.totalTime / 60)}h
													</p>
													<p className='text-sm text-orange-600'>
														Загальний час
													</p>
												</div> */}
											</div>
										</CardContent>
									</Card>
								</div>
								{/* Особиста інформація
								<Card>
									<CardHeader>
										<CardTitle>Особиста інформація</CardTitle>
									</CardHeader>
									<CardContent className='space-y-4'>
										<div className='flex justify-between items-center py-2'>
											<span className='text-muted-foreground'>Ім'я</span>
											<span className='font-medium'>{user.name}</span>
										</div>
										<Separator />
										<div className='flex justify-between items-center py-2'>
											<span className='text-muted-foreground'>Email</span>
											<span className='font-medium'>{user.email}</span>
										</div>
										<Separator />
										<div className='flex justify-between items-center py-2'>
											<span className='text-muted-foreground'>Вік</span>
											<span className='font-medium'>
												{user.age ? `${user.age} років` : 'Не вказано'}
											</span>
										</div>
									</CardContent>
								</Card> */}
								{/* Фізичні параметри
								<Card>
									<CardHeader>
										<CardTitle>Фізичні параметри</CardTitle>
									</CardHeader>
									<CardContent className='space-y-4'>
										<div className='flex justify-between items-center py-2'>
											<span className='text-muted-foreground'>Зріст</span>
											<span className='font-medium'>
												{user.height ? `${user.height} см` : 'Не вказано'}
											</span>
										</div>
										<Separator />
										<div className='flex justify-between items-center py-2'>
											<span className='text-muted-foreground'>Вага</span>
											<span className='font-medium'>
												{user.weight ? `${user.weight} кг` : 'Не вказано'}
											</span>
										</div>
										<Separator />
										<div className='flex justify-between items-center py-2'>
											<span className='text-muted-foreground'>Мета</span>
											<span className='font-medium'>
												{getGoalText(user.goal)}
											</span>
										</div>
									</CardContent>
								</Card> */}
								{/* Мої плани */}
								<Card className='lg:col-span-3'>
									<CardHeader>
										<div className='flex justify-between items-center'>
											<CardTitle>Мої плани тренувань</CardTitle>
											<Button variant='outline' size='sm' asChild>
												<a href='/dashboard/plans'>Переглянути всі</a>
											</Button>
										</div>
									</CardHeader>
									<CardContent>
										{isLoadingPlans ? (
											<div className='grid md:grid-cols-3 gap-4'>
												{[1, 2, 3].map(i => (
													<Card key={i}>
														<CardContent className='p-4'>
															<Skeleton className='h-4 w-3/4 mb-2' />
															<Skeleton className='h-3 w-1/2 mb-3' />
															<Skeleton className='h-3 w-full' />
														</CardContent>
													</Card>
												))}
											</div>
										) : plans.length > 0 ? (
											<div className='grid md:grid-cols-3 gap-4'>
												{plans.map((plan: any) => (
													<Card
														key={plan.id}
														className='hover:shadow-md transition-shadow'
													>
														<CardContent className='p-4'>
															<div className='flex justify-between items-start mb-3'>
																<div className='flex-1'>
																	<h4 className='font-semibold text-base mb-1'>
																		{plan.name}
																	</h4>
																	<p className='text-sm text-muted-foreground'>
																		{new Date(
																			plan.createdAt
																		).toLocaleDateString()}
																	</p>
																</div>
																{getStatusBadge(plan.status)}
															</div>

															<div className='flex items-center gap-4 text-sm text-muted-foreground mb-3'>
																<span>{plan.exercises?.length || 0} вправ</span>
																<span>{getGoalText(plan.fitnessGoal)}</span>
															</div>

															<Button
																variant='outline'
																size='sm'
																asChild
																className='w-full'
															>
																<a href={`/dashboard/plans/${plan.id}`}>
																	Переглянути план
																</a>
															</Button>
														</CardContent>
													</Card>
												))}
											</div>
										) : (
											<div className='text-center py-8'>
												<p className='text-muted-foreground mb-4'>
													У вас ще немає створених планів тренувань
												</p>
												<Button asChild>
													<a href='/dashboard/plans/generate-plan'>
														Створити перший план
													</a>
												</Button>
											</div>
										)}
									</CardContent>
								</Card>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	)
}
