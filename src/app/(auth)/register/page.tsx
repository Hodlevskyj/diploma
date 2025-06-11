'use client'
import RegisterForm from '@/components/forms/RegisterForm'

const RegisterPage = () => {
	return (
		<>
			<div className='register-page'>
				<RegisterForm />
			</div>
			<p>
				Have an account? <a href='/login'>Login</a>
			</p>
		</>
	)
}
export default RegisterPage
