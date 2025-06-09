import React from 'react';
import UserItem from './UserItem'; // імпортуємо компонент

function SearchModal({ results, onClose }) {
    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <button style={styles.closeButton} onClick={onClose}>×</button>
                <h2 style={styles.header}>Users</h2>

                {results.length === 0 ? (
                    <p style={{ textAlign: 'center' }}>No such user found</p>
                ) : (
                    <div style={styles.resultList}>
                        {results.map((user) => (
                            <UserItem key={user.id} user={user} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
    },
    modal: {
        backgroundColor: '#fff',
        padding: '24px',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    },
    closeButton: {
        position: 'absolute',
        top: '12px',
        right: '16px',
        fontSize: '20px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#999',
    },
    header: {
        marginBottom: '16px',
        textAlign: 'center',
        fontSize: '1.4rem',
    },
    resultList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
};

export default SearchModal;
