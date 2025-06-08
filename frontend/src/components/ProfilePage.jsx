import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostItem from './PostItem';
import Pagination from './Pagination';

function ProfilePage() {
    const [userData, setUserData] = useState({
        id: null,
        username: '',
        bio: '',
        karma: 0,
        posts: 0,
        views: 0
    });
    const [posts, setPosts] = useState([]);
    const [reposts, setReposts] = useState([]);
    const [activities, setActivities] = useState([]);
    const [activeTab, setActiveTab] = useState('posts');

    const POSTS_PER_PAGE = 2;
    const [currentPage, setCurrentPage] = useState(1);

    const totalItems = activeTab === 'posts' ? posts.length : reposts.length;
    const totalPages = Math.ceil(totalItems / POSTS_PER_PAGE);
    const indexOfLast = currentPage * POSTS_PER_PAGE;
    const indexOfFirst = indexOfLast - POSTS_PER_PAGE;
    const currentItems = activeTab === 'posts'
        ? posts.slice(indexOfFirst, indexOfLast)
        : reposts.slice(indexOfFirst, indexOfLast);

    useEffect(() => {
        axios.get('/api/current_user')
            .then(response => {
                setUserData({
                    ...response.data,
                    posts: 24, // Mock data
                    views: 156  // Mock data
                });
            })
            .catch(error => {
                console.error('Error getting current user:', error);
            });
    }, []);

    useEffect(() => {
        if (!userData.id) return;

        setCurrentPage(1);
        if (activeTab === 'posts') {
            axios.get('/api/posts/by_user', { params: { user_id: userData.id } })
                .then(response => {
                    setPosts(response.data.posts);
                })
                .catch(error => console.error(error));
        } else if (activeTab === 'reposts') {
            axios.get('/api/reposts/by_user', { params: { user_id: userData.id } })
                .then(response => {
                    setReposts(response.data.reposts);
                })
                .catch(error => console.error(error));
        }
    }, [activeTab, userData.id]);


    const switchTab = (tabName) => {
        setActiveTab(tabName);
        setCurrentPage(1);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'posts':
                return (
                    <div className="posts-grid">
                        {currentItems.map(item => (
                            <PostItem key={item.postId || item.id} post={item} />
                        ))}
                        {currentItems.length === 0 && (
                            <div className="empty-state">Публікацій поки немає</div>
                        )}
                    </div>
                );
            case 'reposts':
                return (
                    <div className="posts-grid">
                        {currentItems.map(item => (
                            <PostItem key={item.postId || item.id} post={item} />
                        ))}
                        {currentItems.length === 0 && (
                            <div className="empty-state">Репостів поки немає</div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="app-container">

            {/* Main Content */}
            <main className="main-content">
                <div className="profile-container">
                    {/* Profile Header */}
                    <div className="profile-header">
                        <div className="profile-avatar"></div>
                        <div className="profile-info">
                            <h1 className="profile-name">{userData.username}</h1>
                            <p className="profile-bio">{userData.bio}</p>
                            <div className="profile-stats">
                                <div className="stat-item">
                                    <div className="stat-number">{userData.karma}</div>
                                    <div className="stat-label">Karma</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-number">{userData.posts}</div>
                                    <div className="stat-label">Posts</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-number">{userData.views}</div>
                                    <div className="stat-label">Views</div>
                                </div>
                            </div>
                        </div>
                        <div className="profile-actions">
                            <button className="btn btn-primary">Редагувати профіль</button>
                            <button className="btn btn-secondary">Поділитися</button>
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="profile-content">
                        {/* Tabs */}
                        <div className="content-tabs">
                            <button
                                className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
                                onClick={() => switchTab('posts')}
                            >
                                Публікації
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'reposts' ? 'active' : ''}`}
                                onClick={() => switchTab('reposts')}
                            >
                                Репости
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="tab-content active">
                            {renderTabContent()}
                        </div>


                    </div>
                </div>
            </main>
        </div>
    );
}

export default ProfilePage;