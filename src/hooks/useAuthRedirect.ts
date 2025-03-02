import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const useAuthRedirect = () => {
	const router = useRouter()

	useEffect(() => {
		const token = localStorage.getItem('token')
		if (token) {
			router.push('/dashboard')
		}
	}, [router])
}

export default useAuthRedirect
