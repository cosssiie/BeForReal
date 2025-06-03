import React from 'react';

function ProfilePage({ onLogout }) {
    return (
        <div className="profile-container">
            <h2>Your Profile</h2>

            <button onClick={onLogout} className="logout-button">
                Logout
            </button>
        </div>
    );
}

export default ProfilePage;
