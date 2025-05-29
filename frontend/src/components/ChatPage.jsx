import React, { useState } from 'react';
import { Scrollbar } from 'react-scrollbars-custom';
import Chat from './Chat';

// fake chats just for visualization 
const fakeChats = [
    { id: 1, name: 'John Smith', lastMessage: 'Hey, how are you?' },
    { id: 2, name: 'Maria Johnson', lastMessage: 'Are we meeting tomorrow?' },
    { id: 3, name: 'Sergey Kuznetsov', lastMessage: 'I`ve sent the documents.' },
    { id: 4, name: 'Alex Smirnov', lastMessage: 'Thanks for your help!' },
    { id: 5, name: 'Helen Voronova', lastMessage: 'How is the project going?' },
    { id: 6, name: 'Dmitry Fedorov', lastMessage: 'Call me when you`re free.' },
    { id: 7, name: 'Olga Sokolova', lastMessage: 'Watching a new movie.' },
    { id: 8, name: 'Paul Orlov', lastMessage: 'Ready for the meeting.' },
    { id: 9, name: 'Anna Mikhailova', lastMessage: 'Thanks for the info!' },
    { id: 10, name: 'Nikita Lebedev', lastMessage: 'See you tonight.' },
];

// fake messages just for visualization 
const fakeMessages = {
    1: [
        { sender: 'John', text: 'Hey John!', time: '10:00' },
        { sender: 'John', text: 'How are you?', time: '10:01' },
    ],
    2: [
        { sender: 'me', text: 'Are we meeting tomorrow?', time: '09:00' },
    ],
    3: [
        { sender: 'Sergey', text: 'I`ve sent the documents.', time: '15:30' },
        { sender: 'me', text: 'Got them, thanks!', time: '15:35' },
    ],
    4: [
        { sender: 'Alex', text: 'What about going to Paris in a week?', time: '15:12' },
        { sender: 'Alex', text: 'I`ll be free soon, so can discuss that', time: '15:13' },
        { sender: 'me', text: 'Oh, a good idea!', time: '15:25' },
        { sender: 'me', text: 'I agree', time: '15:25' },
        { sender: 'Alex', text: 'What about going to Paris in a week?', time: '15:12' },
        { sender: 'Alex', text: 'I`ll be free soon, so can discuss that', time: '15:13' },
        { sender: 'me', text: 'Oh, a good idea!', time: '15:25' },
        { sender: 'me', text: 'I agree', time: '15:25' },
        { sender: 'Alex', text: 'What about going to Paris in a week?', time: '15:12' },
        { sender: 'Alex', text: 'I`ll be free soon, so can discuss that', time: '15:13' },
        { sender: 'me', text: 'Oh, a good idea!', time: '15:25' }
    ]
};

function ChatPage() {
    const [selectedChatId, setSelectedChatId] = useState(fakeChats[0].id);
    const selectedChat = fakeChats.find(chat => chat.id === selectedChatId);
    const messages = fakeMessages[selectedChatId] || [];

    return (
        <div className="chat-container">
            <div className="chat-sidebar">
                <Scrollbar className="custom-scroll-wrapper">
                    <div className="scroll-inner">
                        <ul className="chat-list">
                            {fakeChats.map(chat => (
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
                <header className="chat-header">{selectedChat.name}</header>
                <div className="chat-messages-wrapper">
                    <Chat messages={messages} />
                </div>
                <div className="message-input">
                    <input
                        type="text"
                        className="message-text-input"
                        placeholder="Type a message..."
                    />
                    <button className="send-message-button">
                        <img src="/assets/images/white-arrow.png" alt="Send" />
                    </button>
                </div>
            </div>

            <style>
                @import url('https://fonts.googleapis.com/css2?family=Radio+Canada:ital,wght@0,300..700;1,300..700&display=swap');
            </style>
        </div>
    );
}

export default ChatPage;
