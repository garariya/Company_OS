import React, { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

function ChatWindow({
  selectedConversation,
  messages,
  messageInput,
  setMessageInput,
  onSendMessage,
  currentUser,
  messagesLoading,
  onRefreshMessages,
}) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom whenever messages list changes
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getOtherParticipant = () => {
    if (!selectedConversation) return null;
    const part = selectedConversation.participants.find(
      (p) => p.user.id !== currentUser.id
    );
    return part ? part.user : null;
  };

  const participant = getOtherParticipant();

  if (!selectedConversation) {
    return (
      <div className="chat-window-empty-state">
        <svg
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          width="64"
          height="64"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 18.09a5.967 5.967 0 01-.707-3.557m0 0a5.228 5.228 0 01-.037-.488C4.666 9.444 8.7 5.75 13.75 5.75c4.956 0 9 3.58 9 7.75z"
          />
        </svg>
        <h3>Welcome to CompanyOS Chat</h3>
        <p>Select a conversation from the sidebar or click "New Chat" to start messaging.</p>
      </div>
    );
  }

  return (
    <div className="chat-window-panel">
      {/* Chat Header */}
      <div className="chat-window-header">
        <div className="chat-window-header-user">
          <span className="chat-header-name">
            {participant
              ? `${participant.firstName} ${participant.lastName}`
              : "Unknown User"}
          </span>
          {participant && (
            <span className={`role-badge ${participant.role.toLowerCase()}`}>
              {participant.role}
            </span>
          )}
        </div>
        <button
          className="btn chat-refresh-btn"
          title="Refresh Messages"
          onClick={onRefreshMessages}
          disabled={messagesLoading}
        >
          <svg
            className={messagesLoading ? "spin" : ""}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
            width="18"
            height="18"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="chat-messages-area">
        {messagesLoading && messages.length === 0 ? (
          <div className="chat-messages-loader">
            <div className="spinner"></div>
            <span>Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-messages-empty">
            <p>No messages yet. Send a message to start the conversation!</p>
          </div>
        ) : (
          <div className="chat-messages-list">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isMe={msg.senderId === currentUser.id}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="chat-input-area">
        <MessageInput
          value={messageInput}
          onChange={setMessageInput}
          onSend={onSendMessage}
        />
      </div>
    </div>
  );
}

export default ChatWindow;
