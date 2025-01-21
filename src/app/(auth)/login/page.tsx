'use client'
import withoutAuth from '@/components/auth/withoutAuth'
import LoginForm from '@/components/forms/LoginForm'

const LoginPage = () => {
	return (
		<>
			<div className='login-page'>
				<h1>Login</h1>
				<LoginForm />
			</div>
			<p>
				Don't have an account? <a href='/register'>Register</a>
			</p>
		</>
	)
}

export default withoutAuth(LoginPage)
