import React, {useEffect, useState, useRef} from 'react';
import {useParams} from 'react-router-dom';
import PostItem from './PostItem';
import {ArrowUp, ArrowDown, Flag, Trash, Send, MessageCircle, EllipsisVertical, CornerDownLeft, X} from "lucide-react";
import ReportModal from "./ReportModal";
import {style} from 'framer-motion';

function buildCommentTree(comments) {
    const map = {};
    const roots = [];

    comments.forEach(c => map[c.id] = {...c, replies: []});

    comments.forEach(c => {
        if (c.parent_id) {
            map[c.parent_id]?.replies.push(map[c.id]);
        } else {
            roots.push(map[c.id]);
        }
    });

    return roots;
}

function CommentItem({
                         comment,
                         onReply,
                         onDelete,
                         userId,
                         user,
                         post,
                         votes = {},
                         handleKarmaChange = () => {
                         },
                         handleCommentKarmaChange = () => {
                         }

                     }) {
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [showOptions, setShowOptions] = useState(false);
    const [comments, setComments] = useState([]);
    const [showReport, setShowReport] = useState(false);

    const optionsRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (optionsRef.current && !optionsRef.current.contains(event.target)) {
                setShowOptions(false);
            }
        }

        if (showOptions) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showOptions]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (replyText.trim()) {
            onReply(replyText, comment.id, comment.author);
            setReplyText('');
            setShowReplyBox(false);
        }
    };


    const handleReportSubmit = async (reason) => {
        try {
            const res = await fetch(`/api/comments/${comment.id}/report`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({reason}),
            });

            if (res.ok) {
                alert('Скарга на коментар відправлена');
                setShowReport(false);
                setShowOptions(false);
            } else {
                const err = await res.json();
                alert(err.error || 'Не вдалось відправити скаргу');
            }
        } catch (error) {
            console.error('Помилка скарги:', error);
        }
    };


    return (
        <>
            <div className="comment-section">
                <div className="comment" style={{
                    marginLeft: comment.parent_id ? 20 : 0,
                    borderLeft: comment.parent_id ? '1px solid #ccc' : 'none',
                    paddingLeft: 10
                }}>
                    <div className="comment-header" style={{position: 'relative'}}>
                        {comment.parent_id && (
                            <div className="reply-to">
                                Reply to @{comment.parent_username || 'user'}
                            </div>
                        )}
                        <span className="comment-author">{comment.author || 'Anonymous'}</span>
                        <span className="comment-date">{new Date(comment.date).toLocaleString()}</span>

                        {/* Кнопка опцій */}
                        <button
                            className="options-button"
                            onClick={() => setShowOptions(prev => !prev)}
                            aria-label="Options"
                            style={{marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer'}}
                        >
                            <EllipsisVertical size={18}/>
                        </button>

                        {showOptions && (
                            <div className="options-popup" ref={optionsRef} style={{top: '-35px', right: '-40px'}}>
                                <button
                                    className="flag-button"
                                    onClick={() => {
                                        setShowReport(true);
                                        setShowOptions(false);
                                    }}
                                >
                                    <Flag size={16}/>
                                </button>
                                {(userId === comment.userId || user?.is_moderator) && (
                                    <button
                                        className="flag-button delete-button"
                                        onClick={() => {
                                            setShowOptions(false);
                                            if (window.confirm('Ви дійсно хочете видалити цей коментар?')) {
                                                onDelete(comment.id);
                                            }
                                        }}
                                    >
                                        <Trash size={16}/>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="comment-body">
                        <p className="comment-text">{comment.text}</p>
                        <div className="comment-footer">
                            <div className="karma-container" style={{backgroundColor: '#f6f6f6'}}>
                                <ArrowUp
                                    size={16}
                                    className={`karma-button ${votes[comment.id] === 1 ? 'voted-up' : ''}`}
                                    onClick={() => handleCommentKarmaChange(comment.id, 1, userId)}
                                />
                                <span className="karma-value">{comment.karma}</span>
                                <ArrowDown
                                    size={16}
                                    className={`karma-button ${votes[comment.id] === -1 ? 'voted-down' : ''}`}
                                    onClick={() => handleCommentKarmaChange(comment.id, -1, userId)}
                                />
                            </div>
                            <button className="reply-button" onClick={() => setShowReplyBox(!showReplyBox)}>
                                {showReplyBox ? <X size={18}/> : <CornerDownLeft size={18}/>}
                            </button>
                        </div>

                    </div>

                </div>

                {showReplyBox && (
                    <form className="reply-form" onSubmit={handleSubmit}>
                        <textarea
                            className="reply-form-input"
                            input type="text"
                            placeholder="Your reply"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={2}
                        />
                        <button className="reply-form-button" type="submit"><Send size={18}/></button>
                    </form>
                )}
                {comment.replies?.length > 0 && (
                    <div className="comment-replies">
                        {comment.replies.map(reply => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                onReply={onReply}
                                onDelete={onDelete}
                                userId={userId}
                                user={user}
                                userIsModerator={user?.is_moderator}
                                post={post}
                                votes={votes}
                                handleCommentKarmaChange={handleCommentKarmaChange}
                            />

                        ))}
                    </div>
                )}
            </div>
            {showReport && (
                <ReportModal
                    onClose={() => setShowReport(false)}
                    onSubmit={handleReportSubmit}
                />
            )}
        </>
    );
}

function PostPage({userId, user, userIsModerator}) {
    const {postId} = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [commentVotes, setCommentVotes] = useState({});

    useEffect(() => {
        fetch(`/api/posts/${postId}`, {credentials: 'include'})
            .then(res => res.json())
            .then(data => setPost(data.post))
            .catch(err => console.error("Error fetching post:", err));

        fetch(`/api/comments/${postId}`, {credentials: 'include'})
            .then(res => res.json())
            .then(data => setComments(data))
            .catch(err => console.error("Error fetching comments:", err));
    }, [postId]);

    const handleReply = async (text, parentId = null, parentAuthor = null) => {
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch(`/api/comments/${postId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    text,
                    parent_id: parentId,
                    parent_author: parentAuthor
                })
            });

            if (!res.ok) throw new Error("Failed to post reply");

            const created = await res.json();
            setComments(prev => [...prev, created]);
        } catch (err) {
            setError('Failed to add comment.');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

   const handleCommentKarmaChange = (commentId, delta) => {
    const currentVote = commentVotes[commentId];

    fetch(`/api/comments/${commentId}/vote`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({ delta }),
    })
    .then(res => {
        if (!res.ok) throw new Error('Failed to vote');
        return res.json();
    })
    .then(() => {
        // Після успішного голосування оновлюємо коментарі з сервера
        fetch(`/api/comments/${postId}`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                setComments(data);

                if (currentVote === delta) {
                    // Якщо повторне натискання тим самим голосом — видаляємо голос
                    setCommentVotes(prev => {
                        const newVotes = { ...prev };
                        delete newVotes[commentId];
                        return newVotes;
                    });
                } else {
                    // Інакше оновлюємо локальний голос
                    setCommentVotes(prev => ({
                        ...prev,
                        [commentId]: delta,
                    }));
                }
            })
            .catch(err => console.error('Failed to refresh comments:', err));
    })
    .catch(err => {
        console.error('Vote error:', err);
        alert('Не вдалося проголосувати');
    });
};



    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        handleReply(newComment);
        setNewComment('');
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const res = await fetch(`/api/comments/${commentId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to delete comment');

            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch (err) {
            alert('Помилка при видаленні коментаря');
            console.error(err);
        }
    };

    if (!post || !user) {
        return <div className="loading-post">Loading post...</div>;
    }


    return (
        <div className="post-page">
            <div className="post-container">
                {user && post && (
                    <PostItem
                        post={post}
                        userId={user.id}
                        isModerator={user?.is_moderator}
                        isSingle={true}
                    />
                )}

                <div className="comments-section">
                    <div className="add-comment-card">
                        <form className="add-comment-form" onSubmit={handleCommentSubmit}>
                            <div className="user-avatar">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.username}/>
                                ) : (
                                    <span>{user?.username.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <div className="input-group">
                                <textarea
                                    className="comment-input"
                                    placeholder="Share your thoughts..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    rows={3}
                                />
                                <button
                                    type="submit"
                                    className="submit-button"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <span className="spinner"></span>
                                    ) : (
                                        <>
                                            <Send size={18}/>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                        {error && <div className="error-message">{error}</div>}
                    </div>

                    <div className="comments-list">
                        {comments.length === 0 ? (
                            <div className="empty-state">
                                <MessageCircle size={48} className="icon"/>
                                <h3>No comments yet</h3>
                                <p>Be the first to share what you think!</p>
                            </div>
                        ) : (
                            buildCommentTree([...comments].reverse()).map(comment => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    onReply={handleReply}
                                    onDelete={handleDeleteComment}
                                    userId={userId}
                                    user={user}
                                    post={post}
                                    votes={commentVotes} // ✅ додаємо
                                    handleCommentKarmaChange={handleCommentKarmaChange}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
            <style>{`
                .sidebar-container-filter {
                    display: none;
                }
            `}</style>

        </div>
    );
}

export default PostPage;