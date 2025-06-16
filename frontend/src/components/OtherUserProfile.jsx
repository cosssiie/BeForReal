import React, {useState, useEffect, useRef} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {EllipsisVertical, Flag} from 'lucide-react';
import axios from 'axios';
import PostItem from './PostItem';
import Pagination from './Pagination';
import Sidebar from './Sidebar';
import ReportModal from "./ReportModal";

function OtherUserProfile() {
    const {id} = useParams();
    const navigate = useNavigate();
    const [showOptions, setShowOptions] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const optionsRef = useRef(null);

    const [userData, setUserData] = useState({
        id: null,
        username: '',
        bio: '',
        karma: 0,
        profile_picture: '',
        calculated_karma: 0,
        is_blocked: false
    });

    const [posts, setPosts] = useState([]);
    const [reposts, setReposts] = useState([]);
    const [activeTab, setActiveTab] = useState('posts');
    const [selectedChat, setSelectedChat] = useState(null);

    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [isLoadingContent, setIsLoadingContent] = useState(false);
    const [userId, setUserId] = useState(null); // logged-in user id

    const POSTS_PER_PAGE = 3;
    const [currentPage, setCurrentPage] = useState(1);

    const totalItems = activeTab === 'posts' ? posts.length : reposts.length;
    const totalPages = Math.ceil(totalItems / POSTS_PER_PAGE);
    const indexOfLast = currentPage * POSTS_PER_PAGE;
    const indexOfFirst = indexOfLast - POSTS_PER_PAGE;
    const currentItems = activeTab === 'posts'
        ? posts.slice(indexOfFirst, indexOfLast)
        : reposts.slice(indexOfFirst, indexOfLast);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        axios.get('/api/current_user', { withCredentials: true })
            .then(res => {
                setUserId(res.data.id);
                setCurrentUser(res.data);
            })
            .catch(err => console.error("Can't get logged-in user:", err));
    }, []);


    useEffect(() => {
        if (!id) return;

        setIsLoadingUser(true);
        axios.get(`/api/users/${id}`)
            .then(res => { setUserData(res.data); console.log("User data loaded:", res.data); }
            )
            .catch(err => console.error('Error loading user:', err))
            .finally(() => setIsLoadingUser(false));
    }, [id]);

    useEffect(() => {
        if (!userData.id) return;

        setIsLoadingContent(true);
        setCurrentPage(1);

        axios.get(
            activeTab === 'posts'
                ? '/api/posts/by_user'
                : '/api/reposts/by_user',
            {params: {user_id: userData.id}}
        )
            .then(response => {
                if (activeTab === 'posts') {
                    setPosts(response.data.posts);
                } else {
                    setReposts(response.data.reposts);
                }
            })
            .catch(error => console.error('Error loading content:', error))
            .finally(() => setIsLoadingContent(false));
    }, [activeTab, userData.id]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (optionsRef.current && !optionsRef.current.contains(event.target)) {
                setShowOptions(false);
                setShowReport(false);
            }
        }

        if (showOptions) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showOptions]);

    const toggleOptions = () => {
        setShowOptions(prev => !prev);
        setShowReport(false);
    };

    const handleStartChat = () => {
        setIsLoadingContent(true);
        axios.post('/api/chats/start', {user_id: userData.id}, {withCredentials: true})
            .then(response => {
                const chatId = response.data.chat_id;
                setSelectedChat(chatId);
                navigate(`/chats/${chatId}`);
            })
            .catch(error => console.error('Failed to start chat:', error))
            .finally(() => setIsLoadingContent(false));
    };

    const handleReportSubmit = async (reason) => {
        if (!userId) {
            alert("Не вдалося визначити ваш акаунт для скарги.");
            return;
        }

        try {
            const res = await fetch(`/api/users/${userData.id}/report`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({reporterId: userId, reason}),
            });

            if (res.ok) {
                alert('Report was send');
                setShowReport(false);
                setShowOptions(false);
            } else {
                const err = await res.json();
                alert(err.error || 'Error sending report');
            }
        } catch (error) {
            console.error('Error sending report:', error);
        }
    };

    const handleBlockUser = async () => {
        try {
            const res = await axios.post(`/api/users/${userData.id}/block`, {}, { withCredentials: true });
            if (res.status === 200) {
                alert("User is blocked");
                setUserData(prev => ({ ...prev, is_blocked: true }));
            }
        } catch (error) {
            alert("Error blocking user");
            console.error(error);
        }
    };

    const handleUnblockUser = async () => {
        try {
            const res = await axios.post(`/api/users/${userData.id}/unblock`, {}, { withCredentials: true });
            if (res.status === 200) {
                alert("User is unblocked");
                setUserData(prev => ({ ...prev, is_blocked: false }));
            }
        } catch (error) {
            alert("Error unblocking user");
            console.error(error);
        }
    };

    if (isLoadingUser) {
        return <div className="loading" style={{fontSize: 20, textAlign: 'center', marginTop: 50}}>
            Loading profile...
        </div>;
    }

    return (
        <div className="profile-container">
            <div className="profile">
                <div className="profile-header">
                    <div className="profile-photo">
                        <img src={`/static/profile_pictures/${userData.profile_picture}`}/>
                    </div>
                    <div className="profile-info">
                        <button className="additional-button" onClick={toggleOptions}>
                            <EllipsisVertical size={18}/>
                        </button>
                        <div className="personal-info">
                            <span className="nickname">{userData.username}</span>
                            <div className="account-action-buttons">
                                <button className="chat-button" onClick={handleStartChat}>
                                    Start a Conversation
                                </button>

                                {currentUser?.is_moderator && userData.id !== currentUser.id && (
                                    <div className="moderator-actions">
                                        {userData.is_blocked ? (
                                            <button className="unblock-button" onClick={handleUnblockUser}>
                                                Unblock user
                                            </button>
                                        ) : (
                                            <button className="block-button" onClick={handleBlockUser}>
                                                Block user
                                            </button>
                                        )}
                                    </div>
                                )}

                            </div>


                            {showOptions && (
                                <div className="options-popup" ref={optionsRef}>
                                    <button
                                        className="flag-button"
                                        onClick={() => {
                                            setShowOptions(false);
                                            setShowReport(true);
                                        }}
                                    >
                                        <Flag size={16}/>
                                    </button>
                                </div>
                            )}
                            {showReport && (
                                <ReportModal
                                    onClose={() => setShowReport(false)}
                                    onSubmit={handleReportSubmit}
                                />
                            )}

                            {currentUser?.is_moderator && userData.id !== currentUser.id && (
                                <div className="moderator-actions">
                                    {userData.is_blocked ? (
                                        <button className="unblock-button" onClick={handleUnblockUser}>
                                            Розблокувати користувача
                                        </button>
                                    ) : (
                                        <button className="block-button" onClick={handleBlockUser}>
                                            Заблокувати користувача
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="statistics">
                            <p className="bio">{userData.bio}</p>
                            <p className="karma">Karma: {userData.calculated_karma}</p>
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
                                        <PostItem key={item.postId || item.id} post={item}/>
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
        </div>
    );
}

export default OtherUserProfile;
