import React, {useState, useEffect, useRef} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {EllipsisVertical, Flag} from 'lucide-react';
import axios from 'axios';
import PostItem from './PostItem';
import Pagination from './Pagination';

function OtherUserProfile() {
    const {id} = useParams();
    const navigate = useNavigate();
    const [showOptions, setShowOptions] = useState(false);
    const [showReportReasons, setShowReportReasons] = useState(false);
    const optionsRef = useRef(null);

    const reportReasons = [
        "Спам",
        "Образливий контент",
        "Нецензурна лексика",
        "Реклама",
        "Порушення авторських прав",
        "Фейковий акаунт",
        "Порушення правил спільноти",
        "Неправдива інформація"
    ];

    const [userData, setUserData] = useState({
        id: null,
        username: '',
        bio: '',
        karma: 0,
        profile_picture: ''
    });
    const [posts, setPosts] = useState([]);
    const [reposts, setReposts] = useState([]);
    const [activeTab, setActiveTab] = useState('posts');
    const [selectedChat, setSelectedChat] = useState(null);

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

    useEffect(() => {
        if (!id) return;

        setIsLoadingUser(true);
        axios.get(`/api/users/${id}`)
            .then(res => setUserData(res.data))
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
                setShowReportReasons(false);
            }
        }

        if (showOptions) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showOptions]);


    const handleStartChat = () => {
        setIsLoadingContent(true);  // Можна окремий стан, але для простоти так
        axios.post('/api/chats/start', {user_id: userData.id}, {withCredentials: true})
            .then(response => {
                const chatId = response.data.chat_id;
                setSelectedChat(chatId);
                navigate(`/chats/${chatId}`);
            })
            .catch(error => console.error('Failed to start chat:', error))
            .finally(() => setIsLoadingContent(false));
    };

    const handleReport = async (reason) => {
        try {
            const res = await fetch(`/api/users/${userData.id}/report`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({reporterId: localStorage.getItem('userId'), reason})
            });

            if (res.ok) {
                alert('Скаргу надіслано');
                setShowReportReasons(false);
                setShowOptions(false);
            } else {
                const err = await res.json();
                alert(err.error || 'Не вдалося надіслати скаргу');
            }
        } catch (error) {
            console.error('Error reporting user:', error);
        }
    };


    if (isLoadingUser) {
        return <div className="loading" style={{fontSize: 20, textAlign: 'center', marginTop: 50}}>Loading
            profile...</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile">
                <div className="profile-header">
                    <div className="profile-photo">
                        <img src={`/static/profile_pictures/${userData.profile_picture}`} alt="Profile"/>
                    </div>
                    <div className="profile-info">
                        <div className="personal-info">
                            <span className="nickname">{userData.username}</span>
                            <div className="profile-buttons">
                                <button className="chat-button" onClick={handleStartChat}>
                                    Почати чат
                                </button>
                            </div>
                            <button className="additional-button" onClick={() => setShowOptions(prev => !prev)}>
                                <EllipsisVertical size={20}/>
                            </button>
                        </div>
                        {showOptions && (
                            <div className="options-popup" ref={optionsRef}>
                                <button className="flag-button" onClick={() => setShowReportReasons(prev => !prev)}>
                                    <Flag size={16}/>
                                </button>
                                {showReportReasons && (
                                    <div className="report-reasons-popup">
                                        {reportReasons.map((reason) => (
                                            <div
                                                key={reason}
                                                className="report-reason-item"
                                                onClick={() => handleReport(reason)}
                                                style={{cursor: 'pointer', padding: '4px 6px'}}
                                            >
                                                {reason}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="statistics">
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
