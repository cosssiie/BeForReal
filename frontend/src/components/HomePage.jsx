import React, { useEffect, useState } from 'react';
import Post from './Post';
import Pagination from './Pagination';

function HomePage({ userId }) {
    const [posts, setPosts] = useState([]);
    const [votes, setVotes] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const POSTS_PER_PAGE = 10;

    useEffect(() => {
        fetch('/api/posts')
            .then(res => res.json())
            .then(data => {
                setPosts(data.posts);
            })
            .catch(err => console.error("Failed to load posts:", err));
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

    const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
    const indexOfLast = currentPage * POSTS_PER_PAGE;
    const indexOfFirst = indexOfLast - POSTS_PER_PAGE;
    const currentPosts = posts.slice(indexOfFirst, indexOfLast);

    return (
        <div className="home-container">
            <Post
                currentPosts={currentPosts}
                votes={votes}
                handleKarmaChange={handleKarmaChange}
                userId={userId}
            />
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}

export default HomePage;
