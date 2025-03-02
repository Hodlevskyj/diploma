'use client'
import RegisterForm from '@/components/forms/RegisterForm'

const RegisterPage = () => {
	return (
		<>
			<div className='register-page'>
				<h1>Register</h1>
				<RegisterForm />
			</div>
			<p>
				Have an account? <a href='/login'>Login</a>
			</p>
		</>
	)
}
export default RegisterPage
