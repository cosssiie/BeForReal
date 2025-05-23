import React from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';

function Post() {
    const category = 'category';
    const text = 'some text';
    const createdAt = '2025-05-21T15:30:00Z';
    const likes = 18;
    const dislikes = 1;
    const commentsCount = 4;

    return (
        <div className="post">
            <div className="post-header"><span className="post-author">User</span>
                <span className="post-date">{new Date(createdAt).toLocaleString()}</span>
            </div>

            <div className="post-content">
                <span className="post-category">Category: <b>{category}</b></span>
                <p>{text}</p>
            </div>

            <div className="post-footer">

                <div className="post-actions">
                    <div className="post-action">
                        <ThumbsUp size={16} /> {likes}
                    </div>
                    <div className="post-action">
                        <ThumbsDown size={16} /> {dislikes}
                    </div>
                    <div className="post-action">
                        <MessageCircle size={16} /> {commentsCount}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Post;
