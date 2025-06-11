import React, { useEffect, useState } from 'react';
import Post from './Post';
import Pagination from './Pagination';

function HomePage({ userId, user }) {
    const [posts, setPosts] = useState([]);
    const [votes, setVotes] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const POSTS_PER_PAGE = 10;

    const totalPages = Math.ceil((posts?.length || 0) / POSTS_PER_PAGE);
    const indexOfLast = currentPage * POSTS_PER_PAGE;
    const indexOfFirst = indexOfLast - POSTS_PER_PAGE;
    const currentPosts = posts?.slice(indexOfFirst, indexOfLast) || [];

    useEffect(() => {
        setIsLoading(true);
        fetch('/api/posts', { credentials: 'include' })
            .then(res => {
                if (!res.ok) throw new Error('Failed to load posts');
                return res.json();
            })
            .then(data => {
                setPosts(data.posts || []);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Failed to load posts:', err);
                setPosts([]);
                setIsLoading(false);
            });
    }, []);

    const handleKarmaChange = (postId, delta, userId) => {
        const currentVote = votes[postId] || 0;
        if (currentVote === delta) return;

        fetch(`/api/posts/${postId}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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

    const handleDeletePost = (postId) => {
        setPosts(prev => prev.filter(post => post.id !== postId));
    };

    if (isLoading) {
        return <div className="loading">Loading posts...</div>;
    }

    return (
        <div className="home-container">
            <Post
                currentPosts={currentPosts}
                votes={votes}
                handleKarmaChange={handleKarmaChange}
                userId={userId}
                isModerator={user?.is_moderator || false}
                onDeletePost={handleDeletePost}
            />
            {posts.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
}

export default HomePage;