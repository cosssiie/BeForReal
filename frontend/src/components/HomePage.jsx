import React, { useEffect, useState } from 'react';
import Post from './Post';
import Sidebar from './Sidebar';
import Pagination from './Pagination';

function HomePage({ userId, onLogout  }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [posts, setPosts] = useState([]);
    const [votes, setVotes] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const POSTS_PER_PAGE = 10;
    const [selectedCategory, setSelectedCategory] = useState(null);


    const totalPages = Math.ceil((posts?.length || 0) / POSTS_PER_PAGE);
    const indexOfLast = currentPage * POSTS_PER_PAGE;
    const indexOfFirst = indexOfLast - POSTS_PER_PAGE;
    const currentPosts = posts?.slice(indexOfFirst, indexOfLast) || [];

    const handleCategorySelect = (categoryId) => {
    setIsLoading(true);
    setSelectedCategory(categoryId);

    const url = categoryId
        ? `/api/posts/by_category?category_id=${categoryId}`
        : '/api/posts';

    fetch(url, {
        credentials: 'include'
    })
        .then(res => {
            if (!res.ok) throw new Error("Failed to load filtered posts");
            return res.json();
        })
        .then(data => {
            setPosts(data.posts || data); // API може повертати `posts: [...]` або просто `[...]`
            setCurrentPage(1); // скидаємо до першої сторінки
            setIsLoading(false);
        })
        .catch(err => {
            console.error("Error fetching filtered posts:", err);
            setPosts([]);
            setIsLoading(false);
        });
};


    useEffect(() => {
        setIsLoading(true);
        fetch('/api/posts', {
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) throw new Error("Failed to load posts");
                return res.json();
            })
            .then(data => {
                setPosts(data.posts || []);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to load posts:", err);
                setPosts([]);
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        const postsList = document.querySelector('.posts-list');
        if (postsList) {
            postsList.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [currentPage]);

    const handleKarmaChange = (postId, delta, userId) => {
        const currentVote = votes[postId] || 0;
        if (currentVote === delta) return;

        fetch(`/api/posts/${postId}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ delta, userId }),
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to vote');
                return res.json();
            })
            .then(data => {
                setPosts(prev =>
                    prev.map(post =>
                        post.id === postId ? { ...post, karma: data.newKarma } : post
                    )
                );
                setVotes(prev => ({ ...prev, [postId]: delta }));
            })
            .catch(err => console.error(err));
    };

    if (isLoading) {
        return <div className="loading">Loading posts...</div>;
    }

    return (
        <div className="home-layout">
            <Sidebar isOpen={isSidebarOpen} onLogout={onLogout} onCategorySelect={handleCategorySelect} />
            <div className="home-content">
                <div className="home-container">
                    <Post
                        currentPosts={currentPosts}
                        votes={votes}
                        handleKarmaChange={handleKarmaChange}
                        userId={userId}
                    />
                    {posts.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default HomePage;