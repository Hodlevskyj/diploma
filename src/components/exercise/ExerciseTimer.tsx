interface TimerProps {
	targetValue: number
	remainingTime: number
	isRunning: boolean
	isPaused: boolean
	onPause: () => void
	onResume: () => void
	onReset: () => void
}

const ExerciseTimer = ({
	targetValue,
	remainingTime,
	isRunning,
	isPaused,
	onPause,
	onResume,
	onReset,
}: TimerProps) => {
	const progress = Math.max(
		0,
		Math.min(((targetValue - remainingTime) / targetValue) * 100, 100)
	)

	return (
		<div className='relative pt-1'>
			<div className='flex mb-2 items-center justify-between'>
				<div>
					<span className='text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-blue-200'>
						Час, що залишився
					</span>
				</div>
				<div className='text-right'>
					<span className='text-xs font-semibold inline-block'>
						{Math.floor(remainingTime / 60)}:
						{String(remainingTime % 60).padStart(2, '0')}
					</span>
				</div>
			</div>
			<div className='overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200'>
				<div
					style={{ width: `${progress}%` }}
					className='shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500'
				/>
			</div>
			{isRunning && remainingTime > 0 && (
				<div className='flex gap-2 justify-center mt-2'>
					<button
						onClick={isPaused ? onResume : onPause}
						className='px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded'
					>
						{isPaused ? 'Продовжити' : 'Пауза'}
					</button>
					<button
						onClick={onReset}
						className='px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded'
					>
						Скинути
					</button>
				</div>
			)}
		</div>
	)
}

export default ExerciseTimer
