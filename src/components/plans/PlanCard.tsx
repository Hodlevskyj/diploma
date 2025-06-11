import Link from 'next/link'
import { ReactNode } from 'react'
import { Badge } from '../ui/badge'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '../ui/card'

interface PlanCardProps {
	id: number
	name: string
	description: string | null
	fitnessGoal: string | null
	isFavorite?: boolean
	onFavoriteChange?: (planId: number, isFavorite: boolean) => void
	children?: ReactNode
}

export function PlanCard({
	id,
	name,
	description,
	fitnessGoal,
	children,
}: PlanCardProps) {
	return (
		<Card className='overflow-hidden'>
			<CardHeader className='relative'>
				<div className='absolute top-3 right-3'>{children}</div>
				<CardTitle className='text-xl'>{name}</CardTitle>
				{fitnessGoal && (
					<Badge variant='outline' className='w-fit'>
						{fitnessGoal}
					</Badge>
				)}
			</CardHeader>
			<CardContent>
				<CardDescription className='line-clamp-3'>
					{description || 'Немає опису'}
				</CardDescription>
			</CardContent>
			<CardFooter className='flex justify-between'>
				<Link
					href={`/dashboard/plans/${id}`}
					className='text-primary hover:underline'
				>
					Переглянути деталі
				</Link>
			</CardFooter>
		</Card>
	)
}
