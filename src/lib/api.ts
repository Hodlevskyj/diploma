export interface User {
	id: number
	email: string
	name: string | null
	role: 'USER' | 'ADMIN'
	createdAt?: string
}

const getAuthHeaders = () => {
	return {
		'Content-Type': 'application/json',
	}
}

export async function getPlans() {
	const res = await fetch(`${API_URL}/dashboard/plans`, {
		headers: getAuthHeaders(),
		credentials: 'include',
	})
	if (!res.ok) {
		if (res.status === 401) {
			throw new Error('Unauthorized - Please log in')
		}
		throw new Error('Failed to fetch plans')
	}
	return res.json()
}

export async function getPlanExercises(planId: number) {
	const response = await fetch(
		`${API_URL}/dashboard/plans/${planId}/exercises`,
		{
			headers: getAuthHeaders(),
			credentials: 'include',
		}
	)

	if (!response.ok) {
		const error = await response.json()
		throw new Error(error.message || 'Помилка отримання вправ плану')
	}

	return response.json()
}

export async function getPlan(id: number) {
	const res = await fetch(`${API_URL}/dashboard/plans/${id}`, {
		headers: getAuthHeaders(),
		credentials: 'include',
	})
	if (!res.ok) throw new Error('Failed to fetch plan')
	return res.json()
}

export async function createPlan(data: any) {
	const res = await fetch(`${API_URL}/dashboard/plans`, {
		method: 'POST',
		headers: getAuthHeaders(),
		credentials: 'include',
		body: JSON.stringify(data),
	})
	if (!res.ok) throw new Error('Failed to create plan')
	return res.json()
}

export async function removePlan(id: number) {
	const res = await fetch(`${API_URL}/dashboard/plans/${id}`, {
		method: 'DELETE',
		headers: getAuthHeaders(),
		credentials: 'include',
	})
	if (!res.ok) throw new Error('Failed to delete plan')
	return res.json()
}

export async function addExerciseToPlan(planId: number, exerciseData: any) {
	const res = await fetch(`${API_URL}/dashboard/plans/${planId}/exercises`, {
		method: 'POST',
		headers: getAuthHeaders(),
		credentials: 'include',
		body: JSON.stringify(exerciseData),
	})
	if (!res.ok) throw new Error('Failed to add exercise to plan')
	return res.json()
}

export async function getExercises() {
	const res = await fetch(`${API_URL}/dashboard/exercises`, {
		headers: getAuthHeaders(),
		credentials: 'include',
	})
	if (!res.ok) throw new Error('Failed to fetch exercises')
	return res.json()
}

export async function removeExerciseFromPlan(
	planId: number,
	exerciseId: number
) {
	const res = await fetch(
		`${API_URL}/dashboard/plans/${planId}/exercises/${exerciseId}`,
		{
			method: 'DELETE',
			headers: getAuthHeaders(),
			credentials: 'include',
		}
	)
	if (!res.ok) throw new Error('Failed to delete exercise from plan')
	return res.json()
}
export async function updateExerciseInPlan(
	planId: number,
	exerciseId: number,
	data: {
		order: number
		reps?: number
		duration?: number
		restDuration?: number
	}
) {
	const res = await fetch(
		`${API_URL}/dashboard/plans/${planId}/exercises/${exerciseId}`,
		{
			method: 'PATCH',
			headers: getAuthHeaders(),
			credentials: 'include',
			body: JSON.stringify(data),
		}
	)
	if (!res.ok) throw new Error('Не вдалося оновити вправу')
	return res.json()
}

export async function completePlan(
	planId: number,
	trackedExercises: {
		exerciseId: number
		type: 'reps' | 'time'
		value: number
		targetValue: number
		completed: boolean
		pauseCount: number
		resetCount: number
	}[],
	status: 'COMPLETED' | 'CANCELLED'
) {
	const res = await fetch(`${API_URL}/dashboard/plans/${planId}/complete`, {
		method: 'POST',
		headers: getAuthHeaders(),
		credentials: 'include',
		body: JSON.stringify({ trackedExercises, status }),
	})
	if (!res.ok) throw new Error('Failed to complete plan')
	return res.json()
}

