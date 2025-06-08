import React, { useEffect, useState } from 'react';

function CreateNewPost({ onCreate }) {
    const [content, setContent] = useState('');
    const [images, setImages] = useState([]);
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetch('/api/categories', {
            credentials: 'include',
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data.categories)) {
                    setCategories(data.categories);
                } else {
                    console.error('Invalid categories format:', data);
                    setCategories([]);
                }
            })
            .catch(err => {
                console.error('Failed to load categories:', err);
            });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!content.trim() || !category) return;

        const formData = new FormData();
        formData.append("content", content);
        formData.append("category", category);

        images.forEach((img) => {
            formData.append("images[]", img);
        });

        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            const data = await res.json();

            if (res.ok) {
                onCreate?.(data.post);
                setContent('');
                setCategory('');
                setImages([]);
            } else {
                alert(data.error || 'Failed to create post');
            }
        } catch (err) {
            console.error('Error creating post:', err);
        }
    };

    const handleRemoveImage = (indexToRemove) => {
        setImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
    };

    return (
        <form onSubmit={handleSubmit} className="post create-post">
            <div className="post-header">
                <span className="post-author">You</span>
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
                        {Array.isArray(categories) && categories.map((cat) => (
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
                <div className="image-add">
                    <label htmlFor="image-upload" className="custom-file-label">
                        Upload Image
                    </label>
                    <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        name="images[]"
                        onChange={(e) => {
                            const newFiles = Array.from(e.target.files);
                            setImages(prevImages => [...prevImages, ...newFiles]);
                            e.target.type = '';
                            e.target.type = 'file';
                        }}
                        className="post-image-input"
                    />

                    {images.length > 0 && (
                        <div className="image-preview-outer">
                            <div className="image-preview-container">
                                {images.map((img, index) => (
                                    <div key={index} className="image-preview-wrapper">
                                        <img
                                            src={URL.createObjectURL(img)}
                                            alt={`preview-${index}`}
                                            className="image-preview"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                            className="image-remove-button"
                                            aria-label="Remove image"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>)}
                </div>
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
