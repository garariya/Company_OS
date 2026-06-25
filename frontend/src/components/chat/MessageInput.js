import React from "react";

function MessageInput({ value, onChange, onSend }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSend();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSend();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="chat-input-form">
      <textarea
        className="chat-input-textarea"
        placeholder="Type a message..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows="1"
      />
      <button
        type="submit"
        className="btn btn-primary chat-send-btn"
        disabled={!value.trim()}
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
            d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
          />
        </svg>
        <span>Send</span>
      </button>
    </form>
  );
}

export default MessageInput;
