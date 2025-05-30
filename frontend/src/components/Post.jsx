import React, { useEffect, useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';

function Post() {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
    fetch('/api/posts')
        .then(res => res.json())
        .then(data => {
            console.log("Fetched posts:", data.posts);
            setPosts(data.posts);
        })
        .catch(err => console.error("Failed to load posts:", err));
}, []);


    return (
        <div className="posts-list">
            {posts.map(post => (
                <div className="post" key={post.id}>
                    <div className="post-header">
                        <span className="post-author">{post.username}</span>
                        <span className="post-date">
                            {new Date(post.date).toLocaleString()}
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
                            <div className="post-action">
                                <ThumbsUp size={16} /> {post.likes}
                            </div>
                            <div className="post-action">
                                <ThumbsDown size={16} /> {post.dislikes}
                            </div>
                            <div className="post-action">
                                <MessageCircle size={16} /> {post.commentsCount}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Post;
