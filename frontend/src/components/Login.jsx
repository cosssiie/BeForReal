import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [animate, setAnimate] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => setAnimate(true), 50); // невелика затримка
        return () => clearTimeout(timer);
    }, []);

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
                onLogin(data.user_id);
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

        <div className="login-page">
            <div className="bg-elements">
                <div className="floating-shape shape-1"></div>
                <div className="floating-shape shape-2"></div>
                <div className="floating-shape shape-3"></div>
                <div className="floating-shape shape-4"></div>
            </div>

            <div className={`login-container ${animate ? 'animate-in' : ''}`}>
                <div className="logo-wrapper">
                    <img src="/assets/images/logo_2.png" alt="Site Logo" className="site-logo" />
                </div>
                <div className="login-header">
                    <h2 className="login-title">Login</h2>
                </div>
                <form className="login-form" onSubmit={handleLoginClick}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        className="form-input"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="login-btn" type="submit">Log In</button>
                    <button
                        className="create-account-button"
                        type="button"
                        onClick={handleCreateAccount}
                    >
                        Create new account
                    </button>
                </form>
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
}

export default Login;
