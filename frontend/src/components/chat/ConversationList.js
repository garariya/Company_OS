import React, { useState } from "react";

function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
  currentUser,
  onNewChatClick,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const getOtherParticipant = (conversation) => {
    const part = conversation.participants.find(
      (p) => p.user.id !== currentUser.id
    );
    return part ? part.user : null;
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  };

  const filteredConversations = conversations.filter((conv) => {
    const participant = getOtherParticipant(conv);
    if (!participant) return false;
    const fullName = `${participant.firstName} ${participant.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="chat-sidebar-panel">
      {/* Sidebar Header */}
      <div className="chat-sidebar-header">
        <h2>Chats</h2>
        <button className="btn btn-primary new-chat-btn" onClick={onNewChatClick}>
          <svg
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
            width="16"
            height="16"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          <span>New Chat</span>
        </button>
      </div>

      {/* Search Conversations */}
      <div className="chat-search-wrapper">
        <svg
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="16"
          height="16"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          className="chat-search-input"
          placeholder="Search chats..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Conversations List */}
      <div className="chat-conversations-list">
        {filteredConversations.length === 0 ? (
          <div className="chat-empty-conversations">
            {searchTerm ? "No matches found" : "No active chats"}
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const participant = getOtherParticipant(conv);
            if (!participant) return null;

            const isSelected = selectedConversation && selectedConversation.id === conv.id;
            const lastMsg = conv.messages && conv.messages[0];
            const lastMsgText = lastMsg ? lastMsg.content : "No messages yet";
            const initials = getInitials(participant.firstName, participant.lastName);

            return (
              <div
                key={conv.id}
                className={`conversation-item ${isSelected ? "active" : ""}`}
                onClick={() => onSelectConversation(conv)}
              >
                <div className="conversation-avatar">
                  {initials}
                </div>
                <div className="conversation-details">
                  <div className="conversation-meta-row">
                    <span className="conversation-name">
                      {participant.firstName} {participant.lastName}
                    </span>
                    <span className={`role-badge ${participant.role.toLowerCase()}`}>
                      {participant.role}
                    </span>
                  </div>
                  <div className="conversation-preview">
                    {lastMsgText}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ConversationList;
