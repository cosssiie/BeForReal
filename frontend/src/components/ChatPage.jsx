import React, { useState, useEffect } from 'react';
import { Scrollbar } from 'react-scrollbars-custom';
import Chat from './Chat';

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

        fetch(`/api/chats/${userId}`)
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


    // Завантажуємо повідомлення для вибраного чату
    useEffect(() => {
        if (!selectedChatId) return;

        fetch(`/api/messages/${selectedChatId}`)
            .then(res => res.json())
            .then(data => {
                setMessages(data);
                console.log('Fetching messages for selected user:', data);
            })
            .catch(err => console.error('Failed to load messages:', err));
    }, [selectedChatId]);

    const selectedChat = chats.find(chat => chat.id === selectedChatId);

    const handleSendMessage = () => {
        if (!messageInput.trim()) return;

        const payload = {
            userId: userId,
            chatId: selectedChatId,
            text: messageInput.trim(),
        };

        fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to send message');
                return res.json();
            })
            .then(() => {
                // Очищаємо поле вводу
                setMessageInput('');

                // Оновлюємо повідомлення
                fetch(`/api/messages/${selectedChatId}`)
                    .then(res => res.json())
                    .then(data => setMessages(data));

                fetch(`/api/chats/${userId}`)
                    .then(res => res.json())
                    .then(data => setChats(data));
            })
            .catch(err => console.error(err));
    };


    return (
        <div className="chat-container">
            <div className="chat-sidebar">
                <Scrollbar className="custom-scroll-wrapper">
                    <div className="scroll-inner">
                        <ul className="chat-list">
                            {chats.map(chat => (
                                <li
                                    key={chat.id}
                                    onClick={() => setSelectedChatId(chat.id)}
                                    className={`chat-item ${chat.id === selectedChatId ? 'selected' : ''}`}
                                >
                                    <strong>{chat.name}</strong>
                                    <p className="chat-preview">{chat.lastMessage}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Scrollbar>
            </div>

            <div className="chat-window">
                <header className="chat-header">{selectedChat ? selectedChat.name : 'Select a chat'}</header>
                <div className="chat-messages-wrapper">
                    <Chat messages={messages} userId={userId} isGroup={true} />
                </div>
                <div className="message-input">
                    <input
                        type="text"
                        className="message-text-input"
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button className="send-message-button" onClick={handleSendMessage}>
                        <img src="/assets/images/white-arrow.png" alt="Send" />
                    </button>

                </div>
            </div>
        </div>
    );
}

export default ChatPage;
