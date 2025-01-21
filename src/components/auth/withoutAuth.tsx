'use client'

import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

const withoutAuth = (WrappedComponent: React.ComponentType) => {
	return (props: any) => {
		const router = useRouter()

		useEffect(() => {
			const token = localStorage.getItem('token')
			if (token) {
				router.push('/dashboard')
			}
		}, [router])

		return <WrappedComponent {...props} />
	}
}

export default withoutAuth
