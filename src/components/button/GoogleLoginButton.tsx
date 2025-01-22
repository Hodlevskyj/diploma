'use client'

const GoogleLoginButton = () => {
	const handleLogin = () => {
		window.location.href = 'http://localhost:4000/auth/google'
	}
	return <button onClick={handleLogin}>Login with Google</button>
}

export default GoogleLoginButton
