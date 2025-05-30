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
        <div className="posts-list">
            {posts.map(post => (
                <div className="post" key={post.id}>
                    <div className="post-header">
                        <span className="post-author">{post.username}</span>
                        <span className="post-date">
                            {
                                isToday(post.date)
                                ?  new Date(post.date).toLocaleString([], { hour: '2-digit', minute: '2-digit' })
                                :  new Date(post.date).toLocaleString([], { year: '2-digit', month: '2-digit', day: '2-digit' })
                            }
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
