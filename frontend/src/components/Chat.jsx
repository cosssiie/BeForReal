import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const Chat = ({ messages, userId, isGroup, onMessageDeleted }) => {
    const bottomRef = useRef(null);
    const [selectedMsgId, setSelectedMsgId] = useState(null);
    const optionsRef = useRef(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'auto' });
        }
    }, [messages]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (optionsRef.current && !optionsRef.current.contains(event.target)) {
                setSelectedMsgId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleMessageClick = (msgId, msgUserId) => {
        if (String(msgUserId) === String(userId)) {
            setSelectedMsgId(prevId => prevId === msgId ? null : msgId);
        } else {
            setSelectedMsgId(null);
        }
    };

    const handleDelete = async (msgId) => {
        if (!msgId) return;
        try {
            await axios.delete(`/api/messages/${msgId}`, { withCredentials: true });
            if (onMessageDeleted) {
                onMessageDeleted(msgId);
            }
            setSelectedMsgId(null);
        } catch (err) {
            console.error('Помилка видалення:', err);
        }
    };

    return (
        <div className="chat-messages">
            {(!messages || messages.length === 0) ? (
                <p className="empty-chat">No messages yet.</p>
            ) : (
                messages.map((msg, index) => {
                    const isIncoming = String(msg.userId) !== String(userId);
                    const isOwnMessage = !isIncoming;
                    const isSelected = selectedMsgId === msg.id;

                    return (
                        <div
                            key={msg.id || index}
                            className={`message ${isIncoming ? 'message-incoming' : 'message-outgoing'}`}
                            onClick={() => handleMessageClick(msg.id, msg.userId)}
                        >
                            {isIncoming && <div className="message-username">{msg.sender}</div>}
                            <p>{msg.text}</p>
                            <span className="message-time">
                                {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>

                            {isOwnMessage && isSelected && msg.id && (
                                <div className="message-options-panel" ref={optionsRef}>
                                    <button onClick={() => handleDelete(msg.id)}>Delete</button>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
            <div ref={bottomRef} />
        </div>
    );
};

export default Chat;