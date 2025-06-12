import React, { useState, useEffect } from 'react';

function UpdateProfileModal({ userData, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        username: '',
        bio: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (userData) {
            setFormData({
                username: userData.username || '',
                bio: userData.bio || ''
            });
        }
    }, [userData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (formData.password && formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        onSubmit(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3>Change Profile</h3>
                <ul className="input-list">
                    <ul className="input-list">
                        <li>
                            <label>Username:</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </li>
                        <li>
                            <label>Bio:</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                            />
                        </li>
                        <li>
                            <label>New Password:</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </li>
                        <li>
                            <label>Confirm Password:</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </li>
                    </ul>

                </ul>
                <div className="modal-actions">
                    <button onClick={handleSubmit}>Update</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default UpdateProfileModal;
