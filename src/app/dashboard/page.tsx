'use client'

import withAuth from '@/components/auth/withAuth'
import LogoutButton from '@/components/button/LogoutButton'

function Dashboard() {
	return (
		<div className='dashboard'>
			<h1>Welcome to your Dashboard</h1>
			<LogoutButton />
		</div>
	)
}

export default withAuth(Dashboard)
