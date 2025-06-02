import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, ArrowDown, MessageCircle } from 'lucide-react';

function PostItem({ post, votes = {}, userId, handleKarmaChange = () => { }, isSingle = false }) {
    const navigate = useNavigate();

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
                </div>
            </div>
        </div>
    );
}

export default PostItem;
