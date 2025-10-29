import React, { useState, useRef, useEffect } from "react";
import { useAppStore } from "../../stores/use.store.js";
import "./AIChatBot.css";

const AIChatBot = () => {
  const { aiChat, ui } = useAppStore();
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiChat.chatMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || aiChat.isTyping) return;

    const message = inputMessage.trim();
    setInputMessage("");
    await aiChat.sendMessage(message);
  };

  const handleQuickQuestion = async (question) => {
    setInputMessage("");
    await aiChat.sendMessage(question);
  };

  const handleCloseChat = () => {
    aiChat.closeChat();
  };

  if (!aiChat.isChatOpen) return null;

  return (
    <div className="ai-chatbot">
      <div className="chat-header">
        <div className="chat-title">
          <span className="chat-icon">🤖</span>
          <span>Cybersage AI Assistant</span>
        </div>
        <button className="close-chat" onClick={handleCloseChat}>
          ×
        </button>
      </div>

      <div className="chat-messages">
        {aiChat.chatMessages.length === 0 && (
          <div className="welcome-message">
            <p>
              Hello! I'm here to help you understand cybersecurity concepts.
            </p>
            <p>Ask me anything about the questions you're working on!</p>
          </div>
        )}

        {aiChat.chatMessages.map((message) => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="message-content">
              {message.content}
              {message.isError && (
                <div className="message-error">⚠️ Connection issue</div>
              )}
            </div>
            <div className="message-time">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>

            {message.role === "assistant" && message.suggested_follow_ups && (
              <div className="suggested-questions">
                {message.suggested_follow_ups.map((question, index) => (
                  <button
                    key={index}
                    className="suggested-question"
                    onClick={() => handleQuickQuestion(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {aiChat.isTyping && (
          <div className="message assistant">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <div className="chat-input-container">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about cybersecurity concepts..."
            disabled={aiChat.isTyping}
            className="chat-input"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || aiChat.isTyping}
            className="send-button"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIChatBot;
