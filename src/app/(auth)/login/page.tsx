'use client'
import withoutAuth from '@/components/auth/withoutAuth'
import GoogleLoginButton from '@/components/button/GoogleLoginButton'
import LoginForm from '@/components/forms/LoginForm'

const LoginPage = () => {
	return (
		<>
			<div className='login-page'>
				<LoginForm />
				<GoogleLoginButton />
			</div>
			<p>
				Don't have an account? <a href='/register'>Register</a>
			</p>
		</>
	)
}

export default withoutAuth(LoginPage)
