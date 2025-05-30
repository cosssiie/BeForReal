import React from 'react';
import Post from './Post';
import CreateNewPost from './CreateNewPost';

function HomePage() {

    return (
        <div className="home-container">
            <CreateNewPost />
            <Post />
        </div>
    )
}

export default HomePage;