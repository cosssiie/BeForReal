import React, { useEffect, useRef } from 'react';

const Chat = ({ messages, userId, isGroup }) => {
    const bottomRef = useRef(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'auto' });
        }
    }, [messages]);

    return (
        <div className="chat-messages">
            {messages.length === 0 ? (
                <p className="empty-chat">No messages yet.</p>
            ) : (
                messages.map((msg, index) => {
                    const isIncoming = String(msg.userId) !== String(userId);

                    return (
                        <div
                            key={index}
                            className={`message ${isIncoming ? 'message-incoming' : 'message-outgoing'}`}
                        >
                            {isGroup && isIncoming && (
                                <>
                                    <div className="message-username">{msg.sender}</div>
                                </>
                            )}

                            <p>{msg.text}</p>
                            <span className="message-time">{msg.time}</span>
                        </div>
                    );
                })
            )}
            <div ref={bottomRef} />
        </div>
    );
};

export default Chat;
