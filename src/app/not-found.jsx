import Link from 'next/link'

export default function NotFound() {
	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-100'>
			<div className='text-center'>
				<h1 className='text-6xl font-bold text-gray-800'>404</h1>
				<p className='text-xl mt-4 text-gray-600'>Сторінку не знайдено</p>
				<Link
					href='/'
					className='mt-6 inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
				>
					Повернутися на головну
				</Link>
			</div>
		</div>
	)
}
