import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // <-- Імпорт useNavigate

function SignUp() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();  // <-- Ініціалізація навігатора

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!username || !email || !password || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        fetch('/api/sign-up', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                username,
                email,
                password
            })
        })
            .then(res => res.json().then(data => ({ status: res.status, body: data })))
            .then(({ status, body }) => {
                if (status === 201) {
                    setSuccess(body.message);
                    setUsername('');
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                    // Перенаправлення на home після успішної реєстрації
                    navigate('/home');
                } else {
                    setError(body.error || 'Something went wrong.');
                }
            })
            .catch(err => {
                setError('Server error');
            });
    };

    return (
        <div className="sign-up-page">
            <div className="bg-elements">
                <div className="floating-shape shape-1"></div>
                <div className="floating-shape shape-2"></div>
                <div className="floating-shape shape-3"></div>
                <div className="floating-shape shape-4"></div>
            </div>


            <div className="sign-up-container">
                <div className="sign-up-header">
                    <h2 className="sign-up-title">Sign Up</h2>
                </div>
                <form className="sign-up-form" onSubmit={handleSubmit}>

                    <input
                        type="text"
                        className="form-input"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <input
                        type="email"
                        className="form-input"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        className="form-input"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        className="form-input"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <button className="sign-up-btn" type="submit">
                        Sign Up
                    </button>

                </form>

                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
            </div>
        </div>
    );
}

export default SignUp;
