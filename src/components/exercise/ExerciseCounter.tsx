interface CounterProps {
	target: number
	current: number
	onIncrement: () => void
	onDecrement: () => void
}

const ExerciseCounter = ({
	target,
	current,
	onIncrement,
	onDecrement,
}: CounterProps) => {
	return (
		<div className='flex flex-col items-center gap-4'>
			<div className='text-4xl font-bold'>
				{current} / {target}
			</div>
			<div className='flex gap-4'>
				<button
					onClick={onDecrement}
					className='p-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors'
					disabled={current <= 0}
				>
					<svg
						className='w-6 h-6'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M20 12H4'
						/>
					</svg>
				</button>
				<button
					onClick={onIncrement}
					className='p-2 rounded-full bg-green-100 hover:bg-green-200 transition-colors'
					disabled={current >= target}
				>
					<svg
						className='w-6 h-6'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M12 6v12M6 12h12'
						/>
					</svg>
				</button>
			</div>
		</div>
	)
}

export default ExerciseCounter
