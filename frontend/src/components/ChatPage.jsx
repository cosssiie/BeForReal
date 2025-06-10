import React, { useState, useEffect, useCallback } from 'react';
import { Scrollbar } from 'react-scrollbars-custom';
import Chat from './Chat';
import Sidebar from './Sidebar';
import io from 'socket.io-client';
import { useParams, useLocation } from 'react-router-dom';

const socket = io();

function ChatPage({ userId }) {
    const { chatId } = useParams();
    const [chats, setChats] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const location = useLocation();
    const selectedChatIdFromLocation = location.state?.selectedChat || null;
    const [optionsOpenChatId, setOptionsOpenChatId] = useState(null);

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
        if (chatId && chats.length > 0) {
            setSelectedChatId(Number(chatId));
        } else if (chats.length > 0 && selectedChatId === null) {
            setSelectedChatId(selectedChatIdFromLocation || chats[0].id);
        }
    }, [chatId, chats, selectedChatIdFromLocation]);

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

        fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(message),
        })
            .then(res => res.json())
            .then(savedMessage => {
                setMessageInput('');
                fetch(`/api/chats/${userId}`)
                    .then(res => res.json())
                    .then(data => setChats(data));
            })
            .catch(console.error);
    };

    const handleDeleted = (deletedId) => {
        setMessages((prevMessages) => {
            const updatedMessages = prevMessages.filter(msg => msg.id !== deletedId);
            const deletedMessage = prevMessages.find(msg => msg.id === deletedId);
            const isLastMessage = prevMessages.length > 0 && prevMessages[prevMessages.length - 1].id === deletedId;

            if (isLastMessage) {
                const newLast = updatedMessages[updatedMessages.length - 1];
                setChats(prevChats =>
                    prevChats.map(chat =>
                        chat.id === selectedChatId
                            ? { ...chat, lastMessage: newLast ? newLast.text : '' }
                            : chat
                    )
                );
            }

            return updatedMessages;
        });
    };

    const handleOpenOptions = (e, chatId) => {
        e.stopPropagation();
        setOptionsOpenChatId(prev => prev === chatId ? null : chatId);
    };

    useEffect(() => {
        const closeMenu = () => setOptionsOpenChatId(null);
        document.addEventListener('click', closeMenu);
        return () => document.removeEventListener('click', closeMenu);
    }, []);

    const handleDeleteChat = (chatId) => {
        fetch(`/api/chats/${chatId}`, {
            method: 'DELETE',
            credentials: 'include'
        })
            .then(res => res.json())
            .then(() => {
                setChats(prev => prev.filter(c => c.id !== chatId));
                if (selectedChatId === chatId) {
                    setSelectedChatId(null);
                    setMessages([]);
                }
            })
            .catch(console.error);
    };

    const selectedChat = chats.find(chat => chat.id === selectedChatId);

    return (
        <div className="home-layout">
            <Sidebar />
            <div className="chat-container">
                <div className="chat-sidebar">
                    <Scrollbar className="custom-scroll-wrapper">
                        <div className="scroll-inner">
                            <ul className="chat-list">
                                {chats.map(chat => (
                                    <li
                                        key={chat.id}
                                        className={`chat-item ${chat.id === selectedChatId ? 'selected' : ''}`}
                                        style={{ position: 'relative' }}
                                    >
                                        <div onClick={() => setSelectedChatId(Number(chat.id))} className="chat-info" style={{ paddingRight: '30px' }}>
                                            <strong>{chat.name}</strong>
                                            <p className="chat-preview">{chat.lastMessage}</p>
                                        </div>
                                        <span
                                            className="chat-options-icon"
                                            onClick={(e) => handleOpenOptions(e, chat.id)}
                                            style={{
                                                position: 'absolute',
                                                top: '6px',
                                                right: '8px',
                                                cursor: 'pointer',
                                                fontSize: '20px',
                                                zIndex: 11,
                                            }}
                                        >
                                            ⋮
                                        </span>
                                        {optionsOpenChatId === chat.id && (
                                            <div className="chat-options-menu">
                                                <button onClick={() => handleDeleteChat(chat.id)}>Видалити чат</button>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Scrollbar>
                </div>

                <div className="chat-window">
                    <header className="chat-header">{selectedChat ? selectedChat.name : 'Select a chat'}</header>
                    <div className="chat-messages-wrapper">
                        <Chat messages={messages} userId={userId} isGroup={selectedChat?.isGroup} onMessageDeleted={handleDeleted} />
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
        </div>
    );
}

export default ChatPage;