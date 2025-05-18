'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import ReactPlayer from 'react-player'
import { useAuth } from '../../context/AuthContext'

export default function ExerciseDetail({ id }: { id: string }) {
	const { user, loading: authLoading } = useAuth()
	const [exercise, setExercise] = useState<any>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [timer, setTimer] = useState(0)
	const [isTimerRunning, setIsTimerRunning] = useState(false)
	const [isReading, setIsReading] = useState(false)
	const [speechSynth] = useState(new SpeechSynthesisUtterance())
	const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
	const [voiceError, setVoiceError] = useState<string | null>(null)
	const router = useRouter()
	const playerRef = useRef<ReactPlayer>(null)

	// Завантаження голосів для Web Speech API
	useEffect(() => {
		const loadVoices = () => {
			const availableVoices = window.speechSynthesis.getVoices()
			setVoices(availableVoices)
			const ukrainianVoice = availableVoices.find(
				voice => voice.lang === 'uk-UA'
			)
			if (!ukrainianVoice) {
				setVoiceError(
					'Українська мова для читання недоступна у вашому браузері. Використовується англійська.'
				)
			}
		}

		loadVoices()
		window.speechSynthesis.onvoiceschanged = loadVoices

		return () => {
			window.speechSynthesis.onvoiceschanged = null
		}
	}, [])

	// Завантаження деталей вправи
	useEffect(() => {
		const fetchExercise = async () => {
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_BASE_URL}/exercises/${id}`,
					{ credentials: 'include' }
				)
				if (!response.ok) {
					const errorText = await response.text()
					throw new Error(
						`HTTP error! status: ${response.status} - ${errorText}`
					)
				}
				const data = await response.json()
				setExercise(data)
			} catch (err) {
				setError(
					err instanceof Error ? err.message : 'An unexpected error occurred'
				)
				console.error('Error fetching exercise:', err)
			} finally {
				setLoading(false)
			}
		}

		if (!authLoading && user) fetchExercise()
	}, [id, authLoading, user])

	// Логіка таймера
	useEffect(() => {
		let interval: NodeJS.Timeout
		if (isTimerRunning) {
			interval = setInterval(() => {
				setTimer(prev => prev + 1)
			}, 1000)
		}
		return () => clearInterval(interval)
	}, [isTimerRunning])

	const handleStartTimer = () => {
		setIsTimerRunning(true)
		if (playerRef.current) {
			playerRef.current.seekTo(0) // Скидаємо відео на початок
			playerRef.current.getInternalPlayer().playVideo() // Запускаємо відео
		}
	}

	const handleStopTimer = async () => {
		setIsTimerRunning(false)
		if (playerRef.current) {
			playerRef.current.getInternalPlayer().pauseVideo() // Призупиняємо відео
		}
		if (!user) {
			alert('Користувач не автентифікований!')
			return
		}
		try {
			await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/exercises/track`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId: user.id,
					exerciseId: Number(id),
					duration: timer,
				}),
				credentials: 'include',
			})
			alert('Виконання вправи збережено!')
			setTimer(0)
		} catch (err) {
			console.error('Error tracking exercise:', err)
		}
	}

	// Логіка читання опису голосом
	const handleReadDescription = async () => {
		if (!exercise?.description || isReading) {
			if (speechSynth) {
				window.speechSynthesis.cancel()
				setIsReading(false)
			}
			return
		}

		const tempDiv = document.createElement('div')
		tempDiv.innerHTML = exercise.description
		let plainText = tempDiv.textContent || exercise.description

		let selectedLang = 'uk-UA'
		const ukrainianVoice = voices.find(voice => voice.lang === 'uk-UA')
		if (!ukrainianVoice) {
			selectedLang = 'en-US'
			try {
				const response = await fetch(
					`https://api.mymemory.translated.net/get?q=${encodeURIComponent(
						plainText
					)}&langpair=uk|en`
				)
				const data = await response.json()
				if (data.responseStatus === 200) {
					plainText = data.responseData.translatedText
				}
			} catch (err) {
				console.error('Translation error:', err)
			}
		}

		speechSynth.text = plainText
		speechSynth.lang = selectedLang
		speechSynth.rate = 1.0
		speechSynth.onend = () => setIsReading(false)

		window.speechSynthesis.speak(speechSynth)
		setIsReading(true)
	}

	if (authLoading || loading) return <p>Завантаження вправи...</p>
	if (error) return <p>Помилка: {error}</p>
	if (!user) return <p>Будь ласка, увійдіть, щоб переглянути деталі вправи.</p>

	return (
		<div className='p-4 max-w-3xl mx-auto'>
			<h2 className='text-2xl font-bold mb-4'>{exercise?.name}</h2>
			<p>
				<strong>М’язова група:</strong> {exercise?.muscleGroup}
			</p>
			<p>
				<strong>Категорія:</strong> {exercise?.category}
			</p>
			{exercise?.equipment && (
				<p>
					<strong>Обладнання:</strong> {exercise.equipment}
				</p>
			)}
			{exercise?.videoUrl && (
				<div className='mt-4'>
					<h3 className='text-lg font-semibold mb-2'>Відео виконання вправи</h3>
					<div className='w-full max-w-md mx-auto aspect-video'>
						<ReactPlayer
							ref={playerRef}
							url={exercise.videoUrl}
							width='100%'
							height='100%'
							controls={true}
							playing={isTimerRunning}
							config={{
								youtube: {
									playerVars: { modestbranding: 1, rel: 0 },
								},
							}}
						/>
					</div>
				</div>
			)}
			{exercise?.description && (
				<div className='mt-4'>
					<strong>Опис:</strong>
					<div dangerouslySetInnerHTML={{ __html: exercise.description }} />
					{voiceError && <p className='text-red-500'>{voiceError}</p>}
					<button
						onClick={handleReadDescription}
						className={`px-4 py-2 rounded mt-2 ${
							isReading ? 'bg-red-500' : 'bg-blue-500'
						} text-white`}
					>
						{isReading ? 'Зупинити читання' : 'Читати опис голосом'}
					</button>
				</div>
			)}
			{exercise?.difficulty && (
				<p className='mt-2'>
					<strong>Складність:</strong> {exercise.difficulty}
				</p>
			)}

			<div className='mt-6'>
				<h3 className='text-xl font-semibold mb-2'>Таймер для вправи</h3>
				<p>
					Час: {Math.floor(timer / 60)}:{('0' + (timer % 60)).slice(-2)}
				</p>
				<button
					onClick={handleStartTimer}
					disabled={isTimerRunning}
					className='px-4 py-2 bg-green-500 text-white rounded mr-2'
				>
					Старт
				</button>
				<button
					onClick={handleStopTimer}
					disabled={!isTimerRunning}
					className='px-4 py-2 bg-red-500 text-white rounded'
				>
					Стоп
				</button>
			</div>

			<button
				onClick={() => router.push('/dashboard')}
				className='mt-4 px-4 py-2 bg-gray-200 rounded'
			>
				Назад до бібліотеки
			</button>
		</div>
	)
}
