import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [animate, setAnimate] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => setAnimate(true), 50);
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
        navigate('/sign-up');
    };

    return (
        <div className="login-page">
            <div className="bg-elements">
                <div className="floating-shape shape-1"></div>
                <div className="floating-shape shape-2"></div>
                <div className="floating-shape shape-3"></div>
                <div className="floating-shape shape-4"></div>
            </div>

            <div className="logo-wrapper">
                <img src="/assets/images/logo_2.png" alt="Site Logo" className="site-logo" />
            </div>

            <div className={`login-container ${animate ? 'animate-in' : ''}`}>
                <div className="login-header">
                    <h2 className="login-title">Log In</h2>
                </div>
                <form className="login-form" onSubmit={handleLoginClick}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <div className="password-input-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-input"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <EyeOff size={20} className="eye-icon" />
                            ) : (
                                <Eye size={20} className="eye-icon" />
                            )}
                        </button>
                    </div>
                    <button className="login-btn" type="submit">Log In</button>
                    <button
                        className="create-account-button"
                        type="button"
                        onClick={handleCreateAccount}
                    >
                        Create Account
                    </button>
                </form>
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
}

export default Login;