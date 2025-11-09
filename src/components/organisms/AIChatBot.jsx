import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAppStore } from "../../stores/use.store.js";
import "./AIChatBot.css";

const AIChatBot = () => {
  // Remove ANY old chatbot DOM nodes before rendering
  useEffect(() => {
    const allBots = document.querySelectorAll(".ai-chatbot");
    if (allBots.length > 1) {
      // ✅ hide older ones without removing them
      allBots.forEach((bot, i) => {
        if (i < allBots.length - 1) {
          bot.style.display = "none";
          bot.classList.add("hidden-bot");
        }
      });
    }
  }, []);

  const { aiChat } = useAppStore();
  const [inputMessage, setInputMessage] = useState("");
  const [isLocked, setIsLocked] = useState(false); // ✅ prevents multiple messages
  const messagesEndRef = useRef(null);

  /* ---------- Auto Scroll ---------- */
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [aiChat.chatMessages, scrollToBottom]);

  /* ---------- Send Message (single at a time) ---------- */
  const sendSingleMessage = useCallback(
    async (text) => {
      if (!text.trim() || aiChat.isTyping || isLocked) return;

      setIsLocked(true); // ✅ lock until answer received

      try {
        await aiChat.sendMessage(text);
      } catch {
        aiChat.addMessage({
          role: "assistant",
          content: "⚠️ There was a connection issue. Try again.",
          isError: true,
          timestamp: Date.now(),
        });
      }

      // ✅ unlock after typing stops
      const unlockCheck = setInterval(() => {
        if (!aiChat.isTyping) {
          clearInterval(unlockCheck);
          setIsLocked(false);
        }
      }, 300);
    },
    [aiChat, isLocked]
  );

  /* ---------- Manual Send ---------- */
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const text = inputMessage.trim();
    setInputMessage("");
    await sendSingleMessage(text);
  };

  /* ---------- Quick Ask ---------- */
  const handleQuickAsk = (q) => {
    sendSingleMessage(q);
  };

  /* ---------- Close Chat ---------- */
  const closeChat = () => {
    const bot = document.querySelector(".ai-chatbot");
    if (bot) bot.classList.add("hide"); //visually and interactively removed
    aiChat.closeChat();
  };

  /* ---------- Hidden UI If Closed ---------- */
  if (!aiChat.isChatOpen) return null;

  return (
    <div className="ai-chatbot slide-up">
      <div className="chat-header">
        <div className="chat-title">
          <span className="bot-title">SageBot</span>
        </div>
        <button className="close-chat" onClick={closeChat}>
          ×
        </button>
      </div>

      {/* ---------- Messages Area ---------- */}
      <div className="chat-messages">
        {aiChat.chatMessages.length === 0 && (
          <div className="welcome-message">
            <p>Hello! I can explain cybersecurity concepts.</p>
            <p>Try: “Explain phishing in one line”</p>
          </div>
        )}

        {aiChat.chatMessages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <div className="message-content">
              {msg.content}
              {msg.isError && (
                <div className="message-error">⚠ Connection lost</div>
              )}
            </div>

            <div className="message-time">
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>

            {msg.role === "assistant" && msg.suggested_follow_ups && (
              <div className="suggested-questions">
                {msg.suggested_follow_ups.map((q, idx) => (
                  <button
                    key={idx}
                    className="suggested-question"
                    onClick={() => handleQuickAsk(q)}
                    disabled={isLocked || aiChat.isTyping} // ✅ disabled until response ends
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Assistant typing */}
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

      {/* ---------- Message Input ---------- */}
      <form className="chat-input-form" onSubmit={handleFormSubmit}>
        <div className="chat-input-container">
          <input
            className="chat-input"
            type="text"
            placeholder="Ask a cybersecurity question..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={aiChat.isTyping || isLocked} // ✅ locked until assistant finishes
          />
          <button
            type="submit"
            className="send-button"
            disabled={!inputMessage.trim() || aiChat.isTyping || isLocked}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIChatBot;
