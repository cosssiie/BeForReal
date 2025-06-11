import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostItem from './PostItem';
import Pagination from './Pagination';
import UpdateProfileModal from './UpdateProfileModal';
import Sidebar from './Sidebar';

function ProfilePage() {
    const [userData, setUserData] = useState({
        id: null,
        username: '',
        bio: '',
        karma: 0
    });
    const [posts, setPosts] = useState([]);
    const [reposts, setReposts] = useState([]);
    const [activeTab, setActiveTab] = useState('posts');
    const [showModal, setShowModal] = useState(false);

    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [isLoadingContent, setIsLoadingContent] = useState(false);

    const POSTS_PER_PAGE = 3;
    const [currentPage, setCurrentPage] = useState(1);

    const totalItems = activeTab === 'posts' ? posts.length : reposts.length;
    const totalPages = Math.ceil(totalItems / POSTS_PER_PAGE);
    const indexOfLast = currentPage * POSTS_PER_PAGE;
    const indexOfFirst = indexOfLast - POSTS_PER_PAGE;
    const currentItems = activeTab === 'posts'
        ? posts.slice(indexOfFirst, indexOfLast)
        : reposts.slice(indexOfFirst, indexOfLast);

    // Завантаження даних користувача
    useEffect(() => {
        setIsLoadingUser(true);
        axios.get('/api/current_user')
            .then(response => {
                setUserData(response.data);
            })
            .catch(error => {
                console.error('Error getting current user:', error);
            })
            .finally(() => {
                setIsLoadingUser(false);
            });
    }, []);

    // Завантаження постів або репостів в залежності від активної вкладки
    useEffect(() => {
        if (!userData.id) return;

        const fetchData = async () => {
            setIsLoadingContent(true);
            setCurrentPage(1);
            try {
                if (activeTab === 'posts') {
                    const response = await axios.get('/api/posts/by_user', {
                        params: { user_id: userData.id }
                    });
                    setPosts(response.data.posts);
                } else {
                    const response = await axios.get('/api/reposts/by_user', {
                        params: { user_id: userData.id }
                    });
                    setReposts(response.data.reposts);
                }
            } catch (error) {
                console.error('Error loading posts/reposts:', error);
            } finally {
                setIsLoadingContent(false);
            }
        };

        fetchData();
    }, [activeTab, userData.id]);

    if (isLoadingUser) {
        return <div className="loading">Loading user...</div>;
    }

    const handleModalOpen = () => setShowModal(true);
    const handleModalClose = () => setShowModal(false);

    const handleProfileUpdate = async (updatedData) => {
        console.log('Profile Changed');
    };

    return (
        <div className="profile-container">
            <div className="profile">
                <div className="profile-header">
                    <div className="profile-photo">
                        <img src="" />
                    </div>
                    <div className="profile-info">
                        <div className="personal-info">
                            <span className="nickname">{userData.username}</span>
                            <div className="profile-actions">
                                <button className="change-profile" onClick={handleModalOpen}>
                                    Change Profile
                                </button>
                            </div>
                        </div>
                        <div className="profile-stats">
                            <p className="bio">{userData.bio}</p>
                            <p className="karma">Karma: {userData.karma}</p>
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
                        {isLoadingContent ? (
                            <p>Loading posts...</p>
                        ) : (
                            <>
                                <div className="posts-list">
                                    {currentItems.map(item => (
                                        <PostItem key={item.postId || item.id} post={item} userId={userData.id} />
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            {showModal && (
                <UpdateProfileModal
                    userData={userData}
                    onClose={handleModalClose}
                    onSubmit={handleProfileUpdate}
                />
            )}

            <style>{`
                .sidebar-container-filter {
                    display: none;
                }
                .posts-list {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr); 
                    gap: 20px;
                    animation: fadeIn 0.3s ease-out; 
                }
            `}</style>
        </div>
    );
}

export default ProfilePage;