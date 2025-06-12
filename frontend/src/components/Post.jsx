import { useEffect, useState } from 'react';
import CreateNewPost from './CreateNewPost';
import PostItem from './PostItem';

function Post({ currentPosts, votes, handleKarmaChange, userId, isModerator, onDeletePost }) {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        setPosts(currentPosts);
    }, [currentPosts]);

    const handleCreatePost = (newPost) => {
        setPosts(prevPosts => [newPost, ...prevPosts]);
    };

    return (
        <div className="posts-list">
            <CreateNewPost onCreate={handleCreatePost} />
            {posts.map(post => (
                <PostItem
                    key={post.id}
                    post={post}
                    votes={votes}
                    handleKarmaChange={handleKarmaChange}
                    userId={userId}
                    isModerator={isModerator}
                    isSingle={false}
                    onDeletePost={onDeletePost}
                />
            ))}
        </div>
    );
}

export default Post;