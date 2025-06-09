import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PostItem from './PostItem';

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

function CommentItem({ comment, onReply }) {
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replyText, setReplyText] = useState('');

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
            <div className="comment-header">
                <span className="comment-author">{comment.author || 'Anonymous'}</span>
                <span className="comment-date">{new Date(comment.date).toLocaleString()}</span>
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

function PostPage() {
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

    if (!post) {
        return <div className="loading-post">Loading post...</div>;
    }

    return (
        <div className="post-page">
            <PostItem post={post} isSingle={true} />

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
                        <CommentItem key={comment.id} comment={comment} onReply={handleReply} />
                    ))
                )}
            </div>
        </div>
    );
}

export default PostPage;