export async function savePartialProgress(
	planId: number,
	trackedExercises: {
		exerciseId: number
		type: 'reps' | 'time'
		value: number
		targetValue: number
		completed: boolean
		pauseCount: number
		resetCount: number
	}[]
) {
	const res = await fetch(`${API_URL}/dashboard/plans/${planId}/progress`, {
		method: 'POST',
		headers: getAuthHeaders(),
		credentials: 'include',
		body: JSON.stringify({ trackedExercises }),
	})
	if (!res.ok) throw new Error('Failed to save partial progress')
	return res.json()
}

export async function updatePlan(
	id: number,
	data: { name?: string; description?: string }
) {
	console.log(`Sending PATCH request to ${API_URL}/dashboard/plans/${id}`, data) // Додайте логування
	const res = await fetch(`${API_URL}/dashboard/plans/${id}`, {
		method: 'PATCH', // Переконайтеся, що метод вказаний
		headers: {
			...getAuthHeaders(),
			'Content-Type': 'application/json',
		},
		credentials: 'include',
		body: JSON.stringify(data),
	})

	if (!res.ok) {
		const errorText = await res.text()
		console.error(
			`Error updating plan: ${res.status} ${res.statusText}`,
			errorText
		)
		throw new Error(`Не вдалося оновити план: ${res.status} ${res.statusText}`)
	}

	return res.json()
}

export async function isPlanFavorite(planId: number) {
	const res = await fetch(
		`${API_URL}/dashboard/plans/favorites/${planId}/status`,
		{
			headers: getAuthHeaders(),
			credentials: 'include',
		}
	)
	if (!res.ok) return false
	const data = await res.json()
	return data.isFavorite
}

// admin

export async function getUserCount() {
	const res = await fetch(`${API_URL}/admin/users/count`, {
		headers: getAuthHeaders(),
		credentials: 'include',
	})
	if (!res.ok) throw new Error('Не вдалося отримати кількість користувачів')
	return res.json()
}

// Отримати всі вправи (адмін)
export async function adminGetExercises() {
	const res = await fetch(`${API_URL}/admin/exercises`, {
		headers: getAuthHeaders(),
		credentials: 'include',
	})
	if (!res.ok) throw new Error('Не вдалося отримати вправи')
	return res.json()
}

// Створити нову вправу
export async function adminCreateExercise(data: any) {
	const res = await fetch(`${API_URL}/admin/exercises`, {
		method: 'POST',
		headers: getAuthHeaders(),
		credentials: 'include',
		body: JSON.stringify(data),
	})
	if (!res.ok) {
		const errorData = await res.json().catch(() => ({}))
		throw new Error(errorData.message || 'Не вдалося створити вправу')
	}
	return res.json()
}

// Оновити вправу
export async function adminUpdateExercise(id: number, data: any) {
	const res = await fetch(`${API_URL}/admin/exercises/${id}`, {
		method: 'PUT',
		headers: getAuthHeaders(),
		credentials: 'include',
		body: JSON.stringify(data),
	})
	if (!res.ok) throw new Error('Не вдалося оновити вправу')
	return res.json()
}

// Видалити вправу
export async function adminDeleteExercise(id: number) {
	const res = await fetch(`${API_URL}/admin/exercises/${id}`, {
		method: 'DELETE',
		headers: getAuthHeaders(),
		credentials: 'include',
	})
	if (!res.ok) throw new Error('Не вдалося видалити вправу')
	return res.json()
}

export const adminGetCategories = async () => {
	const response = await fetch(`${API_URL}/admin/categories`, {
		credentials: 'include',
		headers: getAuthHeaders(),
	})

	if (!response.ok) {
		const error = await response.json().catch(() => ({}))
		throw new Error(error.message || 'Помилка при отриманні категорій вправ')
	}

	return response.json()
}

