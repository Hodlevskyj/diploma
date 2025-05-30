import { CreatePlanDto } from '@/types/plan'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { planService } from '../api/services/planServise'

export function usePlans() {
	const queryClient = useQueryClient()

	const plansQuery = useQuery('plans', planService.getAll)

	const createPlan = useMutation({
		mutationFn: (data: CreatePlanDto) => planService.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries('plans')
			toast.success('План створено!')
		},
		onError: (error: Error) => {
			toast.error(error.message)
		},
	})

	const deletePlan = useMutation({
		mutationFn: (id: number) => planService.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries('plans')
			toast.success('План видалено!')
		},
		onError: (error: Error) => {
			toast.error(error.message)
		},
	})

	return {
		plans: plansQuery.data ?? [],
		isLoading: plansQuery.isLoading,
		createPlan: createPlan.mutate,
		isCreating: createPlan.isLoading,
		deletePlan: deletePlan.mutate,
		isDeleting: deletePlan.isLoading,
	}
}
