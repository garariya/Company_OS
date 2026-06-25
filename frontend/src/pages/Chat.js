import React, { useState, useEffect } from "react";
import { getUser, getToken } from "../utils/auth";
import ConversationList from "../components/chat/ConversationList";
import ChatWindow from "../components/chat/ChatWindow";

const API_BASE = "http://localhost:5001/api";

function Chat() {
  const currentUser = getUser();
  const token = getToken();

  // State Management
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState(null);

  // New Chat Dialog States
  const [employees, setEmployees] = useState([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState("");

  // Load initial conversations on mount
  useEffect(() => {
    if (!token) {
      setError("Authorization token missing. Please log in again.");
      setLoading(false);
      return;
    }
    fetchConversations();
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Load messages when selected conversation changes
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    } else {
      setMessages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation]);

  // Fetch all conversations of current user
  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/chat/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        // Sort by updatedAt desc
        const sorted = (data.conversations || []).sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        setConversations(sorted);
      } else {
        setError(data.message || "Failed to load conversations.");
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Unable to connect to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all employees to allow starting a new chat
  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE}/employees`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setEmployees(data.employees || []);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  // Fetch messages for a specific conversation
  const fetchMessages = async (conversationId) => {
    try {
      setMessagesLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/chat/conversations/${conversationId}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages || []);
      } else {
        setError(data.message || "Failed to load messages.");
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Unable to load conversation history.");
    } finally {
      setMessagesLoading(false);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!selectedConversation || !messageInput.trim()) return;

    const content = messageInput;
    // Clear input immediately to make UI feel snappy
    setMessageInput("");

    try {
      const res = await fetch(`${API_BASE}/chat/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: content,
        }),
      });
      const data = await res.json();

      if (res.ok && data.data) {
        const newMessage = data.data;
        // Append message to UI immediately without page refresh
        setMessages((prev) => [...prev, newMessage]);

        // Update conversation preview and updatedAt in local list, and move to top
        setConversations((prev) => {
          return prev
            .map((conv) => {
              if (conv.id === selectedConversation.id) {
                return {
                  ...conv,
                  messages: [newMessage],
                  updatedAt: newMessage.createdAt,
                };
              }
              return conv;
            })
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        });
      } else {
        setError(data.message || "Failed to send message.");
        // Restore input if message failed
        setMessageInput(content);
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Connection error.");
      setMessageInput(content);
    }
  };

  // Create new conversation
  const handleCreateConversation = async (participantId) => {
    // 1. Check if a conversation already exists locally with this participant
    const existing = conversations.find((c) =>
      c.participants.some((p) => p.user.id === participantId)
    );

    if (existing) {
      setSelectedConversation(existing);
      setShowNewChatModal(false);
      setNewChatSearch("");
      return;
    }

    // 2. Call backend to create conversation
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/chat/conversation`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ participantId }),
      });
      const data = await res.json();

      if (res.ok && data.conversation) {
        const newConv = {
          ...data.conversation,
          messages: [],
          updatedAt: new Date().toISOString(),
        };

        // Add to active conversations and select it
        setConversations((prev) => [newConv, ...prev]);
        setSelectedConversation(newConv);
        setMessages([]);
        setShowNewChatModal(false);
        setNewChatSearch("");
      } else {
        setError(data.message || "Failed to start conversation.");
      }
    } catch (err) {
      console.error("Error creating conversation:", err);
      setError("Failed to create conversation. Connection error.");
    }
  };

  // Filter employees list for New Chat Modal
  const filteredEmployees = employees.filter((emp) => {
    // Don't chat with self
    if (emp.user.id === currentUser.id) return false;
    const name = `${emp.user.firstName} ${emp.user.lastName}`.toLowerCase();
    return name.includes(newChatSearch.toLowerCase());
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Error Alert Bar */}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#FEF2F2",
            color: "#991B1B",
            border: "1px solid #FCA5A5",
            borderRadius: "6px",
            marginBottom: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "14px",
          }}
        >
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: "none",
              border: "none",
              color: "#991B1B",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            &times;
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-indicator" style={{ flex: 1, minHeight: "300px" }}>
          <div className="spinner"></div>
          <span>Loading chat...</span>
        </div>
      ) : (
        <div className="chat-container">
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
            currentUser={currentUser}
            onNewChatClick={() => setShowNewChatModal(true)}
          />

          <ChatWindow
            selectedConversation={selectedConversation}
            messages={messages}
            messageInput={messageInput}
            setMessageInput={setMessageInput}
            onSendMessage={handleSendMessage}
            currentUser={currentUser}
            messagesLoading={messagesLoading}
            onRefreshMessages={() => fetchMessages(selectedConversation.id)}
          />
        </div>
      )}

      {/* New Chat Modal Dialog */}
      {showNewChatModal && (
        <div
          className="new-chat-modal-overlay"
          onClick={() => setShowNewChatModal(false)}
        >
          <div className="new-chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="new-chat-modal-header">
              <h3>Start a New Chat</h3>
              <button
                className="close-modal-btn"
                onClick={() => setShowNewChatModal(false)}
              >
                <svg
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="new-chat-modal-body">
              <input
                type="text"
                className="new-chat-search-input"
                placeholder="Search employees by name..."
                value={newChatSearch}
                onChange={(e) => setNewChatSearch(e.target.value)}
                autoFocus
              />
              <div className="employee-select-list">
                {filteredEmployees.length === 0 ? (
                  <div className="employee-select-empty">No employees found</div>
                ) : (
                  filteredEmployees.map((emp) => {
                    const name = `${emp.user.firstName} ${emp.user.lastName}`;
                    const initials = `${emp.user.firstName[0] || ""}${
                      emp.user.lastName[0] || ""
                    }`.toUpperCase();
                    return (
                      <div
                        key={emp.id}
                        className="employee-select-item"
                        onClick={() => handleCreateConversation(emp.user.id)}
                      >
                        <div className="employee-select-avatar">{initials}</div>
                        <div className="employee-select-info">
                          <span className="employee-select-name">{name}</span>
                          <span className="employee-select-role">
                            {emp.user.role} &bull; {emp.designation || "Staff"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
