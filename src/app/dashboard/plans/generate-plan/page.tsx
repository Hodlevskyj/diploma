'use client'

import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
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
					<CardDescription>
						Введіть ваші фізичні параметри та побажання для створення
						оптимального плану тренувань
					</CardDescription>
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
													Підтримка форми
												</SelectItem>
											</SelectContent>
										</Select>
										<FormDescription>
											Ваша основна фітнес-ціль визначить тип вправ у плані
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='daysPerWeek'
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Кількість днів на тиждень: {field.value}
										</FormLabel>
										<FormControl>
											<Slider
												min={1}
												max={7}
												step={1}
												defaultValue={[field.value]}
												onValueChange={vals => field.onChange(vals[0])}
											/>
										</FormControl>
										<FormDescription>
											Скільки днів на тиждень ви готові тренуватися
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='preferredDuration'
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Бажана тривалість тренування (хв): {field.value}
										</FormLabel>
										<FormControl>
											<Slider
												min={15}
												max={120}
												step={5}
												defaultValue={[field.value || 45]}
												onValueChange={vals => field.onChange(vals[0])}
											/>
										</FormControl>
										<FormDescription>
											Скільки часу ви готові витрачати на одне тренування
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
								<FormField
									control={form.control}
									name='height'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Зріст (см)</FormLabel>
											<FormControl>
												<Input
													type='number'
													placeholder='Введіть зріст'
													{...field}
													onChange={e => field.onChange(e.target.valueAsNumber)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name='weight'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Вага (кг)</FormLabel>
											<FormControl>
												<Input
													type='number'
													placeholder='Введіть вагу'
													{...field}
													onChange={e => field.onChange(e.target.valueAsNumber)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name='age'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Вік</FormLabel>
											<FormControl>
												<Input
													type='number'
													placeholder='Введіть вік'
													{...field}
													onChange={e => field.onChange(e.target.valueAsNumber)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

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
