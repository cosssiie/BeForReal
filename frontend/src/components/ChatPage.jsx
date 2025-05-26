import React, { useState } from 'react';
import { Scrollbar } from 'react-scrollbars-custom';

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

function ChatPage() {
    const [selectedChatId, setSelectedChatId] = useState(fakeChats[0].id);
    const selectedChat = fakeChats.find(chat => chat.id === selectedChatId);

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
                <h2 className='chat-header'>{selectedChat.name}</h2>
                <div className="chat-messages">
                </div>
            </div>

            <style>
                @import url('https://fonts.googleapis.com/css2?family=Radio+Canada:ital,wght@0,300..700;1,300..700&display=swap');
            </style>

        </div>
    );
}

export default ChatPage;
