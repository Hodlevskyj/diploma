import Cookies from 'js-cookie'

const getAuthHeaders = () => {
	const token = Cookies.get('access_token')
	return {
		Authorization: `Bearer ${token}`,
		'Content-Type': 'application/json',
	}
}

export async function getPlans() {
	const res = await fetch('http://localhost:4000/plans', {
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

export async function getPlan(id: number) {
	const res = await fetch(`http://localhost:4000/plans/${id}`, {
		headers: getAuthHeaders(),
		credentials: 'include',
	})
	if (!res.ok) throw new Error('Failed to fetch plan')
	return res.json()
}

export async function createPlan(data: any) {
	const res = await fetch('http://localhost:4000/plans', {
		method: 'POST',
		headers: getAuthHeaders(),
		credentials: 'include',
		body: JSON.stringify(data),
	})
	if (!res.ok) throw new Error('Failed to create plan')
	return res.json()
}

export async function removePlan(id: number) {
	const res = await fetch(`http://localhost:4000/plans/${id}`, {
		method: 'DELETE',
		headers: getAuthHeaders(),
		credentials: 'include',
	})
	if (!res.ok) throw new Error('Failed to delete plan')
	return res.json()
}

export async function addExerciseToPlan(planId: number, exerciseData: any) {
	const res = await fetch(`http://localhost:4000/plans/${planId}/exercises`, {
		method: 'POST',
		headers: getAuthHeaders(),
		credentials: 'include',
		body: JSON.stringify(exerciseData),
	})
	if (!res.ok) throw new Error('Failed to add exercise to plan')
	return res.json()
}

export async function getExercises() {
	const res = await fetch('http://localhost:4000/exercises', {
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
		`http://localhost:4000/plans/${planId}/exercises/${exerciseId}`,
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
		`http://localhost:4000/plans/${planId}/exercises/${exerciseId}`,
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
	const res = await fetch(`http://localhost:4000/plans/${planId}/complete`, {
		method: 'POST',
		headers: getAuthHeaders(),
		credentials: 'include',
		body: JSON.stringify({ trackedExercises, status }),
	})
	if (!res.ok) throw new Error('Failed to complete plan')
	return res.json()
}

export async function getPlanProgress(planId: number, userId: number) {
	const res = await fetch(
		`http://localhost:4000/plans/${planId}/progress/${userId}`,
		{
			headers: getAuthHeaders(),
			credentials: 'include',
		}
	)
	if (!res.ok) throw new Error('Failed to fetch plan progress')
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
	const res = await fetch(`http://localhost:4000/plans/${planId}/progress`, {
		method: 'POST',
		headers: getAuthHeaders(),
		credentials: 'include',
		body: JSON.stringify({ trackedExercises }),
	})
	if (!res.ok) throw new Error('Failed to save partial progress')
	return res.json()
}
