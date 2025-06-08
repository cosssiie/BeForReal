import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import axios from 'axios';
import PostItem from './PostItem';
import Pagination from './Pagination';

function OtherUserProfile() {
    const {id} = useParams();
    const navigate = useNavigate();

    const [userData, setUserData] = useState({
        id: null,
        username: '',
        bio: '',
        karma: 0
    });
    const [posts, setPosts] = useState([]);
    const [reposts, setReposts] = useState([]);
    const [activeTab, setActiveTab] = useState('posts');
    const [selectedChat, setSelectedChat] = useState(null);
    const [isLoading, setIsLoading] = useState(true);


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

        setIsLoading(true); // ДОДАНО

        axios.get(`/api/users/${id}`)
            .then(response => setUserData(response.data))
            .catch(error => console.error('Error fetching user data:', error))
            .finally(() => setIsLoading(false)); // ДОДАНО
    }, [id]);


    useEffect(() => {
        if (!id) return;

        setCurrentPage(1);
        setIsLoading(true); // ДОДАНО

        const url = activeTab === 'posts'
            ? '/api/posts/by_user'
            : '/api/reposts/by_user';

        axios.get(url, {params: {user_id: id}})
            .then(response => {
                if (activeTab === 'posts') {
                    setPosts(response.data.posts);
                } else {
                    setReposts(response.data.reposts);
                }
            })
            .catch(error => console.error(error))
            .finally(() => setIsLoading(false)); // ДОДАНО
    }, [activeTab, id]);


    const handleStartChat = () => {
        navigate(`/chat/${userData.id}`);
    };
    if (isLoading) {
        return <div className="loading">Loading profile...</div>;
    }
    axios.post('/api/chats/start', { user_id: userData.id }, { withCredentials: true })
        .then(response => {
            const chatId = response.data.chat_id;
            setSelectedChat(chatId); // Оновлюємо selectedChat новим chatId
            navigate(`/chats/${chatId}`); // Перенаправляємо на новий чат (якщо URL з id)
        })
        .catch(error => {
            console.error('Failed to start chat:', error);
        });
};




    return (
        <div className="profile-container">
            <div className="profile">
                <div className="profile-header">
                    <div className="profile-photo">
                        <img src={`/static/profile_pictures/${userData.profile_picture}`}/>
                    </div>
                    <div className="profile-info">
                        <div className="personal-info">
                            <span className="nickname">{userData.username}</span>
                            <div className="profile-buttons">
                                <button className="chat-button" onClick={handleStartChat}>
                                    Почати чат
                                </button>
                            </div>
                        </div>
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
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OtherUserProfile;
