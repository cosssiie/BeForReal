import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PostItem from './PostItem';

function PostPage() {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);

    useEffect(() => {
        fetch(`/api/posts/${postId}`, {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => setPost(data.post))
            .catch(err => console.error("Error fetching post:", err));

        fetch(`/api/comments/${postId}`, {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => setComments(data))
            .catch(err => console.error("Error fetching comments:", err));
    }, [postId]);

    if (!post) {
        return <div className="loading-post">Loading post...</div>;
    }

    return (
        <div className="post-page">
            <PostItem post={post} isSingle={true} />

            <div className="comments">
                {comments.length === 0 ? (
                    <p className="no-comments">No comments yet.</p>
                ) : (
                    comments.map(comment => (
                        <div className="comment" key={comment.id}>
                            <div className="comment-header">
                                <span className="comment-author"> {comment.author || 'Anonymous'}</span>
                                <span className="comment-date">{comment.date ? new Date(comment.date).toLocaleString() : 'No date'}</span>

                            </div>
                            <p>{comment.text || 'No comment text'}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default PostPage;
