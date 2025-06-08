import React, { useState, useEffect } from 'react';

// Mock socket for demonstration
const socket = {
    emit: (event, data) => console.log('Socket emit:', event, data),
    on: (event, callback) => console.log('Socket on:', event),
    off: (event, callback) => console.log('Socket off:', event)
};

function ChatPage({ userId }) {
    const [chats, setChats] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');

    // Завантажуємо чати користувача
    useEffect(() => {
        if (!userId) {
            console.log('No userId provided');
            return;
        }
        console.log('Fetching chats for userId:', userId);

        fetch(`/api/chats/${userId}`, {
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                console.log('Fetched chats:', data);
                setChats(data);
                if (data.length > 0) setSelectedChatId(data[0].id);
            })
            .catch(err => console.error('Failed to load chats:', err));
    }, [userId]);

    useEffect(() => {
        if (!selectedChatId) return;

        fetch(`/api/messages/${selectedChatId}`, {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => setMessages(data))
            .catch(console.error);

        const room = `chat_${selectedChatId}`;
        socket.emit('join', room);

        const handleNewMessage = (newMessage) => {
            if (String(newMessage.chatId) === String(selectedChatId)) {
                setMessages(prev => [...prev, newMessage]);
            }

            setChats(prevChats =>
                prevChats.map(chat =>
                    chat.id === newMessage.chatId
                        ? {
                            ...chat,
                            lastMessage: newMessage.text
                        }
                        : chat
                )
            );
        };

        socket.on('new_message', handleNewMessage);

        return () => {
            socket.emit('leave', room);
            socket.off('new_message', handleNewMessage);
        };
    }, [selectedChatId]);

    const handleSendMessage = () => {
        if (!messageInput.trim()) return;

        const message = {
            userId,
            chatId: selectedChatId,
            text: messageInput.trim(),
        };

        // Надсилання через API для збереження в базу
        fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(message),
        })
            .then(res => res.json())
            .then(savedMessage => {
                setMessageInput('');

                // Socket: надсилаємо в кімнату
                const room = `chat_${selectedChatId}`;
                socket.emit('new_message', { ...savedMessage, room });

                // Оновлюємо список чатів
                fetch(`/api/chats/${userId}`)
                    .then(res => res.json())
                    .then(data => setChats(data));
            })
            .catch(console.error);
    };

    const selectedChat = chats.find(chat => chat.id === selectedChatId);

    return (
        <div className="app-container">
            {/* Top Navigation */}

            <div className="main-content">
                {/* Sidebar */}
                <aside className="sidebar">
                    <ul className="chat-groups">
                        {chats.map(chat => (
                            <li
                                key={chat.id}
                                onClick={() => setSelectedChatId(chat.id)}
                                className={`chat-group ${chat.id === selectedChatId ? 'selected' : ''}`}
                            >
                                <div className="chat-group-name">{chat.name}</div>
                                <div className="chat-group-desc">{chat.lastMessage}</div>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Chat Section */}
                <div className="chat-section">
                    <div className="chat-header">
                        {selectedChat ? selectedChat.name : 'Select a chat'}
                    </div>

                    <div className="chat-messages">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`message ${message.userId === userId ? 'sent' : 'received'}`}
                            >
                                <div>{message.text}</div>
                                {message.timestamp && (
                                    <div className="message-time">
                                        {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="chat-input">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button className="send-btn" onClick={handleSendMessage}>
                            →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatPage;