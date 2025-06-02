import React, {useEffect, useState} from 'react';

function CreateNewPost({ onCreate }) {
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                setCategories(data.categories); // 👈 твій бек повинен повертати { categories: [...] }
            })
            .catch(err => {
                console.error('Failed to load categories:', err);
            });
    }, []);

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() || !category) return;

    const userId = localStorage.getItem("userId");

    try {
        const res = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId,
                content,
                category
            })
        });

        const data = await res.json();

        if (res.ok) {
            onCreate?.(data.post);
            setContent('');
            setCategory('');
        } else {
            alert(data.error || 'Failed to create post');
        }
    } catch (err) {
        console.error('Error creating post:', err);
    }
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

                    >
                        <option value="" disabled>
                            select category
                        </option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </label>

                <textarea
                    className="textarea"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter your post content..."
                    rows={1}
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
