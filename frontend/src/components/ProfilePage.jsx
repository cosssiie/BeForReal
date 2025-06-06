import React, { useState } from 'react';

function ProfilePage() {
    const [activeTab, setActiveTab] = useState('posts');

    return (
        <div className="profile-container">
            <div className="profile">
                <div className="profile-header">
                    <div className="profile-photo">
                        <img src="" alt="" />
                    </div>
                    <div className="profile-info">
                        <div className="personal-info">
                            <span className="nickname">Username</span>
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
                    <nav className="tab-nav">
                        <ul className="tab-list">
                            <li
                                className={`tab-item ${activeTab === 'posts' ? 'active' : ''}`}
                                onClick={() => setActiveTab('posts')}
                            >
                                Posts
                            </li>
                            <li
                                className={`tab-item ${activeTab === 'reposts' ? 'active' : ''}`}
                                onClick={() => setActiveTab('reposts')}
                            >
                                Reposts
                            </li>
                        </ul>
                    </nav>
                    <div className="tab-content">
                        {activeTab === 'posts' && <div>User's posts...</div>}
                        {activeTab === 'reposts' && <div>User's reposts..</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
