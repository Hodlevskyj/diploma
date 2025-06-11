import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Clock, Dumbbell } from 'lucide-react'
import Link from 'next/link'

interface ExerciseCategory {
	id: number
	name: string
}

interface Exercise {
	id: number
	name: string
	muscleGroup: string
	exerciseCategory: ExerciseCategory
	equipment?: string
	isTimeBased?: boolean
	description?: string
}

interface ExerciseCardProps {
	exercise: Exercise
	isFavorite?: boolean
	onFavoriteChange?: (isFavorite: boolean) => void
}

export function ExerciseCard({
	exercise,
	isFavorite = false,
	onFavoriteChange,
}: ExerciseCardProps) {
	return (
		<Card className='h-full flex flex-col'>
			<CardHeader className='pb-2'>
				<div className='flex justify-between items-start'>
					<CardTitle className='text-lg'>{exercise.name}</CardTitle>
				</div>
			</CardHeader>
			<CardContent className='flex-grow'>
				<div className='space-y-2 text-sm'>
					<div className='flex items-center gap-2'>
						<Dumbbell className='h-4 w-4 text-muted-foreground' />
						<span>{exercise.muscleGroup}</span>
					</div>
					<div className='flex items-center gap-2'>
						<span className='text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full'>
							{exercise.exerciseCategory?.name || 'Без категорії'}
						</span>
						{exercise.isTimeBased !== undefined && (
							<span className='text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full flex items-center gap-1'>
								<Clock className='h-3 w-3' />
								{exercise.isTimeBased ? 'На час' : 'На повторення'}
							</span>
						)}
					</div>
					{exercise.equipment && (
						<div className='text-muted-foreground'>
							Обладнання: {exercise.equipment}
						</div>
					)}
					{exercise.description && (
						<p className='line-clamp-2 text-muted-foreground mt-2'>
							{exercise.description}
						</p>
					)}
				</div>
			</CardContent>
			<CardFooter>
				<Button variant='outline' className='w-full' asChild>
					<Link href={`/dashboard/exercises/${exercise.id}`}>
						Деталі вправи
					</Link>
				</Button>
			</CardFooter>
		</Card>
	)
}
