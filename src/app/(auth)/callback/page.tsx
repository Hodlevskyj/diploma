'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function CallbackPage() {
	const searchParams = useSearchParams()
	const router = useRouter()

	useEffect(() => {
		const code = searchParams.get('code')

		if (!code) {
			router.push('/auth/error')
			return
		}

		router.push(`/api/callback?code=${code}`)
	}, [searchParams, router])

	return <p>Авторизація триває...</p>
}
