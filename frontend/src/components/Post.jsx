import { useState } from 'react';
import CreateNewPost from './CreateNewPost';
import PostItem from './PostItem';

function Post({ currentPosts, votes, handleKarmaChange, userId }) {

    return (
        <div className="posts-list">
            {currentPosts.map(post => (
                <PostItem
                    key={post.id}
                    post={post}
                    votes={votes}
                    handleKarmaChange={handleKarmaChange}
                    userId={userId}
                    isSingle={false}
                />
            ))}
        </div>
    );
}

export default Post;
