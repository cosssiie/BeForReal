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

        fetch('/api/sign up', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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
        <div className="sign-up-wrapper">
            <div className="sign-up-container">
                <h2>Create Account</h2>
                <form onSubmit={handleSubmit}>

                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <button className="submit-button" type="submit">
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
