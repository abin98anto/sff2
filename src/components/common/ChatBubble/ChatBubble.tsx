import React, { useState, useEffect, useRef } from "react";
import "./ChatBubble.scss";
import { useAppSelector } from "../../../hooks/reduxHooks";

interface Message {
  id: number;
  text: string;
  sender: string;
  timestamp: string;
  read?: boolean;
}

const ChatBubble: React.FC = () => {
  const users: string[] = [
    "John Doe",
    "Jane Smith",
    "Alex Brown",
    "Emily White",
  ];
  const initialMessages: Message[] = [
    {
      id: 1,
      text: "Hey, how’s the course going?",
      sender: "John Doe",
      timestamp: "10:30 AM",
      read: false,
    },
    {
      id: 2,
      text: "Pretty good, thanks! How about you?",
      sender: "You",
      timestamp: "10:32 AM",
      read: true,
    },
    {
      id: 3,
      text: "Glad to hear that! I’m struggling with Module 3.",
      sender: "John Doe",
      timestamp: "10:35 AM",
      read: false,
    },
  ];

  const { userInfo } = useAppSelector((state) => state.user);

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showPlaceholder, setShowPlaceholder] = useState<boolean>(false);
  const [activeUser, setActiveUser] = useState<string>(users[0] || "");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState<string>("");

  // Refs to track the chat container, overlay, and placeholder for click-outside detection
  const chatRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);

  // Calculate unread messages for the active user (or any user if no active user)
  const unreadCount = messages.filter(
    (msg) => msg.sender !== "You" && !msg.read
  ).length;

  // Handle clicking the bubble to expand/collapse or show placeholder
  const handleBubbleClick = () => {
    if (!userInfo) {
      setShowPlaceholder(true);
    } else if (users.length === 0) {
      setShowPlaceholder(true);
    } else {
      setIsExpanded(!isExpanded);
      // Mark all messages as read when expanding
      if (!isExpanded) {
        setMessages(
          messages.map((msg) =>
            msg.sender !== "You" ? { ...msg, read: true } : msg
          )
        );
      }
    }
  };

  // Handle clicking a user in the sidebar (only in expanded mode)
  const handleUserClick = (user: string): void => {
    setActiveUser(user);
    // In a real app, fetch messages for the selected user here
  };

  // Handle sending a message
  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (newMessage.trim() && userInfo && users.length > 0) {
      // Changed !userInfo to userInfo
      const newMsg: Message = {
        id: messages.length + 1,
        text: newMessage,
        sender: "You",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        read: true,
      };
      setMessages([...messages, newMsg]);
      setNewMessage("");
    }
  };

  // Handle clicks outside the chat or placeholder to collapse/hide
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isExpanded &&
        chatRef.current &&
        !chatRef.current.contains(event.target as Node) &&
        overlayRef.current &&
        overlayRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
      if (
        showPlaceholder &&
        placeholderRef.current &&
        !placeholderRef.current.contains(event.target as Node)
      ) {
        setShowPlaceholder(false);
      }
    };

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Clean up the event listener on unmount
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded, showPlaceholder]);

  return (
    <>
      {/* Minimized Bubble (always visible, even when placeholder or expanded chat are shown) */}
      <div className="chat-bubble-minimized" onClick={handleBubbleClick}>
        <span className="chat-icon">💬</span>
        {userInfo && unreadCount > 0 && (
          <span className="unread-count">{unreadCount}</span>
        )}
      </div>

      {/* Placeholder Speech Bubble (visible when not logged in or no users) */}
      {showPlaceholder && (!userInfo || users.length === 0) && (
        <div className="chat-placeholder" ref={placeholderRef}>
          <span>There are no chats to see</span>
        </div>
      )}

      {/* Expanded Chat Window with Overlay (visible when expanded, logged in, and users exist) */}
      {isExpanded && userInfo && users.length > 0 && (
        <>
          <div className="chat-overlay" ref={overlayRef}></div>
          <div className="chat-container" ref={chatRef}>
            <div className="chat-sidebar">
              <h3>Chats</h3>
              <ul className="chat-list">
                {users.map((user) => (
                  <li
                    key={user}
                    className={`chat-item ${
                      user === activeUser ? "active" : ""
                    }`}
                    onClick={() => handleUserClick(user)}
                  >
                    {user}
                  </li>
                ))}
              </ul>
            </div>
            <div className="chat-main">
              <div className="chat-header">
                <h4>{activeUser}</h4>
              </div>
              <div className="chat-messages">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${
                      msg.sender === "You" ? "sent" : "received"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className="timestamp">{msg.timestamp}</span>
                  </div>
                ))}
              </div>
              <form className="chat-input" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewMessage(e.target.value)
                  }
                />
                <button type="submit">Send</button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ChatBubble;
