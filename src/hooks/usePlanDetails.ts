import { planService } from '@/api/services/planServise'
import { AddExerciseDto, Plan, UpdatePlanDto } from '@/types/plan'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'

export function usePlanDetails(planId: string) {
	const queryClient = useQueryClient()

	const {
		data: plan,
		isLoading,
		error,
	} = useQuery<Plan, Error>(
		['plan', planId],
		() => planService.fetchPlan(planId),
		{
			enabled: !!planId,
			retry: 1,
		}
	)

	const updatePlan = useMutation<Plan, Error, UpdatePlanDto>({
		mutationFn: data => planService.updatePlan(planId, data),
		onSuccess: () => {
			queryClient.invalidateQueries(['plan', planId])
			toast.success('План оновлено!')
		},
		onError: error => {
			toast.error(error.message)
		},
	})

	const addExercise = useMutation<Plan, Error, AddExerciseDto>({
		mutationFn: data => planService.addExercise(planId, data),
		onSuccess: () => {
			queryClient.invalidateQueries(['plan', planId])
			toast.success('Вправу додано!')
		},
		onError: error => {
			toast.error(error.message)
		},
	})

	const deleteExercise = useMutation<void, Error, number>({
		mutationFn: exerciseId => planService.deleteExercise(planId, exerciseId),
		onSuccess: () => {
			queryClient.invalidateQueries(['plan', planId])
			toast.success('Вправу видалено!')
		},
		onError: error => {
			toast.error(error.message)
		},
	})

	return {
		plan,
		isLoading,
		error,
		updatePlan: updatePlan.mutate,
		isUpdating: updatePlan.isLoading,
		addExercise: addExercise.mutate,
		isAddingExercise: addExercise.isLoading,
		deleteExercise: deleteExercise.mutate,
		isDeletingExercise: deleteExercise.isLoading,
	}
}
