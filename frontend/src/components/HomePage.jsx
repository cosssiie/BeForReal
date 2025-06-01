import React from 'react';
import Post from './Post';

function HomePage({ userId }) {

    return (
        <div className="home-container">
            <Post userId={userId} />
        </div>
    )
}

export default HomePage;