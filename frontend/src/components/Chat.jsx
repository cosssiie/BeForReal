import React, { useEffect, useRef } from 'react';

const Chat = ({ messages, userId, isGroup }) => {

    const bottomRef = useRef(null);

    useEffect(() => {
        // Скрол до останнього повідомлення
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'auto' });
        }
    }, [messages]);

    return (
        <div className="chat-messages">
            {messages.length === 0 ? (
                <p className="empty-chat">No messages yet.</p>
            ) : (
                messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message ${msg.userId === userId ? 'message-outgoing' : 'message-incoming'}`}
                    >
                        {isGroup && msg.userId !== userId && (
                            <div className="message-username">{msg.sender}</div>
                        )}

                        <p>{msg.text}</p>
                        <span className="message-time">{msg.time}</span>
                    </div>

                ))
            )}
            <div ref={bottomRef} />
        </div>
    );
};

export default Chat;
