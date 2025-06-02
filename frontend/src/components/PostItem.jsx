import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, ArrowDown, MessageCircle, Heart } from 'lucide-react';

const availableEmojis = ['👍', '❤️', '😂', '😮', '😢', '👎', '🔥'];

function PostItem({ post, votes = {}, userId, handleKarmaChange = () => { }, isSingle = false }) {
    const navigate = useNavigate();
    const [reactions, setReactions] = useState({});
    const [userReaction, setUserReaction] = useState(null);
    const [showReactions, setShowReactions] = useState(false);

    const isToday = (someDate) => {
        const today = new Date();
        const date = new Date(someDate);
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    useEffect(() => {
        fetch(`/api/posts/${post.id}/reactions`)
            .then(res => res.json())
            .then(data => {
                setReactions(data.reactions || {});
            })
            .catch(err => {
                console.error('Failed to load reactions:', err);
            });
    }, [post.id]);

    const handleReaction = async (emoji) => {
        try {
            const res = await fetch(`/api/posts/${post.id}/react`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, emoji })
            });

            if (res.ok) {
                const updated = await fetch(`/api/posts/${post.id}/reactions`);
                const data = await updated.json();
                setReactions(data.reactions);
                setUserReaction(emoji);
                setShowReactions(false);
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to react');
            }
        } catch (error) {
            console.error('Error reacting:', error);
        }
    };

    return (
        <div className="post">
            <div className="post-header">
                <span className="post-author">{post.username}</span>
                <span className="post-date">
                    {isToday(post.date)
                        ? new Date(post.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
                <div className="reactions-display" style={{ display: 'flex', gap: '8px', marginLeft: '10px' }}>
                    {Object.entries(reactions).map(([emoji, count]) => (
                        <div className="display-reaction" key={emoji} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <span className="reaction-emoji">{emoji}</span>
                            <span className="reaction-count">{count}</span>
                        </div>
                    ))}
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

                    {!isSingle && (
                        <div className="post-action">
                            <button
                                className="comment-button"
                                onClick={() => navigate(`/posts/${post.id}`)}
                            >
                                <MessageCircle size={16} />
                                <span>{post.commentsCount}</span>
                            </button>
                        </div>
                    )}

                    <div
                        className="reactions-container"
                        onMouseEnter={() => setShowReactions(true)}
                        onMouseLeave={() => setShowReactions(false)}
                        style={{ position: 'relative' }}
                    >
                        <button className="reaction-button">
                            <Heart size={18} />
                        </button>

                        {showReactions && (
                            <div className="reactions-popup">
                                {availableEmojis.map((emoji) => (
                                    <span
                                        key={emoji}
                                        className="reaction-emoji"
                                        onClick={() => handleReaction(emoji)}
                                    >
                                        {emoji}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PostItem;
