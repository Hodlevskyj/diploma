'use client'
import withAuth from '../auth/withAuth'

function SuccessPage() {
	return (
		<div className='success-page'>
			<h1>Verification Successful</h1>
			<p>Your email has been successfully verified.</p>
			<a href='/dashboard'>Main Page</a>
		</div>
	)
}

export default withAuth(SuccessPage)
