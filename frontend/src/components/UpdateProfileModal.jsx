import React, { useState, useEffect } from 'react';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function UpdateProfileModal({ userData, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        username: '',
        bio: '',
        password: '',
        confirmPassword: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        if (userData) {
            setFormData({
                username: userData.username || '',
                bio: userData.bio || '',
                password: '',
                confirmPassword: ''
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

      const submitData = new FormData();
      submitData.append('username', formData.username);
      submitData.append('bio', formData.bio);
      if (formData.password) {
        submitData.append('password', formData.password);
      }
      if (formData.profile_picture) {
        submitData.append('profile_picture', formData.profile_picture);
      }

      onSubmit(submitData);
    };

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm("Ви впевнені, що хочете видалити акаунт? Цю дію не можна скасувати.");
        if (!confirmDelete) return;

        try {
            await axios.delete('/api/user/delete');
            navigate('/login');  // перехід на сторінку входу
        } catch (err) {
            console.error("Помилка при видаленні акаунту:", err);
            alert("Помилка при видаленні акаунту");
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3>Change Profile</h3>
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
                      <label>Profile Picture:</label>
                      <input
                        type="file"
                        accept="image/*"
                        name="profile_picture"
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          profile_picture: e.target.files[0]
                        }))}
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

                <div className="modal-actions">
                    <button onClick={handleSubmit}>Update</button>
                    <button onClick={onClose}>Cancel</button>
                </div>

                <div className="delete-section">
                    <button onClick={handleDeleteAccount} className="delete-btn">
                        Видалити акаунт
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UpdateProfileModal;
