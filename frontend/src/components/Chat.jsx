import React from 'react';

const Chat = ({ messages }) => {
  return (
    <div className="chat-messages">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`message ${msg.sender === 'me' ? 'message-outgoing' : 'message-incoming'}`}
        >
          <p>{msg.text}</p>
          <span className="message-time">{msg.time}</span>
        </div>
      ))}
    </div>
  );
};

export default Chat;
