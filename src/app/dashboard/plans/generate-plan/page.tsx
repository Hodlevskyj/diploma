'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from '@/components/ui/form'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { generateWorkoutPlan } from '@/lib/api'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

const formSchema = z.object({
	fitnessGoal: z.enum(['LOSE_WEIGHT', 'GAIN_MUSCLE', 'STAY_ACTIVE'], {
		required_error: 'Будь ласка, виберіть ціль тренувань',
	}),
	daysPerWeek: z.number().min(1).max(7),
	preferredDuration: z.number().min(15).max(120).optional(),
	height: z.number().min(100).max(250).optional(),
	weight: z.number().min(30).max(250).optional(),
	age: z.number().min(16).max(100).optional(),
	difficultyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
	equipmentType: z.enum(['NONE', 'MINIMAL', 'HOME_GYM', 'FULL_GYM']),
})

export default function GeneratePlanPage() {
	const [isLoading, setIsLoading] = useState(false)
	const router = useRouter()

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			fitnessGoal: 'STAY_ACTIVE',
			daysPerWeek: 3,
			preferredDuration: 45,
			height: undefined,
			weight: undefined,
			age: undefined,
			difficultyLevel: 'INTERMEDIATE',
			equipmentType: 'MINIMAL',
		},
	})

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsLoading(true)
		try {
			const plan = await generateWorkoutPlan(values)
			toast.success('План тренувань успішно створено!')
			router.push(`/dashboard/plans/${plan.id}`)
		} catch (error) {
			console.error('Error generating plan:', error)
			toast.error('Не вдалося створити план тренувань')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className='container py-10'>
			<h1 className='text-3xl font-bold mb-6'>
				Створення персонального плану тренувань
			</h1>
			<Card className='max-w-2xl mx-auto'>
				<CardHeader>
					<CardTitle>Параметри плану</CardTitle>
					<p className='text-muted-foreground'>
						Введіть ваші фізичні параметри та побажання для створення
						оптимального плану тренувань
					</p>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
							<FormField
								control={form.control}
								name='fitnessGoal'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Ціль тренувань</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder='Виберіть ціль тренувань' />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value='LOSE_WEIGHT'>Схуднення</SelectItem>
												<SelectItem value='GAIN_MUSCLE'>
													Набір м'язової маси
												</SelectItem>
												<SelectItem value='STAY_ACTIVE'>
													Підтримка активності
												</SelectItem>
											</SelectContent>
										</Select>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='daysPerWeek'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Кількість днів на тиждень</FormLabel>
										<Select
											onValueChange={value => field.onChange(parseInt(value))}
											defaultValue={field.value.toString()}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder='Виберіть кількість днів' />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{[2, 3, 4, 5, 6].map(day => (
													<SelectItem key={day} value={day.toString()}>
														{day} днів
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormItem>
								)}
							/>

							<Button type='submit' className='w-full' disabled={isLoading}>
								{isLoading ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Створення плану...
									</>
								) : (
									'Створити план тренувань'
								)}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	)
}
