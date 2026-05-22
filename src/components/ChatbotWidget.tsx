"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";
import styles from "./ChatbotWidget.module.css";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      text: "Hello! I am your 24/7 Virtual Library Assistant. How can I help you find books, check due dates, or explore reading recommendations today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");

    // Add user message
    const userMsg: Message = {
      id: Math.random().toString(),
      text: userText,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Send to AI endpoint
      const storedUser = localStorage.getItem("user");
      const userId = storedUser ? JSON.parse(storedUser).id : null;

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, userId }),
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: Message = {
          id: Math.random().toString(),
          text: data.response,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error("Failed to chat");
      }
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: Math.random().toString(),
        text: "I'm sorry, I am having trouble connecting to the catalog right now. Please try again in a moment.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button 
          className={styles.floatBtn} 
          onClick={() => setIsOpen(true)}
          aria-label="Open Chatbot"
        >
          <MessageSquare size={24} />
          <span className={styles.tooltip}>Virtual Assistant</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`${styles.chatWindow} glass`}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.botInfo}>
              <div className={styles.botIcon}>
                <Bot size={20} color="#ffffff" />
              </div>
              <div>
                <h4 className={styles.botTitle}>Library AI Assistant</h4>
                <span className={styles.status}>Online & Ready</span>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label="Close Chat">
              <X size={18} />
            </button>
          </div>

          {/* Messages list */}
          <div className={styles.messageList}>
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`${styles.messageWrapper} ${msg.sender === "user" ? styles.userWrapper : styles.botWrapper}`}
              >
                <div className={styles.avatar}>
                  {msg.sender === "user" ? <User size={12} /> : <Bot size={12} />}
                </div>
                <div className={styles.messageBubble}>
                  <p className={styles.msgText}>{msg.text}</p>
                  <span className={styles.msgTime}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className={`${styles.messageWrapper} ${styles.botWrapper}`}>
                <div className={styles.avatar}>
                  <Bot size={12} />
                </div>
                <div className={`${styles.messageBubble} ${styles.loadingBubble}`}>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
                  <div className={styles.dot}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form className={styles.inputForm} onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={styles.inputField}
              disabled={loading}
            />
            <button type="submit" className={styles.sendBtn} disabled={!input.trim() || loading} aria-label="Send Message">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
