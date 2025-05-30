import React, { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, MessageCircle } from 'lucide-react';

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

    const handleKarmaChange = (postId, delta) => {
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post.id === postId
                    ? { ...post, karma: post.karma + delta }
                    : post
            )
        );
        //db request
    };

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
                            <div className="karma-container">
                                <ArrowUp
                                    size={16}
                                    className="karma-button"
                                    onClick={() => handleKarmaChange(post.id, 1)}
                                />
                                <span className="karma-value">{post.karma}</span>
                                <ArrowDown
                                    size={16}
                                    className="karma-button"
                                    onClick={() => handleKarmaChange(post.id, -1)}
                                />
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
