import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../hooks/useSocket';
import { Send, X } from 'lucide-react';
import clsx from 'clsx';

const API_BASE_URL = 'http://localhost:3001';

// ChatWindow component now accepts conversation, currentUser, and onClose as props
const ChatWindow = ({ conversation, currentUser, onClose }) => {
  const { socket } = useSocket();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.conversation]); // Depend on conversation.conversation array

  // Join the conversation room when component mounts or conversation changes
  useEffect(() => {
    if (socket && conversation?.id) {
      socket.emit('joinRoom', conversation.id);
      console.log(`Joined conversation room: ${conversation.id}`);

      // No need to fetch messages here, as they are passed via conversation prop
      // and updated via socket.on('receiveMessage') in Connections.jsx
      // The conversation prop should ideally contain pre-fetched messages.

      return () => {
        socket.emit('leaveRoom', conversation.id);
        console.log(`Left conversation room: ${conversation.id}`);
      };
    }
  }, [socket, conversation?.id]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (socket && message.trim() && currentUser?.id && conversation?.id) {
      const messageData = {
        conversationId: conversation.id,
        senderId: currentUser.id,
        content: message.trim(), // Use 'content' to match server-side
        timestamp: new Date().toISOString(),
      };
      socket.emit('sendMessage', messageData);
      setMessage('');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  if (!conversation) return null; // Should not happen if called correctly, but for safety

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <img
              src={conversation.otherUser?.avatar || 'https://avatars.dicebear.com/api/human/avatar.svg'}
              alt={conversation.otherUser?.fullName || 'Người dùng'}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h3 className="font-semibold">
                {conversation.otherUser?.fullName || 'Người dùng'}
              </h3>
              <p className="text-sm text-gray-600">
                {conversation.postTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {conversation.conversation && conversation.conversation.length > 0 ? (
            conversation.conversation.map(msg => (
              <div key={msg.id} className={clsx("flex", msg.senderId === currentUser.id ? 'justify-end' : 'justify-start')}>
                <div className={clsx(
                  "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                  msg.senderId === currentUser.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                )}>
                  <p className="text-sm">{msg.content}</p>
                  <p className={clsx(
                    "text-xs mt-1",
                    msg.senderId === currentUser.id
                      ? 'text-blue-100'
                      : 'text-gray-500'
                  )}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">Chưa có tin nhắn nào.</div>
          )}
          <div ref={messagesEndRef} /> {/* For auto-scrolling */}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tin nhắn..."
            />
            <button
              type="submit"
              className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
