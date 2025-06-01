import React, {useEffect, useState} from 'react';
import {ArrowUp, ArrowDown, MessageCircle} from 'lucide-react';
import CreateNewPost from './CreateNewPost';
import Pagination from './Pagination';


function Post({userId}) {
    const [posts, setPosts] = useState([]);
    const [votes, setVotes] = useState({});
    const [reactions, setReactions] = useState({});
    const [userReactions, setUserReactions] = useState({});

    //for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const POSTS_PER_PAGE = 10;
    const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
    const indexOfLast = currentPage * POSTS_PER_PAGE;
    const indexOfFirst = indexOfLast - POSTS_PER_PAGE;
    const currentPosts = posts.slice(indexOfFirst, indexOfLast);

    useEffect(() => {
        fetch('/api/posts')
            .then(res => res.json())
            .then(data => {
                console.log("Fetched posts:", data.posts);
                setPosts(data.posts);
            })
            .catch(err => console.error("Failed to load posts:", err));
    }, []);

    useEffect(() => {
        const postsList = document.querySelector('.posts-list');
        if (postsList) {
            postsList.scrollIntoView({behavior: 'smooth'});
        } else {
            window.scrollTo({top: 0, behavior: 'smooth'});
        }
    }, [currentPage]);

    useEffect(() => {
        posts.forEach(post => {
            fetch(`/api/posts/${post.id}/reactions`)
                .then(res => res.json())
                .then(data => {
                    setReactions(prev => ({...prev, [post.id]: data.reactions}));
                })
                .catch(err => console.error(err));
        });
    }, [posts]);

    const handleReact = (postId, emoji) => {
        const userId = localStorage.getItem("userId");
        fetch(`/api/posts/${postId}/react`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({userId, emoji}),
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to react');
                // Локально оновлюємо стани
                setUserReactions(prev => ({...prev, [postId]: emoji}));
                setReactions(prev => {
                    const prevCounts = prev[postId] || {};
                    // Віднімаємо 1 від попередньої реакції користувача (якщо була)
                    const oldEmoji = userReactions[postId];
                    const newCounts = {...prevCounts};

                    if (oldEmoji && newCounts[oldEmoji]) {
                        newCounts[oldEmoji] = newCounts[oldEmoji] - 1;
                        if (newCounts[oldEmoji] <= 0) delete newCounts[oldEmoji];
                    }

                    // Додаємо 1 до нового emoji
                    newCounts[emoji] = (newCounts[emoji] || 0) + 1;

                    return {...prev, [postId]: newCounts};
                });
            })
            .catch(err => console.error(err));
    };


    const handleKarmaChange = (postId, delta, userId) => {
        const currentVote = votes[postId] || 0;

        // Якщо вже проголосував тим самим чином — нічого не робити
        if (currentVote === delta) return;

        fetch(`/api/posts/${postId}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({delta: delta, userId: userId}), // просто передаємо новий голос
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to vote');
                return res.json();
            })
            .then(data => {
                setPosts(prevPosts =>
                    prevPosts.map(post =>
                        post.id === postId
                            ? {...post, karma: data.newKarma}
                            : post
                    )
                );
                setVotes(prev => ({...prev, [postId]: delta}));
            })
            .catch(err => console.error(err));
    };


    const isToday = (someDate) => {
        const today = new Date();
        const date = new Date(someDate);

        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    return (
        <>
            <div className="posts-list">
                <CreateNewPost onCreate={(newPost) => setPosts([newPost, ...posts])}/>
                {currentPosts.map(post => (
                    <div className="post" key={post.id}>
                        <div className="post-header">
                            <span className="post-author">{post.username}</span>
                            <span className="post-date">
                                {isToday(post.date)
                                    ? new Date(post.date).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
                                    : new Date(post.date).toLocaleDateString()}
                            </span>
                        </div>

                        <div className="post-content">
                            <span className="post-category">
                                Category: <b>{post.category}</b>
                            </span>
                            <p>{post.content}</p>
                        </div>

                        <div className="post-footer">
                            <div className="post-reactions">
                                {/* Відобразити існуючі реакції */}
                                {reactions[post.id] && Object.entries(reactions[post.id]).map(([emoji, count]) => (
                                    <span key={emoji} className="reaction-badge">
                {emoji} {count}
            </span>
                                ))}

                                {/* Кнопки для додавання реакції */}
                                <div className="reaction-buttons">
                                    {['👍', '❤️', '😂', '😮', '😢', '👎', '🔥'].map(emoji => (
                                        <button
                                            key={emoji}
                                            className={`reaction-btn ${userReactions[post.id] === emoji ? 'selected' : ''}`}
                                            onClick={() => handleReact(post.id, emoji)}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="post-actions">
                                <div className="karma-container">
                                    <ArrowUp
                                        size={16}
                                        className={`karma-button ${votes[post.id] === 1 ? 'voted-up' : ''}`}
                                        onClick={() => handleKarmaChange(post.id, 1, userId)}
                                    />
                                    <span className="karma-value">{post.karma}</span>
                                    <ArrowDown
                                        size={16}
                                        className={`karma-button ${votes[post.id] === -1 ? 'voted-down' : ''}`}
                                        onClick={() => handleKarmaChange(post.id, -1, userId)}
                                    />
                                </div>
                                <div className="post-action">
                                    <MessageCircle size={16}/> {post.commentsCount}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </>
    );
}

export default Post;
