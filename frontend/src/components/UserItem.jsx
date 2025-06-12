import React from 'react';
import { Link } from 'react-router-dom';

function UserItem({ user }) {
    return (
        <Link to={`/profile/${user.id}`} style={styles.link}>
            <div style={styles.userCard}>
                <img
                    src={`/static/profile_pictures/${user.profile_picture}`}
                    alt="avatar"
                    style={styles.avatar}
                />
                <div style={styles.userInfo}>
                    <strong>{user.username}</strong>
                    <p style={styles.bio}>
                        {user.bio?.slice(0, 80) || '—'}
                    </p>
                </div>
            </div>
        </Link>
    );
}

const styles = {
    link: {
        textDecoration: 'none',
        color: 'inherit',
    },
    userCard: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px',
        border: '1px solid #eee',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        transition: 'background 0.2s',
    },
    avatar: {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        marginRight: '16px',
        objectFit: 'cover',
    },
    userInfo: {
        flex: 1,
    },
    bio: {
        fontSize: '0.9rem',
        color: '#555',
        marginTop: '4px',
    },
};

export default UserItem;
