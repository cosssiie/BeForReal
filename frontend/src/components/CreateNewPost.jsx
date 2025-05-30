import React, { useState } from 'react';

function CreateNewPost({ onCreate }) {
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const categories = ['Some categories'];

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!content.trim() || !category) return;

        const newPost = {
            id: Date.now(),
            username: 'You',
            date: new Date().toISOString(),
            content,
            category,
            karma: 0,
            commentsCount: 0,
        };

        onCreate?.(newPost);

        setContent('');
        setCategory('');
    };

    return (
        <form onSubmit={handleSubmit} className="post create-post">
            <div className="post-header">
                <span className="post-author">You</span>
                <span className="post-date">{new Date().toLocaleString()}</span>
            </div>

            <div className="post-content">
                <label className="post-category">
                    Category:
                    <select
                        className="select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    >
                        <option value="" disabled>
                            select category
                        </option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </label>

                <textarea
                    className="textarea"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter your post content..."
                    rows={4}
                />
            </div>

            <div className="post-footer">
                <button type="submit" className="submit-button">
                    Post
                </button>
            </div>
        </form>
    );
}

export default CreateNewPost;
