import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowUp, ArrowDown, MessageCircle, Heart, Repeat, EllipsisVertical, Flag } from 'lucide-react';

const availableEmojis = ['👍', '❤️', '😂', '😮', '😢', '👎', '🔥'];
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

function PostItem({
    post,
    votes = {},
    userId,
    handleKarmaChange = () => { },
    isSingle = false
}) {
    const navigate = useNavigate();
    const [reactions, setReactions] = useState({});
    const [userReaction, setUserReaction] = useState(null);
    const [showReactions, setShowReactions] = useState(false);
    const [repostCount, setRepostCount] = useState(post.repostCount || 0);
    const [hasReposted, setHasReposted] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [showReportReasons, setShowReportReasons] = useState(false);
    const optionsRef = useRef(null);

    const toggleOptions = () => {
        setShowOptions(prev => !prev);
        setShowReportReasons(false);
    };

    const toggleReportReasons = () => {
        setShowReportReasons(prev => !prev);
    };

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

    useEffect(() => {
        fetch(`/api/posts/${post.id}/reactions`, {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => setReactions(data.reactions || {}))
            .catch(err => console.error('Failed to load reactions:', err));
    }, [post.id]);

    useEffect(() => {
        fetch(`/api/posts/${post.id}/reposts`, {
            credentials: 'include',
        })
            .then(res => res.json())
            .then(data => {
                setRepostCount(data.repostCount || 0);
                setHasReposted(data.hasReposted);
            })
            .catch(err => console.error('Failed to load repost info', err));
    }, [post.id]);

    const handleReaction = async (emoji) => {
        try {
            const res = await fetch(`/api/posts/${post.id}/react`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ userId, emoji })
            });

            if (res.ok) {
                const updated = await fetch(`/api/posts/${post.id}/reactions`, {
                    credentials: 'include'
                });
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

    const handleRepost = async () => {
        try {
            const res = await fetch(`/api/posts/${post.id}/repost`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ userId })
            });
            if (res.ok) {
                setRepostCount(prev => prev + 1);
                setHasReposted(true);
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to repost');
            }
        } catch (error) {
            console.error('Error reposting:', error);
        }
    };

    const handleReport = async (reason) => {
        try {
            const res = await fetch(`/api/posts/${post.id}/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ reporterId: userId, reason })
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
            console.error('Error reporting post:', error);
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
            return `${diffDays} дні(в) тому`;
        } else {
            return date.toLocaleDateString();
        }
    };

    return (
        <div className="post">
            <div className="post-header" style={{ position: 'relative' }}>
                <div className="username-date">
                    <span className="post-author" style={{ color: 'blue' }}>
                        <Link to={userId === post.userId ? '/profile' : `/profile/${post.userId}`}>
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
                        <button className="flag-button" onClick={toggleReportReasons}>
                            <Flag size={16} />
                        </button>
                        {showReportReasons && (
                            <div className="report-reasons-popup">
                                {reportReasons.map((reason) => (
                                    <div
                                        key={reason}
                                        className="report-reason-item"
                                        onClick={() => handleReport(reason)}
                                        style={{ cursor: 'pointer', padding: '4px 6px' }}
                                    >
                                        {reason}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="post-content">
                <span className="post-category">Category: <b>{post.category}</b></span>
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
                <div className="reactions-display" style={{ display: 'flex', gap: '8px', marginLeft: '10px' }}>
                    {Object.entries(reactions).map(([emoji, count]) => (
                        <div className="display-reaction" key={emoji}
                            style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
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
                        disabled={hasReposted}
                        title={hasReposted ? 'Ви вже репостнули' : 'Репостнути'}
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
    );
}

export default PostItem;
