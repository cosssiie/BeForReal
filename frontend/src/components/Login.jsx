import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();


    const handleLoginClick = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                onLogin(data.user_id);  // ← передай userId
                navigate('/home');
            } else {
                setError(data.message || 'Invalid login or password.');
            }
        } catch (err) {
            setError('Login failed. Please try again.');
            console.error(err);
        }
    };

    const handleCreateAccount = () => {
        navigate('/sign up');
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <h2>Login</h2>
                <form onSubmit={handleLoginClick}>
                    <input
                        type="text"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="submit-button" type="submit">
                        Sign In
                    </button>
                    <button
                        className="create-account-button"
                        type="button"
                        onClick={handleCreateAccount}
                    >
                        Create an account
                    </button>
                </form>
                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            </div>
        </div>
    );
}

export default Login;