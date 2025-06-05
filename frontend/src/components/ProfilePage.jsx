import React from 'react';

function ProfilePage() {
    return (
        <div className="profile-container">
            <div className="profile">
                <div className="profile-header">
                    <div className="profile-photo">
                        <img src="" alt="" />
                    </div>
                    <div className="profile-info">
                        <div className="personal-info">
                            <span className="nickname">Someone</span>
                            <div className="profile-buttons">
                                <button className="change-profile">Change Profile</button>
                                <button className="change-profile">Change Profile</button>
                            </div>
                        </div>
                        <div className="statistics">

                        </div>
                    </div>
                </div>
                <div className="profile-posts">
                    <nav>
                        <ul>

                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
