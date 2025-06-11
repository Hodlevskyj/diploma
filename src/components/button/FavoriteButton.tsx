'use client'

import {
	addFavoritePlan,
	checkIfPlanIsFavorite,
	removeFavoritePlan,
} from '@/lib/api'
import { Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../ui/button'

interface FavoriteButtonProps {
	planId: number
	onChange?: (isFavorite: boolean) => void
	initialState?: boolean
}

export function FavoriteButton({
	planId,
	onChange,
	initialState,
}: FavoriteButtonProps) {
	const [isFavorite, setIsFavorite] = useState(initialState || false)
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		const fetchStatus = async () => {
			try {
				if (initialState !== undefined) {
					setIsFavorite(initialState)
					return
				}

				const status = await checkIfPlanIsFavorite(planId)
				setIsFavorite(status)
			} catch (error) {
				console.error('Error fetching favorite status:', error)
			}
		}

		fetchStatus()
	}, [planId, initialState])

	const toggleFavorite = async () => {
		try {
			setIsLoading(true)

			if (isFavorite) {
				await removeFavoritePlan(planId)
				toast.success('План видалено з улюблених')
			} else {
				await addFavoritePlan(planId)
				toast.success('План додано до улюблених')
			}

			const newStatus = !isFavorite
			setIsFavorite(newStatus)

			if (onChange) {
				onChange(newStatus)
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Помилка при зміні статусу улюбленого'
			toast.error('Помилка', { description: errorMessage })
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Button
			variant='ghost'
			size='icon'
			onClick={toggleFavorite}
			disabled={isLoading}
			aria-label={isFavorite ? 'Видалити з улюблених' : 'Додати до улюблених'}
		>
			<Heart
				className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
			/>
		</Button>
	)
}
