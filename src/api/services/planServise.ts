import {
	AddExerciseDto,
	CreatePlanDto,
	UpdatePlanDto,
	WorkoutPlan,
} from '@/types/planexercise'

const getTokenFromCookies = () => {
	const cookies = document.cookie
		.split('; ')
		.find(row => row.startsWith('access_token='))
	return cookies ? cookies.split('=')[1] : ''
}
const API_URL = process.env.NEXT_PUBLIC_BASE_URL

const handleResponse = async (response: Response) => {
	if (!response.ok) {
		const errorData = await response.json().catch(() => null)
		console.error('API Error:', {
			status: response.status,
			statusText: response.statusText,
			url: response.url,
			errorData,
		})
		throw new Error(
			errorData?.message || `HTTP error! status: ${response.status}`
		)
	}
	return response.json()
}

export const planService = {
	async getAll(): Promise<WorkoutPlan[]> {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/plans`,
				{
					credentials: 'include',
					headers: {
						Authorization: `Bearer ${getTokenFromCookies() || ''}`,
					},
				}
			)

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || 'Не вдалося завантажити плани')
			}

			return response.json()
		} catch (error) {
			console.error('Get plans error:', error)
			throw error
		}
	},

	async create(data: CreatePlanDto): Promise<WorkoutPlan> {
		try {
			console.log('Створення плану з даними:', data)

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/plans`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${getTokenFromCookies() || ''}`,
					},
					credentials: 'include',
					body: JSON.stringify(data),
				}
			)

			const responseData = await response.json()

			if (!response.ok) {
				console.error('Помилка відповіді сервера:', responseData)
				throw new Error(responseData.message || 'Не вдалося створити план')
			}

			console.log('Відповідь сервера:', responseData)
			return responseData
		} catch (error: any) {
			console.error('Детальна помилка створення плану:', {
				error,
				message: error.message,
				stack: error.stack,
			})
			throw new Error(`Помилка створення плану: ${error.message}`)
		}
	},

	async delete(id: number): Promise<void> {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/plans/${id}`,
				{
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${getTokenFromCookies() || ''}`,
					},
					credentials: 'include',
				}
			)

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.message || 'Не вдалося видалити план')
			}
		} catch (error) {
			console.error('Delete plan error:', error)
			throw error
		}
	},

	async fetchPlan(id: string): Promise<WorkoutPlan> {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/plans/${id}`,
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Accept: 'application/json',
					},
					credentials: 'include',
				}
			)

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))
				throw new Error(
					errorData.message || `Помилка завантаження плану (${response.status})`
				)
			}

			const result = await response.json()

			if (!result || !result.data) {
				throw new Error('Некоректні дані відповіді')
			}

			return result.data
		} catch (error) {
			console.error('Помилка завантаження плану:', error)
			throw error instanceof Error
				? error
				: new Error('Не вдалося завантажити план')
		}
	},

	async updatePlan(id: string, data: UpdatePlanDto): Promise<WorkoutPlan> {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/plans/${id}`,
			{
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(data),
			}
		)
		if (!response.ok) throw new Error('Не вдалося оновити план')
		return response.json()
	},

	async addExercise(
		planId: string,
		data: AddExerciseDto
	): Promise<WorkoutPlan> {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/plans/${planId}/exercises`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(data),
			}
		)
		if (!response.ok) throw new Error('Не вдалося додати вправу')
		return response.json()
	},

	async deleteExercise(planId: string, exerciseId: number): Promise<void> {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_BASE_URL}/plans/${planId}/exercises/${exerciseId}`,
			{
				method: 'DELETE',
				credentials: 'include',
			}
		)
		if (!response.ok) throw new Error('Не вдалося видалити вправу')
	},
}
