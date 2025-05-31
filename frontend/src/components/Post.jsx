import React, {useEffect, useState} from 'react';
import {ArrowUp, ArrowDown, MessageCircle} from 'lucide-react';

function Post({userId}) {
    const [posts, setPosts] = useState([]);
    const [votes, setVotes] = useState({});

    useEffect(() => {
        fetch('/api/posts')
            .then(res => res.json())
            .then(data => {
                console.log("Fetched posts:", data.posts);
                setPosts(data.posts);
            })
            .catch(err => console.error("Failed to load posts:", err));
    }, []);

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
        <div className="posts-list">
            {posts.map(post => (
                <div className="post" key={post.id}>
                    <div className="post-header">
                        <span className="post-author">{post.username}</span>
                        <span className="post-date">
                            {
                                isToday(post.date)
                                    ? new Date(post.date).toLocaleString([], {hour: '2-digit', minute: '2-digit'})
                                    : new Date(post.date).toLocaleString([], {
                                        year: '2-digit',
                                        month: '2-digit',
                                        day: '2-digit'
                                    })
                            }
                        </span>
                    </div>

                    <div className="post-content">
                        <span className="post-category">
                            Category: <b>{post.category}</b>
                        </span>
                        <p>{post.content}</p>
                    </div>

                    <div className="post-footer">
                        <div className="post-actions">
                            <div className="karma-container">
                                <ArrowUp
                                    size={16}
                                    className={`karma-button ${votes[post.id] === 1 ? 'voted-up' : ''}`}
                                    onClick={() => handleKarmaChange(post.id, 1, 5)}
                                />
                                <span className="karma-value">{post.karma}</span>
                                <ArrowDown
                                    size={16}
                                    className={`karma-button ${votes[post.id] === -1 ? 'voted-down' : ''}`}
                                    onClick={() => handleKarmaChange(post.id, -1, 5)}
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
    );
}

export default Post;