export async function getUsers(): Promise<User[]> {
	const response = await fetch(`${API_URL}/admin/users`, {
		credentials: 'include',
		headers: getAuthHeaders(),
	})

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`)
	}

	const users = await response.json()
	console.log('API response users:', users)
	return users
}

export async function deleteUser(id: number): Promise<{ message: string }> {
	const response = await fetch(`${API_URL}/admin/${id}`, {
		method: 'DELETE',
		credentials: 'include',
		headers: getAuthHeaders(),
	})

	if (!response.ok) {
		const error = await response.json()
		throw new Error(error.message || 'Failed to delete user')
	}

	return response.json()
}

export async function updateUserRole(
	userId: number,
	role: 'USER' | 'ADMIN' | 'PREMIUM'
) {
	const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			...getAuthHeaders(),
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ role }),
	})

	if (!response.ok) {
		const error = await response.json()
		throw new Error(error.message || 'Failed to update user role')
	}

	return response.json()
}

export async function generateWorkoutPlan(data: {
	fitnessGoal: string
	daysPerWeek: number
	preferredDuration?: number
	height?: number
	weight?: number
	age?: number
	difficultyLevel: string
	equipmentType: string
}) {
	const res = await fetch(`${API_URL}/dashboard/plans/generate`, {
		method: 'POST',
		headers: getAuthHeaders(),
		credentials: 'include',
		body: JSON.stringify(data),
	})
	if (!res.ok) {
		if (res.status === 401) {
			throw new Error('Unauthorized - Please log in')
		}
		throw new Error('Failed to generate workout plan')
	}
	return res.json()
}

// Відстеження виконання вправи
export async function trackExercise(data: {
	exerciseId: number
	workoutPlanId: number
	type?: 'reps' | 'time'
	value?: number
	targetValue?: number
	completed: boolean
	pauseCount?: number
	resetCount?: number
}) {
	const res = await fetch(`${API_URL}/exercise/track`, {
		method: 'POST',
		headers: {
			...getAuthHeaders(),
			'Content-Type': 'application/json',
		},
		credentials: 'include',
		body: JSON.stringify({
			exerciseId: data.exerciseId,
			workoutPlanId: data.workoutPlanId,
			type: data.type || 'reps',
			value: data.value || 0,
			targetValue: data.targetValue || 0,
			completed: data.completed,
			pauseCount: data.pauseCount || 0,
			resetCount: data.resetCount || 0,
		}),
	})

	if (!res.ok) {
		throw new Error('Failed to track exercise')
	}

	return res.json()
}

// Отримання прогресу плану
export async function getPlanProgress(planId: number) {
	const res = await fetch(`${API_URL}/planexercise/${planId}/progress`, {
		headers: getAuthHeaders(),
		credentials: 'include',
	})

	if (!res.ok) {
		throw new Error('Failed to fetch plan progress')
	}

	return res.json()
}

export async function getAdminPlans() {
	const res = await fetch(`${API_URL}/admin/plans`, {
		headers: getAuthHeaders(),
		credentials: 'include',
	})
	if (!res.ok) {
		if (res.status === 401) {
			throw new Error('Unauthorized - Please log in')
		}
		throw new Error('Failed to fetch plans')
	}
	return res.json()
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// Перевірити, чи є план в улюблених
export async function checkIfPlanIsFavorite(planId: number) {
	try {
		// Переконуємося, що planId - це число
		const numericPlanId = Number(planId)

		if (isNaN(numericPlanId)) {
			console.error('Invalid plan ID:', planId)
			return false
		}

		const response = await fetch(
			`${API_URL}/dashboard/plans/favorites/${numericPlanId}/check`,
			{
				credentials: 'include',
				headers: getAuthHeaders(),
			}
		)

		if (!response.ok) {
			console.log('Check endpoint failed, falling back to all favorites')
			return false
		}

		const data = await response.json()
		return data.isFavorite
	} catch (error) {
		console.error('Error checking if plan is favorite:', error)
		return false
	}
}

// Додати план до улюблених
export async function addFavoritePlan(planId: number) {
	try {
		// Переконуємося, що planId - це число
		const numericPlanId = Number(planId)

		if (isNaN(numericPlanId)) {
			throw new Error('Невірний ID плану')
		}

		const res = await fetch(
			`${API_URL}/dashboard/plans/favorites/${numericPlanId}`,
			{
				method: 'POST',
				headers: getAuthHeaders(),
				credentials: 'include',
			}
		)

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(
				errorData.message || 'Не вдалося додати план до улюблених'
			)
		}

		return res.json()
	} catch (error) {
		console.error('Error adding plan to favorites:', error)
		throw error
	}
}

// Видалити план з улюблених
export async function removeFavoritePlan(planId: number) {
	try {
		// Переконуємося, що planId - це число
		const numericPlanId = Number(planId)

		if (isNaN(numericPlanId)) {
			throw new Error('Невірний ID плану')
		}

		const res = await fetch(
			`${API_URL}/dashboard/plans/favorites/${numericPlanId}`,
			{
				method: 'DELETE',
				headers: getAuthHeaders(),
				credentials: 'include',
			}
		)

		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}))
			throw new Error(
				errorData.message || 'Не вдалося видалити план з улюблених'
			)
		}

		return res.json()
	} catch (error) {
		console.error('Error removing plan from favorites:', error)
		throw error
	}
}

// Utility function to get cookie value
function getCookie(name: string): string | null {
	const value = `; ${document.cookie}`
	const parts = value.split(`; ${name}=`)
	if (parts.length === 2) {
		return parts.pop()?.split(';').shift() || null
	}
	return null
}

export async function getWorkoutCalendar(month: string, year: string) {
	const baseUrl =
		process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'
	const url = `${baseUrl}/dashboard/plans/calendar`

	console.log('Fetching calendar from:', url)
	console.log('Sending month:', month, 'type:', typeof month)
	console.log('Sending year:', year, 'type:', typeof year)

	try {
		const res = await fetch(url, {
			method: 'POST', // Змінюємо на POST
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
			credentials: 'include',
			body: JSON.stringify({ month, year }), // Передаємо в тілі
		})

		if (!res.ok) {
			let errorMessage = `HTTP ${res.status}: ${res.statusText}`
			try {
				const errorData = await res.json()
				if (errorData.message) {
					errorMessage = Array.isArray(errorData.message)
						? errorData.message.join(', ')
						: errorData.message
				}
			} catch (e) {
				const errorText = await res.text()
				if (errorText) errorMessage = errorText
			}
			console.error('API Error:', {
				status: res.status,
				statusText: res.statusText,
				message: errorMessage,
			})
			throw new Error(errorMessage)
		}

		const data = await res.json()
		console.log('Calendar data received:', data)
		return data
	} catch (error) {
		console.error('Fetch error:', error)
		throw error
	}
}
export async function markDayAsCompleted(planId: number, dayId: number) {
	const baseUrl =
		process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'
	const url = `${baseUrl}/dashboard/plans/${planId}/days/${dayId}/complete`
	console.log('Marking day as completed from:', url) // Для діагностики
	const res = await fetch(url, {
		method: 'POST',
		headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
		credentials: 'include',
	})
	if (!res.ok)
		throw new Error(`Failed to mark day as completed: ${res.statusText}`)
	return res.json()
}

export async function markExerciseAsCompleted(
	planId: number,
	exerciseId: number
) {
	const baseUrl =
		process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'
	const url = `${baseUrl}/dashboard/plans/${planId}/exercises/${exerciseId}/complete`
	console.log('Marking exercise as completed from:', url) // Для діагностики
	const res = await fetch(url, {
		method: 'POST',
		headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
		credentials: 'include',
	})
	if (!res.ok)
		throw new Error(`Failed to mark exercise as completed: ${res.statusText}`)
	return res.json()
}
