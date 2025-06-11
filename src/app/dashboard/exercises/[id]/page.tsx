'use client'
import ExerciseDetail from '@/components/exercise/ExerciseDetail'
import { useParams } from 'next/navigation'

export default function ExercisePage() {
	const params = useParams()
	const id = params.id

	if (!id) return <p>Loading...</p>

	return <ExerciseDetail id={id as string} />
}
