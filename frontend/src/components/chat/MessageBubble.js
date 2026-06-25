import React from "react";

function MessageBubble({ message, isMe }) {
  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "";
    }
  };

  const senderName = message.sender
    ? `${message.sender.firstName} ${message.sender.lastName}`
    : "Unknown User";

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className={`message-bubble-wrapper ${isMe ? "me" : "other"}`}>
      {!isMe && (
        <div className="message-avatar" title={senderName}>
          {getInitials(senderName)}
        </div>
      )}
      <div className="message-bubble-container">
        {!isMe && <div className="message-sender-name">{senderName}</div>}
        <div className="message-bubble">
          <div className="message-text">{message.content}</div>
          <div className="message-time">{formatTime(message.createdAt)}</div>
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
