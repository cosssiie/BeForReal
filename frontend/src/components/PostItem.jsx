import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowUp, ArrowDown, MessageCircle, Heart, Repeat, EllipsisVertical, Flag, Trash } from 'lucide-react';
import ReportModal from './ReportModal';

const availableEmojis = ['👍', '❤️', '😂', '😮', '😢', '👎', '🔥'];

function PostItem({
    post,
    votes = {},
    userId,
    isModerator = false,
    handleKarmaChange = () => { },
    isSingle = false,
    onDeletePost = () => { },
}) {
    const navigate = useNavigate();
    const [reactions, setReactions] = useState({});
    const [userReaction, setUserReaction] = useState(null);
    const [showReactions, setShowReactions] = useState(false);
    const [repostCount, setRepostCount] = useState(post.repostCount || 0);
    const [hasReposted, setHasReposted] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const optionsRef = useRef(null);

    const toggleOptions = () => {
        setShowOptions(prev => !prev);
        setShowReport(false);
    };

    useEffect(() => {
        fetch(`/api/posts/${post.id}/reactions`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => setReactions(data.reactions || {}))
            .catch(err => console.error('Failed to load reactions:', err));
    }, [post.id]);

    useEffect(() => {
        fetch(`/api/posts/${post.id}/reposts`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                setRepostCount(data.repostCount || 0);
                setHasReposted(data.hasReposted);
            })
            .catch(err => console.error('Failed to load repost info', err));
    }, [post.id]);

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

    const handleReaction = async (emoji) => {
        try {
            const res = await fetch(`/api/posts/${post.id}/react`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ userId, emoji }),
            });

            if (res.ok) {
                const updated = await fetch(`/api/posts/${post.id}/reactions`, { credentials: 'include' });
                const data = await updated.json();
                setReactions(data.reactions);
                setUserReaction(emoji);
                setShowReactions(false);
            } else {
                const err = await res.json();
                alert(err.error || 'Error adding reaction');
            }
        } catch (error) {
            console.error('Error adding reaction:', error);
        }
    };

    const handleRepost = async () => {
        try {
            const method = hasReposted ? 'DELETE' : 'POST';
            const res = await fetch(`/api/posts/${post.id}/repost`, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ userId }),
            });

            if (!res.ok) {
                const err = await res.json();
                return alert(err.error || 'Error reposting');
            }

            const info = await fetch(`/api/posts/${post.id}/reposts`, { credentials: 'include' });
            const data = await info.json();
            setRepostCount(data.repostCount || 0);
            setHasReposted(data.hasReposted);
        } catch (error) {
            console.error('Error reposting:', error);
        }
    };

    const handleReportSubmit = async (reason) => {
        try {
            const res = await fetch(`/api/posts/${post.id}/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ reporterId: userId, reason }),
            });

            if (res.ok) {
                setShowReport(false);
                setShowOptions(false);
            } else {
                const err = await res.json();
                alert(err.error || 'Error reporting');
            }
        } catch (error) {
            console.error('Error reporting:', error);
        }
    };

    const formatPostDate = (dateStr) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diffTime = now - date;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) {
            return `${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (diffDays === 1) {
            return 'вчора';
        } else if (diffDays < 5) {
            return `${diffDays} дн. тому`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const handleDeletePost = async () => {
        if (!window.confirm('Are you sure you want to delete a post?')) return;

        try {
            const res = await fetch(`/api/posts/${post.id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (res.ok) {
                if (isSingle) {
                    navigate('/');
                } else {
                    onDeletePost(post.id);
                }
            } else {
                const err = await res.json();
                alert(err.error || 'Error deleting post');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Error deleting post');
        }
    };

    return (
        <>
            <div className="post">
                <div className="post-header">
                    <div className="username-date">
                        <span className="post-author">
                            <Link
                                to={userId === post.userId ? '/profile' : `/profile/${post.userId}`}
                                style={{ color: 'white' }}
                            >
                                {post.username}
                            </Link>
                        </span>
                        <span className="post-date">{formatPostDate(post.date)}</span>
                    </div>

                    <button className="additional-button" onClick={toggleOptions}>
                        <EllipsisVertical size={16} />
                    </button>

                    {showOptions && (
                        <div className="options-popup" ref={optionsRef}>
                            <button
                                className="flag-button"
                                onClick={() => {
                                    setShowOptions(false);
                                    setShowReport(true);
                                }}
                            >
                                <Flag size={16} />
                            </button>
                            {(userId && post.userId && userId === post.userId) || isModerator ? (
                                <button className="flag-button delete-button" onClick={handleDeletePost}>
                                    <Trash size={16} />
                                </button>
                            ) : null}
                        </div>
                    )}

                </div>

                <div className="post-content">
                    <span className="post-category">
                        <b>{post.category}</b>
                    </span>
                    <p>{post.content}</p>
                </div>

                {post.picture && (
                    <div className="post-image" style={{ marginTop: '10px' }}>
                        <img
                            src={`/static/uploads/${post.picture}`}
                            alt="Post"
                            style={{ maxWidth: '100%', borderRadius: '8px' }}
                        />
                    </div>
                )}

                <div className="post-footer">
                    <div className="reactions-display">
                        {Object.entries(reactions).map(([emoji, count]) => (
                            <div className="display-reaction" key={emoji}>
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

                        <button
                            className={`repost-button ${hasReposted ? 'reposted' : ''}`}
                            onClick={handleRepost}
                            title={hasReposted ? 'Delete repost' : 'Репостнуть'}
                        >
                            <Repeat size={18} className="inline-icon" />
                            <span>{repostCount}</span>
                        </button>

                        {!isSingle && (
                            <div className="post-action">
                                <button className="comment-button" onClick={() => navigate(`/posts/${post.id}`)}>
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
            {showReport && (
                <ReportModal
                    isOpen={showReport}
                    onClose={() => setShowReport(false)}
                    onSubmit={handleReportSubmit}
                />
            )}
        </>
    );
}

export default PostItem;