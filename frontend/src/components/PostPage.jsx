import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import PostItem from './PostItem';
import { Flag, Trash } from "lucide-react";

function buildCommentTree(comments) {
    const map = {};
    const roots = [];

    comments.forEach(c => map[c.id] = { ...c, replies: [] });

    comments.forEach(c => {
        if (c.parent_id) {
            map[c.parent_id]?.replies.push(map[c.id]);
        } else {
            roots.push(map[c.id]);
        }
    });

    return roots;
}

function CommentItem({ comment, onReply, onDelete, userId, user }) {
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [showOptions, setShowOptions] = useState(false);
    const [comments, setComments] = useState([]);


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
            onReply(replyText, comment.id);
            setReplyText('');
            setShowReplyBox(false);
        }
    };


    return (
        <div className="comment" style={{ marginLeft: comment.parent_id ? 20 : 0, borderLeft: comment.parent_id ? '1px solid #ccc' : 'none', paddingLeft: 10 }}>
            <div className="comment-header" style={{ position: 'relative' }}>
                <span className="comment-author">{comment.author || 'Anonymous'}</span>
                <span className="comment-date">{new Date(comment.date).toLocaleString()}</span>

                {/* Кнопка опцій */}
                <button
                    className="options-button"
                    onClick={() => setShowOptions(prev => !prev)}
                    aria-label="Options"
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    &#8230; {/* три крапки */}
                </button>

                {showOptions && (
                    <div className="options-popup" ref={optionsRef}>
                        <button className="flag-button">
                            <Flag size={16} />
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
                                <Trash size={16} />
                            </button>
                        )}
                    </div>
                )}

            </div>

            <p>{comment.text}</p>
            <button onClick={() => setShowReplyBox(!showReplyBox)}>
                {showReplyBox ? 'Cancel' : 'Reply'}
            </button>

            {showReplyBox && (
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        rows={2}
                    />
                    <button type="submit">Post Reply</button>
                </form>
            )}

            {comment.replies?.length > 0 && (
                <div className="comment-replies">
                    {comment.replies.map(reply => (
                        <CommentItem key={reply.id} comment={reply} onReply={onReply} />
                    ))}
                </div>
            )}
        </div>
    );
}

function PostPage({ userId, user, userIsModerator }) {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`/api/posts/${postId}`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => setPost(data.post))
            .catch(err => console.error("Error fetching post:", err));

        fetch(`/api/comments/${postId}`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => setComments(data))
            .catch(err => console.error("Error fetching comments:", err));
    }, [postId]);

    const handleReply = async (text, parentId = null) => {
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch(`/api/comments/${postId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ text, parent_id: parentId })
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

    if (!post) {
        return <div className="loading-post">Loading post...</div>;
    }

    return (
        <div className="post-page">
            <PostItem post={post} isSingle={true} user={user} />

            <div className="add-comment">
                <form onSubmit={handleCommentSubmit}>
                    <textarea
                        placeholder="Write your comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={4}
                    />
                    <button type="submit" disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Add Comment'}
                    </button>
                </form>
                {error && <p className="error">{error}</p>}
            </div>

            <div className="comments">
                {comments.length === 0 ? (
                    <p className="no-comments">No comments yet.</p>
                ) : (
                    buildCommentTree(comments).map(comment => (
                        <CommentItem key={comment.id} comment={comment} onReply={handleReply} onDelete={handleDeleteComment} userId={userId} userIsModerator={user?.is_moderator} user />
                    ))
                )}
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
