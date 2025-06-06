import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostItem from './PostItem';

function ProfilePage() {
    const [activeTab, setActiveTab] = useState('posts');
    const [posts, setPosts] = useState([]);
    const [reposts, setReposts] = useState([]);
    const userId = 1; // <-- заміни на реальний userId з auth

    useEffect(() => {
        if (activeTab === 'posts') {
            axios.get(`/api/posts/by_user`, { params: { user_id: userId } })
                .then(response => setPosts(response.data.posts))
                .catch(error => console.error(error));
        } else if (activeTab === 'reposts') {
            axios.get(`/api/reposts/by_user`, { params: { user_id: userId } })
                .then(response => setReposts(response.data.reposts))
                .catch(error => console.error(error));
        }
    }, [activeTab]);

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
                        {activeTab === 'posts' && (
                        <div>
                            {posts.map(post => (
                                <PostItem key={post.postId || post.id} post={post} />
                            ))}
                        </div>
                    )}

                    {activeTab === 'reposts' && (
                        <div>
                            {reposts.map(repost => (
                                <PostItem key={repost.postId} post={repost} />
                            ))}
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
